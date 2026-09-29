"use client";

import { useDriverVehicle, useDriverOnline, useDriverOffline, useDriverRequests, useAcceptRequest, useCurrentPool, useDriverArrive, useDriverStartTrip, useCompletePassenger } from "@/hooks/useDriver";
import { DriverHeader } from "@/components/driver/DriverHeader";
import { CabinGauge } from "@/components/driver/CabinGauge";
import { RequestStream } from "@/components/driver/RequestStream";
import { PoolDispatch } from "@/components/driver/PoolDispatch";
import { TelemetryVector } from "@/components/driver/TelemetryVector";
import { StatsRow } from "@/components/driver/StatsRow";
import { CreateVehicleForm } from "@/components/driver/CreateVehicleForm";

import { Skeleton } from "@/components/ui/skeleton";

export default function DriverDashboardPage() {
  const { data: vehicle, isLoading: isVehicleLoading, error: vehicleError } = useDriverVehicle();
  const onlineMutation = useDriverOnline();
  const offlineMutation = useDriverOffline();
  
  const { data: requests = [], isLoading: isRequestsLoading } = useDriverRequests();
  const acceptMutation = useAcceptRequest();

  const { data: pool, isLoading: isPoolLoading } = useCurrentPool();
  const arriveMutation = useDriverArrive();
  const startMutation = useDriverStartTrip();
  const completeMutation = useCompletePassenger();

  // If the API returns 404 for vehicle, they need to create one
  const needsVehicle = !isVehicleLoading && !vehicle && vehicleError?.message?.includes("404");

  if (needsVehicle) {
    return <CreateVehicleForm />;
  }

  const isToggling = onlineMutation.isPending || offlineMutation.isPending;
  const isInitialLoading = isVehicleLoading || isPoolLoading;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden pb-12">
        <div className="fixed top-20 right-0 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none" />
        <main className="mx-auto max-w-[1600px] w-full px-4 md:px-8 py-8 flex flex-col gap-8 relative z-10">
          <Skeleton className="w-full h-24 rounded-xl bg-surface-container-low" />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 flex flex-col gap-8">
              <Skeleton className="w-full h-[300px] rounded-xl bg-surface-container-low" />
              <Skeleton className="w-full h-[400px] rounded-xl bg-surface-container-low" />
            </div>
            <div className="xl:col-span-8 flex flex-col gap-8">
              <Skeleton className="w-full h-[300px] rounded-xl bg-surface-container-low" />
              <Skeleton className="w-full h-[350px] rounded-xl bg-surface-container-low" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="w-full h-32 rounded-xl bg-surface-container-low" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden pb-12">
      {/* Dynamic Background */}
      <div className="fixed top-20 right-0 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary-fixed/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="mx-auto max-w-[1600px] w-full px-4 md:px-8 py-8 flex flex-col gap-8 relative z-10">
        <DriverHeader 
          vehicle={vehicle}
          hasActivePool={!!pool}
          isLoading={isVehicleLoading}
          onGoOnline={() => onlineMutation.mutate()}
          onGoOffline={() => offlineMutation.mutate()}
          isToggling={isToggling}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 flex flex-col gap-8">
            <CabinGauge pool={pool} capacity={vehicle?.capacity || 3} />
            <PoolDispatch 
              pool={pool} 
              onArrive={() => pool && arriveMutation.mutate(pool.id)}
              onStart={() => pool && startMutation.mutate(pool.id)}
              onCompletePassenger={(rideId) => completeMutation.mutate(rideId)}
              isActionLoading={arriveMutation.isPending || startMutation.isPending || completeMutation.isPending}
            />
          </div>

          <div className="xl:col-span-8 flex flex-col gap-8">
            <RequestStream 
              requests={requests} 
              pool={pool}
              isLoading={isRequestsLoading}
              onAccept={(id) => acceptMutation.mutate(id)}
              isAccepting={acceptMutation.isPending}
            />
            <TelemetryVector />
          </div>
        </div>

        <div className="mt-4">
          <StatsRow />
        </div>
      </main>
    </div>
  );
}
