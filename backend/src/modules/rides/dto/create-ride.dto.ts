import { IsString, IsNotEmpty, IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateRideDto {
  @ApiProperty({ example: 'pickup-zone-uuid' })
  @IsString()
  @IsNotEmpty()
  pickupZoneId: string;

  @ApiProperty({ example: 'destination-zone-uuid' })
  @IsString()
  @IsNotEmpty()
  destinationZoneId: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 3 })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  requestedSeats?: number = 1;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.CASH;
}
