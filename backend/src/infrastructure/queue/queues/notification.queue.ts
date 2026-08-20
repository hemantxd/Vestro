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

export interface LikeNotificationJobData {
  userId: string;
  actorId: string;
  entityId: string;
  entityType: string;
}

export interface CommentNotificationJobData {
  userId: string;
  actorId: string;
  entityId: string;
  entityType: string;
  commentText?: string;
}

export async function enqueueFollowNotification(userId: string, actorId: string) {
  const jobData: FollowNotificationJobData = { userId, actorId };
  await notificationQueue.add("follow-notification", jobData);
}

export async function enqueueMentionNotification(userId: string, actorId: string, entityId?: string) {
  const jobData: MentionNotificationJobData = { userId, actorId, entityId };
  await notificationQueue.add("mention-notification", jobData);
}

export async function enqueueLikeNotification(
  userId: string,
  actorId: string,
  entityId: string,
  entityType = "post"
) {
  const jobData: LikeNotificationJobData = { userId, actorId, entityId, entityType };
  await notificationQueue.add("like-notification", jobData);
}

export async function enqueueCommentNotification(
  userId: string,
  actorId: string,
  entityId: string,
  entityType = "post",
  commentText?: string
) {
  const jobData: CommentNotificationJobData = { userId, actorId, entityId, entityType, commentText };
  await notificationQueue.add("comment-notification", jobData);
}
