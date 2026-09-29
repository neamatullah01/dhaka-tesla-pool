import { User, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SeatData {
  id: string;
  state: "you" | "taken" | "open";
}

interface CabinSeatsProps {
  seats: SeatData[];
}

export function CabinSeats({ seats }: CabinSeatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {seats.map((seat, index) => {
        const isYou = seat.state === "you";
        const isTaken = seat.state === "taken";
        const isOpen = seat.state === "open";

        return (
          <div
            key={seat.id}
            className={cn(
              "rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center gap-2 text-center",
              isYou && "bg-primary-container/20 ring-1 ring-primary-container text-primary-container",
              isOpen && "bg-surface-container text-on-surface-variant",
              isTaken && "bg-surface-variant text-on-surface-variant"
            )}
          >
            {isYou ? (
              <User className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Armchair className={cn("w-6 h-6", isTaken ? "text-on-surface-variant" : "")} aria-hidden="true" />
            )}
            
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-label-md font-semibold", isYou && "text-on-surface", !isYou && "text-on-surface")}>
                Seat {index + 1}
              </span>
              <span className={cn(
                "text-label-sm uppercase font-label",
                isYou && "text-primary-container",
                isOpen && "text-secondary-fixed",
                isTaken && "text-on-surface-variant"
              )}>
                {isYou ? "You" : isTaken ? "Reserved" : "Open"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
