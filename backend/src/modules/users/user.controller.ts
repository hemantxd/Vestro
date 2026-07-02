import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { userService } from "./user.service.js";

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.params.userId || req.user?.userId) as string | undefined;
      if (!userId) {
        res.status(400).json({ status: "error", message: "User ID is required" });
        return;
      }
      const profile = await userService.getProfile(userId);
      res.status(200).json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  },

  async getProfileByUsername(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await userService.getUserByUsername(username as string);
      res.status(200).json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const profile = await userService.updateProfile(req.user.userId, req.body);
      res.status(200).json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      if (!query) {
        res.status(400).json({ status: "error", message: "Search query is required" });
        return;
      }

      const users = await userService.searchUsers(query, limit);
      res.status(200).json({ status: "success", data: users });
    } catch (error) {
      next(error);
    }
  },
};