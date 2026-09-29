"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    } else {
      if (user.role === "DRIVER") {
        router.replace("/driver/dashboard");
      } else if (user.role === "PASSENGER") {
        router.replace("/passenger/request-ride");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
