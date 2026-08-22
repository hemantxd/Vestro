import { apiRequest } from "./client";
import type { AppNotification } from "@/types/notification";

export interface UnreadCountResult {
  unreadCount: number;
}

export const notificationApi = {
  async getNotifications(limit = 20, page = 1): Promise<AppNotification[]> {
    const res = await apiRequest<{ status: string; data: AppNotification[] }>(
      `/notifications?limit=${limit}&page=${page}`
    );
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiRequest<{ status: string; data: UnreadCountResult }>(
      "/notifications/unread-count"
    );
    return res.data.unreadCount;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiRequest<{ status: string; message: string }>(
      `/notifications/${notificationId}/read`,
      { method: "PATCH" }
    );
  },

  async markAllAsRead(): Promise<void> {
    await apiRequest<{ status: string; message: string }>("/notifications/read-all", {
      method: "PATCH",
    });
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiRequest<{ status: string; message: string }>(
      `/notifications/${notificationId}`,
      { method: "DELETE" }
    );
  },
};