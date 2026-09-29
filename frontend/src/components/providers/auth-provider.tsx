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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
