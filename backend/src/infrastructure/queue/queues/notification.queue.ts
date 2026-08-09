import { Queue } from "bullmq";
import { bullmqConnection } from "../bullmq.js";

export const notificationQueue = new Queue("notifications", {
  connection: bullmqConnection,
});

export interface FollowNotificationJobData {
  userId: string;
  actorId: string;
}

export interface MentionNotificationJobData {
  userId: string;
  actorId: string;
  entityId?: string;
}

export async function enqueueFollowNotification(userId: string, actorId: string) {
  const jobData: FollowNotificationJobData = { userId, actorId };
  await notificationQueue.add("follow-notification", jobData);
}

export async function enqueueMentionNotification(userId: string, actorId: string, entityId?: string) {
  const jobData: MentionNotificationJobData = { userId, actorId, entityId };
  await notificationQueue.add("mention-notification", jobData);
}
