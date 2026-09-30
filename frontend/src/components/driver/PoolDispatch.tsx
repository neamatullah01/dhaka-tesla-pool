import { Route, MapPin, Flag, ChevronRight, CheckCircle2, Play } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { DriverPool } from "@/hooks/useDriver";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface PoolDispatchProps {
  pool: DriverPool | null | undefined;
}

export function PoolDispatch({ pool }: PoolDispatchProps) {
  if (!pool) {
    return (
      <SectionCard title="Pool Dispatch" icon={Route} className="h-full">
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest gap-3 text-on-surface-variant">
          <Route className="w-8 h-8 opacity-50" />
          <p className="text-body-md text-center">No active pool</p>
          <p className="text-body-sm text-center max-w-[250px]">Accept a passenger to start a new pool</p>
        </div>
      </SectionCard>
    );
  }

  const { status, originZone, corridorCode, members } = pool;

  return (
    <SectionCard
      title={`Pool Dispatch #${pool.id.substring(0, 8).toUpperCase()}`}
      icon={Route}
      right={<StatusBadge tone={status === "OPEN" ? "success" : "info"}>{status}</StatusBadge>}
      className="h-full border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] bg-surface-container-low flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-body-sm text-on-surface-variant">
          Active Corridor: <span className="font-semibold text-on-surface">{corridorCode}</span> • Waypoint 1/3
        </p>
      </div>

      <div className="relative pl-6 flex-1 flex flex-col gap-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
        
        {/* Origin / Pickup Node */}
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-label-md font-bold text-on-surface">{originZone?.name || 'Unknown'} Terminal (Pickup)</span>
              {status === "OPEN" && (
                <span className="text-body-xs text-on-surface-variant mt-1">Waiting for passengers...</span>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Current Zone</span>
          </div>
        </div>

        {/* Member Destinations */}
        {members.map((member, idx) => (
          <div key={member.id} className="relative">
            <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-outline-variant/50 border-2 border-surface-container-low" />
            <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-label-sm font-semibold text-on-surface flex items-center gap-2">
                  {member.rideRequest.destinationZone?.name || 'Unknown'} Drop
                  <span className="text-[10px] text-on-surface-variant font-normal">({member.rideRequest.passenger?.name || 'Unknown'})</span>
                </span>
                <span className="text-body-xs flex items-center gap-1 mt-0.5">
                  <span className={cn("px-1.5 py-0.5 rounded-[3px] text-[9px] uppercase font-bold tracking-wider", 
                    member.rideRequest.status === "COMPLETED" ? "bg-success/10 text-success" : 
                    member.rideRequest.status === "STARTED" ? "bg-primary/10 text-primary" :
                    member.rideRequest.status === "DRIVER_ARRIVED" ? "bg-info/10 text-info" :
                    "bg-surface-variant text-on-surface-variant"
                  )}>
                    {member.rideRequest.status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
