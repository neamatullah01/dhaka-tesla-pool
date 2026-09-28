import { Controller, Get, Post, Patch, Body, UseGuards, Query, Param } from '@nestjs/common';
import { DriverService } from './driver.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { GetRequestsDto } from './dto/get-requests.dto.js';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';

@ApiTags('Driver')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @ApiOperation({ summary: 'Create a new vehicle for the driver' })
  @ApiResponse({ status: 201, description: 'Vehicle created.' })
  @Post('vehicle')
  async createVehicle(@CurrentUser() user: User, @Body() dto: CreateVehicleDto) {
    const vehicle = await this.driverService.createVehicle(user.id, dto);
    return { success: true, data: vehicle };
  }

  @ApiOperation({ summary: 'Get driver vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle details.' })
  @Get('vehicle')
  async getVehicle(@CurrentUser() user: User) {
    const vehicle = await this.driverService.getVehicle(user.id);
    return { success: true, data: vehicle };
  }

  @ApiOperation({ summary: 'Update driver vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated.' })
  @Patch('vehicle')
  async updateVehicle(@CurrentUser() user: User, @Body() dto: UpdateVehicleDto) {
    const vehicle = await this.driverService.updateVehicle(user.id, dto);
    return { success: true, data: vehicle };
  }

  @ApiOperation({ summary: 'Driver goes online' })
  @ApiResponse({ status: 200, description: 'Driver is now online.' })
  @Post('online')
  async goOnline(@CurrentUser() user: User) {
    const vehicle = await this.driverService.goOnline(user.id);
    return { success: true, data: vehicle };
  }

  @ApiOperation({ summary: 'Driver goes offline' })
  @ApiResponse({ status: 200, description: 'Driver is now offline.' })
  @Post('offline')
  async goOffline(@CurrentUser() user: User) {
    const vehicle = await this.driverService.goOffline(user.id);
    return { success: true, data: vehicle };
  }

  @ApiOperation({ summary: 'Discover open passenger ride requests' })
  @ApiResponse({ status: 200, description: 'List of REQUESTED rides.' })
  @Get('requests')
  async getRequests(@Query() query: GetRequestsDto) {
    const requests = await this.driverService.getRequests(query);
    return { success: true, data: requests };
  }

  @ApiOperation({ summary: 'Driver accepts a passenger ride request' })
  @ApiResponse({ status: 200, description: 'Ride accepted and matched to pool.' })
  @Post('requests/:id/accept')
  async acceptRequest(@CurrentUser() user: User, @Param('id') rideId: string) {
    const poolData = await this.driverService.acceptRequest(user.id, rideId);
    return { success: true, message: 'Ride accepted', data: poolData };
  }
}
