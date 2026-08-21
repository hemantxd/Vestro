import { apiRequest } from "./client";

export interface LikeToggleResult {
  liked: boolean;
}

export interface LikeUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

export const likeApi = {
  async togglePostLike(postId: string): Promise<LikeToggleResult> {
    const res = await apiRequest<{ status: string; data: LikeToggleResult }>(
      `/likes/${postId}/toggle`,
      { method: "POST" }
    );
    return res.data;
  },

  async getPostLikeStatus(postId: string): Promise<LikeToggleResult> {
    const res = await apiRequest<{ status: string; data: LikeToggleResult }>(
      `/likes/${postId}/status`
    );
    return res.data;
  },

  async getPostLikers(postId: string): Promise<LikeUser[]> {
    const res = await apiRequest<{ status: string; data: LikeUser[] }>(
      `/likes/${postId}/likers`
    );
    return res.data;
  },

  async getCommentLikers(commentId: string): Promise<LikeUser[]> {
    const res = await apiRequest<{ status: string; data: LikeUser[] }>(
      `/likes/comment/${commentId}/likers`
    );
    return res.data;
  },
};