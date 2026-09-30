import { User, Wallet, History, ArrowRight, Zap, Leaf } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface RouteInfo {
  from: string;
  to: string;
}

interface WelcomeBannerProps {
  name: string;
  balancePaisa?: number;
  recentRoutes?: RouteInfo[];
}

export function WelcomeBanner({
  name,
  balancePaisa = 0,
  recentRoutes,
}: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 md:p-8 bg-surface-container-low bg-gradient-to-br from-primary-container/15 via-surface-container-low to-surface-container-low shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant/20">
      <div className="absolute -left-10 -top-10 w-72 h-48 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10">
        <div className="flex flex-col gap-4 max-w-xl flex-1 min-w-[280px]">
          <div>
            <StatusBadge tone="info">
              <User className="w-3 h-3 mr-1 inline-block" aria-hidden="true" />
              Passenger
            </StatusBadge>
          </div>
          <h1 className="font-headline text-headline-xl-mobile md:text-headline-xl font-bold text-primary tracking-tight">
            Welcome back, {name}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Pick your zones, choose your seats and see your fare before you
            confirm. Share a seat and save on your ride.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          {/* TeslaPay Balance Card */}
          <div className="bg-surface-container-highest/50 backdrop-blur-sm rounded-xl p-5 flex flex-col justify-center min-w-[180px] border border-outline-variant/30 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              <Wallet className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
                TeslaPay balance
              </span>
            </div>
            <div className="font-headline text-headline-sm font-bold text-on-surface relative z-10">
              ৳{(balancePaisa / 100).toFixed(2)}
            </div>
          </div>

          {/* Premium Fleet Stat Card */}
          <div className="bg-gradient-to-br from-primary-container/20 to-surface-container-highest/50 backdrop-blur-sm border border-primary-container/30 rounded-xl p-5 flex flex-col justify-center min-w-[180px] shadow-sm relative overflow-hidden group hover:border-primary-container/50 transition-colors">
            <div className="absolute -top-2 -right-2 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Zap className="w-16 h-16 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              <Leaf className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-[9px] uppercase tracking-wider text-primary font-bold">
                Fleet Status
              </span>
            </div>
            <div className="font-headline text-title-md font-bold text-on-surface relative z-10 mb-0.5">
              100% Electric
            </div>
            <div className="text-[10px] text-on-surface-variant relative z-10 font-medium">
              Zero emission rides
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
