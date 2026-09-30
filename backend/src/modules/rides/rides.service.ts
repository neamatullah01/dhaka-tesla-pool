import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ZonesService } from '../zones/zones.service.js';
import { FaresService } from '../fares/fares.service.js';
import { CreateRideDto } from './dto/create-ride.dto.js';
import { RideEstimateDto } from './dto/ride-estimate.dto.js';
import { RideStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zonesService: ZonesService,
    private readonly faresService: FaresService,
  ) {}

  async estimateFare(dto: RideEstimateDto) {
    if (dto.pickupZoneId === dto.destinationZoneId) {
      throw new BadRequestException('Pickup and destination cannot be the same');
    }

    const [pickup, destination] = await Promise.all([
      this.prisma.zone.findUnique({ where: { id: dto.pickupZoneId } }),
      this.prisma.zone.findUnique({ where: { id: dto.destinationZoneId } }),
    ]);

    if (!pickup || !destination) {
      throw new NotFoundException('One or both zones not found');
    }

    const distanceMeters = Math.abs(pickup.routeOrder - destination.routeOrder) * 4000;
    
    const baseFarePaisa = 5000;
    const ratePerMeterPaisa = 2;
    const distanceCharge = distanceMeters * ratePerMeterPaisa;
    
    const poolEligible = dto.requestedSeats < 3;
    const discountPaisa = poolEligible ? 2000 : 0;
    
    const totalFarePaisa = baseFarePaisa + distanceCharge - discountPaisa;

    return {
      distanceMeters,
      farePaisa: totalFarePaisa,
      poolEligible
    };
  }

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
    // Inside your cancel ride method:
    const ride = await this.prisma.rideRequest.findUnique({
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

    await this.prisma.$transaction(async (prisma) => {
      // 1. Mark the ride as CANCELLED
      await prisma.rideRequest.update({
        where: { id: rideId },
        data: { 
          status: 'CANCELLED', 
          cancelledAt: new Date(),
          cancellationReason: 'PASSENGER_CANCELLED'
        }
      });
      
      await prisma.rideStatusHistory.create({
        data: {
          rideRequestId: rideId,
          fromStatus: ride.status,
          toStatus: RideStatus.CANCELLED,
          changedById: passengerId,
          note: 'Passenger cancelled the ride'
        }
      });

      // 2. If the ride was already assigned to a pool, free up the seats!
      if (ride.poolMembership) {
        // Decrease the reserved seats on the pool
        await prisma.pool.update({
          where: { id: ride.poolMembership.poolId },
          data: {
            seatsReserved: { decrement: ride.seatsRequested }
          }
        });
        
        // Optional: Mark the pool member as cancelled
        await prisma.poolMember.update({
          where: { id: ride.poolMembership.id },
          data: { status: 'CANCELLED', cancelledAt: new Date() }
        });

        // If all pool members are cancelled, cancel the pool
        const allMembers = await prisma.poolMember.findMany({ where: { poolId: ride.poolMembership.poolId } });
        const activeMembers = allMembers.filter(m => m.status !== 'CANCELLED' && m.status !== 'COMPLETED');
        if (activeMembers.length === 0) {
          const pool = await prisma.pool.update({
            where: { id: ride.poolMembership.poolId },
            data: { status: 'CANCELLED', cancelledAt: new Date() }
          });
          await prisma.vehicle.update({
            where: { id: pool.vehicleId },
            data: { status: 'ONLINE' }
          });
        }
      }
    });

    return await this.prisma.rideRequest.findUnique({ where: { id: rideId } });
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
