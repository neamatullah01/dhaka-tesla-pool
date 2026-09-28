import { Module } from '@nestjs/common';
import { RidesService } from './rides.service.js';
import { RidesController } from './rides.controller.js';
import { ZonesModule } from '../zones/zones.module.js';
import { FaresModule } from '../fares/fares.module.js';

@Module({
  imports: [ZonesModule, FaresModule],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
