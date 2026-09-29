import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore, User } from "@/store/auth.store";
import { LoginInput } from "@/lib/validations/auth";

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post("/auth/login", credentials);
      return response as LoginResponse;
    },
    onSuccess: (response: any) => {
      const userData = response?.data?.user || response?.user;
      const token = response?.data?.accessToken || response?.accessToken;
      
      if (userData && token) {
        setAuth(userData, token);
      }
    },
  });
};
