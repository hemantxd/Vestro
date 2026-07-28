"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

export default function SettingsProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sync form fields from user store when user changes
  const prevUserId = useRef(user?.id);
  useEffect(() => {
    if (!user || prevUserId.current === user.id) return;
    prevUserId.current = user.id;
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setLocation(user.location || "");
    setAvatar(user.avatar);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ displayName, bio, location });
      setUser(updated as unknown as UserProfile);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const updated = await userApi.uploadProfilePicture(file);
      setUser(updated as unknown as UserProfile);
      setAvatar(updated.avatar);
      setSuccess("Profile picture updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setError("");
    setSuccess("");
    try {
      const updated = await userApi.deleteProfilePicture();
      setUser(updated as unknown as UserProfile);
      setAvatar(null);
      setSuccess("Profile picture removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">Settings</h1>
            <p className="text-xs text-white/40">Profile</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-sm text-center">
            {success}
          </div>
        )}

        {/* Avatar Section */}
        <div className="mb-8 pb-8 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/30">
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-semibold hover:bg-[#00E060] transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              {avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                >
                  Remove Photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-white/30">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="sp-displayName" className="block text-sm text-white/60 mb-1.5">Display Name</label>
            <input
              id="sp-displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="sp-bio" className="block text-sm text-white/60 mb-1.5">Bio</label>
            <textarea
              id="sp-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors resize-none"
            />
            <p className="text-xs text-white/20 mt-1 text-right">{bio.length}/500</p>
          </div>

          <div>
            <label htmlFor="sp-location" className="block text-sm text-white/60 mb-1.5">Location</label>
            <input
              id="sp-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you based?"
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] font-semibold text-sm hover:bg-[#00E060] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}