import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Tell the backend to revoke the refresh token and clear the httpOnly cookie
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      // 2. Clear all cached React Query state to prevent cross-session leaks
      queryClient.clear();
      
      // 3. Regardless of API success/failure, clear frontend memory and state
      clearAuth();
      
      // 4. Redirect to login
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });
};
