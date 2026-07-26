import { create } from "zustand";
import { authApi } from "@/lib/api/auth";
import { getAccessToken, setAccessToken } from "@/lib/api/client";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch {
      // Token expired - try refresh
      try {
        await authApi.refresh();
        const user = await authApi.getMe();
        set({ user, isLoading: false, isAuthenticated: true });
      } catch {
        setAccessToken(null);
        set({ user: null, isLoading: false, isAuthenticated: false });
      }
    }
  },

  login: async (email: string, password: string) => {
    await authApi.login({ email, password });
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  register: async (username: string, email: string, password: string, displayName?: string) => {
    await authApi.register({ username, email, password, displayName });
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  googleLogin: async (idToken: string) => {
    await authApi.googleLogin(idToken);
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));