import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Public
router.get("/:postId", commentController.getComments as any);

// Protected
router.post("/:postId", authenticate as any, commentController.createComment as any);
router.delete("/:commentId", authenticate as any, commentController.deleteComment as any);

export default router;