import jwt from "jsonwebtoken";
import argon2 from "argon2";
import crypto from "crypto";
import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";
import { userRepository } from "../users/user.repository.js";
import { AppError } from "../../common/errors/AppError.js";
import type { RegisterInput, LoginInput, AuthTokens } from "./auth.types.js";

export const authService = {
  async register(input: RegisterInput, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const { username, email, password, displayName } = input;

    // Check if email already exists
    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

    // Check if username already exists
    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
      throw new AppError("Username already taken", 409);
    }

    const passwordHash = await argon2.hash(password);

    const user = await authRepository.createUser({
      username,
      email,
      passwordHash,
      displayName: displayName || null,
    });

    const tokens = await generateTokens(user.id, user.email, user.username, ip, userAgent);
    return tokens;
  },

  async login(input: LoginInput, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const { email, password } = input;

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    if (!user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = await generateTokens(user.id, user.email, user.username, ip, userAgent);
    return tokens;
  },

  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (new Date() > session.expiresAt) {
      await authRepository.deleteSession(session.id);
      throw new AppError("Refresh token has expired", 401);
    }

    // Fetch the user to get username for the new token
    const user = await userRepository.findById(session.userId);

    // Delete old session (token rotation)
    await authRepository.deleteSession(session.id);

    const tokens = await generateTokens(
      session.userId,
      user?.email || "",
      user?.username || "",
      ip,
      userAgent
    );

    return tokens;
  },

  async logout(refreshToken: string): Promise<void> {
    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (session) {
      await authRepository.deleteSession(session.id);
    }
  },

  async logoutAllSessions(userId: string): Promise<void> {
    await authRepository.deleteUserSessions(userId);
  },
};

async function generateTokens(
  userId: string,
  email: string,
  username: string,
  ip?: string,
  userAgent?: string
): Promise<AuthTokens> {
  const accessToken = jwt.sign(
    { userId, email, username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  const expiresInMs = parseDuration(env.JWT_REFRESH_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + expiresInMs);

  await authRepository.createSession({
    userId,
    refreshToken,
    ip: ip || null,
    userAgent: userAgent || null,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000; // Default 30 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d": return value * 24 * 60 * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    case "s": return value * 1000;
    default: return 30 * 24 * 60 * 60 * 1000;
  }
}