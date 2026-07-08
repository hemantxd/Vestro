import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const notifications = await notificationService.getNotifications(req.user.userId, { limit, page });
      res.status(200).json({ status: "success", data: notifications });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const count = await notificationService.getUnreadCount(req.user.userId);
      res.status(200).json({ status: "success", data: { unreadCount: count } });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const notificationId = req.params.notificationId as string;
      await notificationService.markAsRead(notificationId, req.user.userId);
      res.status(200).json({ status: "success", message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      await notificationService.markAllAsRead(req.user.userId);
      res.status(200).json({ status: "success", message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const notificationId = req.params.notificationId as string;
      await notificationService.deleteNotification(notificationId, req.user.userId);
      res.status(200).json({ status: "success", message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  },
};