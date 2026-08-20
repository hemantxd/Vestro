// Dev-only smoke test for the LIKE notification queue pipeline:
//   enqueueLikeNotification -> BullMQ "notifications" queue -> worker ->
//   notificationService.createLikeNotification
import "dotenv/config";
import { enqueueLikeNotification } from "../src/infrastructure/queue/queues/notification.queue.js";
import { notificationQueue } from "../src/infrastructure/queue/queues/notification.queue.js";
import { notificationWorker } from "../src/infrastructure/queue/workers/notification.worker.js";

async function main() {
  const userId = process.argv[2]?.trim();
  const actorId = process.argv[3]?.trim();
  const postId = process.argv[4]?.trim();
  if (!userId || !actorId || !postId) {
    console.error("Usage: npm run notif:like:test -- <userId> <actorId> <postId>");
    process.exit(1);
  }

  console.log(`Enqueuing like notification: actor ${actorId} liked post ${postId} of ${userId} ...`);

  await enqueueLikeNotification(userId, actorId, postId, "post");

  const jobPromise = new Promise<void>((resolve, reject) => {
    notificationWorker.on("completed", (job) => {
      if (job.name === "like-notification") {
        console.log(`✅ Like notification job ${job.id} completed.`);
        resolve();
      }
    });
    notificationWorker.on("failed", (job, err) => {
      if (job?.name === "like-notification") reject(err);
    });
    setTimeout(() => reject(new Error("Timed out waiting for like notification job")), 20000);
  });

  try {
    await jobPromise;
  } catch (err) {
    console.error("❌ Like notification queue test failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await notificationQueue.close();
    await notificationWorker.close();
    process.exit();
  }
}

main();