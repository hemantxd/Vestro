import { db } from "../../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { comments } from "../../db/schema/comments.js";
import { users } from "../../db/schema/users.js";
import { posts } from "../../db/schema/posts.js";

export const commentRepository = {
  async create(data: { postId: string; authorId: string; text: string }) {
    const [comment] = await db
      .insert(comments)
      .values(data)
      .returning();
    return comment;
  },

  async findByPostId(postId: string) {
    return db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: comments.text,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  },

  async findById(id: string) {
    return db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  },

  async delete(id: string) {
    await db
      .delete(comments)
      .where(eq(comments.id, id));
  },

  async getCountByPostId(postId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(eq(comments.postId, postId));
    return result.count;
  },

  async syncCommentsCount(postId: string) {
    const count = await this.getCountByPostId(postId);
    await db
      .update(posts)
      .set({ commentsCount: count })
      .where(eq(posts.id, postId));
  },
};