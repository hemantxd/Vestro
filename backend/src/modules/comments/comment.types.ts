export interface CreateCommentInput {
  text: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  text: string;
  createdAt: Date;
  updatedAt: Date | null;
}