import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ZonesService } from './zones.service.js';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Zones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @ApiOperation({ summary: 'Get all active zones' })
  @ApiResponse({ status: 200, description: 'List of active zones.' })
  @Get()
  async findAll() {
    const zones = await this.zonesService.findAll();
    return {
      success: true,
      data: zones,
    };
  }

  @ApiOperation({ summary: 'Get a zone by ID' })
  @ApiParam({ name: 'id', description: 'Zone ID' })
  @ApiResponse({ status: 200, description: 'The zone details.' })
  @ApiResponse({ status: 404, description: 'Zone not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const zone = await this.zonesService.findById(id);
    return {
      success: true,
      data: zone,
    };
  }
}
