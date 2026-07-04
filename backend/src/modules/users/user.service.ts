import { AppError } from "../../common/errors/AppError.js";
import { userRepository } from "./user.repository.js";
import { deleteCloudinaryImage } from "../../middleware/upload.middleware.js";
import type { UpdateProfileInput } from "./user.types.js";

const mapUser = (user: any) => ({
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
});

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return mapUser(user);
  },

  async getUserByUsername(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return mapUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await userRepository.updateUser(userId, input);
    return mapUser(updatedUser);
  },

  async updateProfilePicture(userId: string, imageUrl: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar) {
      await deleteCloudinaryImage(user.avatar);
    }

    const updatedUser = await userRepository.updateAvatar(userId, imageUrl);
    return mapUser(updatedUser);
  },

  async deleteProfilePicture(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.avatar) {
      throw new AppError("No profile picture to delete", 400);
    }

    // Delete from Cloudinary
    await deleteCloudinaryImage(user.avatar);

    // Set avatar to null in DB
    const updatedUser = await userRepository.updateAvatar(userId, null);
    return mapUser(updatedUser);
  },

  async searchUsers(query: string, options?: { limit?: number; page?: number }) {
    const results = await userRepository.searchUsers(query, options);
    return results.map(mapUser);
  },
};