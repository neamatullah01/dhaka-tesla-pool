import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RideEstimateDto {
  @ApiProperty({ description: 'ID of the pickup zone' })
  @IsUUID()
  pickupZoneId: string;
  
  @ApiProperty({ description: 'ID of the destination zone' })
  @IsUUID()
  destinationZoneId: string;
  
  @ApiProperty({ description: 'Number of seats requested', minimum: 1, maximum: 3 })
  @IsInt()
  @Min(1)
  @Max(3)
  requestedSeats: number;
}
