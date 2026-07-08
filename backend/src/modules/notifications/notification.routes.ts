import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);

export default router;