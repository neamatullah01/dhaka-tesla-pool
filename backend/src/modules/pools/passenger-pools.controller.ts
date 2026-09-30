import { Controller, Get, Post, Query, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PoolsService } from './pools.service.js';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';
import { JoinPoolDto } from './dto/join-pool.dto.js';

@ApiTags('Passenger Pools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PASSENGER)
@Controller('passenger/pools')
export class PassengerPoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @ApiOperation({ summary: 'Get active pools matching route' })
  @ApiResponse({ status: 200, description: 'List of active pools' })
  @Get('active')
  async getActivePools(
    @Query('pickupZoneId') pickupZoneId: string,
    @Query('destinationZoneId') destinationZoneId: string,
  ) {
    if (!pickupZoneId || !destinationZoneId) {
      throw new BadRequestException('pickupZoneId and destinationZoneId are required');
    }
    const pools = await this.poolsService.getActivePoolsForRoute(pickupZoneId, destinationZoneId);
    return { success: true, data: pools };
  }

  @ApiOperation({ summary: 'Join an active pool directly' })
  @ApiResponse({ status: 201, description: 'Successfully requested to join pool' })
  @Post(':id/join')
  async joinPool(
    @CurrentUser() user: User,
    @Param('id') poolId: string,
    @Body() dto: JoinPoolDto,
  ) {
    const ride = await this.poolsService.joinPool(user.id, poolId, dto);
    return { success: true, message: 'Successfully requested to join the pool', data: ride };
  }
}
