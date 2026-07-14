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

    const comment = await commentRepository.create({
      postId,
      authorId,
      text: input.text,
    });

    // Sync the comments count on the post
    await commentRepository.syncCommentsCount(postId);

    // Fetch the full comment with author info
    const comments = await commentRepository.findByPostId(postId);
    const created = comments.find((c) => c.id === comment.id);

    return created || comment;
  },

  async getComments(postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return commentRepository.findByPostId(postId);
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

    // Sync the comments count
    await commentRepository.syncCommentsCount(comment.postId);
  },
};