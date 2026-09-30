import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service.js';
import { PoolsController } from './pools.controller.js';
import { PassengerPoolsController } from './passenger-pools.controller.js';
import { FaresModule } from '../fares/fares.module.js';

@Module({
  imports: [FaresModule],
  controllers: [PoolsController, PassengerPoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
