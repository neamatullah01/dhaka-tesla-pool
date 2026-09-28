import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ZonesService } from '../zones/zones.service.js';
import { FaresService } from '../fares/fares.service.js';
import { CreateRideDto } from './dto/create-ride.dto.js';
import { RideStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zonesService: ZonesService,
    private readonly faresService: FaresService,
  ) {}

  async createRide(passengerId: string, dto: CreateRideDto) {
    // 1. Check active ride
    const activeRide = await this.prisma.rideRequest.findFirst({
      where: {
        passengerId,
        status: { in: [RideStatus.REQUESTED, RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED, RideStatus.STARTED] }
      }
    });

    if (activeRide) {
      throw new BadRequestException('Passenger already has an active ride');
    }

    // 2. Validate zones & Calculate distance and fare
    // We assume pooling is always true for the MVP
    const fareDetails = await this.faresService.calculateFare(dto.pickupZoneId, dto.destinationZoneId, true);

    const seats = dto.requestedSeats ?? 1;
    const paymentMethod = dto.paymentMethod ?? PaymentMethod.CASH;

    // 3. Create Ride REQUESTED and history in a transaction
    return this.prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.create({
        data: {
          passengerId,
          pickupZoneId: dto.pickupZoneId,
          destinationZoneId: dto.destinationZoneId,
          seatsRequested: seats,
          status: RideStatus.REQUESTED,
          baseFarePaisa: fareDetails.baseFarePaisa,
          distanceFarePaisa: fareDetails.distanceFarePaisa,
          poolDiscountPaisa: fareDetails.poolDiscountPaisa,
          totalFarePaisa: fareDetails.finalFarePaisa,
          payment: {
            create: {
              amountPaisa: fareDetails.finalFarePaisa,
              method: paymentMethod,
              status: PaymentStatus.PENDING,
            }
          },
          statusHistory: {
            create: {
              toStatus: RideStatus.REQUESTED,
              changedById: passengerId,
              note: 'Ride requested by passenger',
            }
          }
        },
      });

      return {
        id: ride.id,
        status: ride.status,
        estimatedFarePaisa: ride.totalFarePaisa,
      };
    });
  }

  async cancelRide(passengerId: string, rideId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        include: { poolMembership: true }
      });

      if (!ride) {
        throw new NotFoundException('Ride not found');
      }
      if (ride.passengerId !== passengerId) {
        throw new BadRequestException('Not your ride');
      }

      if (ride.status !== RideStatus.REQUESTED && ride.status !== RideStatus.MATCHED) {
        throw new BadRequestException('Ride cannot be cancelled from its current state');
      }

      if (ride.status === RideStatus.REQUESTED) {
        // Just cancel the ride
        const updatedRide = await tx.rideRequest.update({
          where: { id: ride.id },
          data: { 
            status: RideStatus.CANCELLED, 
            cancelledAt: new Date(),
            cancellationReason: 'PASSENGER_CANCELLED'
          }
        });
        await tx.rideStatusHistory.create({
          data: {
            rideRequestId: ride.id,
            fromStatus: RideStatus.REQUESTED,
            toStatus: RideStatus.CANCELLED,
            changedById: passengerId,
            note: 'Passenger cancelled before matching'
          }
        });
        return updatedRide;
      }

      // If MATCHED, handle pool un-matching
      if (ride.status === RideStatus.MATCHED && ride.poolMembership) {
        const poolId = ride.poolMembership.poolId;

        // Lock pool row
        const lockedPools = await tx.$queryRaw<any[]>`
          SELECT "totalCapacity", "seatsReserved" FROM pools WHERE id = ${poolId} FOR UPDATE
        `;

        if (lockedPools.length > 0) {
          await tx.poolMember.update({
            where: { id: ride.poolMembership.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() }
          });

          await tx.pool.update({
            where: { id: poolId },
            data: { seatsReserved: { decrement: ride.seatsRequested } }
          });
        }

        const updatedRide = await tx.rideRequest.update({
          where: { id: ride.id },
          data: { 
            status: RideStatus.CANCELLED, 
            cancelledAt: new Date(),
            cancellationReason: 'PASSENGER_CANCELLED'
          }
        });

        await tx.rideStatusHistory.create({
          data: {
            rideRequestId: ride.id,
            fromStatus: RideStatus.MATCHED,
            toStatus: RideStatus.CANCELLED,
            changedById: passengerId,
            note: 'Passenger cancelled after matching'
          }
        });

        // If all pool members are cancelled, cancel the pool
        const allMembers = await tx.poolMember.findMany({ where: { poolId } });
        const activeMembers = allMembers.filter(m => m.status !== 'CANCELLED' && m.status !== 'COMPLETED');
        if (activeMembers.length === 0) {
          const pool = await tx.pool.update({
            where: { id: poolId },
            data: { status: 'CANCELLED', cancelledAt: new Date() }
          });
          await tx.vehicle.update({
            where: { id: pool.vehicleId },
            data: { status: 'ONLINE' }
          });
        }

        return updatedRide;
      }
    });
  }

  async getCurrentRide(passengerId: string) {
    const ride = await this.prisma.rideRequest.findFirst({
      where: {
        passengerId,
        status: { in: [RideStatus.REQUESTED, RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED, RideStatus.STARTED] }
      },
      include: {
        pickupZone: { select: { name: true } },
        destinationZone: { select: { name: true } },
        payment: true,
        poolMembership: {
          include: {
            pool: {
              include: {
                driver: { select: { name: true, phone: true } },
                vehicle: { select: { model: true, plateNo: true } }
              }
            }
          }
        }
      }
    });

    if (!ride) {
      throw new NotFoundException('No active ride found');
    }

    return ride;
  }

  async getRideById(passengerId: string, rideId: string) {
    const ride = await this.prisma.rideRequest.findUnique({
      where: { id: rideId },
      include: {
        pickupZone: { select: { name: true } },
        destinationZone: { select: { name: true } },
        payment: true,
        poolMembership: {
          include: {
            pool: {
              include: {
                driver: { select: { name: true } },
                vehicle: { select: { model: true, plateNo: true } }
              }
            }
          }
        }
      }
    });

    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.passengerId !== passengerId) throw new BadRequestException('Not your ride');

    return ride;
  }

  async getRides(passengerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const rides = await this.prisma.rideRequest.findMany({
      where: { passengerId },
      include: {
        pickupZone: { select: { name: true } },
        destinationZone: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    return rides;
  }
}
