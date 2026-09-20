import { Router } from "express";
import { postController } from "./post.controller.js";
import { authenticate, optionalAuth } from "../../middleware/auth.middleware.js";
import { uploadPostMedia } from "../../middleware/upload.middleware.js";
import { readLimiter, uploadLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Public routes (optionalAuth so `isLiked` is computed for logged-in viewers)
router.get("/ticker/:ticker", readLimiter as any, optionalAuth as any, postController.getPostsByTicker as any);
router.get("/tickers/trending", readLimiter as any, postController.getTrendingTickers as any);
router.get("/:postId", readLimiter as any, optionalAuth as any, postController.getPostById as any);
router.get("/user/:userId", readLimiter as any, optionalAuth as any, postController.getUserPosts as any);

// Protected routes
router.post("/", uploadLimiter as any, authenticate as any, uploadPostMedia, postController.createPost as any);
router.get("/feed/main", readLimiter as any, authenticate as any, postController.getFeed as any);
router.delete("/:postId", writeLimiter as any, authenticate as any, postController.deletePost as any);

export default router;