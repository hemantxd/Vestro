import { db } from "../../db/index.js";
import { eq, or, ilike, inArray } from "drizzle-orm";
import { users } from "../../db/schema/users.js";
import type { UpdateProfileInput } from "./user.types.js";

export const userRepository = {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async findByUsername(username: string) {
    return db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  async findByUsernames(usernames: string[]) {
    if (usernames.length === 0) return [];
    return db.query.users.findMany({
      where: inArray(users.username, usernames),
      columns: { id: true, username: true },
    });
  },

  async getAvatarUrl(id: string): Promise<string | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { avatar: true },
    });
    return user?.avatar || null;
  },

  async updateUser(id: string, data: UpdateProfileInput) {
    const [user] = await db
      .update(users)
      .set(data as any)
      .where(eq(users.id, id))
      .returning();

    return user;
  },

  async updateAvatar(id: string, avatarUrl: string | null) {
    const [user] = await db
      .update(users)
      .set({ avatar: avatarUrl })
      .where(eq(users.id, id))
      .returning();

    return user;
  },

  async searchUsers(
    query: string,
    options?: { limit?: number; page?: number }
  ) {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const searchPattern = `%${query}%`;

    const results = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, searchPattern),
          ilike(users.displayName, searchPattern),
          ilike(users.email, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset);

    return results;
  },
};