import { Router } from "express";
import { followController } from "./follow.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes (optional auth for isFollowingBack)
router.get("/:userId/followers", followController.getFollowers);
router.get("/:userId/following", followController.getFollowing);

// Protected routes
router.post("/", authenticate, followController.followUser);
router.delete("/:followingId", authenticate, followController.unfollowUser);
router.delete("/follower/:followerId", authenticate, followController.removeFollower);
router.get("/:followingId/status", authenticate, followController.getFollowStatus);

export default router;