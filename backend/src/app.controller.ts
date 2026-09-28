import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor() {}

  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy and running.' })
  @Get()
  getHealth() {
    return {
      success: true,
      data: {
        status: 'ok',
      },
    };
  }
}
