import { AppError } from "../../common/errors/AppError.js";
import { postRepository } from "./post.repository.js";
import { followRepository } from "../follows/follow.repository.js";
import { likeRepository } from "../likes/like.repository.js";
import { userRepository } from "../users/user.repository.js";
import { enqueueMentionNotification } from "../../infrastructure/queue/queues/notification.queue.js";
import type { CreatePostInput } from "./post.types.js";

const MAX_TICKERS = 5;
const CURRENCY_SYMBOLS_REGEX = /[$₹¥€£₩₺₽₫₱₿]/g;
const SUPPORTED_CURRENCIES = new Set([
  "USD",
  "INR",
  "JPY",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "CHF",
  "CNY",
  "KRW",
  "HKD",
]);

// Tickers are plain symbols — currency symbols ("$", "₹", "¥", ...) are
// stripped so "$AAPL" becomes "AAPL". Returns unique, uppercased tickers.
function normalizeTickers(tickers?: string[]): string[] {
  if (!tickers || tickers.length === 0) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of tickers) {
    const cleaned = (raw || "")
      .replace(CURRENCY_SYMBOLS_REGEX, "")
      .replace(/[\s,;]+/g, "")
      .toUpperCase()
      .slice(0, 20);

    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      normalized.push(cleaned);
    }
    if (normalized.length >= MAX_TICKERS) break;
  }

  return normalized;
}

// Currency is stored separately from tickers and defaults to "USD".
function normalizeCurrency(currency?: string): string {
  const cleaned = (currency || "")
    .replace(CURRENCY_SYMBOLS_REGEX, "")
    .trim()
    .toUpperCase()
    .slice(0, 10);
  return SUPPORTED_CURRENCIES.has(cleaned) ? cleaned : "USD";
}

async function attachIsLiked(posts: any[], userId?: string) {
  if (!userId || posts.length === 0) return posts;

  const postIds = posts.map((p: any) => p.id);
  const rows = await likeRepository.getUserLikedPostIds(userId, postIds);

  return posts.map((post: any) => ({
    ...post,
    isLiked: rows.has(post.id),
  }));
}

// Attach each post's list of tickers (ordered as they were added).
async function attachTickers<T extends { id: string }>(posts: T[]): Promise<T[]> {
  if (posts.length === 0) return posts;

  const rows = await postRepository.getTickersForPosts(posts.map((p) => p.id));
  const tickersByPost = new Map<string, string[]>();
  for (const row of rows) {
    const list = tickersByPost.get(row.postId) ?? [];
    list.push(row.ticker);
    tickersByPost.set(row.postId, list);
  }

  return posts.map((post) => ({
    ...post,
    tickers: tickersByPost.get(post.id) ?? [],
  }));
}

// Extract unique @username mentions from post text (e.g. "@elonmusk")
function extractMentionedUsernames(text: string): string[] {
  const regex = /@([a-zA-Z0-9_]{1,30})/g;
  const usernames = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    usernames.add(match[1]);
  }
  return [...usernames];
}

async function notifyMentionedUsers(text: string, actorId: string, postId: string) {
  const mentionedUsernames = extractMentionedUsernames(text);
  if (mentionedUsernames.length === 0) return;

  const mentionedUsers = await userRepository.findByUsernames(mentionedUsernames);

  // Notify each mentioned user (except the author themselves)
  await Promise.all(
    mentionedUsers
      .filter((u) => u.id !== actorId)
      .map((u) => enqueueMentionNotification(u.id, actorId, postId))
  );
}

export const postService = {
  async getTrendingTickers(limit = 8) {
    return postRepository.getTrendingTickers(limit);
  },

  async createPost(authorId: string, input: CreatePostInput, mediaUrls?: { url: string; type: "image" | "video" }[]) {
    const tickers = normalizeTickers(input.tickers);
    const currency = normalizeCurrency(input.currency);
    const hasMedia = mediaUrls && mediaUrls.length > 0;
    let mediaType: string | null = null;

    if (hasMedia) {
      const allVideo = mediaUrls!.every((m) => m.type === "video");
      const allImage = mediaUrls!.every((m) => m.type === "image");
      mediaType = allVideo ? "video" : allImage ? "image" : "mixed";
    }

    const post = await postRepository.create({
      authorId,
      text: input.text || null,
      currency,
      hasMedia: !!hasMedia,
      mediaType,
    });

    if (tickers.length > 0) {
      await postRepository.addTickers(post.id, tickers);
    }

    if (hasMedia) {
      await postRepository.addMedia(
        mediaUrls!.map((m, i) => ({
          postId: post.id,
          url: m.url,
          type: m.type,
          orderIndex: i,
        }))
      );
    }

    await postRepository.incrementPostsCount(authorId);

    // Fire-and-forget: notify mentioned users (async, non-blocking)
    if (input.text) {
      await notifyMentionedUsers(input.text, authorId, post.id);
    }

    return this.getPostById(post.id, authorId);
  },

  async getPostById(postId: string, currentUserId?: string) {
    const post = await postRepository.getPostWithAuthor(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const media = await postRepository.getMediaForPost(postId);
    const enriched = await attachIsLiked([post], currentUserId);
    const [withTickers] = await attachTickers(enriched);

    return {
      ...withTickers,
      media,
    };
  },

  async getFeed(userId: string, options?: { limit?: number; page?: number }) {
    const following = await followRepository.getFollowing(userId, { limit: 1000 });
    const followingIds = following.map((f: any) => f.id);
    const userIds = [...followingIds, userId];

    const feed = await postRepository.getFeed(userIds, options);

    const postsWithMedia = await Promise.all(
      feed.map(async (post) => ({
        ...post,
        media: await postRepository.getMediaForPost(post.id),
      }))
    );

    const withTickers = await attachTickers(postsWithMedia);
    return attachIsLiked(withTickers, userId);
  },

  async getUserPosts(authorId: string, currentUserId?: string, options?: { limit?: number; page?: number }) {
    const userPosts = await postRepository.getUserPosts(authorId, options);

    const postsWithMedia = await Promise.all(
      userPosts.map(async (post) => ({
        ...post,
        media: await postRepository.getMediaForPost(post.id),
      }))
    );

    const withTickers = await attachTickers(postsWithMedia);
    return attachIsLiked(withTickers, currentUserId);
  },

  async getPostsByTicker(ticker: string, currentUserId?: string, options?: { limit?: number; page?: number }) {
    const tickerPosts = await postRepository.getPostsByTicker(ticker, options);

    const postsWithMedia = await Promise.all(
      tickerPosts.map(async (post) => ({
        ...post,
        media: await postRepository.getMediaForPost(post.id),
      }))
    );

    const withTickers = await attachTickers(postsWithMedia);
    return attachIsLiked(withTickers, currentUserId);
  },

  async deletePost(postId: string, userId: string) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    if (post.authorId !== userId) {
      throw new AppError("You can only delete your own posts", 403);
    }

    await postRepository.deletePost(postId, userId);
    await postRepository.decrementPostsCount(userId);
  },
};