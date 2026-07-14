import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { likeService } from "./like.service.js";

export const likeController = {
  async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      const result = await likeService.toggleLike(req.user.userId, postId as string);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async getLikers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const likers = await likeService.getLikers(postId as string);
      res.status(200).json({ status: "success", data: likers });
    } catch (error) {
      next(error);
    }
  },

  async getLikeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      const status = await likeService.getLikeStatus(req.user.userId, postId as string);
      res.status(200).json({ status: "success", data: status });
    } catch (error) {
      next(error);
    }
  },
};