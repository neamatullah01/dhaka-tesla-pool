"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ActiveRideCard } from "@/components/rides/ActiveRideCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FareBreakdown } from "@/components/rides/FareBreakdown";
import { useRideDetails, useCancelRide } from "@/hooks/useRides";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Loader2, X, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function RideStatusPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = typeof params.id === "string" ? params.id : "";
  
  const { data: currentRide, isLoading } = useRideDetails(rideId);
  const cancelMutation = useCancelRide();

  useEffect(() => {
    // If the ride gets cancelled while they are on this page, push them back
    if (currentRide && currentRide.status === "CANCELLED") {
      router.push("/passenger/request-ride");
    }
  }, [currentRide, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="fixed top-20 right-0 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none" />

      <AppHeader />

      <main className="mx-auto max-w-[1480px] w-full px-4 md:px-8 py-6 flex flex-col gap-6 relative z-10">
        {currentRide?.status === "COMPLETED" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-title-lg font-bold">Successfully reached destination!</h2>
                <p className="text-body-md opacity-90 mt-1">Thank you for riding with Dhaka Tesla Pool.</p>
              </div>
            </div>
            <Link 
              href="/passenger/request-ride" 
              className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label text-label-lg font-semibold hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap text-center"
            >
              Book another ride
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-6 bg-surface-container-low rounded-xl p-6 shadow-md h-96">
              <Skeleton className="w-48 h-8 rounded" />
              <Skeleton className="w-full h-12 rounded mt-4" />
              <Skeleton className="w-full h-full rounded mt-4" />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6 bg-surface-container-low rounded-xl p-6 shadow-md h-64">
              <Skeleton className="w-48 h-8 rounded" />
              <Skeleton className="w-full h-16 rounded mt-4" />
            </div>
          </div>
        ) : !currentRide ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container rounded-xl">
            <div className="text-headline-sm text-on-surface">Ride not found</div>
            <div className="text-body-md text-on-surface-variant">This ride may have been cancelled or doesn't exist.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <ActiveRideCard data={currentRide} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
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
                    onClick={() => cancelMutation.mutate(currentRide.id, {
                      onSuccess: () => {
                        router.push("/passenger/request-ride");
                      }
                    })}
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
          </div>
        )}
      </main>
    </div>
  );
}
