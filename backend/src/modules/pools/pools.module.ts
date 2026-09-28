import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service.js';
import { PoolsController } from './pools.controller.js';

@Module({
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
