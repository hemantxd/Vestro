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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}