import { Worker, Job } from "bullmq";
import { bullmqConnection } from "../bullmq.js";
import { notificationService } from "../../../modules/notifications/notification.service.js";
import { logger } from "../../../config/logger.js";
import type { FollowNotificationJobData } from "../queues/notification.queue.js";

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