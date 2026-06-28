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
      })
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