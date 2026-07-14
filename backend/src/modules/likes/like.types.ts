export interface LikeResponse {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface LikeUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}