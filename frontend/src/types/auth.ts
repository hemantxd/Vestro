export interface AuthPayload {
  userId: string;
  email: string;
  username: string;
}

export interface User {
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

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  data: {
    accessToken: string;
  };
}

export interface ApiError {
  status: string;
  message: string;
}