export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  parentId: string | null;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCommentInput {
  text: string;
  parentId?: string;
}