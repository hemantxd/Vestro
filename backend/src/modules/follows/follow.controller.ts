import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { followService } from "./follow.service.js";

export const followController = {
  async followUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { followingId } = req.body;
      if (!followingId) {
        res.status(400).json({ status: "error", message: "followingId is required" });
        return;
      }

      const follow = await followService.follow(req.user.userId, followingId);
      res.status(201).json({ status: "success", data: follow });
    } catch (error) {
      next(error);
    }
  },

  async unfollowUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { followingId } = req.params;
      await followService.unfollow(req.user.userId, followingId as string);
      res.status(200).json({ status: "success", message: "Unfollowed successfully" });
    } catch (error) {
      next(error);
    }
  },

  async removeFollower(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { followerId } = req.params;
      await followService.removeFollower(req.user.userId, followerId as string);
      res.status(200).json({ status: "success", message: "Follower removed" });
    } catch (error) {
      next(error);
    }
  },

  async getFollowers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        res.status(400).json({ status: "error", message: "User ID is required" });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const followers = await followService.getFollowers(userId, req.user?.userId, { limit, page });
      res.status(200).json({ status: "success", data: followers });
    } catch (error) {
      next(error);
    }
  },

  async getFollowing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        res.status(400).json({ status: "error", message: "User ID is required" });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const following = await followService.getFollowing(userId, req.user?.userId, { limit, page });
      res.status(200).json({ status: "success", data: following });
    } catch (error) {
      next(error);
    }
  },

  async getFollowStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { followingId } = req.params;
      const status = await followService.getFollowStatus(req.user.userId, followingId as string);
      res.status(200).json({ status: "success", data: status });
    } catch (error) {
      next(error);
    }
  },
};