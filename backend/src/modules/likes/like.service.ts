import { AppError } from "../../common/errors/AppError.js";
import { likeRepository } from "./like.repository.js";
import { postRepository } from "../posts/post.repository.js";
import { commentRepository } from "../comments/comment.repository.js";

export const likeService = {
  // === Post likes ===
  async togglePostLike(userId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const existing = await likeRepository.findByUserAndPost(userId, postId);

    if (existing) {
      await likeRepository.deletePostLike(userId, postId);
      await likeRepository.decrementPostLikes(postId);
      return { liked: false };
    } else {
      await likeRepository.createPostLike(userId, postId);
      await likeRepository.incrementPostLikes(postId);
      return { liked: true };
    }
  },

  async getPostLikers(postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return likeRepository.getLikers(postId);
  },

  async getPostLikeStatus(userId: string, postId: string) {
    const like = await likeRepository.findByUserAndPost(userId, postId);
    return { liked: !!like };
  },

  // === Comment likes ===
  async toggleCommentLike(userId: string, commentId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const existing = await likeRepository.findByUserAndComment(userId, commentId);

    if (existing) {
      await likeRepository.deleteCommentLike(userId, commentId);
      await likeRepository.decrementCommentLikes(commentId);
      return { liked: false };
    } else {
      await likeRepository.createCommentLike(userId, commentId);
      await likeRepository.incrementCommentLikes(commentId);
      return { liked: true };
    }
  },

  async getCommentLikeStatus(userId: string, commentId: string) {
    const existing = await likeRepository.findByUserAndComment(userId, commentId);
    return { liked: !!existing };
  },
};