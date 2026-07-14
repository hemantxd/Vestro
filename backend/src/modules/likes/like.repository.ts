import { db } from "../../db/index.js";
import { eq, and, sql } from "drizzle-orm";
import { likes } from "../../db/schema/likes.js";
import { users } from "../../db/schema/users.js";
import { posts } from "../../db/schema/posts.js";

export const likeRepository = {
  async findByUserAndPost(userId: string, postId: string) {
    return db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    });
  },

  async create(userId: string, postId: string) {
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    return like;
  },

  async delete(userId: string, postId: string) {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  },

  async getLikers(postId: string) {
    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
      })
      .from(likes)
      .innerJoin(users, eq(likes.userId, users.id))
      .where(eq(likes.postId, postId))
      .orderBy(sql`${likes.createdAt} DESC`);
  },

  async getLikeCount(postId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(likes)
      .where(eq(likes.postId, postId));
    return result.count;
  },

  async incrementPostLikes(postId: string) {
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
  },

  async decrementPostLikes(postId: string) {
    await db
      .update(posts)
      .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  },
};