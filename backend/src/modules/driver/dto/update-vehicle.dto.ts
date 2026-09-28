import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Bullet Model S' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 'DHAKA-D-11-2244' })
  @IsString()
  @IsOptional()
  plateNo?: string;

  @ApiPropertyOptional({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}
