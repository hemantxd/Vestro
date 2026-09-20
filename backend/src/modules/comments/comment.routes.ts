import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Public
router.get("/:postId", readLimiter as any, commentController.getComments as any);

// Protected
router.post("/:postId", writeLimiter as any, authenticate as any, commentController.createComment as any);
router.delete("/:commentId", writeLimiter as any, authenticate as any, commentController.deleteComment as any);

export default router;