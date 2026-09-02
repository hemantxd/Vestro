import { Router } from "express";
import { postController } from "./post.controller.js";
import { authenticate, optionalAuth } from "../../middleware/auth.middleware.js";
import { uploadPostMedia } from "../../middleware/upload.middleware.js";

const router = Router();

// Public routes (optionalAuth so `isLiked` is computed for logged-in viewers)
router.get("/ticker/:ticker", optionalAuth as any, postController.getPostsByTicker as any);
router.get("/tickers/trending", postController.getTrendingTickers as any);
router.get("/:postId", optionalAuth as any, postController.getPostById as any);
router.get("/user/:userId", optionalAuth as any, postController.getUserPosts as any);

// Protected routes
router.post("/", authenticate as any, uploadPostMedia, postController.createPost as any);
router.get("/feed/main", authenticate as any, postController.getFeed as any);
router.delete("/:postId", authenticate as any, postController.deletePost as any);

export default router;