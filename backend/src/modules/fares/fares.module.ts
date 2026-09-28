import { Module } from '@nestjs/common';
import { FaresService } from './fares.service.js';
import { ZonesModule } from '../zones/zones.module.js';

@Module({
  imports: [ZonesModule],
  providers: [FaresService],
  exports: [FaresService],
})
export class FaresModule {}
