"use client";

import { useState } from "react";
import { useDriverHistory } from "@/hooks/useDriver";
import { History, Filter, CalendarDays, Navigation2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { formatPaisa, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DriverHistoryPage() {
  const { data: history = [], isLoading } = useDriverHistory();
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "CANCELLED">("ALL");

  const filteredHistory = history.filter(ride => {
    if (filter === "ALL") return true;
    if (filter === "CANCELLED") {
      return ride.status === "CANCELLED";
    }
    return ride.status === filter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      <div className="fixed top-20 right-0 w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="pt-6 px-4 md:px-8 max-w-4xl mx-auto w-full relative z-10">
        <Link href="/driver/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface rounded-xl border border-outline-variant/30 transition-colors shadow-sm font-semibold text-label-md">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <main className="mx-auto max-w-4xl w-full px-4 md:px-8 py-8 flex flex-col gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-container-high rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-primary-container" />
            </div>
            <h1 className="text-headline-md font-headline font-bold text-on-surface">My Ride History</h1>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
            <Filter className="w-4 h-4 text-on-surface-variant ml-2" />
            {(["ALL", "COMPLETED", "CANCELLED"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-label-sm font-semibold transition-colors ${
                  filter === f 
                    ? "bg-surface-variant text-on-surface" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4 mt-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-surface-container-low" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="mt-4 bg-surface-container-low rounded-xl p-6 md:p-8 shadow-md border border-outline-variant/30">
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <History className="w-8 h-8 text-on-surface-variant opacity-50" />
              <p className="text-body-md text-on-surface">No history found</p>
              <p className="text-body-sm text-on-surface-variant text-center max-w-[250px]">
                You haven't completed any rides matching the selected filter yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {filteredHistory.map(ride => (
              <div key={ride.id} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 hover:border-primary-container/30 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ride.status === "COMPLETED" ? "bg-success/10" : "bg-error/10"}`}>
                    {ride.status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-error" />}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-on-surface-variant" />
                      <span className="text-label-sm text-on-surface-variant font-medium">
                        {formatDate(ride.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-label-md font-bold text-on-surface">{ride.pickupZone?.name}</span>
                      <Navigation2 className="w-3.5 h-3.5 text-primary rotate-90" />
                      <span className="text-label-md font-bold text-on-surface">{ride.destinationZone?.name}</span>
                    </div>
                    <span className="text-body-xs text-on-surface-variant mt-1">
                      Ride ID: {ride.id.substring(0, 8).toUpperCase()} • {ride.requestedSeats} Seat{ride.requestedSeats > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end md:ml-auto">
                  <span className="text-title-md font-bold text-on-surface">{formatPaisa(ride.totalFarePaisa || ride.amountPaisa || 0)}</span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider bg-surface-container-highest px-2 py-0.5 rounded mt-1">
                    {ride.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
