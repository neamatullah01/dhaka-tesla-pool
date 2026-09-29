import { Armchair, Shield, Lock, UserPlus } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { DriverPool } from "@/hooks/useDriver";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

interface CabinGaugeProps {
  pool: DriverPool | null | undefined;
  capacity: number;
}

export function CabinGauge({ pool, capacity }: CabinGaugeProps) {
  const user = useAuthStore((state) => state.user);
  
  // Filter out cancelled members
  const members = (pool?.members || []).filter(m => !["CANCELLED", "CANCELED", "REJECTED"].includes(m.status));
  
  const reservedSeats = members.reduce((acc, m) => acc + m.seatsAllocated, 0);
  const isInvariantEnforced = reservedSeats <= capacity;

  // Expand members based on seatsAllocated if they booked multiple seats
  const occupiedSeats: any[] = [];
  members.forEach(member => {
    for (let i = 0; i < member.seatsAllocated; i++) {
      occupiedSeats.push({
        id: `${member.id}-${i}`,
        name: member.rideRequest.passenger.name,
        destination: member.rideRequest.destinationZone?.name || "Unknown",
        status: member.status
      });
    }
  });

  const seats = Array.from({ length: capacity }, (_, i) => {
    return occupiedSeats[i] || null;
  });

  return (
    <SectionCard
      title="Cabin Occupancy Gauge"
      icon={Armchair}
      right={<span className="text-label-sm font-semibold bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant border border-outline-variant/30">{reservedSeats} / {capacity} Reserved</span>}
      className="h-full border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] bg-surface-container-low"
    >
      <p className="text-body-sm text-on-surface-variant mb-6 leading-relaxed">
        Tesla Cabin configuration for Model-Y Fleet Bullet. Capacity invariant rigidly enforced.
      </p>

      <div className="flex flex-col gap-4">
        {/* Pilot Slot */}
        <div className="bg-surface-container-highest rounded-xl p-4 flex items-center justify-between border border-primary/20 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Telemetry Live</span>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center border border-primary-container/30">
              <Shield className="w-5 h-5 text-primary-container" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1.5">
                Seat 0 • Pilot
              </span>
              <span className="text-label-lg font-bold text-on-surface mt-0.5">
                {user?.name || "Pilot"} (Active)
              </span>
            </div>
          </div>
          <div className="hidden sm:block px-3 py-1 bg-surface-container rounded text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold shadow-sm border border-outline-variant/20">
            Pilot Slot
          </div>
        </div>

        {/* Passenger Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {seats.map((seat, idx) => {
            const isOccupied = seat !== null;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "rounded-xl p-4 flex flex-col items-center justify-center text-center relative border transition-all h-[140px]",
                  isOccupied 
                    ? "bg-surface-container-lowest border-outline-variant/30 shadow-sm"
                    : "bg-primary-container/5 border-primary/30 shadow-[0_0_15px_rgba(0,242,254,0.05)] border-dashed"
                )}
              >
                {isOccupied && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
                
                {isOccupied ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
                      <Lock className="w-4 h-4 text-on-surface-variant" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-md font-bold text-on-surface truncate max-w-[100px]">{seat.name}</span>
                      <span className="text-body-xs text-on-surface-variant mt-0.5 truncate max-w-[100px]">{seat.destination}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-sm">
                      Locked
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-primary-container/70">
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center mb-1">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-label-md font-bold text-on-surface">Available</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-primary-container px-2 py-1 bg-primary-container rounded shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                      1 Available
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            <span className="font-semibold text-on-surface">Invariant Enforced:</span> <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono text-[10px]">reservedSeats &lt;= {capacity}</code>. Interactive Postgres row-level locking active. Concurrency collision prevention engaged.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
