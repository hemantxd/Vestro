import jwt from "jsonwebtoken";
import argon2 from "argon2";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";
import { userRepository } from "../users/user.repository.js";
import { AppError } from "../../common/errors/AppError.js";
import type { RegisterInput, LoginInput, AuthTokens } from "./auth.types.js";

let googleClient: OAuth2Client | null = null;
if (env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
}

async function generateUniqueUsername(base: string): Promise<string> {
  const exists = await authRepository.findUserByUsername(base);
  if (!exists) return base;

  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).substring(2, 6);
    const candidate = `${base}_${suffix}`;
    const taken = await authRepository.findUserByUsername(candidate);
    if (!taken) return candidate;
  }

  return `${base}_${Date.now().toString(36)}`;
}

export const authService = {
  async register(input: RegisterInput, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const { username, email, password, displayName } = input;

    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

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

    const tokens = await generateTokens(user.id, user.email!, user.username, ip, userAgent);
    return tokens;
  },

  async login(input: LoginInput, ip?: string, userAgent?: string): Promise<AuthTokens> {
    const { email, password } = input;

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = await generateTokens(user.id, user.email!, user.username, ip, userAgent);
    return tokens;
  },

  async googleLogin(idToken: string, ip?: string, userAgent?: string): Promise<AuthTokens> {
    if (!googleClient) {
      throw new AppError("Google authentication is not configured", 500);
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError("Invalid Google token", 401);
    }

    const googleId = payload.sub;
    const email = payload.email;
    const displayName = payload.name || email.split("@")[0];
    const avatar = payload.picture || null;

    // Check if user exists by Google provider ID
    let user = await authRepository.findUserByProvider("google", googleId);

    if (!user) {
      // Check if user exists by email (link accounts)
      user = await authRepository.findUserByEmail(email);

      if (user) {
        // Link Google account to existing local user
        user = await authRepository.linkGoogleAccount(user.id, googleId);
      } else {
        // Create new user with Google data
        const username = await generateUniqueUsername(
          email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
        );

        user = await authRepository.createOAuthUser({
          username,
          email,
          provider: "google",
          providerId: googleId,
          displayName,
          avatar,
        });
      }
    }

    const tokens = await generateTokens(user.id, user.email!, user.username, ip, userAgent);
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

    const user = await userRepository.findById(session.userId);
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
  if (!match) return 30 * 24 * 60 * 60 * 1000;

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