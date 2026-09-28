import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { GetRequestsDto } from './dto/get-requests.dto.js';
import { VehicleStatus, RideStatus } from '@prisma/client';

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
}
