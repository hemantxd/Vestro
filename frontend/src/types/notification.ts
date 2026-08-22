export type NotificationType = "follow" | "like" | "comment" | "mention" | "message";

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorUsername: string;
  actorDisplayName: string | null;
  actorAvatar: string | null;
  entityId: string | null;
  entityType: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
}