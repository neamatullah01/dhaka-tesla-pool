import { formatPaisa } from "@/lib/format";

interface FareBreakdownProps {
  baseFarePaisa: number;
  distanceChargePaisa: number;
  discountPaisa?: number;
  totalPaisa: number;
}

export function FareBreakdown({
  baseFarePaisa,
  distanceChargePaisa,
  discountPaisa,
  totalPaisa,
}: FareBreakdownProps) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center py-3 text-body-md border-b border-outline-variant/40">
        <span className="text-on-surface-variant">Base fare</span>
        <span className="font-label text-on-surface">{formatPaisa(baseFarePaisa)}</span>
      </div>
      
      <div className="flex justify-between items-center py-3 text-body-md border-b border-outline-variant/40">
        <span className="text-on-surface-variant">Distance charge</span>
        <span className="font-label text-on-surface">{formatPaisa(distanceChargePaisa)}</span>
      </div>
      
      {discountPaisa !== undefined && discountPaisa > 0 && (
        <div className="flex justify-between items-center py-3 text-body-md border-b border-outline-variant/40">
          <span className="text-on-surface-variant">Pool discount</span>
          <span className="font-label text-secondary-container">
            &minus;{formatPaisa(discountPaisa)}
          </span>
        </div>
      )}
      
      <div className="pt-4 flex justify-between items-end">
        <span className="font-headline text-headline-sm text-on-surface">Total fare</span>
        <div className="flex flex-col items-end">
          <span className="font-label text-3xl font-bold text-primary-container leading-none">
            {formatPaisa(totalPaisa)}
          </span>
          <span className="text-label-sm text-on-surface-variant mt-1">
            {totalPaisa.toLocaleString()} paisa
          </span>
        </div>
      </div>
    </div>
  );
}
