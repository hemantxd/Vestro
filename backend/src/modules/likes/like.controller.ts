import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { likeService } from "./like.service.js";

export const likeController = {
  // === Post likes ===
  async togglePostLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      const result = await likeService.togglePostLike(req.user.userId, postId as string);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPostLikers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const likers = await likeService.getPostLikers(postId as string);
      res.status(200).json({ status: "success", data: likers });
    } catch (error) {
      next(error);
    }
  },

  async getPostLikeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      const status = await likeService.getPostLikeStatus(req.user.userId, postId as string);
      res.status(200).json({ status: "success", data: status });
    } catch (error) {
      next(error);
    }
  },

  // === Comment likes ===
  async toggleCommentLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { commentId } = req.params;
      const result = await likeService.toggleCommentLike(req.user.userId, commentId as string);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getCommentLikeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { commentId } = req.params;
      const status = await likeService.getCommentLikeStatus(req.user.userId, commentId as string);
      res.status(200).json({ status: "success", data: status });
    } catch (error) {
      next(error);
    }
  },
};