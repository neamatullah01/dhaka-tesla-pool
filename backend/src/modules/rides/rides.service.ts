import { Injectable, BadRequestException } from '@nestjs/common';
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
}
