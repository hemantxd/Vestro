import { Queue } from "bullmq";
import { bullmqConnection } from "../bullmq.js";

export const emailQueue = new Queue("emails", {
  connection: bullmqConnection,
});

export interface PasswordResetEmailJobData {
  email: string;
  otp: string;
}

// Enqueue a password-reset OTP email for async delivery by the email worker.
// This is fire-and-forget — the request handler does not wait for the send.
export async function enqueuePasswordResetEmail(email: string, otp: string) {
  const jobData: PasswordResetEmailJobData = { email, otp };
  await emailQueue.add("password-reset-email", jobData);
}