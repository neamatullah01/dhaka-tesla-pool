import { CarFront } from "lucide-react";
import { DemoAccounts } from "./DemoAccounts";

interface BrandPanelProps {
  onFill?: (email: string, pass: string) => void;
}

export function BrandPanel({ onFill }: BrandPanelProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
          <CarFront className="h-6 w-6 text-primary-container fill-primary-container/20" />
        </div>
        <h1 className="font-headline text-headline-md text-primary tracking-tight">
          Dhaka Tesla Pool
        </h1>
      </div>
      <p className="text-body-sm text-on-surface-variant leading-relaxed">
        Share a seat. Split the fare. Survive Dhaka traffic.
      </p>
      
      {process.env.NODE_ENV !== "production" && (
        <DemoAccounts onFill={onFill} />
      )}
    </>
  );
}
