import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthPayload } from "../common/types/index.js";
import { AppError } from "../common/errors/AppError.js";
import { env } from "../config/env.js";

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Access token is required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token has expired", 401);
    }
    throw new AppError("Invalid access token", 401);
  }
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
};