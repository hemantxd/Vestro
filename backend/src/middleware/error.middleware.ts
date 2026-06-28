import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors/AppError.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message }, "Operational error");
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  logger.error({ err }, "Unexpected error");

  res.status(500).json({
    status: "error",
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};