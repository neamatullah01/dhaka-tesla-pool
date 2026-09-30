import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export type UserRole = "PASSENGER" | "DRIVER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletBalancePaisa?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: (user, accessToken) => {
    apiClient.setAccessToken(accessToken);
    set({ user, isAuthenticated: true, isInitializing: false });
  },
  clearAuth: () => {
    apiClient.setAccessToken(null);
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
