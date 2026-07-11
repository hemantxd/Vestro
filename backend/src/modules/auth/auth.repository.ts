import { db } from "../../db/index.js";
import { eq, and } from "drizzle-orm";
import { users } from "../../db/schema/users.js";
import { sessions } from "../../db/schema/sessions.js";

export const authRepository = {
  async findUserByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async findUserByUsername(username: string) {
    return db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  async findUserByProvider(provider: string, providerId: string) {
    return db.query.users.findFirst({
      where: and(
        eq(users.provider, provider),
        eq(users.providerId, providerId)
      ),
    });
  },

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    displayName?: string | null;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName || data.username,
        provider: "local",
      })
      .returning();
    return user;
  },

  async createOAuthUser(data: {
    username: string;
    email: string;
    provider: string;
    providerId: string;
    displayName?: string | null;
    avatar?: string | null;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        provider: data.provider,
        providerId: data.providerId,
        displayName: data.displayName || data.username,
        avatar: data.avatar || null,
        emailVerified: true,
      })
      .returning();
    return user;
  },

  async linkGoogleAccount(userId: string, googleId: string) {
    const [user] = await db
      .update(users)
      .set({ provider: "google", providerId: googleId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },

  async createSession(data: {
    userId: string;
    refreshToken: string;
    ip?: string | null;
    userAgent?: string | null;
    expiresAt: Date;
  }) {
    const [session] = await db
      .insert(sessions)
      .values({
        userId: data.userId,
        refreshToken: data.refreshToken,
        ip: data.ip || null,
        userAgent: data.userAgent || null,
        expiresAt: data.expiresAt,
      })
      .returning();
    return session;
  },

  async findSessionByRefreshToken(refreshToken: string) {
    return db.query.sessions.findFirst({
      where: eq(sessions.refreshToken, refreshToken),
    });
  },

  async deleteSession(id: string) {
    await db.delete(sessions).where(eq(sessions.id, id));
  },

  async deleteUserSessions(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  },
};