export interface CreateCommentInput {
  text: string;
  parentId?: string;
}

export interface CommentResponse {
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
  replies?: CommentResponse[];
  createdAt: Date;
  updatedAt: Date | null;
}