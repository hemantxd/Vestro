export interface CreatePostInput {
  text?: string;
  mediaIds?: string[];
}

export interface PostMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnail: string | null;
  orderIndex: number;
}

export interface PostResponse {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  text: string | null;
  hasMedia: boolean;
  mediaType: string | null;
  media: PostMediaItem[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  createdAt: Date;
}