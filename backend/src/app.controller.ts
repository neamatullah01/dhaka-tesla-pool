import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  constructor() {}

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
