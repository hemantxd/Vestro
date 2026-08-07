import { redisConnection } from "./redis.js";

export const cacheService = {
  async get(key: string): Promise<string | null> {
    return redisConnection.get(key);
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await redisConnection.set(key, value, "EX", ttlSeconds);
    } else {
      await redisConnection.set(key, value);
    }
  },

  async del(key: string): Promise<void> {
    await redisConnection.del(key);
  },

  async delByPattern(pattern: string): Promise<void> {
    const keys = await redisConnection.keys(pattern);
    if (keys.length > 0) {
      await redisConnection.del(...keys);
    }
  },
};