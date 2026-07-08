import { db } from "../../db/index.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { follows } from "../../db/schema/follows.js";
import { users } from "../../db/schema/users.js";

export const followRepository = {
  async findFollow(followerId: string, followingId: string) {
    return db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ),
    });
  },

  async createFollow(followerId: string, followingId: string) {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  },

  async deleteFollow(followerId: string, followingId: string) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  },

  async getFollowers(userId: string, options?: { limit?: number; page?: number }) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        bio: users.bio,
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .orderBy(sql`${follows.createdAt} DESC`)
      .limit(limit)
      .offset(offset);
  },

  async getFollowing(userId: string, options?: { limit?: number; page?: number }) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        bio: users.bio,
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .orderBy(sql`${follows.createdAt} DESC`)
      .limit(limit)
      .offset(offset);
  },

  // Bulk check: returns a Set of user IDs that currentUserId follows
  async getFollowingIds(currentUserId: string, targetIds: string[]): Promise<Set<string>> {
    if (targetIds.length === 0) return new Set();

    const rows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, currentUserId),
          inArray(follows.followingId, targetIds)
        )
      );

    return new Set(rows.map((r) => r.followingId));
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return row.count > 0;
  },

  // Atomic count updates using SQL
  async incrementFollowersCount(userId: string) {
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, userId));
  },

  async decrementFollowersCount(userId: string) {
    await db
      .update(users)
      .set({
        followersCount: sql`GREATEST(${users.followersCount} - 1, 0)`,
      })
      .where(eq(users.id, userId));
  },

  async incrementFollowingCount(userId: string) {
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, userId));
  },

  async decrementFollowingCount(userId: string) {
    await db
      .update(users)
      .set({
        followingCount: sql`GREATEST(${users.followingCount} - 1, 0)`,
      })
      .where(eq(users.id, userId));
  },
};