import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createChatWebSocketServer } from "./websocket/chat.websocket.js";
import "./infrastructure/queue/workers/notification.worker.js";
import "./infrastructure/queue/workers/email.worker.js";

const start = async () => {
  try {
    const server = http.createServer(app);
    // Attach realtime chat WebSocket (path: /ws).
    createChatWebSocketServer(server);

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

start();