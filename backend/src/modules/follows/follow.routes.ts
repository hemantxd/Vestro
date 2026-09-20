import { Router } from "express";
import { followController } from "./follow.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Public routes (optional auth for isFollowingBack)
router.get("/:userId/followers", readLimiter as any, followController.getFollowers);
router.get("/:userId/following", readLimiter as any, followController.getFollowing);

// Protected routes
router.post("/", writeLimiter as any, authenticate, followController.followUser);
router.delete("/:followingId", writeLimiter as any, authenticate, followController.unfollowUser);
router.delete("/follower/:followerId", writeLimiter as any, authenticate, followController.removeFollower);
router.get("/:followingId/status", readLimiter as any, authenticate, followController.getFollowStatus);

export default router;