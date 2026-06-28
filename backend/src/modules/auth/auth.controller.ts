import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const userAgent = req.headers["user-agent"];
      const tokens = await authService.register(req.body, ip, userAgent);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/api/v1/auth/refresh",
      });

      res.status(201).json({
        status: "success",
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const userAgent = req.headers["user-agent"];
      const tokens = await authService.login(req.body, ip, userAgent);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/api/v1/auth/refresh",
      });

      res.status(200).json({
        status: "success",
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          status: "error",
          message: "Refresh token is required",
        });
        return;
      }

      const ip = req.ip;
      const userAgent = req.headers["user-agent"];
      const tokens = await authService.refreshTokens(refreshToken, ip, userAgent);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
      });

      res.status(200).json({
        status: "success",
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/v1/auth/refresh",
      });

      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      await authService.logoutAllSessions(req.user.userId);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/v1/auth/refresh",
      });

      res.status(200).json({
        status: "success",
        message: "Logged out from all sessions",
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  },
};