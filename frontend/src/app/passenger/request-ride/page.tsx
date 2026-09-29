"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { WelcomeBanner } from "@/components/rides/WelcomeBanner";
import { RideRequestCard } from "@/components/rides/RideRequestCard";
import { ActiveRideCard } from "@/components/rides/ActiveRideCard";
import { CabinCapacityCard } from "@/components/rides/CabinCapacityCard";
import { FareEstimateCard } from "@/components/rides/FareEstimateCard";
import { RecentHistoryCard } from "@/components/rides/RecentHistoryCard";
import { SeatData } from "@/components/rides/CabinSeats";
import { RideRequestInput } from "@/lib/validations/ride";
import { useZones } from "@/hooks/useZones";
import { useCurrentRide, useRideEstimate, useRequestRide, useActivePools, useJoinPool, useCancelRide } from "@/hooks/useRides";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FareBreakdown } from "@/components/rides/FareBreakdown";
import { Receipt, Loader2, X } from "lucide-react";

export default function RequestRidePage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { data: zones = [], isLoading: isLoadingZones } = useZones();
  const { data: currentRide, isLoading: isCheckingRide } = useCurrentRide();
  const requestMutation = useRequestRide();
  const cancelMutation = useCancelRide();

  useEffect(() => {
    if (currentRide && ["MATCHED", "DRIVER_ARRIVED", "STARTED", "COMPLETED"].includes(currentRide.status)) {
      router.push(`/passenger/ride/${currentRide.id}`);
    }
  }, [currentRide, router]);

  const [formValues, setFormValues] = useState<Partial<RideRequestInput>>({
    requestedSeats: 1,
    paymentMethod: "CASH",
    pickupZoneId: "",
    destinationZoneId: ""
  });

  const handleFormChange = (values: Partial<RideRequestInput>) => {
    setFormValues(prev => ({ ...prev, ...values }));
  };

  const handleRequestRide = (data: RideRequestInput) => {
    requestMutation.mutate(data);
  };

  const seats: SeatData[] = Array.from({ length: 3 }, (_, i) => ({
    id: `seat-${i}`,
    state: i < (formValues.requestedSeats || 1) ? "you" : "open"
  }));

  const hasBothZones = !!formValues.pickupZoneId && !!formValues.destinationZoneId && formValues.pickupZoneId !== formValues.destinationZoneId;
  
  const estimateQuery = useRideEstimate(
    { 
      pickupZoneId: formValues.pickupZoneId as string, 
      destinationZoneId: formValues.destinationZoneId as string, 
      requestedSeats: formValues.requestedSeats as number 
    },
    hasBothZones
  );

  const { data: activePools = [], isLoading: isLoadingPools } = useActivePools(formValues.pickupZoneId, formValues.destinationZoneId);
  const joinPoolMutation = useJoinPool();

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background glow blobs */}
      <div className="fixed top-20 right-0 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none" />

      <AppHeader />
      
      <main className="mx-auto max-w-[1480px] w-full px-4 md:px-8 py-6 flex flex-col gap-8 relative z-10">
        {isCheckingRide || isLoadingZones ? (
          <div className="w-full h-[140px] bg-surface-container-low rounded-xl p-6 shadow-md flex flex-col justify-between">
            <Skeleton className="w-24 h-6 rounded" />
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton className="w-64 h-8 rounded" />
              <Skeleton className="w-96 h-4 rounded" />
            </div>
          </div>
        ) : !currentRide && (
          <WelcomeBanner name={user?.name || "Passenger"} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
            {isCheckingRide ? (
              <div className="flex flex-col gap-6 bg-surface-container-low rounded-xl p-6 md:p-8 shadow-md">
                <Skeleton className="w-48 h-8 bg-surface-variant rounded" />
                <Skeleton className="w-full h-12 bg-surface-variant rounded mt-4" />
                <Skeleton className="w-full h-24 bg-surface-variant rounded" />
              </div>
            ) : !currentRide ? (
              <RideRequestCard 
                formValues={formValues}
                onValuesChange={handleFormChange}
                onSubmit={handleRequestRide} 
                zones={zones}
              />
            ) : (
              <ActiveRideCard data={currentRide} />
            )}
            
            {isCheckingRide || isLoadingZones ? (
              <div className="bg-surface-container-low rounded-xl p-6 shadow-md flex flex-col gap-4 h-64 mt-8">
                <Skeleton className="w-48 h-8 rounded" />
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
              </div>
            ) : (
              <RecentHistoryCard />
            )}
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-8 order-1 lg:order-2">
            {currentRide && (
              <div className="flex flex-col gap-8">
                {(currentRide.fare || currentRide.totalFarePaisa !== undefined) && (
                  <SectionCard
                    title="Fare breakdown"
                    icon={Receipt}
                    right={<StatusBadge tone="muted">Fixed fare</StatusBadge>}
                  >
                    <FareBreakdown 
                      baseFarePaisa={currentRide.fare?.baseFarePaisa ?? currentRide.baseFarePaisa ?? 0}
                      distanceChargePaisa={currentRide.fare?.distanceChargePaisa ?? currentRide.distanceFarePaisa ?? 0}
                      discountPaisa={currentRide.fare?.discountPaisa ?? currentRide.poolDiscountPaisa ?? 0}
                      totalPaisa={currentRide.fare?.totalPaisa ?? currentRide.totalFarePaisa ?? 0}
                    />
                  </SectionCard>
                )}

                {["REQUESTED", "MATCHED"].includes(currentRide.status) && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(currentRide.id)}
                      disabled={cancelMutation.isPending}
                      className="w-full h-12 rounded-lg bg-transparent border border-error/50 text-error hover:bg-error-container/30 font-label text-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <X className="w-4 h-4" aria-hidden="true" />}
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel ride"}
                    </button>
                    <div className="text-label-sm text-on-surface-variant text-center">
                      You can cancel until the driver arrives.
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!currentRide && (
              <CabinCapacityCard 
                pools={activePools} 
                isLoading={isLoadingPools || isCheckingRide || isLoadingZones}
                onRequestSeat={(poolId) => {
                  joinPoolMutation.mutate({
                    poolId,
                    pickupZoneId: formValues.pickupZoneId!,
                    destinationZoneId: formValues.destinationZoneId!,
                    requestedSeats: formValues.requestedSeats || 1,
                    paymentMethod: formValues.paymentMethod || "CASH"
                  });
                }}
              />
            )}
            
            {!currentRide && (
              isCheckingRide || isLoadingZones ? (
                <div className="bg-surface-container-low rounded-xl p-6 shadow-md flex flex-col gap-4">
                  <Skeleton className="w-48 h-8 rounded" />
                  <Skeleton className="w-full h-32 rounded" />
                </div>
              ) : (
                <FareEstimateCard 
                  distanceMeters={estimateQuery.data?.distanceMeters}
                  totalPaisa={estimateQuery.data?.farePaisa}
                  discountPaisa={estimateQuery.data?.poolEligible ? 2000 : undefined} 
                  poolEligible={estimateQuery.data?.poolEligible}
                  disabled={!hasBothZones || estimateQuery.isLoading || requestMutation.isPending}
                  loading={requestMutation.isPending || estimateQuery.isLoading}
                />
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
