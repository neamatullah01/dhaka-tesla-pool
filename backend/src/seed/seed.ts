import 'dotenv/config';
import { PrismaClient, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Password for all seed users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Zones
  const zonesData = [
    { name: 'Banani', corridorCode: 'CORRIDOR_NORTH_SOUTH', routeOrder: 1 },
    { name: 'Gulshan 1', corridorCode: 'CORRIDOR_NORTH_SOUTH', routeOrder: 2 },
    { name: 'Gulshan 2', corridorCode: 'CORRIDOR_NORTH_SOUTH', routeOrder: 3 },
    { name: 'Mohakhali', corridorCode: 'CORRIDOR_NORTH_SOUTH', routeOrder: 4 },
    { name: 'Farmgate', corridorCode: 'CORRIDOR_NORTH_SOUTH', routeOrder: 5 },
    { name: 'Dhanmondi', corridorCode: 'CORRIDOR_WEST', routeOrder: 1 },
    { name: 'Mirpur', corridorCode: 'CORRIDOR_WEST', routeOrder: 2 },
    { name: 'Uttara', corridorCode: 'CORRIDOR_NORTH', routeOrder: 1 },
  ];

  for (const zone of zonesData) {
    await prisma.zone.upsert({
      where: { name: zone.name },
      update: {},
      create: zone,
    });
  }
  console.log('Zones seeded.');

  // 2. Create Driver (Jashim)
  const jashim = await prisma.user.upsert({
    where: { email: 'jashim@example.com' },
    update: {},
    create: {
      name: 'Jashim',
      email: 'jashim@example.com',
      passwordHash,
      phone: '01711000001',
      role: UserRole.DRIVER,
    },
  });

  // 3. Create Jashim's Vehicle (Bullet)
  await prisma.vehicle.upsert({
    where: { driverId: jashim.id },
    update: {},
    create: {
      driverId: jashim.id,
      model: 'Bullet',
      plateNo: 'DHAKA-D-11-2233',
      capacity: 3,
      status: VehicleStatus.OFFLINE,
    },
  });
  console.log('Driver Jashim and his vehicle Bullet seeded.');

  // 4. Create Passengers (Nusrat, Rafiq, Shirin)
  const passengers = [
    { name: 'Nusrat', email: 'nusrat@example.com', phone: '01711000002' },
    { name: 'Rafiq', email: 'rafiq@example.com', phone: '01711000003' },
    { name: 'Shirin', email: 'shirin@example.com', phone: '01711000004' },
  ];

  for (const p of passengers) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        phone: p.phone,
        role: UserRole.PASSENGER,
        walletBalancePaisa: 500000, // 5000 BDT
      },
    });
  }
  console.log('Passengers Nusrat, Rafiq, and Shirin seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
