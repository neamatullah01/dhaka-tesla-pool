import 'dotenv/config';
import { DriverService } from './driver.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PoolStatus, RideStatus, UserRole, VehicleStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'crypto';

describe('Concurrency Matching (Integration)', () => {
  let driverService: DriverService;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    prisma = new PrismaService();
    driverService = new DriverService(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should correctly handle concurrent pool acceptance', async () => {
    const runId = randomUUID().split('-')[0];

    // 1. Setup Data
    const driver = await prisma.user.create({
      data: { name: 'Concurrency Driver', email: `driver_${runId}@test.com`, passwordHash: 'hash', role: UserRole.DRIVER }
    });
    
    const passenger1 = await prisma.user.create({
      data: { name: 'Pass 1', email: `pass1_${runId}@test.com`, passwordHash: 'hash', role: UserRole.PASSENGER }
    });
    
    const passenger2 = await prisma.user.create({
      data: { name: 'Pass 2', email: `pass2_${runId}@test.com`, passwordHash: 'hash', role: UserRole.PASSENGER }
    });

    const zonePickup = await prisma.zone.findFirst();
    const zoneDest = await prisma.zone.findFirst({ where: { id: { not: zonePickup!.id } } });

    const vehicle = await prisma.vehicle.create({
      data: {
        driverId: driver.id,
        model: 'Test Vehicle',
        plateNo: `TEST-CONC-${runId}`,
        capacity: 3,
        status: VehicleStatus.ONLINE,
      }
    });

    const pool = await prisma.pool.create({
      data: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        originZoneId: zonePickup!.id,
        corridorCode: zonePickup!.corridorCode,
        status: PoolStatus.OPEN,
        totalCapacity: 3,
        seatsReserved: 2, // 2 seats already taken
      }
    });

    const ride1 = await prisma.rideRequest.create({
      data: {
        passengerId: passenger1.id,
        pickupZoneId: zonePickup!.id,
        destinationZoneId: zoneDest!.id,
        seatsRequested: 1,
        status: RideStatus.REQUESTED,
        baseFarePaisa: 5000,
        distanceFarePaisa: 2000,
        totalFarePaisa: 7000,
      }
    });

    const ride2 = await prisma.rideRequest.create({
      data: {
        passengerId: passenger2.id,
        pickupZoneId: zonePickup!.id,
        destinationZoneId: zoneDest!.id,
        seatsRequested: 1,
        status: RideStatus.REQUESTED,
        baseFarePaisa: 5000,
        distanceFarePaisa: 2000,
        totalFarePaisa: 7000,
      }
    });

    // 2. Execute concurrently!
    const results = await Promise.allSettled([
      driverService.acceptRequest(driver.id, ride1.id),
      driverService.acceptRequest(driver.id, ride2.id),
    ]);

    // 3. Assertions
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // Expected: one succeeds, one fails
    console.log(rejected.map(r => r.status === 'rejected' ? r.reason : null));
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    if (rejected[0].status === 'rejected') {
      expect(rejected[0].reason).toBeInstanceOf(BadRequestException);
      expect(rejected[0].reason.message).toBe('Not enough capacity in the pool');
    }

    // Verify DB state
    const finalPool = await prisma.pool.findUnique({ where: { id: pool.id } });
    expect(finalPool!.seatsReserved).toBe(3); // Never 4!
  }, 15000);
});
