import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // 1. Tell the backend to revoke the refresh token and clear the httpOnly cookie
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      // 2. Regardless of API success/failure, clear frontend memory and state
      clearAuth();
      
      // 3. Redirect to login
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });
};
