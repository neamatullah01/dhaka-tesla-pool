import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Bullet' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'DHAKA-D-11-2233' })
  @IsString()
  @IsNotEmpty()
  plateNo: string;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number = 3;
}
