import { Router } from "express";
import { likeController } from "./like.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// === Post likes ===
router.get("/:postId/likers", likeController.getPostLikers as any);
router.post("/:postId/toggle", authenticate as any, likeController.togglePostLike as any);
router.get("/:postId/status", authenticate as any, likeController.getPostLikeStatus as any);

// === Comment likes ===
router.post("/comment/:commentId/toggle", authenticate as any, likeController.toggleCommentLike as any);
router.get("/comment/:commentId/status", authenticate as any, likeController.getCommentLikeStatus as any);

export default router;