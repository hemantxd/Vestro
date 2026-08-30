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
      // entityId = actorId so the unique dedup key is non-null (and the row
      // still dedupes on (recipient, follow, actor)).
      entityId: actorId,
      entityType: "user",
      message: `${actor.username} started following you`,
    };

    return notificationRepository.create(input);
  },

  async createMentionNotification(userId: string, actorId: string, entityId?: string) {
    const actor = await userRepository.findById(actorId);
    if (!actor) return;

    const input: CreateNotificationInput = {
      userId,
      type: "mention",
      actorId,
      entityId,
      entityType: "post",
      message: `${actor.username} mentioned you in a post`,
    };

    return notificationRepository.create(input);
  },

  async createLikeNotification(
    userId: string,
    actorId: string,
    entityId: string,
    entityType = "post"
  ) {
    // Never notify yourself when you like your own post.
    if (userId === actorId) return;

    const actor = await userRepository.findById(actorId);
    if (!actor) return;

    const input: CreateNotificationInput = {
      userId,
      type: "like",
      actorId,
      entityId,
      entityType,
      message: `${actor.username} liked your ${entityType}`,
    };

    return notificationRepository.create(input);
  },

  async createCommentNotification(
    userId: string,
    actorId: string,
    entityId: string,
    entityType = "post",
    commentText?: string
  ) {
    // Never notify yourself when you comment on your own post/comment.
    if (userId === actorId) return;

    const actor = await userRepository.findById(actorId);
    if (!actor) return;

    const isReply = entityType === "comment";
    const preview = commentText
      ? commentText.length > 60
        ? `${commentText.slice(0, 60)}…`
        : commentText
      : "";

    const input: CreateNotificationInput = {
      userId,
      type: "comment",
      actorId,
      entityId,
      entityType,
      message: isReply
        ? `${actor.username} replied to your comment`
        : preview
        ? `${actor.username} commented: "${preview}"`
        : `${actor.username} commented on your post`,
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