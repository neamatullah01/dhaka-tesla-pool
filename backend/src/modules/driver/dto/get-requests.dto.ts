import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRequestsDto {
  @ApiPropertyOptional({ description: 'Filter by exact pickup zone ID' })
  @IsString()
  @IsOptional()
  pickupZoneId?: string;

  @ApiPropertyOptional({ description: 'Filter by corridor code (e.g., CORRIDOR_NORTH_SOUTH)' })
  @IsString()
  @IsOptional()
  corridorCode?: string;

  @ApiPropertyOptional({ description: 'Filter by date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  date?: string;
}
