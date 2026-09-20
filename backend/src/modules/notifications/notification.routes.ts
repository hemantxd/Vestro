import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Reads are frequent (polling) — read tier; mutations are write tier.
router.get("/", readLimiter as any, notificationController.getNotifications);
router.get("/unread-count", readLimiter as any, notificationController.getUnreadCount);
router.patch("/:notificationId/read", writeLimiter as any, notificationController.markAsRead);
router.patch("/read-all", writeLimiter as any, notificationController.markAllAsRead);
router.delete("/:notificationId", writeLimiter as any, notificationController.deleteNotification);

export default router;