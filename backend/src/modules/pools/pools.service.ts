import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PoolStatus, RideStatus, VehicleStatus, PoolMemberStatus } from '@prisma/client';

@Injectable()
export class PoolsService {
  constructor(private prisma: PrismaService) {}

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
}
