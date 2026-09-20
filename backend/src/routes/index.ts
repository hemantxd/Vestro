import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimit.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import followRoutes from "../modules/follows/follow.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";
import postRoutes from "../modules/posts/post.routes.js";
import likeRoutes from "../modules/likes/like.routes.js";
import commentRoutes from "../modules/comments/comment.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";

const router = Router();

// Global safety net: blanket cap on all /api/v1 traffic (per IP/user).
router.use(apiLimiter as any);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/follows", followRoutes);
router.use("/notifications", notificationRoutes);
router.use("/posts", postRoutes);
router.use("/likes", likeRoutes);
router.use("/comments", commentRoutes);
router.use("/chats", chatRoutes);

export default router;