import { Route, MapPin, Flag, CircleDot, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoneOption {
  id: string;
  name: string;
  order: number;
}

interface ZoneCorridorProps {
  zones: ZoneOption[];
  pickupId?: string;
  destinationId?: string;
}

export function ZoneCorridor({ zones, pickupId, destinationId }: ZoneCorridorProps) {
  const pickupIdx = pickupId ? zones.findIndex(z => z.id === pickupId) : -1;
  const destIdx = destinationId ? zones.findIndex(z => z.id === destinationId) : -1;
  
  const minIdx = pickupIdx !== -1 && destIdx !== -1 ? Math.min(pickupIdx, destIdx) : -1;
  const maxIdx = pickupIdx !== -1 && destIdx !== -1 ? Math.max(pickupIdx, destIdx) : -1;

  return (
    <div className="bg-surface-container-lowest rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-primary-container" aria-hidden="true" />
          <span className="text-label-sm uppercase tracking-wider text-primary-container font-semibold">Corridor zones</span>
        </div>
        <span className="text-label-sm text-on-surface-variant hidden sm:inline-block">
          Rides run in one direction along this corridor
        </span>
      </div>

      <div className="flex items-center overflow-x-auto pb-4 pt-2 w-full">
        {zones.map((zone, index) => {
          const isPickup = zone.id === pickupId;
          const isDest = zone.id === destinationId;
          const isBetween = minIdx !== -1 && maxIdx !== -1 && index > minIdx && index < maxIdx;
          
          let circleState = "bg-surface-container-high text-on-surface-variant";
          let nameState = "text-on-surface-variant";
          
          if (isPickup) {
            circleState = "bg-primary-container text-on-primary-container";
            nameState = "text-primary-container font-semibold";
          } else if (isDest) {
            circleState = "bg-secondary-container text-on-secondary";
            nameState = "text-secondary-fixed font-semibold";
          } else if (isBetween) {
            circleState = "ring-1 ring-primary-container/40 text-primary-container bg-surface-container-lowest";
            nameState = "text-on-surface";
          }

          const hasNext = index < zones.length - 1;
          const connectorActive = minIdx !== -1 && maxIdx !== -1 && index >= minIdx && index < maxIdx;

          return (
            <div key={zone.id} className={cn("flex items-center shrink-0", hasNext && "flex-1")}>
              <div className="flex flex-col items-center gap-2 min-w-[88px] shrink-0">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", circleState)}>
                  {isPickup ? (
                    <MapPin className="w-4 h-4" />
                  ) : isDest ? (
                    <Flag className="w-4 h-4 text-black" />
                  ) : isBetween ? (
                    <CircleDot className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className={cn("text-label-sm text-center transition-colors", nameState)}>
                  {zone.name}
                </div>
              </div>
              
              {hasNext && (
                <div className={cn(
                  "h-px flex-1 min-w-[24px] w-full -mt-6 transition-colors",
                  connectorActive ? "bg-primary-container" : "bg-outline-variant"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
