import { Worker, Job } from "bullmq";
import { bullmqConnection } from "../bullmq.js";
import { notificationService } from "../../../modules/notifications/notification.service.js";
import { logger } from "../../../config/logger.js";
import type { FollowNotificationJobData, MentionNotificationJobData, LikeNotificationJobData, CommentNotificationJobData } from "../queues/notification.queue.js";

export const notificationWorker = new Worker(
  "notifications",
  async (job: Job) => {
    switch (job.name) {
      case "follow-notification": {
        const { userId, actorId } = job.data as FollowNotificationJobData;
        // Reuse the existing notification business logic
        await notificationService.createFollowNotification(userId, actorId);
        break;
      }
      case "mention-notification": {
        const { userId, actorId, entityId } = job.data as MentionNotificationJobData;
        await notificationService.createMentionNotification(userId, actorId, entityId);
        break;
      }
      case "like-notification": {
        const { userId, actorId, entityId, entityType } = job.data as LikeNotificationJobData;
        await notificationService.createLikeNotification(userId, actorId, entityId, entityType);
        break;
      }
      case "comment-notification": {
        const { userId, actorId, entityId, entityType, commentText } = job.data as CommentNotificationJobData;
        await notificationService.createCommentNotification(userId, actorId, entityId, entityType, commentText);
        break;
      }
      default:
        logger.warn({ jobName: job.name }, "Unknown notification job type");
    }
  },
  {
    connection: bullmqConnection,
  }
);

notificationWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, "Notification job completed");
});

notificationWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, jobName: job?.name, err }, "Notification job failed");
});