export type PostMediaType = "image" | "video";

export interface PostMedia {
  id: string;
  url: string;
  type: PostMediaType;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnail: string | null;
  orderIndex: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  text: string | null;
  tickers: string[];
  currency: string;
  hasMedia: boolean;
  mediaType: string | null;
  media: PostMedia[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CreatePostInput {
  text?: string;
  tickers?: string[];
  currency?: string;
  media?: File[];
}

export interface TrendingTicker {
  ticker: string;
  count: number;
}

export interface ListPostsOptions {
  limit?: number;
  page?: number;
}