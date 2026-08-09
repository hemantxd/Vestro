import { apiRequest } from "./client";

export interface FollowStatus {
  isFollowing: boolean;
}

export interface FollowUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  followedAt: string;
  isFollowingBack: boolean;
}

export const followApi = {
  async follow(followingId: string): Promise<void> {
    await apiRequest<{ status: string; data: unknown }>("/follows", {
      method: "POST",
      body: JSON.stringify({ followingId }),
    });
  },

  async unfollow(followingId: string): Promise<void> {
    await apiRequest<{ status: string; message: string }>(`/follows/${followingId}`, {
      method: "DELETE",
    });
  },

  async getFollowStatus(followingId: string): Promise<FollowStatus> {
    const res = await apiRequest<{ status: string; data: FollowStatus }>(
      `/follows/${followingId}/status`
    );
    return res.data;
  },

  async getFollowers(userId: string, limit = 50, page = 1): Promise<FollowUser[]> {
    const res = await apiRequest<{ status: string; data: FollowUser[] }>(
      `/follows/${userId}/followers?limit=${limit}&page=${page}`
    );
    return res.data;
  },

  async getFollowing(userId: string, limit = 50, page = 1): Promise<FollowUser[]> {
    const res = await apiRequest<{ status: string; data: FollowUser[] }>(
      `/follows/${userId}/following?limit=${limit}&page=${page}`
    );
    return res.data;
  },
};