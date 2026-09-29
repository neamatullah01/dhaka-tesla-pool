import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RegisterInput } from "@/lib/validations/auth";
import { User } from "@/store/auth.store";

interface RegisterResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      // Clean up phone number if it's empty
      const payload = { ...userData };
      if (!payload.phone) {
        delete payload.phone;
      }
      const response = await apiClient.post("/auth/register", payload);
      return response as RegisterResponse;
    },
  });
};
