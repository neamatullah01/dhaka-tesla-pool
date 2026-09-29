import { Receipt, Users, CircleDollarSign, Route, Zap, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface FareEstimateCardProps {
  distanceMeters?: number;
  ratePerMeterPaisa?: number;
  baseFarePaisa?: number;
  discountPaisa?: number;
  totalPaisa?: number;
  poolEligible?: boolean;
  onSubmit?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function FareEstimateCard({
  distanceMeters,
  ratePerMeterPaisa = 2,
  baseFarePaisa = 5000,
  discountPaisa,
  totalPaisa,
  poolEligible,
  onSubmit,
  loading,
  disabled
}: FareEstimateCardProps) {
  const hasData = distanceMeters !== undefined;
  
  const formattedDistance = hasData ? `${distanceMeters.toLocaleString()} m` : "—";
  const formattedDistanceKm = hasData ? `${(distanceMeters / 1000).toFixed(1)} km` : "Select pickup and destination";
  
  const distanceChargePaisa = hasData ? distanceMeters * ratePerMeterPaisa : 0;
  
  return (
    <SectionCard
      title="Fare estimate"
      icon={Receipt}
      right={<StatusBadge tone="muted">Fixed fare</StatusBadge>}
    >
      <div className="flex flex-col gap-4">
        <div className="bg-surface-container-lowest rounded-lg p-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Distance</span>
            <span className="font-label text-headline-md text-on-surface">{formattedDistance}</span>
            <span className="text-label-sm text-on-surface-variant mt-1">{formattedDistanceKm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Rate</span>
            <span className="font-label text-headline-md text-primary-container">{ratePerMeterPaisa}p / meter</span>
            <span className="text-label-sm text-on-surface-variant mt-1">Fixed corridor rate</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-body-md text-on-surface-variant">Pool eligibility</span>
          {poolEligible ? (
            <StatusBadge tone="success">
              <Users className="w-3 h-3 mr-1 inline-block" aria-hidden="true" />
              Pool available
            </StatusBadge>
          ) : (
            <StatusBadge tone="muted">Not checked</StatusBadge>
          )}
        </div>

        <div className="flex flex-col mt-2">
          <div className="flex justify-between items-center py-3 text-body-md border-b border-outline-variant/40">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <CircleDollarSign className="w-4 h-4" aria-hidden="true" />
              Base fare
            </div>
            <div className="font-label text-on-surface">
              {hasData ? `${baseFarePaisa.toLocaleString()} p (৳${(baseFarePaisa / 100).toFixed(2)})` : "—"}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-3 text-body-md border-b border-outline-variant/40">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Route className="w-4 h-4" aria-hidden="true" />
              Distance charge ({hasData ? `${distanceMeters.toLocaleString()} m × ${ratePerMeterPaisa}p` : "—"})
            </div>
            <div className="font-label text-on-surface">
              {hasData ? `${distanceChargePaisa.toLocaleString()} p (৳${(distanceChargePaisa / 100).toFixed(2)})` : "—"}
            </div>
          </div>

          {poolEligible && discountPaisa && (
            <div className="flex justify-between items-center py-3 text-body-md bg-secondary-container/10 rounded-lg px-3 -mx-3 text-secondary-container font-semibold mt-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                Pool discount
              </div>
              <div className="font-label">
                −{discountPaisa.toLocaleString()} p (−৳{(discountPaisa / 100).toFixed(2)})
              </div>
            </div>
          )}
        </div>

        <div aria-live="polite" className="pt-6 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="font-headline text-headline-sm font-semibold text-on-surface">Total estimated fare</span>
            <span className="text-label-sm text-on-surface-variant">Fixed fare, no surge pricing</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label text-4xl md:text-5xl font-bold text-primary-container">
              {hasData && totalPaisa ? `৳${(totalPaisa / 100).toFixed(2)}` : "—"}
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {hasData && totalPaisa ? `${totalPaisa.toLocaleString()} paisa` : "—"}
            </span>
          </div>
        </div>

        <button
          type="submit"
          form="ride-request-form"
          disabled={disabled || loading}
          className={cn(
            "mt-6 w-full h-16 rounded-lg font-headline text-headline-sm font-semibold tracking-wide transition flex items-center justify-center gap-2",
            disabled 
              ? "bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed" 
              : "bg-primary-container hover:bg-primary-fixed text-on-primary-container shadow-[0_0_24px_rgba(0,242,254,0.25)] hover:shadow-[0_0_32px_rgba(0,242,254,0.4)]"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Requesting…
            </>
          ) : (
            <>
              <Zap className="w-[22px] h-[22px]" aria-hidden="true" />
              Request Ride {hasData && totalPaisa ? `(৳${(totalPaisa / 100).toFixed(2)})` : ""}
            </>
          )}
        </button>
      </div>
    </SectionCard>
  );
}
