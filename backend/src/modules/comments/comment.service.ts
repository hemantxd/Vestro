import { AppError } from "../../common/errors/AppError.js";
import { commentRepository } from "./comment.repository.js";
import { postRepository } from "../posts/post.repository.js";
import type { CreateCommentInput } from "./comment.types.js";

export const commentService = {
  async createComment(postId: string, authorId: string, input: CreateCommentInput) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // If replying to a comment, verify the parent comment exists
    if (input.parentId) {
      const parent = await commentRepository.findById(input.parentId);
      if (!parent) {
        throw new AppError("Parent comment not found", 404);
      }
      // Ensure replies are only one level deep
      if (parent.parentId) {
        throw new AppError("Cannot reply to a reply", 400);
      }
    }

    const comment = await commentRepository.create({
      postId,
      authorId,
      text: input.text,
      parentId: input.parentId || null,
    });

    await commentRepository.syncCommentsCount(postId);

    return comment;
  },

  async getComments(postId: string, currentUserId?: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return commentRepository.findByPostId(postId, currentUserId);
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    if (comment.authorId !== userId) {
      throw new AppError("You can only delete your own comments", 403);
    }

    await commentRepository.delete(commentId);
    await commentRepository.syncCommentsCount(comment.postId);
  },
};