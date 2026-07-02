import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
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

  async updateUser(id: string, data: UpdateProfileInput) {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return user;
  },

  async searchUsers(query: string, limit: number = 10) {
    return db.query.users.findMany({
      where: (users, { ilike }) => ilike(users.username, `%${query}%`),
      limit,
    });
  },
};