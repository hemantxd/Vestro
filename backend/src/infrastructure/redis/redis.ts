import { Redis } from "ioredis";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

// Use the existing REDIS_URL from environment config
export const redisConnection = new Redis(env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

redisConnection.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});