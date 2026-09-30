import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class JoinPoolDto {
  @ApiProperty({ example: 'zone-uuid-1' })
  @IsString()
  @IsNotEmpty()
  pickupZoneId: string;

  @ApiProperty({ example: 'zone-uuid-2' })
  @IsString()
  @IsNotEmpty()
  destinationZoneId: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  requestedSeats?: number;
}
