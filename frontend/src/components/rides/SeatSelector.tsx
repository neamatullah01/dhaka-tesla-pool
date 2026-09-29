import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface SeatSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function SeatSelector({ value, onChange }: SeatSelectorProps) {
  const options = [
    { value: 1, label: "1 Seat", sub: "Solo" },
    { value: 2, label: "2 Seats", sub: "Share" },
    { value: 3, label: "3 Seats", sub: "Full pod" },
  ];

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-label-md text-on-surface-variant mb-2">Seat quantity</Label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-16 rounded-lg flex flex-col items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-primary-container outline-none",
                isSelected
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              )}
            >
              <span className="text-label-lg font-semibold">{opt.label}</span>
              <span className="text-label-sm opacity-80">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
