import { Route, Armchair, Receipt, ArrowRight, Loader2, X } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RideStatusStepper } from "./RideStatusStepper";
import { CabinSeats } from "./CabinSeats";
import { FareBreakdown } from "./FareBreakdown";
import { Ride, useCancelRide } from "@/hooks/useRides";

interface ActiveRideCardProps {
  data: Ride;
}

export function ActiveRideCard({ data }: ActiveRideCardProps) {
  const cancelMutation = useCancelRide();
  
  const handleCancel = () => {
    cancelMutation.mutate(data.id);
  };
  
  const stepMap: Record<string, number> = {
    REQUESTED: 0,
    MATCHED: 1,
    DRIVER_ARRIVED: 2,
    STARTED: 3,
    COMPLETED: 4,
  };
  
  const currentStep = stepMap[data.status] ?? 0;
  
  const requestedSeats = Number(data.requestedSeats) || 1;
  
  // Format cabin seats. If data.pool exists, we can accurately determine open vs taken seats.
  let openSeatsCount = 3 - requestedSeats;
  let otherSeatsCount = 0;
  
  const poolData = data.pool || (data as any).poolMembership?.pool;
  
  if (poolData && poolData.seatsReserved !== undefined) {
    const totalReserved = poolData.seatsReserved;
    otherSeatsCount = Math.max(0, totalReserved - requestedSeats);
    openSeatsCount = Math.max(0, 3 - totalReserved);
  }
  
  const cabinSeats = [
    ...Array.from({ length: requestedSeats }, (_, i) => ({ id: `you-${data.id}-${i}`, state: "you" as const })),
    ...Array.from({ length: otherSeatsCount }, (_, i) => ({ id: `taken-${data.id}-${i}`, state: "taken" as const })),
    ...Array.from({ length: openSeatsCount }, (_, i) => ({ id: `open-${data.id}-${i}`, state: "open" as const }))
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionCard 
        title="Your ride" 
        icon={Route} 
        right={<StatusBadge tone="info">{data.status}</StatusBadge>}
      >
        <div className="flex items-center gap-2 text-body-lg text-on-surface">
          {data.pickupZone?.name || data.pickupZoneId}
          <ArrowRight className="w-4 h-4 text-primary-container" />
          {data.destinationZone?.name || data.destinationZoneId}
        </div>
        <div className="text-label-md text-on-surface-variant mt-1">
          {requestedSeats} seat{requestedSeats > 1 ? "s" : ""} · {data.paymentMethod}
        </div>
        
        <div className="mt-5">
          <RideStatusStepper currentStep={currentStep} />
        </div>

        {data.status === "REQUESTED" && (
          <div className="relative mt-4 overflow-hidden bg-surface-container-low border border-primary-container/20 rounded-xl p-5 flex flex-col items-center justify-center gap-3">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-container/5 to-transparent animate-pulse" />
            <Loader2 className="w-6 h-6 animate-spin text-primary-container shrink-0 relative z-10" />
            <div className="text-label-lg font-bold text-primary-container relative z-10 text-center">
              Finding your perfect pool...
            </div>
            <div className="text-body-sm text-on-surface-variant relative z-10 text-center max-w-[280px]">
              We're matching you with a driver and passengers heading in your direction to save you money.
            </div>
          </div>
        )}

        {data.status === "MATCHED" && (
          <div className="relative mt-4 overflow-hidden bg-surface-container-low border border-primary-container/30 rounded-xl p-5 flex flex-col items-center justify-center gap-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-container/10 to-transparent animate-pulse" />
            <div className="text-label-lg font-bold text-primary-container relative z-10 text-center">
              Driver is on the way!
            </div>
            <div className="text-body-sm text-on-surface-variant relative z-10 text-center max-w-[280px]">
              Your driver has accepted the match and is heading to your pickup location. Please be ready.
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Cabin capacity"
        icon={Armchair}
        right={poolData?.vehicle ? <StatusBadge tone="success">{poolData.vehicle.model || poolData.vehicle.name}</StatusBadge> : undefined}
      >
        <CabinSeats seats={cabinSeats} />
        {data.status !== "REQUESTED" && poolData && (
          <div className="flex flex-col gap-1 mt-4">
            <div className="text-label-md text-on-surface-variant">
              Driver: <span className="text-on-surface">{poolData.driver?.name || "waiting for a match"}</span>
            </div>
            {poolData.vehicle?.plateNo && (
              <div className="text-label-md text-on-surface-variant">
                Plate No: <span className="text-on-surface font-label">{poolData.vehicle.plateNo}</span>
              </div>
            )}
          </div>
        )}
      </SectionCard>

    </div>
  );
}
