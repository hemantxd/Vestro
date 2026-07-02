import { AppError } from "../../common/errors/AppError.js";
import { userRepository } from "./user.repository.js";
import type { UpdateProfileInput } from "./user.types.js";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      location: user.location,
      verified: user.verified,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      createdAt: user.createdAt,
    };
  },

  async getUserByUsername(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      location: user.location,
      verified: user.verified,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await userRepository.updateUser(userId, input);

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      coverImage: updatedUser.coverImage,
      location: updatedUser.location,
      verified: updatedUser.verified,
      followersCount: updatedUser.followersCount,
      followingCount: updatedUser.followingCount,
      postsCount: updatedUser.postsCount,
      createdAt: updatedUser.createdAt,
    };
  },

  async searchUsers(query: string, limit?: number) {
    return userRepository.searchUsers(query, limit);
  },
};