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

  async updateProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ status: "error", message: "No file uploaded" });
        return;
      }

      // Cloudinary returns the URL in req.file.path
      const imageUrl = (req.file as any).path;

      const profile = await userService.updateProfilePicture(req.user.userId, imageUrl);
      res.status(200).json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  },

  async deleteProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const profile = await userService.deleteProfilePicture(req.user.userId);
      res.status(200).json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      if (!query) {
        res.status(400).json({ status: "error", message: "Search query is required" });
        return;
      }

      const users = await userService.searchUsers(query, { limit, page });
      res.status(200).json({ status: "success", data: users });
    } catch (error) {
      next(error);
    }
  },
};