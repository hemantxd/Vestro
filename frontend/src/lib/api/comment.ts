import { apiRequest } from "./client";
import type { Comment, CreateCommentInput } from "@/types/comment";
import type { LikeToggleResult } from "./like";

export const commentApi = {
  async getComments(postId: string): Promise<Comment[]> {
    const res = await apiRequest<{ status: string; data: Comment[] }>(
      `/comments/${postId}`
    );
    return res.data;
  },

  async createComment(postId: string, input: CreateCommentInput): Promise<Comment> {
    const res = await apiRequest<{ status: string; data: Comment }>(
      `/comments/${postId}`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiRequest<{ status: string; message: string }>(`/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  async toggleCommentLike(commentId: string): Promise<LikeToggleResult> {
    const res = await apiRequest<{ status: string; data: LikeToggleResult }>(
      `/likes/comment/${commentId}/toggle`,
      { method: "POST" }
    );
    return res.data;
  },
};