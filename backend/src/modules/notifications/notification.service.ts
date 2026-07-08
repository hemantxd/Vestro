import { notificationRepository } from "./notification.repository.js";
import { userRepository } from "../users/user.repository.js";
import type { CreateNotificationInput } from "./notification.types.js";

export const notificationService = {
  async createFollowNotification(userId: string, actorId: string) {
    const actor = await userRepository.findById(actorId);
    if (!actor) return;

    const input: CreateNotificationInput = {
      userId,
      type: "follow",
      actorId,
      message: `${actor.username} started following you`,
    };

    return notificationRepository.create(input);
  },

  async getNotifications(userId: string, options?: { limit?: number; page?: number }) {
    return notificationRepository.findByUserId(userId, options);
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId);
  },

  async markAsRead(notificationId: string, userId: string) {
    await notificationRepository.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  },

  async deleteNotification(notificationId: string, userId: string) {
    await notificationRepository.deleteNotification(notificationId, userId);
  },
};