import { Wallet, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface PaymentMethodSelectorProps {
  value: "TESLAPAY" | "CASH";
  onChange: (value: "TESLAPAY" | "CASH") => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const options = [
    { value: "TESLAPAY", label: "TeslaPay", icon: Wallet },
    { value: "CASH", label: "Cash", icon: Banknote },
  ] as const;

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-label-md text-on-surface-variant mb-2">Payment method</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-16 rounded-lg flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-container outline-none",
                isSelected
                  ? "bg-surface-container-high text-primary-container ring-1 ring-primary-container/40"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
              <span className="text-label-lg font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
