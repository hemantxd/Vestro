export interface FollowInput {
  followingId: string;
}

export interface FollowResponse {
  id: string;
  followerId: string;
  followingId: string;
  status: "active" | "pending";
  createdAt: Date;
}

export interface FollowerUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  isFollowingBack: boolean;
  followedAt: Date;
}