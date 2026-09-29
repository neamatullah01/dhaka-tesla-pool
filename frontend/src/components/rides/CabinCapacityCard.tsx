import { Armchair, Info, MapPin, Flag, ChevronRight } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CabinSeats, SeatData } from "./CabinSeats";

import { ActivePoolData } from "@/hooks/useRides";

interface CabinCapacityCardProps {
  pools?: ActivePoolData[];
  onRequestSeat?: (poolId: string) => void;
  isLoading?: boolean;
}

import { Skeleton } from "@/components/ui/skeleton";

export function CabinCapacityCard({ pools = [], onRequestSeat, isLoading }: CabinCapacityCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg bg-surface-container-highest" />
          <Skeleton className="h-7 w-48 rounded bg-surface-container-highest" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full h-32 rounded-lg bg-surface-container-highest" />
          <Skeleton className="w-full h-32 rounded-lg bg-surface-container-highest" />
        </div>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <SectionCard
        title="Live active pools"
        icon={Armchair}
      >
        <div className="bg-surface-container-lowest rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-outline-variant">
          <Armchair className="w-8 h-8 text-on-surface-variant mb-2 opacity-50" />
          <p className="text-body-md text-on-surface">No active pools right now</p>
          <p className="text-body-sm text-on-surface-variant">
            There are no pools on your selected route. Request a ride below to start a new one!
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Live active pools"
      icon={Armchair}
      right={<StatusBadge tone="success">{pools.length} Available</StatusBadge>}
    >
      <div className="flex flex-col gap-4">
        {pools.map((pool) => {
          const seats: SeatData[] = Array.from({ length: pool.totalSeats }, (_, i) => ({
            id: `seat-${pool.id}-${i}`,
            state: i < (pool.totalSeats - pool.availableSeats) ? "taken" : "open"
          }));

          return (
            <div key={pool.id} className="bg-surface-container-lowest rounded-lg p-4 flex flex-col gap-4 border border-outline-variant/30 transition-colors hover:border-primary-container/50">
              <div className="flex justify-between items-start">
                <div className="text-label-md text-on-surface">
                  Driver: <span className="text-primary-container">{pool.driverName}</span>
                </div>
                <StatusBadge tone="info">{pool.availableSeats} seats left</StatusBadge>
              </div>

              <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-fixed" />
                  <span>{pool.currentLocation}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <div className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-secondary-fixed" />
                  <span>{pool.lastDestination}</span>
                </div>
              </div>
              
              <CabinSeats seats={seats} />

              <div className="flex items-center justify-between mt-2 gap-4">
                <div className="flex items-start gap-2 text-label-sm text-on-surface-variant">
                  <Info className="w-4 h-4 text-primary-container shrink-0 mt-0.5" />
                  <span>Seats are assigned on a first-come basis.</span>
                </div>
                <button 
                  onClick={() => onRequestSeat?.(pool.id)}
                  className="flex items-center justify-center px-5 py-2.5 bg-primary-container text-on-primary-container text-label-md font-bold rounded-full hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]"
                >
                  Join Pool
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
