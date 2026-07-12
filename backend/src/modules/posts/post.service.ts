import { AppError } from "../../common/errors/AppError.js";
import { postRepository } from "./post.repository.js";
import { followRepository } from "../follows/follow.repository.js";
import type { CreatePostInput } from "./post.types.js";

export const postService = {
  async createPost(authorId: string, input: CreatePostInput, mediaUrls?: { url: string; type: "image" | "video" }[]) {
    const hasMedia = mediaUrls && mediaUrls.length > 0;
    let mediaType: string | null = null;

    if (hasMedia) {
      const allVideo = mediaUrls!.every((m) => m.type === "video");
      const allImage = mediaUrls!.every((m) => m.type === "image");
      mediaType = allVideo ? "video" : allImage ? "image" : "mixed";
    }

    const post = await postRepository.create({
      authorId,
      text: input.text || null,
      hasMedia: !!hasMedia,
      mediaType,
    });

    // Add media if provided
    if (hasMedia) {
      await postRepository.addMedia(
        mediaUrls!.map((m, i) => ({
          postId: post.id,
          url: m.url,
          type: m.type,
          orderIndex: i,
        }))
      );
    }

    // Increment user's posts count
    await postRepository.incrementPostsCount(authorId);

    return this.getPostById(post.id);
  },

  async getPostById(postId: string) {
    const post = await postRepository.getPostWithAuthor(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const media = await postRepository.getMediaForPost(postId);

    return {
      ...post,
      media,
    };
  },

  async getFeed(userId: string, options?: { limit?: number; page?: number }) {
    // Get list of users that the current user follows
    const following = await followRepository.getFollowing(userId, { limit: 1000 });
    const followingIds = following.map((f: any) => f.id);
    // Include the user's own posts
    const userIds = [...followingIds, userId];

    const feed = await postRepository.getFeed(userIds, options);

    // Attach media to each post
    const postsWithMedia = await Promise.all(
      feed.map(async (post) => ({
        ...post,
        media: await postRepository.getMediaForPost(post.id),
      }))
    );

    return postsWithMedia;
  },

  async getUserPosts(authorId: string, options?: { limit?: number; page?: number }) {
    const userPosts = await postRepository.getUserPosts(authorId, options);

    const postsWithMedia = await Promise.all(
      userPosts.map(async (post) => ({
        ...post,
        media: await postRepository.getMediaForPost(post.id),
      }))
    );

    return postsWithMedia;
  },

  async deletePost(postId: string, userId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    if (post.authorId !== userId) {
      throw new AppError("You can only delete your own posts", 403);
    }

    await postRepository.deletePost(postId, userId);
    await postRepository.decrementPostsCount(userId);
  },
};