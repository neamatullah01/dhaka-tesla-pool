import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { PoolsService } from './pools.service.js';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';

@ApiTags('Driver Pools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver/pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @ApiOperation({ summary: 'Driver arrives at pickup' })
  @ApiResponse({ status: 200, description: 'Pool and rides marked as arrived.' })
  @Post(':id/arrive')
  async arrive(@CurrentUser() user: User, @Param('id') poolId: string) {
    const pool = await this.poolsService.arrive(user.id, poolId);
    return { success: true, message: 'Driver arrived successfully', data: pool };
  }

  @ApiOperation({ summary: 'Driver starts the trip' })
  @ApiResponse({ status: 200, description: 'Pool and rides started.' })
  @Post(':id/start')
  async start(@CurrentUser() user: User, @Param('id') poolId: string) {
    const pool = await this.poolsService.start(user.id, poolId);
    return { success: true, message: 'Trip started successfully', data: pool };
  }
}
