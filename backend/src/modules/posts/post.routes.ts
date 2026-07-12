import { Router } from "express";
import { postController } from "./post.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadPostMedia } from "../../middleware/upload.middleware.js";

const router = Router();

// Public routes
router.get("/:postId", postController.getPostById as any);
router.get("/user/:userId", postController.getUserPosts as any);

// Protected routes
router.post("/", authenticate as any, uploadPostMedia, postController.createPost as any);
router.get("/feed/main", authenticate as any, postController.getFeed as any);
router.delete("/:postId", authenticate as any, postController.deletePost as any);

export default router;