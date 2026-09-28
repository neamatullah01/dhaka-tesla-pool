import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RidesService } from './rides.service.js';
import { CreateRideDto } from './dto/create-ride.dto.js';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';

@ApiTags('Rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PASSENGER)
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @ApiOperation({ summary: 'Request a new ride' })
  @ApiResponse({ status: 201, description: 'Ride requested successfully' })
  @Post()
  async createRide(@CurrentUser() user: User, @Body() dto: CreateRideDto) {
    const ride = await this.ridesService.createRide(user.id, dto);
    return {
      success: true,
      message: 'Ride requested successfully',
      data: ride,
    };
  }
}
