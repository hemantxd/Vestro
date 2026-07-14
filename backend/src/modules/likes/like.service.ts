import { AppError } from "../../common/errors/AppError.js";
import { likeRepository } from "./like.repository.js";
import { postRepository } from "../posts/post.repository.js";

export const likeService = {
  async toggleLike(userId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const existing = await likeRepository.findByUserAndPost(userId, postId);

    if (existing) {
      // Unlike
      await likeRepository.delete(userId, postId);
      await likeRepository.decrementPostLikes(postId);
      return { liked: false };
    } else {
      // Like
      await likeRepository.create(userId, postId);
      await likeRepository.incrementPostLikes(postId);
      return { liked: true };
    }
  },

  async getLikers(postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return likeRepository.getLikers(postId);
  },

  async getLikeStatus(userId: string, postId: string) {
    const like = await likeRepository.findByUserAndPost(userId, postId);
    return { liked: !!like };
  },
};