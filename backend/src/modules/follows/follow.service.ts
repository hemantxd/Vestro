import { AppError } from "../../common/errors/AppError.js";
import { followRepository } from "./follow.repository.js";
import { userRepository } from "../users/user.repository.js";
import { notificationService } from "../notifications/notification.service.js";

export const followService = {
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const targetUser = await userRepository.findById(followingId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const existing = await followRepository.findFollow(followerId, followingId);
    if (existing) {
      throw new AppError("Already following this user", 409);
    }

    const follow = await followRepository.createFollow(followerId, followingId);

    // Atomic count updates
    await Promise.all([
      followRepository.incrementFollowersCount(followingId),
      followRepository.incrementFollowingCount(followerId),
    ]);

    await notificationService.createFollowNotification(followingId, followerId);

    return follow;
  },

  async unfollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError("You cannot unfollow yourself", 400);
    }

    const existing = await followRepository.findFollow(followerId, followingId);
    if (!existing) {
      throw new AppError("Not following this user", 404);
    }

    await followRepository.deleteFollow(followerId, followingId);

    await Promise.all([
      followRepository.decrementFollowersCount(followingId),
      followRepository.decrementFollowingCount(followerId),
    ]);
  },

  async removeFollower(userId: string, followerId: string) {
    const existing = await followRepository.findFollow(followerId, userId);
    if (!existing) {
      throw new AppError("This user is not following you", 404);
    }

    await followRepository.deleteFollow(followerId, userId);

    await Promise.all([
      followRepository.decrementFollowersCount(userId),
      followRepository.decrementFollowingCount(followerId),
    ]);
  },

  async getFollowers(userId: string, currentUserId: string | undefined, options?: { limit?: number; page?: number }) {
    const followers = await followRepository.getFollowers(userId, options);

    // Bulk check isFollowingBack in a single query
    if (currentUserId && followers.length > 0) {
      const followerIds = followers.map((f) => f.id);
      const followingIds = await followRepository.getFollowingIds(currentUserId, followerIds);

      return followers.map((follower) => ({
        ...follower,
        isFollowingBack: followingIds.has(follower.id),
      }));
    }

    return followers.map((follower) => ({ ...follower, isFollowingBack: false }));
  },

  async getFollowing(userId: string, currentUserId: string | undefined, options?: { limit?: number; page?: number }) {
    const following = await followRepository.getFollowing(userId, options);

    // Bulk check isFollowingBack in a single query
    if (currentUserId && following.length > 0) {
      const followingIds = following.map((f) => f.id);
      const followedIds = await followRepository.getFollowingIds(currentUserId, followingIds);

      return following.map((user) => ({
        ...user,
        isFollowingBack: followedIds.has(user.id),
      }));
    }

    return following.map((user) => ({ ...user, isFollowingBack: false }));
  },

  async getFollowStatus(followerId: string, followingId: string) {
    const isFollowing = await followRepository.isFollowing(followerId, followingId);
    return { isFollowing };
  },
};