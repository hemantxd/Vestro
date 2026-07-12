import { db } from "../../db/index.js";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { posts, postMedia } from "../../db/schema/posts.js";
import { users } from "../../db/schema/users.js";

export const postRepository = {
  async create(data: {
    authorId: string;
    text?: string | null;
    hasMedia: boolean;
    mediaType?: string | null;
  }) {
    const [post] = await db
      .insert(posts)
      .values({
        authorId: data.authorId,
        text: data.text || null,
        hasMedia: data.hasMedia,
        mediaType: data.mediaType || null,
      })
      .returning();
    return post;
  },

  async addMedia(mediaItems: {
    postId: string;
    url: string;
    type: "image" | "video";
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    thumbnail?: string | null;
    orderIndex: number;
  }[]) {
    if (mediaItems.length === 0) return [];
    return db.insert(postMedia).values(mediaItems as any).returning();
  },

  async findById(id: string) {
    return db.query.posts.findFirst({
      where: eq(posts.id, id),
    });
  },

  async getPostWithAuthor(postId: string) {
    const [result] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: posts.text,
        hasMedia: posts.hasMedia,
        mediaType: posts.mediaType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, postId));

    return result || null;
  },

  async getMediaForPost(postId: string) {
    return db
      .select()
      .from(postMedia)
      .where(eq(postMedia.postId, postId))
      .orderBy(postMedia.orderIndex);
  },

  async getFeed(
    userIds: string[],
    options?: { limit?: number; page?: number }
  ) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: posts.text,
        hasMedia: posts.hasMedia,
        mediaType: posts.mediaType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(inArray(posts.authorId, userIds))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  },

  async getUserPosts(
    authorId: string,
    options?: { limit?: number; page?: number }
  ) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: posts.text,
        hasMedia: posts.hasMedia,
        mediaType: posts.mediaType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  },

  async deletePost(postId: string, authorId: string) {
    await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)));
  },

  async incrementLikesCount(postId: string) {
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
  },

  async decrementLikesCount(postId: string) {
    await db
      .update(posts)
      .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  },

  async incrementCommentsCount(postId: string) {
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));
  },

  async decrementCommentsCount(postId: string) {
    await db
      .update(posts)
      .set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  },

  async incrementPostsCount(userId: string) {
    await db
      .update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, userId));
  },

  async decrementPostsCount(userId: string) {
    await db
      .update(users)
      .set({ postsCount: sql`GREATEST(${users.postsCount} - 1, 0)` })
      .where(eq(users.id, userId));
  },
};