import { apiRequest } from "./client";
import type { UserProfile, UpdateProfileInput } from "@/types/user";

export const userApi = {
  async getByUsername(username: string): Promise<UserProfile> {
    const res = await apiRequest<{ status: string; data: UserProfile }>(
      `/users/${username}`
    );
    return res.data;
  },

  async getProfile(userId: string): Promise<UserProfile> {
    const res = await apiRequest<{ status: string; data: UserProfile }>(
      `/users/profile/${userId}`
    );
    return res.data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const res = await apiRequest<{ status: string; data: UserProfile }>(
      "/users/profile",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  },

  async uploadProfilePicture(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/users/profile/picture`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {}
      throw new Error(message);
    }

    const res = await response.json();
    return res.data;
  },

  async uploadCoverImage(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/users/profile/cover`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {}
      throw new Error(message);
    }

    const res = await response.json();
    return res.data;
  },

  async deleteProfilePicture(): Promise<UserProfile> {
    const res = await apiRequest<{ status: string; data: UserProfile }>(
      "/users/profile/picture",
      {
        method: "DELETE",
      }
    );
    return res.data;
  },

  async searchUsers(query: string, limit = 10, page = 1): Promise<UserProfile[]> {
    const res = await apiRequest<{ status: string; data: UserProfile[] }>(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
    );
    return res.data;
  },
};