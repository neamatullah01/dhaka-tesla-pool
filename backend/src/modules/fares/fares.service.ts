import { Injectable } from '@nestjs/common';
import { ZonesService } from '../zones/zones.service.js';

@Injectable()
export class FaresService {
  private readonly BASE_FARE_PAISA = 5000;
  private readonly PER_METER_PAISA = 2;
  private readonly POOL_DISCOUNT_PAISA = 2000;

  constructor(private readonly zonesService: ZonesService) {}

  async calculateFare(pickupZoneId: string, destinationZoneId: string, pooled: boolean) {
    // getRouteDistance natively handles edge cases: same zone, unsupported route, missing route
    const route = await this.zonesService.getRouteDistance(pickupZoneId, destinationZoneId);
    
    const distanceMeters = Math.floor(route.distanceKm * 1000);
    const distanceFarePaisa = distanceMeters * this.PER_METER_PAISA;
    const poolDiscountPaisa = pooled ? this.POOL_DISCOUNT_PAISA : 0;
    
    const finalFarePaisa = Math.max(0, this.BASE_FARE_PAISA + distanceFarePaisa - poolDiscountPaisa);

    return {
      distanceMeters,
      baseFarePaisa: this.BASE_FARE_PAISA,
      distanceFarePaisa,
      poolDiscountPaisa,
      finalFarePaisa,
    };
  }
}
