import { Car, Zap, LogOut, History } from "lucide-react";
import { Vehicle } from "@/hooks/useDriver";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DriverHeaderProps {
  vehicle: Vehicle | null | undefined;
  hasActivePool?: boolean;
  isLoading: boolean;
  onGoOnline: () => void;
  onGoOffline: () => void;
  isToggling: boolean;
}

export function DriverHeader({ vehicle, hasActivePool, isLoading, onGoOnline, onGoOffline, isToggling }: DriverHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleLogout = () => {
    toast.warning("Are you sure you want to log out?", {
      action: {
        label: "Logout",
        onClick: () => {
          clearAuth();
          router.push('/login');
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-outline-variant/20">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-4" />
          </div>
        </div>
      </div>
    );
  }

  const isOnline = vehicle?.status === "ONLINE" || vehicle?.status === "IN_TRIP";
  const cannotGoOffline = hasActivePool;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-outline-variant/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-container/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0 border border-outline-variant/30 relative shadow-inner">
          <Car className="w-8 h-8 text-primary-container" />
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-surface-container-low shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-title-lg font-headline text-on-surface font-bold tracking-tight">
              {user?.name || "Driver"}
            </h1>
            <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold rounded shadow-sm">
              {vehicle?.plateNo || "NO-PLATE"}
            </span>
            <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold rounded shadow-sm">
              Pilot Tier 4
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant mt-1">
            {vehicle?.model || "Standard Vehicle"} — {vehicle?.capacity || 3} Max Cabin Occupancy
          </p>
          <div className="flex items-center gap-4 mt-2 text-label-sm text-on-surface-variant/80">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>North-South Spine</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-6 relative z-10 w-full lg:w-auto justify-between lg:justify-end">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="20" className="stroke-primary fill-none stroke-[4]" strokeDasharray="125" strokeDashoffset="15" />
            </svg>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-title-md font-bold text-on-surface leading-tight">88% <span className="text-label-sm text-on-surface-variant font-normal">SOC</span></span>
            <span className="text-label-sm text-primary-container">340 km Range</span>
          </div>
        </div>

        <div className="w-px h-12 bg-outline-variant/30 hidden sm:block" />

        <div className="flex items-center justify-between gap-4 bg-surface-container-highest px-4 h-12 rounded-xl border border-outline-variant/20 shadow-inner">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] leading-tight text-on-surface-variant uppercase font-semibold tracking-wider">Cockpit</span>
            <span className={`text-[12px] leading-tight font-bold ${isOnline ? "text-primary-container" : "text-on-surface-variant"}`}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          
          <button
            type="button"
            onClick={isOnline ? onGoOffline : onGoOnline}
            disabled={isToggling || !vehicle || cannotGoOffline}
            title={cannotGoOffline ? "Cannot go offline while you have an active trip or passenger request" : ""}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              isOnline ? "bg-primary-container" : "bg-surface-variant"
            } ${(isToggling || !vehicle || cannotGoOffline) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-on-primary-container transition-transform ${
                isOnline ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="w-px h-12 bg-outline-variant/30 hidden sm:block" />

        <div className="flex items-center gap-3">
          <Link
            href="/driver/history"
            className="flex items-center justify-center gap-2 px-4 h-12 bg-surface-container-highest hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-xl border border-outline-variant/20 transition-colors shadow-sm font-semibold text-label-md"
            title="Ride History"
          >
            <History className="w-4 h-4" />
            History
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center bg-error/10 hover:bg-error/20 text-error rounded-xl border border-error/20 transition-colors shadow-sm"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
