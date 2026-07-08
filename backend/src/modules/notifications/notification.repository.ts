import { db } from "../../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifications } from "../../db/schema/notifications.js";
import { users } from "../../db/schema/users.js";
import type { CreateNotificationInput } from "./notification.types.js";

export const notificationRepository = {
  async create(input: CreateNotificationInput) {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        actorId: input.actorId,
        entityId: input.entityId || null,
        entityType: input.entityType || null,
        message: input.message || null,
      })
      .returning();
    return notification;
  },

  async findByUserId(userId: string, options?: { limit?: number; page?: number }) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    return db
      .select({
        id: notifications.id,
        type: notifications.type,
        actorId: notifications.actorId,
        actorUsername: users.username,
        actorDisplayName: users.displayName,
        actorAvatar: users.avatar,
        entityId: notifications.entityId,
        entityType: notifications.entityType,
        message: notifications.message,
        read: notifications.read,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result.count;
  },

  async markAsRead(notificationId: string, userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  },

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  },

  async deleteNotification(notificationId: string, userId: string) {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  },
};