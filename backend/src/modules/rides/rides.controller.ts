import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { RidesService } from './rides.service.js';
import { CreateRideDto } from './dto/create-ride.dto.js';
import { RideEstimateDto } from './dto/ride-estimate.dto.js';
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

  @ApiOperation({ summary: 'Estimate ride fare' })
  @ApiResponse({ status: 200, description: 'Returns fare estimation' })
  @Post('estimate')
  async estimateFare(@Body() dto: RideEstimateDto) {
    const data = await this.ridesService.estimateFare(dto);
    return { success: true, data };
  }

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

  @ApiOperation({ summary: 'Cancel a ride request' })
  @ApiResponse({ status: 200, description: 'Ride cancelled successfully' })
  @Post(':id/cancel')
  async cancelRide(@CurrentUser() user: User, @Param('id') rideId: string) {
    const ride = await this.ridesService.cancelRide(user.id, rideId);
    return { success: true, message: 'Ride cancelled successfully', data: ride };
  }

  @ApiOperation({ summary: 'Get current active ride' })
  @ApiResponse({ status: 200, description: 'Current ride details' })
  @Get('current')
  async getCurrentRide(@CurrentUser() user: User) {
    const ride = await this.ridesService.getCurrentRide(user.id);
    return { success: true, data: ride };
  }

  @ApiOperation({ summary: 'Get ride by ID' })
  @ApiResponse({ status: 200, description: 'Ride details' })
  @Get(':id')
  async getRideById(@CurrentUser() user: User, @Param('id') rideId: string) {
    const ride = await this.ridesService.getRideById(user.id, rideId);
    return { success: true, data: ride };
  }

  @ApiOperation({ summary: 'Get passenger ride history' })
  @ApiResponse({ status: 200, description: 'List of past rides' })
  @Get()
  async getRides(@CurrentUser() user: User, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = Math.min(parseInt(limit || '20', 10), 100);
    const rides = await this.ridesService.getRides(user.id, p, l);
    return { success: true, data: rides };
  }
}
