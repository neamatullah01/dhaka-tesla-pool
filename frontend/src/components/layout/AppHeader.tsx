import { Zap, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AppHeader() {
  const { mutate: logout, isPending } = useLogout();
  const user = useAuthStore(state => state.user);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-surface-container-high/40">
      <div className="mx-auto max-w-[1480px] px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left side: Logo + Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary-container" aria-hidden="true" />
            </div>
            <span className="font-headline text-title-lg sm:text-headline-md text-primary tracking-tight">
              Dhaka Tesla Pool
            </span>
          </div>

          <nav className="hidden md:flex bg-surface-container-low rounded-xl p-1 gap-1">
            <Link
              href="/passenger/request-ride"
              className={cn(
                "px-5 py-2.5 rounded-lg text-label-lg font-label transition-colors",
                pathname === "/passenger/request-ride"
                  ? "bg-primary-container text-on-primary-container font-semibold shadow"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              )}
            >
              Request Ride
            </Link>
            <Link
              href="/passenger/history"
              className={cn(
                "px-5 py-2.5 rounded-lg text-label-lg font-label transition-colors",
                pathname === "/passenger/history" || pathname.startsWith("/passenger/history")
                  ? "bg-primary-container text-on-primary-container font-semibold shadow"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              )}
            >
              Ride History
            </Link>
          </nav>
        </div>
        <div className="bg-surface-container-low rounded-xl px-3 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container font-semibold text-body-sm shrink-0">
            {user?.name?.charAt(0) || "P"}
          </div>
          <span className="text-body-sm text-on-surface hidden sm:block">
            {user?.name || "Passenger"}
          </span>
          <div className="w-px h-5 bg-outline-variant" />
          <button
            type="button"
            className="w-[18px] h-[18px] flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
            aria-label="Log out"
            onClick={() => {
              toast("Are you sure you want to log out?", {
                action: {
                  label: "Log out",
                  onClick: () => logout(),
                },
                cancel: {
                  label: "Cancel",
                  onClick: () => {},
                },
              });
            }}
            disabled={isPending}
          >
            <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto w-full border-t border-surface-container-high/40 pt-3">
        <Link
          href="/passenger/request-ride"
          className={cn(
            "px-5 py-2.5 rounded-lg text-label-lg font-label transition-colors whitespace-nowrap",
            pathname === "/passenger/request-ride"
              ? "bg-primary-container text-on-primary-container font-semibold shadow"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          )}
        >
          Request Ride
        </Link>
        <Link
          href="/passenger/history"
          className={cn(
            "px-5 py-2.5 rounded-lg text-label-lg font-label transition-colors whitespace-nowrap",
            pathname === "/passenger/history" || pathname.startsWith("/passenger/history")
              ? "bg-primary-container text-on-primary-container font-semibold shadow"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          )}
        >
          Ride History
        </Link>
      </div>
    </header>
  );
}
