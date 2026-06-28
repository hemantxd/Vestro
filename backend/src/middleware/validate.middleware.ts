import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../common/errors/AppError.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
      throw new AppError(messages.join("; "), 400);
    }
    req.body = result.data;
    next();
  };
};