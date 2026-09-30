import { Radar, User, Check, X, Navigation2, Clock, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { DriverRideRequest, DriverPool } from "@/hooks/useDriver";
import { formatPaisa } from "@/lib/format";
import { useState, useEffect } from "react";

interface RequestStreamProps {
  requests: DriverRideRequest[];
  pool: DriverPool | null | undefined;
  isLoading: boolean;
  onAccept: (id: string) => void;
  isAccepting: boolean;
}

export function RequestStream({ requests, pool, isLoading, onAccept, isAccepting }: RequestStreamProps) {
  const availableSeats = pool ? pool.totalCapacity - pool.seatsReserved : 3;
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAccepting) {
      setLoadingId(null);
    }
  }, [isAccepting]);

  return (
    <SectionCard
      title="Compatible Corridor Stream"
      icon={Radar}
      right={
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Live Stream</span>
        </div>
      }
      className="h-full border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] bg-surface-container-low"
    >
      <p className="text-body-sm text-on-surface-variant mb-6">
        Review incoming ride requests along your corridor and accept compatible passengers to maximize your earnings.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-surface-container-highest animate-pulse rounded-xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest gap-3">
          <Radar className="w-8 h-8 text-on-surface-variant opacity-50" />
          <p className="text-body-md text-on-surface">No compatible requests found</p>
          <p className="text-body-sm text-on-surface-variant text-center max-w-[250px]">
            Waiting for passengers along your corridor...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map(req => {
            const canFit = req.seatsRequested <= availableSeats;
            
            return (
              <div key={req.id} className={`rounded-xl border ${canFit ? 'border-primary/30 bg-primary-container/5' : 'border-outline-variant/20 bg-surface-container-lowest'} p-5 relative overflow-hidden transition-all hover:shadow-md`}>
                {canFit && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center relative border border-outline-variant/30">
                      <User className="w-5 h-5 text-on-surface-variant" />
                      {canFit && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border border-surface-container-lowest flex items-center justify-center">
                          <span className="text-[8px] font-bold text-surface-container-lowest">{req.seatsRequested}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-label-lg font-bold text-on-surface">{req.passenger.name}</span>
                        {canFit && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] uppercase tracking-wider font-bold rounded">
                            Compatible Match
                          </span>
                        )}
                      </div>
                      <span className="text-body-xs text-on-surface-variant mt-0.5">
                        Corridor Alignment: {req.pickupZone?.name} → {req.destinationZone?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-title-lg font-headline font-bold text-on-surface leading-none mb-1">
                      {formatPaisa(req.totalFarePaisa)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Shared Fare ({req.seatsRequested} Seat{req.seatsRequested > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Pickup</span>
                    <span className="text-label-sm font-bold text-on-surface truncate">{req.pickupZone?.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Destination</span>
                    <span className="text-label-sm font-bold text-on-surface truncate">{req.destinationZone?.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Detour Latency</span>
                    <span className="text-label-sm font-bold text-primary flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      +1.8 mins
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold mb-1">Corridor Index</span>
                    <span className="text-label-sm font-bold text-on-surface flex items-center gap-1 truncate">
                      <Navigation2 className="w-3 h-3 text-primary-container shrink-0" />
                      Seq #3
                    </span>
                  </div>
                </div>

                {canFit ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button 
                      onClick={() => {
                        setLoadingId(req.id);
                        onAccept(req.id);
                      }}
                      disabled={isAccepting || loadingId === req.id}
                      className="flex-1 bg-primary-container text-on-primary-container font-bold text-label-md py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] disabled:opacity-50 text-center"
                    >
                      {loadingId === req.id && isAccepting ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                      {loadingId === req.id && isAccepting 
                        ? "Accepting..." 
                        : <span className="truncate">Accept & Fill ({pool ? pool.seatsReserved + req.seatsRequested : req.seatsRequested}/{pool?.totalCapacity || 3})</span>
                      }
                    </button>
                    <button className="px-5 py-3 rounded-lg border border-outline-variant/30 text-on-surface font-label font-bold text-label-md hover:bg-surface-variant/50 transition flex items-center justify-center gap-2 shrink-0">
                      <X className="w-4 h-4 text-on-surface-variant" />
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-error-container/10 border border-error/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-error" />
                      <span className="text-label-sm font-bold text-error">Capacity Exceeded (Needs {req.seatsRequested} seats, {availableSeats} available)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
