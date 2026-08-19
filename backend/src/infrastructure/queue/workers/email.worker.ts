import { Worker, Job } from "bullmq";
import { bullmqConnection } from "../bullmq.js";
import { emailService } from "../../../lib/email.service.js";
import { logger } from "../../../config/logger.js";
import type { PasswordResetEmailJobData } from "../queues/email.queue.js";

export const emailWorker = new Worker(
  "emails",
  async (job: Job) => {
    switch (job.name) {
      case "password-reset-email": {
        const { email, otp } = job.data as PasswordResetEmailJobData;
        await emailService.sendPasswordResetOtp(email, otp);
        break;
      }
      default:
        logger.warn({ jobName: job.name }, "Unknown email job type");
    }
  },
  {
    connection: bullmqConnection,
  }
);

emailWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, "Email job completed");
});

emailWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, jobName: job?.name, err }, "Email job failed");
});