import { apiRequest, setAccessToken } from "./client";
import type { AuthResponse, RegisterInput, LoginInput, User } from "@/types/auth";

export const authApi = {
  async register(input: RegisterInput): Promise<string> {
    const res = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  async login(input: LoginInput): Promise<string> {
    const res = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  async googleLogin(idToken: string): Promise<string> {
    const res = await apiRequest<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  async refresh(): Promise<string> {
    const res = await apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
    });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<{ status: string }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
    }
  },

  async getMe(): Promise<User> {
    const res = await apiRequest<{ status: string; data: User }>("/auth/me");
    return res.data;
  },
};