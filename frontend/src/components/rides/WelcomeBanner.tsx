import { User, Wallet, History, ArrowRight } from "lucide-react";
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

export function WelcomeBanner({ name, balancePaisa, recentRoutes }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 md:p-8 bg-surface-container-low bg-gradient-to-br from-primary-container/15 via-surface-container-low to-surface-container-low shadow-md">
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
            Pick your zones, choose your seats and see your fare before you confirm.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          {balancePaisa !== undefined && (
            <div className="bg-surface-container/70 rounded-lg p-4 flex flex-col justify-center min-w-[200px]">
              <div className="flex items-center gap-1.5 mb-2">
                <Wallet className="w-[14px] h-[14px] text-on-surface-variant" aria-hidden="true" />
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">TeslaPay balance</span>
              </div>
              <div className="font-label text-headline-md font-bold text-primary">
                ৳{(balancePaisa / 100).toFixed(2)}
              </div>
              <div className="text-label-sm text-on-surface-variant mt-0.5">
                {balancePaisa.toLocaleString()} paisa
              </div>
            </div>
          )}

          {recentRoutes && recentRoutes.length > 0 && (
            <div className="flex flex-col justify-center gap-2">
              <div className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Recent routes
              </div>
              <div className="flex flex-col gap-2">
                {recentRoutes.map((route, i) => (
                  <button key={i} type="button" className="bg-surface-container rounded-lg px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high flex items-center gap-2 transition-colors">
                    <History className="w-[14px] h-[14px] text-primary-container" aria-hidden="true" />
                    {route.from}
                    <ArrowRight className="w-3 h-3 text-on-surface-variant" aria-hidden="true" />
                    {route.to}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
