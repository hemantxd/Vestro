import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(hpp());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1", apiRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;