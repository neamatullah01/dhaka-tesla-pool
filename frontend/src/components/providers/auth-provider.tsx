"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth, setInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        // Assuming your backend has an endpoint that uses the refresh token
        // cookie to issue a new access token on reload.
        const res = await apiClient.post("/auth/refresh");
        if (res?.success && res.data?.accessToken) {
          setAuth(res.data.user, res.data.accessToken);
        } else {
          clearAuth();
        }
      } catch (err) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    }

    initAuth();
  }, [setAuth, clearAuth, setInitializing]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
