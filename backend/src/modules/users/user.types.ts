export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  location: string | null;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  coverImage?: string;
}