import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { GetRequestsDto } from './dto/get-requests.dto.js';
import { VehicleStatus, RideStatus, PoolStatus, PoolMemberStatus, Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async createVehicle(driverId: string, dto: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findUnique({ where: { driverId } });
    if (existing) {
      throw new BadRequestException('Driver already has a vehicle');
    }
    const plateCheck = await this.prisma.vehicle.findUnique({ where: { plateNo: dto.plateNo } });
    if (plateCheck) {
      throw new BadRequestException('Vehicle with this plate number already exists');
    }

    return this.prisma.vehicle.create({
      data: {
        driverId,
        model: dto.model,
        plateNo: dto.plateNo,
        capacity: dto.capacity ?? 3,
        status: VehicleStatus.OFFLINE,
      },
    });
  }

  async getVehicle(driverId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { driverId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found for this driver');
    }
    return vehicle;
  }

  async updateVehicle(driverId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.getVehicle(driverId);
    
    if (dto.plateNo && dto.plateNo !== vehicle.plateNo) {
      const plateCheck = await this.prisma.vehicle.findUnique({ where: { plateNo: dto.plateNo } });
      if (plateCheck) {
        throw new BadRequestException('Vehicle with this plate number already exists');
      }
    }

    return this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        ...dto,
      },
    });
  }

  async goOnline(driverId: string) {
    const vehicle = await this.getVehicle(driverId);
    
    if (!vehicle.isActive) {
      throw new BadRequestException('Cannot go online with an inactive vehicle');
    }

    return this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: VehicleStatus.ONLINE },
    });
  }

  async goOffline(driverId: string) {
    const vehicle = await this.getVehicle(driverId);
    
    if (vehicle.status === VehicleStatus.IN_TRIP) {
      throw new BadRequestException('Cannot go offline while STARTED/IN_TRIP');
    }
    
    return this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: VehicleStatus.OFFLINE },
    });
  }

  async getRequests(dto: GetRequestsDto) {
    const whereClause: any = {
      status: RideStatus.REQUESTED,
    };

    if (dto.pickupZoneId) {
      whereClause.pickupZoneId = dto.pickupZoneId;
    }

    if (dto.corridorCode) {
      whereClause.pickupZone = {
        ...(whereClause.pickupZone || {}),
        corridorCode: dto.corridorCode,
      };
    }

    if (dto.date) {
      const startOfDay = new Date(`${dto.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${dto.date}T23:59:59.999Z`);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const requests = await this.prisma.rideRequest.findMany({
      where: whereClause,
      select: {
        id: true,
        pickupZoneId: true,
        destinationZoneId: true,
        seatsRequested: true,
        totalFarePaisa: true,
        createdAt: true,
        pickupZone: { select: { name: true, corridorCode: true } },
        destinationZone: { select: { name: true, corridorCode: true } },
        passenger: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return requests;
  }

  async acceptRequest(driverId: string, rideId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate driver and vehicle
      const vehicle = await tx.vehicle.findUnique({ where: { driverId } });
      if (!vehicle) throw new BadRequestException('Driver does not have a vehicle');
      if (vehicle.status !== VehicleStatus.ONLINE && vehicle.status !== VehicleStatus.IN_TRIP) {
        throw new BadRequestException('Driver must be ONLINE or IN_TRIP to accept rides');
      }
      
      // 2. Validate Ride
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        include: { pickupZone: true },
      });
      if (!ride) throw new NotFoundException('Ride not found');
      if (ride.status !== RideStatus.REQUESTED) {
        throw new BadRequestException('Ride is no longer available (not REQUESTED)');
      }

      // 3. Find compatible OPEN pool
      let pool = await tx.pool.findFirst({
        where: {
          driverId,
          status: PoolStatus.OPEN,
          corridorCode: ride.pickupZone.corridorCode,
        },
      });

      if (pool) {
        // Concurrency Strategy: Lock the pool row for update
        const lockedPools = await tx.$queryRaw<any[]>`
          SELECT "totalCapacity", "seatsReserved" FROM pools WHERE id = ${pool.id} FOR UPDATE
        `;

        if (lockedPools.length === 0) {
           throw new BadRequestException('Pool disappeared during lock');
        }
        const lockedPool = lockedPools[0];

        if (lockedPool.seatsReserved + ride.seatsRequested > lockedPool.totalCapacity) {
          throw new BadRequestException('Not enough capacity in the pool');
        }

        // We use the Prisma client to update since we locked the row
        pool = await tx.pool.update({
          where: { id: pool.id },
          data: {
            seatsReserved: { increment: ride.seatsRequested }
          }
        });
      } else {
        // Check if there's any active pool that is NOT in this corridor
        const activeOtherPool = await tx.pool.findFirst({
           where: { driverId, status: { in: [PoolStatus.OPEN, PoolStatus.DRIVER_ARRIVED, PoolStatus.STARTED] } }
        });
        if (activeOtherPool) {
           throw new BadRequestException('Driver already has an active pool in a different state or corridor');
        }

        // Check if there's enough capacity in vehicle
        if (ride.seatsRequested > vehicle.capacity) {
           throw new BadRequestException('Not enough capacity in vehicle');
        }

        // Create new pool
        pool = await tx.pool.create({
          data: {
            driverId,
            vehicleId: vehicle.id,
            originZoneId: ride.pickupZoneId,
            corridorCode: ride.pickupZone.corridorCode,
            status: PoolStatus.OPEN,
            totalCapacity: vehicle.capacity,
            seatsReserved: ride.seatsRequested,
          }
        });
      }

      // 4. Create pool member
      await tx.poolMember.create({
        data: {
          poolId: pool.id,
          rideRequestId: ride.id,
          seatsAllocated: ride.seatsRequested,
          status: PoolMemberStatus.WAITING,
        }
      });

      // 5. Update ride to MATCHED
      await tx.rideRequest.update({
        where: { id: ride.id },
        data: { 
          status: RideStatus.MATCHED,
          matchedAt: new Date(),
        }
      });

      // 6. Create status history
      await tx.rideStatusHistory.create({
        data: {
          rideRequestId: ride.id,
          fromStatus: RideStatus.REQUESTED,
          toStatus: RideStatus.MATCHED,
          changedById: driverId,
          note: 'Driver matched and pooled ride',
        }
      });

      return pool;
    }, { maxWait: 15000, timeout: 15000 });
  }

  async getCurrentPool(driverId: string) {
    const pool = await this.prisma.pool.findFirst({
      where: {
        driverId,
        status: { in: [PoolStatus.OPEN, PoolStatus.DRIVER_ARRIVED, PoolStatus.STARTED] }
      },
      include: {
        members: {
          include: {
            rideRequest: {
              include: {
                passenger: { select: { name: true } },
                pickupZone: { select: { name: true } },
                destinationZone: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!pool) {
      throw new NotFoundException('No active pool found for this driver');
    }
    return pool;
  }

  async updateRideStatus(driverId: string, rideId: string, newStatus: RideStatus) {
    return this.prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        include: { poolMembership: { include: { pool: true } } }
      });
      if (!ride) throw new NotFoundException('Ride not found');
      if (!ride.poolMembership) throw new BadRequestException('Ride is not in a pool');
      if (ride.poolMembership.pool.driverId !== driverId) throw new BadRequestException('Not your pool');
      // 1. Update the RideRequest Status
      const updatedRide = await tx.rideRequest.update({
        where: { id: ride.id },
        data: { 
          status: newStatus,
          ...(newStatus === RideStatus.STARTED ? { startedAt: new Date() } : {}),
          ...(newStatus === RideStatus.COMPLETED ? { completedAt: new Date() } : {})
        }
      });
      // 2. Map it to the correct PoolMember Status
      let memberStatus = ride.poolMembership.status;
      if (newStatus === RideStatus.STARTED) memberStatus = PoolMemberStatus.PICKED_UP;
      if (newStatus === RideStatus.COMPLETED) memberStatus = PoolMemberStatus.COMPLETED;
      if (newStatus === RideStatus.CANCELLED) memberStatus = PoolMemberStatus.CANCELLED;
      await tx.poolMember.update({
        where: { id: ride.poolMembership.id },
        data: { 
          status: memberStatus,
          ...(newStatus === RideStatus.STARTED ? { pickedUpAt: new Date() } : {}),
          ...(newStatus === RideStatus.COMPLETED ? { completedAt: new Date() } : {})
        }
      });
      // 3. Free up reserved seats if CANCELLED
      if (newStatus === RideStatus.CANCELLED) {
        await tx.pool.update({
          where: { id: ride.poolMembership.poolId },
          data: {
            seatsReserved: { decrement: ride.seatsRequested }
          }
        });
      }
      // 4. Log the history
      await tx.rideStatusHistory.create({
        data: {
          rideRequestId: ride.id,
          fromStatus: ride.status,
          toStatus: newStatus,
          changedById: driverId,
          note: `Driver individually updated passenger to ${newStatus}`
        }
      });
      // 5. If dropped off (COMPLETED), finalize Payment
      if (newStatus === RideStatus.COMPLETED) {
        await tx.payment.upsert({
          where: { rideRequestId: ride.id },
          update: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          },
          create: {
            rideRequestId: ride.id,
            amountPaisa: ride.totalFarePaisa,
            method: PaymentMethod.CASH,
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          }
        });
      }
      // 6. Check if entire pool is completed
      if (newStatus === RideStatus.COMPLETED || newStatus === RideStatus.CANCELLED) {
        const allMembers = await tx.poolMember.findMany({ where: { poolId: ride.poolMembership.poolId } });
        const allDone = allMembers.every(m => m.status === PoolMemberStatus.COMPLETED || m.status === PoolMemberStatus.CANCELLED);
  
        if (allDone) {
          await tx.pool.update({
            where: { id: ride.poolMembership.poolId },
            data: { status: PoolStatus.COMPLETED, completedAt: new Date() }
          });
          await tx.vehicle.update({
            where: { driverId },
            data: { status: VehicleStatus.ONLINE }
          });
        }
      }
      return updatedRide;
    });
  }

  async completeRide(driverId: string, rideId: string) {
    return this.prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        include: { poolMembership: { include: { pool: true } } }
      });

      if (!ride) throw new NotFoundException('Ride not found');
      if (!ride.poolMembership) throw new BadRequestException('Ride is not in a pool');
      if (ride.poolMembership.pool.driverId !== driverId) throw new BadRequestException('Not your pool');
      if (ride.status !== RideStatus.STARTED) throw new BadRequestException('Ride must be STARTED to complete');

      const updatedRide = await tx.rideRequest.update({
        where: { id: ride.id },
        data: { status: RideStatus.COMPLETED, completedAt: new Date() }
      });

      await tx.poolMember.update({
        where: { id: ride.poolMembership.id },
        data: { status: PoolMemberStatus.COMPLETED, completedAt: new Date() }
      });

      await tx.rideStatusHistory.create({
        data: {
          rideRequestId: ride.id,
          fromStatus: RideStatus.STARTED,
          toStatus: RideStatus.COMPLETED,
          changedById: driverId,
          note: 'Driver completed individual ride'
        }
      });

      await tx.payment.upsert({
        where: { rideRequestId: ride.id },
        update: {
          status: 'PAID',
          paidAt: new Date(),
        },
        create: {
          rideRequestId: ride.id,
          amountPaisa: ride.totalFarePaisa,
          method: 'CASH',
          status: 'PAID',
          paidAt: new Date(),
        }
      });

      // Check if pool is fully completed
      const allMembers = await tx.poolMember.findMany({ where: { poolId: ride.poolMembership.poolId } });
      const allDone = allMembers.every(m => m.status === PoolMemberStatus.COMPLETED || m.status === PoolMemberStatus.CANCELLED);

      if (allDone) {
        await tx.pool.update({
          where: { id: ride.poolMembership.poolId },
          data: { status: PoolStatus.COMPLETED, completedAt: new Date() }
        });
        await tx.vehicle.update({
          where: { driverId },
          data: { status: VehicleStatus.ONLINE }
        });
      }

      return updatedRide;
    });
  }

  async confirmPayment(driverId: string, rideId: string) {
    const ride = await this.prisma.rideRequest.findUnique({
      where: { id: rideId },
      include: { poolMembership: { include: { pool: true } }, payment: true }
    });

    if (!ride) throw new NotFoundException('Ride not found');
    if (!ride.poolMembership || ride.poolMembership.pool.driverId !== driverId) throw new BadRequestException('Not your ride');
    if (ride.status !== RideStatus.COMPLETED) throw new BadRequestException('Ride must be COMPLETED to confirm payment');
    if (!ride.payment) throw new NotFoundException('Payment record not found');
    if (ride.payment.status === 'PAID') throw new BadRequestException('Payment already confirmed');

    return this.prisma.payment.update({
      where: { id: ride.payment.id },
      data: { status: 'PAID', paidAt: new Date() }
    });
  }

  async getRides(driverId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const rides = await this.prisma.rideRequest.findMany({
      where: {
        poolMembership: { pool: { driverId } }
      },
      include: {
        pickupZone: { select: { name: true } },
        destinationZone: { select: { name: true } },
        passenger: { select: { name: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    return rides;
  }
}
