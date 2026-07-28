"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { userApi } from "@/lib/api/user";
import { useAuthStore } from "@/store/auth-store";
import type { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const currentUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    userApi
      .getByUsername(username)
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">User not found</h1>
          <p className="text-white/50 mb-6">{error || "This user doesn't exist."}</p>
          <Link href="/" className="text-[#00C853] hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220]">
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
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/30">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {profile.displayName || profile.username}
                </h1>
                {profile.verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#00C853">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-white/40">@{profile.username}</p>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/settings/profile"
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-medium transition-all duration-200"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {/* Bio & Info */}
        <div className="mb-6">
          {profile.bio && (
            <p className="text-sm text-white/70 leading-relaxed mb-3">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/40">
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

        {/* Stats */}
        <div className="flex items-center gap-6 pb-8 border-b border-white/5">
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{profile.postsCount}</p>
            <p className="text-xs text-white/40">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{profile.followersCount}</p>
            <p className="text-xs text-white/40">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{profile.followingCount}</p>
            <p className="text-xs text-white/40">Following</p>
          </div>
        </div>

        {/* Posts placeholder */}
        <div className="py-12 text-center">
          <p className="text-sm text-white/30">No posts yet.</p>
        </div>
      </div>
    </div>
  );
}