// Dev-only smoke test for the COMMENT notification queue pipeline:
//   enqueueCommentNotification -> BullMQ "notifications" queue -> worker ->
//   notificationService.createCommentNotification
import "dotenv/config";
import { enqueueCommentNotification } from "../src/infrastructure/queue/queues/notification.queue.js";
import { notificationQueue } from "../src/infrastructure/queue/queues/notification.queue.js";
import { notificationWorker } from "../src/infrastructure/queue/workers/notification.worker.js";

async function main() {
  const userId = process.argv[2]?.trim();
  const actorId = process.argv[3]?.trim();
  const postId = process.argv[4]?.trim();
  const text = process.argv[5]?.trim() || "Nice post!";
  if (!userId || !actorId || !postId) {
    console.error("Usage: npm run notif:comment:test -- <userId> <actorId> <postId> [text]");
    process.exit(1);
  }

  console.log(`Enqueuing comment notification: actor ${actorId} commented on ${postId} of ${userId} ...`);

  await enqueueCommentNotification(userId, actorId, postId, "post", text);

  const jobPromise = new Promise<void>((resolve, reject) => {
    notificationWorker.on("completed", (job) => {
      if (job.name === "comment-notification") {
        console.log(`✅ Comment notification job ${job.id} completed.`);
        resolve();
      }
    });
    notificationWorker.on("failed", (job, err) => {
      if (job?.name === "comment-notification") reject(err);
    });
    setTimeout(() => reject(new Error("Timed out waiting for comment notification job")), 20000);
  });

  try {
    await jobPromise;
  } catch (err) {
    console.error("❌ Comment notification queue test failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await notificationQueue.close();
    await notificationWorker.close();
    process.exit();
  }
}

main();