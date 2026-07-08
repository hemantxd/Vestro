export interface CreateNotificationInput {
  userId: string;
  type: "follow" | "like" | "comment" | "mention" | "message";
  actorId: string;
  entityId?: string;
  entityType?: string;
  message?: string;
}

export interface NotificationResponse {
  id: string;
  type: string;
  actorId: string;
  actorUsername: string;
  actorDisplayName: string | null;
  actorAvatar: string | null;
  entityId: string | null;
  entityType: string | null;
  message: string | null;
  read: boolean;
  createdAt: Date;
}