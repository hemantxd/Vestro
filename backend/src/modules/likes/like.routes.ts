import { Router } from "express";
import { likeController } from "./like.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Public
router.get("/:postId/likers", likeController.getLikers as any);

// Protected
router.post("/:postId/toggle", authenticate as any, likeController.toggleLike as any);
router.get("/:postId/status", authenticate as any, likeController.getLikeStatus as any);

export default router;