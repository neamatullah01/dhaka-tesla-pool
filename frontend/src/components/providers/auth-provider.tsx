"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { usePathname, useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, setAuth, clearAuth, setInitializing, isInitializing } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await apiClient.post("/auth/refresh");
        // Fallback checks just in case the wrapper structure is missing
        const userData = res?.data?.user || (res as any)?.user;
        const token = res?.data?.accessToken || (res as any)?.accessToken;
        
        if (userData && token) {
          setAuth(userData, token);
        } else {
          clearAuth();
        }
      } catch (err) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    }

    if (isInitializing) {
      initAuth();
    }
  }, [setAuth, clearAuth, setInitializing, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;

    const isDriverRoute = pathname.startsWith("/driver");
    const isPassengerRoute = pathname.startsWith("/passenger");
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

    if (!isAuthenticated) {
      if (isDriverRoute || isPassengerRoute) {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    } else {
      // User is authenticated
      if (user?.role === "DRIVER" && (isPassengerRoute || isAuthRoute || pathname === "/")) {
        router.replace("/driver/dashboard");
      } else if (user?.role === "PASSENGER" && (isDriverRoute || isAuthRoute || pathname === "/")) {
        router.replace("/passenger/request-ride");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isInitializing, isAuthenticated, user, pathname, router]);

  if (isInitializing || !isAuthorized) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden z-50">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000 delay-1000" />

        <div className="relative z-10 flex flex-col items-center gap-6 p-8 w-[500px] text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary border-r-primary rounded-full animate-spin relative z-10 shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
          </div>
          
          <div className="flex flex-col items-center gap-2 w-full">
            <h2 className="text-2xl font-bold font-headline text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container animate-pulse whitespace-nowrap">
              Starting the Engine
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
