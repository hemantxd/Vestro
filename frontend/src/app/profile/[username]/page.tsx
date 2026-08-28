"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import FollowListModal from "@/components/app/FollowListModal";
import PostCard from "@/components/app/PostCard";
import { userApi } from "@/lib/api/user";
import { followApi } from "@/lib/api/follow";
import { postApi } from "@/lib/api/post";
import { useAuthStore } from "@/store/auth-store";
import type { UserProfile } from "@/types/user";
import type { Post } from "@/types/post";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const currentUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<"followers" | "following" | null>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    userApi
      .getByUsername(username)
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        // If not own profile, check follow status
        if (currentUser && currentUser.username !== username) {
          followApi
            .getFollowStatus(p.id)
            .then((status) => { if (!cancelled) setIsFollowing(status.isFollowing); })
            .catch(() => {});
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username, currentUser?.username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollow(profile.id);
        setIsFollowing(false);
        setProfile({ ...profile, followersCount: Math.max(0, profile.followersCount - 1) });
      } else {
        await followApi.follow(profile.id);
        setIsFollowing(true);
        setProfile({ ...profile, followersCount: profile.followersCount + 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">User not found</h1>
          <p className="text-muted mb-6">{error || "This user doesn't exist."}</p>
          <Link href="/" className="text-[#00C853] hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Navbar */}
      <AppNavbar />

      {/* Cover / Header */}
      <div className="h-48 sm:h-64 bg-gradient-to-br from-[#00C853]/20 to-[#0B1220] relative">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Avatar + Actions */}
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#0B1220] bg-white/10 overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-2">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {profile.displayName || profile.username}
                </h1>
                {profile.verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#00C853">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-muted-2">@{profile.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            {isOwnProfile ? (
              <Link
                href="/settings/profile"
                className="px-4 py-2 rounded-lg border border-line text-foreground hover:text-foreground hover:border-white/40 text-sm font-medium transition-all duration-200"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? "border border-line text-foreground hover:text-foreground hover:border-white/40"
                    : "bg-[#00C853] text-[#0B1220] hover:bg-[#00E060] shadow-lg shadow-[#00C853]/20"
                }`}
              >
                {followLoading
                  ? "..."
                  : isFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Bio & Info */}
        <div className="mb-6">
          {profile.bio && (
            <p className="text-sm text-muted leading-relaxed mb-3">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-2">
            {profile.location && (
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {profile.location}
              </span>
            )}
            <span>
              Joined {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stats — Instagram style, clickable */}
        <div className="flex items-center gap-8 pb-8 border-b border-line-soft">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{profile.postsCount}</p>
            <p className="text-xs text-muted-2">Posts</p>
          </div>
          <button
            onClick={() => setModalOpen("followers")}
            className="text-center hover:opacity-70 transition-opacity"
          >
            <p className="text-sm font-semibold text-foreground">{profile.followersCount}</p>
            <p className="text-xs text-muted-2">Followers</p>
          </button>
          <button
            onClick={() => setModalOpen("following")}
            className="text-center hover:opacity-70 transition-opacity"
          >
            <p className="text-sm font-semibold text-foreground">{profile.followingCount}</p>
            <p className="text-xs text-muted-2">Following</p>
          </button>
        </div>

        {/* Posts */}
        <div className="py-6">
          <UserPosts key={profile.id} userId={profile.id} isOwnProfile={isOwnProfile} />
        </div>
      </div>

      {/* Followers / Following Modal */}
      <FollowListModal
        open={modalOpen !== null}
        title={modalOpen === "followers" ? "Followers" : "Following"}
        userId={profile.id}
        type={modalOpen ?? "followers"}
        onClose={() => setModalOpen(null)}
      />
    </div>
  );
}

// Owns the profile's posts list state; remounted via `key` when the profile
// changes so the loading state (default `true`) starts fresh.
function UserPosts({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    postApi
      .getUserPosts(userId, { limit: 20, page: 1 })
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-2">
          {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={(postId) =>
            setPosts((prev) => prev.filter((p) => p.id !== postId))
          }
        />
      ))}
    </div>
  );
}

