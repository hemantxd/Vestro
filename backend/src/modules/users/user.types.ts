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
  username?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string | null;
  coverImage?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  phone?: string | null;
}