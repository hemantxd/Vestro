import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // Disable all rate limiting in local dev/test unless explicitly enabled:
  // RATE_LIMIT_ENABLED=0 (default in development/test). Set to 1 in production.
  // Any value other than "0" enables limiting (covers "1", "true", etc.).
  RATE_LIMIT_ENABLED: z
    .string()
    .optional()
    .transform((v) => (v === "0" ? 0 : 1) as 0 | 1),

  REDIS_URL: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  RESEND_API_KEY: z.string().optional(),
  // Resend sender. Development uses Resend's shared sender (no custom domain
  // or DNS verification needed). Format: "Name <email>".
  EMAIL_FROM: z.string().default("Vestro <onboarding@resend.dev>"),

  GOOGLE_CLIENT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;