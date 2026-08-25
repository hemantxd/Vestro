import { db } from "../../db/index.js";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { posts, postMedia, postTickers } from "../../db/schema/posts.js";
import { users } from "../../db/schema/users.js";

export const postRepository = {
  // Most-used tickers across all posts (for the "Trending" chips).
  async getTrendingTickers(limit: number) {
    return db
      .select({
        ticker: postTickers.ticker,
        count: sql<number>`count(*)::int`,
      })
      .from(postTickers)
      .groupBy(postTickers.ticker)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);
  },

  async create(data: {
    authorId: string;
    text?: string | null;
    currency?: string | null;
    hasMedia: boolean;
    mediaType?: string | null;
  }) {
    const [post] = await db
      .insert(posts)
      .values({
        authorId: data.authorId,
        text: data.text || null,
        currency: data.currency || "USD",
        hasMedia: data.hasMedia,
        mediaType: data.mediaType || null,
      })
      .returning();
    return post;
  },

  async addTickers(postId: string, tickers: string[]) {
    if (tickers.length === 0) return;
    await db.insert(postTickers).values(
      tickers.map((ticker, index) => ({
        postId,
        ticker,
        orderIndex: index,
      }))
    );
  },

  async getTickersForPosts(postIds: string[]) {
    if (postIds.length === 0) return [];
    return db
      .select({
        postId: postTickers.postId,
        ticker: postTickers.ticker,
        orderIndex: postTickers.orderIndex,
      })
      .from(postTickers)
      .where(inArray(postTickers.postId, postIds))
      .orderBy(postTickers.orderIndex);
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
        currency: posts.currency,
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
        currency: posts.currency,
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
        currency: posts.currency,
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

  async getPostsByTicker(
    ticker: string,
    options?: { limit?: number; page?: number }
  ) {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    // Find post ids tagged with the ticker, then page over the posts.
    const postIds = db
      .select({ id: postTickers.postId })
      .from(postTickers)
      .where(eq(postTickers.ticker, ticker.toUpperCase()));

    const results = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: posts.text,
        currency: posts.currency,
        hasMedia: posts.hasMedia,
        mediaType: posts.mediaType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(inArray(posts.id, postIds))
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