import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RideStatusStepperProps {
  currentStep?: number;
}

export function RideStatusStepper({ currentStep = 0 }: RideStatusStepperProps) {
  const steps = [
    "Requested",
    "Matched",
    "Driver arrived",
    "Started",
    "Completed",
  ];

  return (
    <div className="w-full pb-10 pt-2 sm:px-2">
      <div className="relative flex justify-between items-center w-full">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-surface-variant/50 z-0 rounded-full" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 bg-primary-container z-0 transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(0,242,254,0.4)] rounded-full" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((label, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                  isDone && "bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,242,254,0.4)]",
                  isCurrent && "bg-primary-container ring-4 ring-primary-container/30 shadow-[0_0_16px_rgba(0,242,254,0.6)]",
                  isUpcoming && "bg-surface-variant border-[3px] border-surface-container-highest"
                )}
              >
                {isDone && <Check className="w-3.5 h-3.5" strokeWidth={4} />}
                {isCurrent && <div className="w-2 h-2 bg-on-primary-container rounded-full animate-pulse" />}
              </div>
              
              <span
                className={cn(
                  "absolute top-9 whitespace-nowrap text-[13px] font-semibold transition-all duration-300",
                  isCurrent ? "text-primary-container" : "text-on-surface-variant/80",
                  isDone && "text-on-surface",
                  index === 0 ? "left-1/2 -translate-x-[40%] sm:-translate-x-1/2" : "",
                  index === steps.length - 1 ? "right-1/2 translate-x-[40%] sm:translate-x-1/2" : "",
                  index > 0 && index < steps.length - 1 ? "left-1/2 -translate-x-1/2" : ""
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
