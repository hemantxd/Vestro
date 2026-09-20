import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { Store } from "express-rate-limit";
import { redisConnection } from "../infrastructure/redis/redis.js";
import { env } from "../config/env.js";

/**
 * Rate limiting for the Vestro API.
 *
 * Uses a Redis-backed store so counters are shared across all server
 * instances (correct on Render multi-instance + horizontal scaling).
 * Falls back to the default in-memory store when Redis is not configured.
 *
 * Conventions:
 * - Successful 4xx/5xx responses do not count (skipFailedRequests).
 * - Uses the standard `RateLimit-*` headers and a JSON 429 body matching
 *   the AppError shape: { status: "error", message }.
 * - `disabledInDev` lets every limiter be skipped in development/test so
 *   local testing is never throttled (RATE_LIMIT_ENABLED=0).
 */

// Redis is optional in env; when missing we fall back to memory.
// IMPORTANT: express-rate-limit forbids sharing one Store instance across
// multiple limiters (ERR_ERL_STORE_REUSE), so each limiter gets its own
// RedisStore instance — with a unique `prefix` so keys never collide.
// They all reuse the same ioredis connection.
function buildStore(prefix: string): Store | undefined {
  if (!env.REDIS_URL) return undefined;
  return new RedisStore({
    // ioredis client shared with the BullMQ queues.
    // (`as any` — ioredis `.call()` returns Promise<unknown> and the store
    // types are stricter than the actual runtime usage.)
    sendCommand: ((...args: string[]) => redisConnection.call(...(args as [string]))) as any,
    prefix: `rl:${prefix}:`,
  });
}

const skipByEnv = () => env.RATE_LIMIT_ENABLED === 0;

function base(windowMs: number, max: number, options: { storePrefix: string; message: string }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    // Env-gated: skip all limiting in dev/test unless explicitly enabled.
    skip: () => skipByEnv(),
    store: buildStore(options.storePrefix),
    keyGenerator: (req, res) => {
      // Prefer the authenticated user id when available; fall back to IP.
      // Uses the library's IPv6-safe helper for the IP portion so IPv6
      // clients can't bypass limits.
      const userId = (req as { user?: { userId?: string } }).user?.userId;
      const ip = ipKeyGenerator(req.ip ?? "");
      return `${options.storePrefix}:${userId ?? ip}`;
    },
    message: {
      status: "error",
      message: options.message,
    },
  });
}

/** Global safety net: blanket cap on all /api/v1 traffic per IP. */
export const apiLimiter = base(15 * 60 * 1000, 900, {
  storePrefix: "api",
  message: "Too many requests. Please try again later.",
});

/** Auth endpoints (login/register/refresh) — 5 attempts per 15 min. */
export const authLimiter = base(15 * 60 * 1000, 5, {
  storePrefix: "auth",
  message: "Too many attempts. Please try again in 15 minutes.",
});

/**
 * Strictest: forgot/reset password — prevents OTP email bombing
 * (forgot) and OTP guessing (reset).
 */
export const authLimiterStrict = base(60 * 60 * 1000, 3, {
  storePrefix: "auth-strict",
  message: "Too many password-reset attempts. Please try again later.",
});

/** Write-heavy mutations (posts, chats, follows, likes, comments). */
export const writeLimiter = base(15 * 60 * 1000, 100, {
  storePrefix: "write",
  message: "Too many requests. Please slow down.",
});

/** Read-heavy endpoints (feeds, search, notifications). */
export const readLimiter = base(60 * 1000, 60, {
  storePrefix: "read",
  message: "Too many requests. Please try again shortly.",
});

/** Uploads (profile pictures, post media) — expensive, so strictest. */
export const uploadLimiter = base(60 * 60 * 1000, 20, {
  storePrefix: "upload",
  message: "Upload limit reached. Please try again later.",
});
