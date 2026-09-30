import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PoolStatus, RideStatus, VehicleStatus, PoolMemberStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { FaresService } from '../fares/fares.service.js';
import { JoinPoolDto } from './dto/join-pool.dto.js';

@Injectable()
export class PoolsService {
  constructor(
    private prisma: PrismaService,
    private faresService: FaresService,
  ) {}

  async arrive(driverId: string, poolId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pool = await tx.pool.findUnique({ where: { id: poolId }, include: { members: true } });
      if (!pool) throw new NotFoundException('Pool not found');
      if (pool.driverId !== driverId) throw new BadRequestException('Not your pool');
      if (pool.status !== PoolStatus.OPEN) throw new BadRequestException('Pool must be OPEN to arrive');

      const updatedPool = await tx.pool.update({
        where: { id: poolId },
        data: { status: PoolStatus.DRIVER_ARRIVED, driverArrivedAt: new Date() }
      });

      for (const member of pool.members) {
        if (member.status === PoolMemberStatus.WAITING) {
          const ride = await tx.rideRequest.findUnique({ where: { id: member.rideRequestId } });
          if (ride?.status === RideStatus.MATCHED) {
            await tx.rideRequest.update({
              where: { id: ride.id },
              data: { status: RideStatus.DRIVER_ARRIVED, driverArrivedAt: new Date() }
            });
            await tx.rideStatusHistory.create({
              data: { rideRequestId: ride.id, fromStatus: RideStatus.MATCHED, toStatus: RideStatus.DRIVER_ARRIVED, changedById: driverId, note: 'Driver arrived' }
            });
          }
        }
      }
      return updatedPool;
    });
  }

  async start(driverId: string, poolId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pool = await tx.pool.findUnique({ where: { id: poolId }, include: { members: true } });
      if (!pool) throw new NotFoundException('Pool not found');
      if (pool.driverId !== driverId) throw new BadRequestException('Not your pool');
      if (pool.status !== PoolStatus.DRIVER_ARRIVED) throw new BadRequestException('Pool must be DRIVER_ARRIVED to start');

      const updatedPool = await tx.pool.update({
        where: { id: poolId },
        data: { status: PoolStatus.STARTED, startedAt: new Date() }
      });

      await tx.vehicle.update({
        where: { id: pool.vehicleId },
        data: { status: VehicleStatus.IN_TRIP }
      });

      for (const member of pool.members) {
        if (member.status === PoolMemberStatus.WAITING) {
          const ride = await tx.rideRequest.findUnique({ where: { id: member.rideRequestId } });
          if (ride?.status === RideStatus.DRIVER_ARRIVED) {
            await tx.poolMember.update({
              where: { id: member.id },
              data: { status: PoolMemberStatus.PICKED_UP, pickedUpAt: new Date() }
            });
            await tx.rideRequest.update({
              where: { id: ride.id },
              data: { status: RideStatus.STARTED, startedAt: new Date() }
            });
            await tx.rideStatusHistory.create({
              data: { rideRequestId: ride.id, fromStatus: RideStatus.DRIVER_ARRIVED, toStatus: RideStatus.STARTED, changedById: driverId, note: 'Trip started' }
            });
          }
        }
      }
      return updatedPool;
    });
  }

  async getActivePoolsForRoute(pickupZoneId: string, destinationZoneId: string) {
    if (pickupZoneId === destinationZoneId) {
      throw new BadRequestException('Pickup and destination cannot be the same');
    }

    const pickup = await this.prisma.zone.findUnique({ where: { id: pickupZoneId } });
    const destination = await this.prisma.zone.findUnique({ where: { id: destinationZoneId } });

    if (!pickup || !destination) {
      throw new NotFoundException('One or both zones not found');
    }

    if (pickup.corridorCode !== destination.corridorCode) {
      return [];
    }

    const pools = await this.prisma.pool.findMany({
      where: {
        corridorCode: pickup.corridorCode,
        status: { in: [PoolStatus.OPEN, PoolStatus.DRIVER_ARRIVED] },
        seatsReserved: { lt: 3 },
      },
      include: {
        driver: { select: { name: true } },
        originZone: { select: { name: true, routeOrder: true } },
        members: {
          include: {
            rideRequest: {
              include: {
                destinationZone: { select: { name: true, routeOrder: true } }
              }
            }
          }
        }
      }
    });

    const activePools = pools.filter(p => p.totalCapacity - p.seatsReserved >= 1);
    
    return activePools.map(pool => {
      // Determine last destination among pool members
      let lastDestName = destination.name;
      if (pool.members.length > 0) {
        // Assume route direction based on pickup/destination
        const direction = pickup.routeOrder < destination.routeOrder ? 1 : -1;
        let furthestOrder = pool.originZone.routeOrder;
        
        for (const m of pool.members) {
           const destOrder = m.rideRequest.destinationZone.routeOrder;
           if (direction === 1 && destOrder > furthestOrder) {
             furthestOrder = destOrder;
             lastDestName = m.rideRequest.destinationZone.name;
           } else if (direction === -1 && destOrder < furthestOrder) {
             furthestOrder = destOrder;
             lastDestName = m.rideRequest.destinationZone.name;
           }
        }
      }

      return {
        id: pool.id,
        driverName: pool.driver.name,
        currentLocation: pool.originZone.name,
        lastDestination: lastDestName,
        availableSeats: pool.totalCapacity - pool.seatsReserved,
        totalSeats: pool.totalCapacity
      };
    });
  }

  async joinPool(passengerId: string, poolId: string, dto: JoinPoolDto) {
    const requestedSeats = dto.requestedSeats ?? 1;

    // 1. Check if passenger already has active ride
    const activeRide = await this.prisma.rideRequest.findFirst({
      where: {
        passengerId,
        status: { in: [RideStatus.REQUESTED, RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED, RideStatus.STARTED] }
      }
    });

    if (activeRide) {
      throw new BadRequestException('Passenger already has an active ride');
    }

    // 2. Fetch the pool and lock it
    return this.prisma.$transaction(async (tx) => {
      const lockedPools = await tx.$queryRaw<any[]>`SELECT "status", "totalCapacity", "seatsReserved" FROM pools WHERE id = ${poolId} FOR UPDATE`;
      if (lockedPools.length === 0) throw new NotFoundException('Pool not found');
      const lockedPool = lockedPools[0];

      if (lockedPool.status !== PoolStatus.OPEN && lockedPool.status !== PoolStatus.DRIVER_ARRIVED) {
        throw new BadRequestException('Pool is not active for joining');
      }

      if (lockedPool.seatsReserved + requestedSeats > lockedPool.totalCapacity) {
        throw new BadRequestException('Not enough seats available in this pool');
      }

      // 3. Calculate fare using FaresService
      const fareDetails = await this.faresService.calculateFare(dto.pickupZoneId, dto.destinationZoneId, true);

      // 4. Create ride and pool member
      const ride = await tx.rideRequest.create({
        data: {
          passengerId,
          pickupZoneId: dto.pickupZoneId,
          destinationZoneId: dto.destinationZoneId,
          seatsRequested: requestedSeats,
          status: RideStatus.MATCHED, // <--- MAKE SURE THIS IS MATCHED!
          baseFarePaisa: fareDetails.baseFarePaisa,
          distanceFarePaisa: fareDetails.distanceFarePaisa,
          poolDiscountPaisa: fareDetails.poolDiscountPaisa,
          totalFarePaisa: fareDetails.finalFarePaisa,
          payment: {
            create: {
              amountPaisa: fareDetails.finalFarePaisa,
              method: PaymentMethod.CASH,
              status: PaymentStatus.PENDING,
            }
          },
          statusHistory: {
            create: {
              toStatus: RideStatus.MATCHED,
              changedById: passengerId,
              note: 'Passenger directly joined pool',
            }
          }
        }
      });

      // Update pool and create member
      await tx.pool.update({
        where: { id: poolId },
        data: { seatsReserved: { increment: requestedSeats } }
      });

      await tx.poolMember.create({
        data: {
          poolId: poolId,
          rideRequestId: ride.id,
          seatsAllocated: requestedSeats,
          status: PoolMemberStatus.WAITING,
        }
      });

      return {
        id: ride.id,
        status: ride.status,
        estimatedFarePaisa: ride.totalFarePaisa,
      };
    }, { maxWait: 15000, timeout: 15000 });
  }
}
