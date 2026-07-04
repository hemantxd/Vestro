import { db } from "../../db/index.js";
import { eq, or, ilike } from "drizzle-orm";
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

  async getAvatarUrl(id: string): Promise<string | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { avatar: true },
    });
    return user?.avatar || null;
  },

  async updateUser(id: string, data: UpdateProfileInput & { avatar?: string }) {
    const [user] = await db
      .update(users)
      .set(data)
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