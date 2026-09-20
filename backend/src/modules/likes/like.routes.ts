import { Router } from "express";
import { likeController } from "./like.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// === Post likes ===
router.get("/:postId/likers", readLimiter as any, likeController.getPostLikers as any);
router.post("/:postId/toggle", writeLimiter as any, authenticate as any, likeController.togglePostLike as any);
router.get("/:postId/status", readLimiter as any, authenticate as any, likeController.getPostLikeStatus as any);

// === Comment likes ===
router.get("/comment/:commentId/likers", readLimiter as any, likeController.getCommentLikers as any);
router.post("/comment/:commentId/toggle", writeLimiter as any, authenticate as any, likeController.toggleCommentLike as any);
router.get("/comment/:commentId/status", readLimiter as any, authenticate as any, likeController.getCommentLikeStatus as any);

export default router;