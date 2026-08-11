import { apiRequest } from "./client";
import type { CreatePostInput, ListPostsOptions, Post } from "@/types/post";

function buildQuery(options?: ListPostsOptions): string {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.page) params.set("page", String(options.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const postApi = {
  async createPost(input: CreatePostInput): Promise<Post> {
    const formData = new FormData();
    if (input.text) formData.append("text", input.text);
    if (input.tickers && input.tickers.length > 0) {
      input.tickers.forEach((t) => formData.append("tickers", t));
    }
    if (input.currency) formData.append("currency", input.currency);
    if (input.media && input.media.length > 0) {
      input.media.forEach((file) => formData.append("media", file));
    }

    const res = await apiRequest<{ status: string; data: Post }>("/posts", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  async getFeed(options?: ListPostsOptions): Promise<Post[]> {
    const res = await apiRequest<{ status: string; data: Post[] }>(
      `/posts/feed/main${buildQuery(options)}`
    );
    return res.data;
  },

  async getPost(postId: string): Promise<Post> {
    const res = await apiRequest<{ status: string; data: Post }>(
      `/posts/${postId}`
    );
    return res.data;
  },

  async getUserPosts(userId: string, options?: ListPostsOptions): Promise<Post[]> {
    const res = await apiRequest<{ status: string; data: Post[] }>(
      `/posts/user/${userId}${buildQuery(options)}`
    );
    return res.data;
  },

  async getPostsByTicker(ticker: string, options?: ListPostsOptions): Promise<Post[]> {
    const res = await apiRequest<{ status: string; data: Post[] }>(
      `/posts/ticker/${encodeURIComponent(ticker)}${buildQuery(options)}`
    );
    return res.data;
  },

  async deletePost(postId: string): Promise<void> {
    await apiRequest<{ status: string; message: string }>(`/posts/${postId}`, {
      method: "DELETE",
    });
  },
};