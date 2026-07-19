import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { commentService } from "./comment.service.js";

export const commentController = {
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      const { text, parentId } = req.body;

      if (!text) {
        res.status(400).json({ status: "error", message: "Text is required" });
        return;
      }

      const comment = await commentService.createComment(postId as string, req.user.userId, { text, parentId });
      res.status(201).json({ status: "success", data: comment });
    } catch (error) {
      next(error);
    }
  },

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const comments = await commentService.getComments(postId as string, req.user?.userId);
      res.status(200).json({ status: "success", data: comments });
    } catch (error) {
      next(error);
    }
  },

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { commentId } = req.params;
      await commentService.deleteComment(commentId as string, req.user.userId);
      res.status(200).json({ status: "success", message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  },
};