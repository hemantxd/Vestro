import { db } from "../../db/index.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { likes } from "../../db/schema/likes.js";
import { commentLikes } from "../../db/schema/comment-likes.js";
import { users } from "../../db/schema/users.js";
import { posts } from "../../db/schema/posts.js";
import { comments } from "../../db/schema/comments.js";

export const likeRepository = {
  // === Post likes ===
  async findByUserAndPost(userId: string, postId: string) {
    return db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    });
  },

  async createPostLike(userId: string, postId: string) {
    const [like] = await db.insert(likes).values({ userId, postId }).returning();
    return like;
  },

  async deletePostLike(userId: string, postId: string) {
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

  async getUserLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const rows = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(and(eq(likes.userId, userId), inArray(likes.postId, postIds)));
    return new Set(rows.map((r) => r.postId));
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

  // === Comment likes ===
  async findByUserAndComment(userId: string, commentId: string) {
    return db.query.commentLikes.findFirst({
      where: and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)),
    });
  },

  async createCommentLike(userId: string, commentId: string) {
    const [like] = await db.insert(commentLikes).values({ userId, commentId }).returning();
    return like;
  },

  async deleteCommentLike(userId: string, commentId: string) {
    await db
      .delete(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));
  },

  async incrementCommentLikes(commentId: string) {
    await db
      .update(comments)
      .set({ likesCount: sql`${comments.likesCount} + 1` })
      .where(eq(comments.id, commentId));
  },

  async decrementCommentLikes(commentId: string) {
    await db
      .update(comments)
      .set({ likesCount: sql`GREATEST(${comments.likesCount} - 1, 0)` })
      .where(eq(comments.id, commentId));
  },
};