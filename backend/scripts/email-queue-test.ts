// Dev-only end-to-end smoke test for the EMAIL QUEUE pipeline:
//   enqueuePasswordResetEmail -> BullMQ "emails" queue -> email worker -> Resend
// Usage: RESEND_API_KEY=... npm run email:queue:test -- delivered@resend.dev
import "dotenv/config";
import { enqueuePasswordResetEmail } from "../src/infrastructure/queue/queues/email.queue.js";
import { emailQueue } from "../src/infrastructure/queue/queues/email.queue.js";
import { emailWorker } from "../src/infrastructure/queue/workers/email.worker.js";
import { env } from "../src/config/env.js";

async function main() {
  const to = process.argv[2]?.trim();
  if (!to) {
    console.error("Usage: npm run email:queue:test -- <recipient@example.com>");
    process.exit(1);
  }
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    process.exit(1);
  }

  const dummyOtp = "777111";
  console.log(`Enqueuing password-reset email to ${to} ...`);

  await enqueuePasswordResetEmail(to, dummyOtp);

  // Wait for the worker to pick up and process the job.
  const jobPromise = new Promise<void>((resolve, reject) => {
    emailWorker.on("completed", (job) => {
      if (job.name === "password-reset-email") {
        console.log(`✅ Email job ${job.id} completed (sent via queue).`);
        resolve();
      }
    });
    emailWorker.on("failed", (job, err) => {
      if (job?.name === "password-reset-email") {
        reject(err);
      }
    });
    setTimeout(() => reject(new Error("Timed out waiting for email job")), 20000);
  });

  try {
    await jobPromise;
  } catch (err) {
    console.error("❌ Queue email test failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await emailQueue.close();
    await emailWorker.close();
    process.exit();
  }
}

main();