import { apiRequest } from "./client";

interface FollowStatus {
  isFollowing: boolean;
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
};