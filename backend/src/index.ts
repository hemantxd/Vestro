import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const start = async () => {
  try {
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

start();