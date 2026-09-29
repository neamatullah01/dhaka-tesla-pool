import { History, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useRideHistory } from "@/hooks/useRides";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaisa } from "@/lib/format";

export function RecentHistoryCard() {
  const { data: rides = [], isLoading } = useRideHistory();
  const recentRides = rides.slice(0, 3); // Just show top 3 for the dashboard

  return (
    <SectionCard
      title="Recent history"
      icon={History}
      right={
        <Link href="/passenger/history" className="text-label-sm font-semibold text-primary hover:text-primary-fixed transition-colors">
          View all
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-24 bg-surface-variant rounded-lg" />
            <Skeleton className="w-full h-24 bg-surface-variant rounded-lg hidden sm:block" />
          </>
        ) : recentRides.length === 0 ? (
          <div className="col-span-full text-center text-body-md text-on-surface-variant py-4 bg-surface-container rounded-lg">
            No recent rides found.
          </div>
        ) : (
          recentRides.map((ride) => (
            <div key={ride.id} className="bg-surface-container rounded-lg p-4 flex justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1 font-label text-label-md font-semibold text-primary-container">
                  {ride.pickupZone?.name || "Pickup"}
                  <ArrowRight className="w-3 h-3 mx-1" aria-hidden="true" />
                  {ride.destinationZone?.name || "Destination"}
                </div>
                <div className="mt-1">
                  <StatusBadge tone={ride.status === "COMPLETED" ? "success" : "muted"}>
                    {ride.status}
                  </StatusBadge>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1 text-right justify-center">
                <span className="font-label text-label-lg text-on-surface">
                  {ride.fare?.totalPaisa ? formatPaisa(ride.fare.totalPaisa) : (ride.amountPaisa ? formatPaisa(ride.amountPaisa) : "—")}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  {ride.paymentMethod?.toUpperCase() === "TESLAPAY" ? "Paid via TeslaPay" : "Paid in cash"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
