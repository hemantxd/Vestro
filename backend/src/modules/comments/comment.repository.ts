import { db } from "../../db/index.js";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { comments } from "../../db/schema/comments.js";
import { users } from "../../db/schema/users.js";
import { posts } from "../../db/schema/posts.js";
import { commentLikes } from "../../db/schema/comment-likes.js";

export const commentRepository = {
  async create(data: { postId: string; authorId: string; text: string; parentId?: string | null }) {
    const [comment] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        authorId: data.authorId,
        text: data.text,
        parentId: data.parentId || null,
      })
      .returning();
    return comment;
  },

  async findByPostId(postId: string, currentUserId?: string) {
    const rows = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        parentId: comments.parentId,
        text: comments.text,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    // If user is authenticated, check which comments they liked
    if (currentUserId && rows.length > 0) {
      const commentIds = rows.map((r) => r.id);
      const likedRows = await db
        .select({ commentId: commentLikes.commentId })
        .from(commentLikes)
        .where(
          and(
            eq(commentLikes.userId, currentUserId),
            inArray(commentLikes.commentId, commentIds)
          )
        );
      const likedSet = new Set(likedRows.map((r) => r.commentId));

      const enriched = rows.map((r) => ({
        ...r,
        isLiked: likedSet.has(r.id),
      }));

      // Build nested structure: top-level comments with replies
      const topLevel = enriched.filter((r) => !r.parentId);
      const replyMap = new Map<string, typeof enriched>();
      for (const r of enriched) {
        if (r.parentId) {
          const existing = replyMap.get(r.parentId) || [];
          existing.push(r);
          replyMap.set(r.parentId, existing);
        }
      }

      return topLevel.map((comment) => ({
        ...comment,
        replies: replyMap.get(comment.id) || [],
      }));
    }

    // Without auth, just return flat structure grouped
    const topLevel = rows.filter((r) => !r.parentId);
    const replyMap = new Map<string, typeof rows>();
    for (const r of rows) {
      if (r.parentId) {
        const existing = replyMap.get(r.parentId) || [];
        existing.push(r);
        replyMap.set(r.parentId, existing);
      }
    }

    return topLevel.map((comment) => ({
      ...comment,
      isLiked: false,
      replies: replyMap.get(comment.id) || [],
    }));
  },

  async findById(id: string) {
    return db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  },

  async delete(id: string) {
    // Delete replies first, then the comment
    await db.delete(comments).where(eq(comments.parentId, id));
    await db.delete(comments).where(eq(comments.id, id));
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