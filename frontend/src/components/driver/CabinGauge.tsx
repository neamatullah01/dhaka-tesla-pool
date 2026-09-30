import {
  Armchair,
  Shield,
  Lock,
  UserPlus,
  MapPin,
  Navigation,
  XCircle,
  CheckCircle2,
  Loader2,
  Route,
  Play,
} from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { DriverPool, useUpdateRideStatus } from "@/hooks/useDriver";
import { useAuthStore } from "@/store/auth.store";
import { formatPaisa } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CabinGaugeProps {
  pool: DriverPool | null | undefined;
  capacity: number;
}

export function CabinGauge({ pool, capacity }: CabinGaugeProps) {
  const user = useAuthStore((state) => state.user);
  const [loadingAction, setLoadingAction] = useState<{
    seatId: string;
    action: string;
  } | null>(null);

  const updateStatusMutation = useUpdateRideStatus();

  const handleStatusUpdate = async (
    seatId: string,
    rideId: string,
    status: "DRIVER_ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED",
  ) => {
    setLoadingAction({ seatId, action: status });
    try {
      await updateStatusMutation.mutateAsync({ rideId, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // Filter out cancelled and completed members so their seats become available
  const members = (pool?.members || []).filter((m) => {
    const isMemberDone = [
      "CANCELLED",
      "CANCELED",
      "REJECTED",
      "COMPLETED",
    ].includes(m.status?.toUpperCase());
    const isRideDone = [
      "CANCELLED",
      "CANCELED",
      "REJECTED",
      "COMPLETED",
    ].includes(m.rideRequest?.status?.toUpperCase());
    return !isMemberDone && !isRideDone;
  });

  const reservedSeats = members.reduce((acc, m) => acc + m.seatsAllocated, 0);
  const isInvariantEnforced = reservedSeats <= capacity;

  // Expand members based on seatsAllocated if they booked multiple seats
  const occupiedSeats: any[] = [];
  members.forEach((member) => {
    const farePerSeat = member.rideRequest.totalFarePaisa
      ? Math.floor(member.rideRequest.totalFarePaisa / member.seatsAllocated)
      : 0;

    for (let i = 0; i < member.seatsAllocated; i++) {
      occupiedSeats.push({
        id: `${member.id}-${i}`,
        rideRequestId: member.rideRequest.id,
        name:
          member.seatsAllocated > 1
            ? `${member.rideRequest.passenger.name} (Seat ${i + 1})`
            : member.rideRequest.passenger.name,
        pickup: member.rideRequest.pickupZone?.name || "Unknown",
        destination: member.rideRequest.destinationZone?.name || "Unknown",
        status: member.status,
        rideRequestStatus: member.rideRequest.status,
        fare: farePerSeat,
      });
    }
  });

  const totalEarnings = members.reduce(
    (acc, m) => acc + (m.rideRequest.totalFarePaisa || 0),
    0,
  );

  const seats = Array.from({ length: capacity }, (_, i) => {
    return occupiedSeats[i] || null;
  });

  const origin = pool?.originZone?.name;
  const destinations = Array.from(
    new Set(
      members.map((m) => m.rideRequest.destinationZone?.name).filter(Boolean),
    ),
  );

  return (
    <SectionCard
      title="Cabin Occupancy Gauge"
      icon={Armchair}
      right={
        <span className="text-label-sm font-semibold bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant border border-outline-variant/30">
          {reservedSeats} / {capacity} Reserved
        </span>
      }
      className="h-full border border-outline-variant/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] bg-surface-container-low"
    >
      <p className="text-body-sm text-on-surface-variant mb-6 leading-relaxed">
        Tesla Cabin configuration for Model-Y Fleet Bullet. Capacity invariant
        rigidly enforced.
      </p>

      <div className="flex flex-col gap-4">
        {/* Pilot Slot */}
        <div className="bg-surface-container-highest rounded-xl p-4 flex items-center justify-between border border-primary/20 shadow-inner relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center border border-primary-container/30">
              <Shield className="w-5 h-5 text-primary-container" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant flex items-center gap-1.5">
                Seat {capacity} • Pilot
              </span>
              <span className="text-label-lg font-bold text-on-surface mt-0.5">
                {user?.name || "Pilot"} (Active)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold leading-none mt-[1px]">
                Telemetry Live
              </span>
            </div>
            {totalEarnings > 0 && (
              <div className="flex flex-col items-end mb-0.5">
                <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1 leading-none">
                  Pool Revenue
                </span>
                <span className="text-title-md font-headline font-bold text-[#00FFA3] leading-none drop-shadow-[0_0_10px_rgba(0,255,163,0.3)]">
                  {formatPaisa(totalEarnings)}
                </span>
              </div>
            )}
            <div className="hidden sm:block px-3 py-1 bg-surface-container rounded text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold shadow-sm border border-outline-variant/20 leading-none">
              Pilot Slot
            </div>
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
                  "rounded-xl p-4 flex flex-col items-center justify-center text-center relative border transition-all min-h-[160px]",
                  isOccupied
                    ? "bg-surface-container-lowest border-outline-variant/30 shadow-sm"
                    : "bg-primary-container/5 border-primary/30 shadow-[0_0_15px_rgba(0,242,254,0.05)] border-dashed",
                )}
              >
                {isOccupied && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}

                {isOccupied ? (
                  <div className="flex flex-col items-center gap-2 w-full mt-1">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
                      <Lock className="w-3 h-3 text-on-surface-variant" />
                    </div>

                    {seat.rideRequestStatus === "MATCHED" ? (
                      <>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-label-md font-bold text-on-surface truncate max-w-[100px]">
                            {seat.name}
                          </span>
                          <div className="mt-1 mb-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary shadow-[0_0_10px_rgba(0,242,254,0.1)]">
                            {formatPaisa(seat.fare)}
                          </div>
                          <span
                            className="text-[10px] text-on-surface-variant flex items-center justify-center gap-1 mt-0.5 truncate max-w-full w-full"
                            title={`Pickup: ${seat.pickup}`}
                          >
                            <MapPin className="w-3 h-3 shrink-0 text-primary/70" />
                            <span className="truncate">{seat.pickup}</span>
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-2 w-full">
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                seat.id,
                                seat.rideRequestId,
                                "DRIVER_ARRIVED",
                              )
                            }
                            disabled={
                              updateStatusMutation.isPending ||
                              loadingAction?.seatId === seat.id
                            }
                            className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-[10px] uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {(updateStatusMutation.isPending ||
                              loadingAction?.action === "DRIVER_ARRIVED") &&
                            loadingAction?.seatId === seat.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <MapPin className="w-3 h-3" />
                            )}
                            Pick Up
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                seat.id,
                                seat.rideRequestId,
                                "CANCELLED",
                              )
                            }
                            disabled={
                              updateStatusMutation.isPending ||
                              loadingAction?.seatId === seat.id
                            }
                            className="w-full py-1.5 bg-transparent hover:bg-error/10 text-on-surface-variant hover:text-error rounded-md text-[9px] uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/30 disabled:opacity-50"
                          >
                            {(updateStatusMutation.isPending ||
                              loadingAction?.action === "CANCELLED") &&
                            loadingAction?.seatId === seat.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : seat.rideRequestStatus === "DRIVER_ARRIVED" ? (
                      <>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-label-md font-bold text-on-surface truncate max-w-[100px]">
                            {seat.name}
                          </span>
                          <div className="mt-1 mb-1 px-2 py-0.5 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded text-[10px] font-bold text-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.1)]">
                            {formatPaisa(seat.fare)}
                          </div>
                          <span
                            className="text-[10px] text-on-surface-variant flex items-center justify-center gap-1 mt-0.5 truncate max-w-full w-full"
                            title={`Ready to depart from: ${seat.pickup}`}
                          >
                            <MapPin className="w-3 h-3 shrink-0 text-primary/70" />
                            <span className="truncate">
                              Picked up, waiting to start
                            </span>
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              seat.id,
                              seat.rideRequestId,
                              "STARTED",
                            )
                          }
                          disabled={
                            updateStatusMutation.isPending ||
                            loadingAction?.seatId === seat.id
                          }
                          className="mt-2 w-full py-1.5 bg-secondary-container hover:brightness-110 text-black rounded-md transition-all shadow-[0_0_15px_rgba(216,251,120,0.3)] flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:brightness-75"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                            {(updateStatusMutation.isPending ||
                              loadingAction?.action === "STARTED") &&
                            loadingAction?.seatId === seat.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            <span>Start Trip</span>
                          </div>
                          <span className="text-[7.5px] font-bold opacity-80 uppercase tracking-widest">
                            Board Passenger
                          </span>
                        </button>
                      </>
                    ) : seat.rideRequestStatus === "STARTED" ? (
                      <>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-label-md font-bold text-on-surface truncate max-w-[100px]">
                            {seat.name}
                          </span>
                          <div className="mt-1 mb-1 px-2 py-0.5 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded text-[10px] font-bold text-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.1)]">
                            {formatPaisa(seat.fare)}
                          </div>
                          <span
                            className="text-[10px] text-on-surface-variant flex items-center justify-center gap-1 mt-0.5 truncate max-w-full w-full"
                            title={`Destination: ${seat.destination}`}
                          >
                            <Navigation className="w-3 h-3 shrink-0 text-secondary/70" />
                            <span className="truncate">{seat.destination}</span>
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              seat.id,
                              seat.rideRequestId,
                              "COMPLETED",
                            )
                          }
                          disabled={
                            updateStatusMutation.isPending ||
                            loadingAction?.seatId === seat.id
                          }
                          className="mt-2 w-full py-1.5 bg-[#00FFA3] hover:brightness-110 text-black rounded-md transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:brightness-75"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                            {(updateStatusMutation.isPending ||
                              loadingAction?.action === "COMPLETED") &&
                            loadingAction?.seatId === seat.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Drop Off</span>
                          </div>
                          <span className="text-[7.5px] font-bold opacity-80 uppercase tracking-widest">
                            &amp; Receive Payment
                          </span>
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-primary-container/70">
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center mb-1">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-label-md font-bold text-on-surface">
                      Available
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-primary-container px-2 py-1 bg-primary-container rounded shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                      1 Available
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 opacity-50">
            <Route className="w-3 h-3 text-on-surface-variant" />
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
              Active Corridor
            </span>
          </div>

          <h4 className="text-label-sm font-bold text-on-surface mb-5">
            Current Route Overview
          </h4>

          <div className="flex items-center justify-between relative mt-2 mb-2 px-2">
            {/* Connecting Line */}
            <div className="absolute left-6 right-6 top-[11px] h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-primary to-secondary/20 animate-pulse opacity-50" />
            </div>

            {/* Origin Node */}
            <div className="relative flex flex-col items-center gap-2 z-10 w-24">
              <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] bg-opacity-90">
                <MapPin className="w-3 h-3 text-on-primary-container" />
              </div>
              <span className="text-[11px] font-bold text-on-surface truncate w-full text-center">
                {origin || "Pickup"}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-primary font-bold">
                Origin
              </span>
            </div>

            {/* Destination Nodes */}
            {destinations.length > 0 ? (
              destinations.map((dest, i) => (
                <div
                  key={i}
                  className="relative flex flex-col items-center gap-2 z-10 w-24"
                >
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-outline-variant/50 flex items-center justify-center bg-opacity-90">
                    <Navigation className="w-3 h-3 text-on-surface-variant" />
                  </div>
                  <span className="text-[11px] font-bold text-on-surface truncate w-full text-center">
                    {dest}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Drop {i + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="relative flex flex-col items-center gap-2 z-10 w-24">
                <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-outline-variant/50 flex items-center justify-center bg-opacity-90">
                  <Navigation className="w-3 h-3 text-on-surface-variant" />
                </div>
                <span className="text-[11px] font-bold text-on-surface truncate w-full text-center">
                  TBD
                </span>
                <span className="text-[8px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Destination
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
