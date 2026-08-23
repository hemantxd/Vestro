export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  location: string | null;
  birthDate: string | null;
  gender: string | null;
  phone: string | null;
  verified: boolean;
  privateAccount: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
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

// Suggested "traders to follow" (from GET /users/suggested)
export interface SuggestedUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  verified: boolean;
}