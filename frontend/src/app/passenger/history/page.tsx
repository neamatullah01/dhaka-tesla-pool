"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRideHistory } from "@/hooks/useRides";
import { ArrowLeft, ArrowRight, History, Calendar } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPaisa } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FilterType = "ALL" | "COMPLETED" | "CANCELLED";

export default function PassengerHistoryPage() {
  const { data: rides = [], isLoading } = useRideHistory();
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredRides = rides.filter(ride => {
    if (filter === "ALL") return true;
    return ride.status === filter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="fixed top-20 right-0 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none" />

      <AppHeader />

      <main className="mx-auto max-w-[1000px] w-full px-4 md:px-8 py-8 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Link href="/passenger/request-ride" className="flex items-center gap-2 text-label-md font-semibold text-primary hover:text-primary-fixed transition-colors w-fit mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
            <h1 className="text-display-sm font-bold flex items-center gap-3">
              <History className="w-8 h-8 text-primary" />
              Ride History
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Review your past trips and cancellation history.
            </p>
          </div>

          <div className="flex bg-surface-container-low rounded-lg p-1.5 w-fit shrink-0 border border-outline-variant/30">
            {(["ALL", "COMPLETED", "CANCELLED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-5 py-2 rounded-md font-label text-label-md font-bold transition-all duration-200",
                  filter === f
                    ? "bg-primary-container text-black shadow-sm ring-1 ring-primary-container/50"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                )}
              >
                {f === "ALL" ? "All rides" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-[120px] bg-surface-container-low rounded-xl" />
            ))
          ) : filteredRides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-surface-container rounded-2xl border border-outline-variant/30">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-title-lg font-bold">No rides found</h3>
              <p className="text-body-md text-on-surface-variant mt-1">
                {filter === "ALL" 
                  ? "You haven't requested any rides yet." 
                  : `You don't have any ${filter.toLowerCase()} rides.`}
              </p>
            </div>
          ) : (
            filteredRides.map((ride) => {
              const isCompleted = ride.status === "COMPLETED";
              const isCancelled = ride.status === "CANCELLED";
              const finalFare = ride.fare?.totalPaisa;
              const estFare = ride.totalFarePaisa || ride.amountPaisa;
              const displayFare = finalFare ?? estFare;
              
              return (
                <div key={ride.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 font-label text-title-md font-bold text-on-surface">
                      <span className="text-primary-container">{ride.pickupZone?.name || "Pickup"}</span>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                      <span className="text-primary-container">{ride.destinationZone?.name || "Destination"}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant">
                      <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ride.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </div>
                      
                      <StatusBadge tone={
                        isCompleted ? "success" : 
                        isCancelled ? "error" : "info"
                      }>
                        {ride.status}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-1 shrink-0 bg-surface-container-low p-4 rounded-lg border border-outline-variant/30 md:bg-transparent md:border-transparent md:p-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">
                        {finalFare ? "Final Fare" : "Estimated Fare"}
                      </span>
                      <span className="font-label text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {displayFare ? formatPaisa(displayFare) : "—"}
                      </span>
                      {isCancelled && (
                        <span className="text-label-sm text-error mt-0.5">Not charged</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 bg-surface-container-highest/50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-label text-label-sm font-bold text-on-surface">
                        {ride.paymentMethod?.toUpperCase() === "TESLAPAY" ? "TeslaPay" : "Cash Payment"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
