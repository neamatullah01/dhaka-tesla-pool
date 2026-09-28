import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.zone.findMany({
      where: { isActive: true },
      orderBy: [
        { corridorCode: 'asc' },
        { routeOrder: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    return zone;
  }

  async getRouteDistance(pickupZoneId: string, destinationZoneId: string) {
    if (pickupZoneId === destinationZoneId) {
      throw new BadRequestException('Pickup and destination cannot be the same');
    }

    const [pickup, destination] = await Promise.all([
      this.prisma.zone.findUnique({ where: { id: pickupZoneId } }),
      this.prisma.zone.findUnique({ where: { id: destinationZoneId } }),
    ]);

    if (!pickup || !destination) {
      throw new BadRequestException('Invalid zone IDs');
    }

    if (!pickup.isActive || !destination.isActive) {
      throw new BadRequestException('One or both zones are inactive');
    }

    if (pickup.corridorCode !== destination.corridorCode) {
      throw new BadRequestException('Unsupported route: Zones are not in the same corridor');
    }

    // Since the PRD states direction matters, let's enforce moving 'forward' or 'backward'
    // Actually, usually distances can be retrieved regardless of direction if stored bi-directionally,
    // or we look up fromZone -> toZone.
    const distanceRecord = await this.prisma.zoneDistance.findUnique({
      where: {
        fromZoneId_toZoneId: {
          fromZoneId: pickup.id,
          toZoneId: destination.id,
        },
      },
    });

    if (!distanceRecord) {
      // Fallback or explicit failure
      throw new BadRequestException('Missing route configuration between these zones');
    }

    return {
      distanceKm: distanceRecord.distanceKm,
      pickup,
      destination,
    };
  }
}
