"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/app/AppNavbar";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

export default function SettingsProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuthStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch full profile on mount using the same endpoint as the profile page
  const fetched = useRef(false);
  useEffect(() => {
    if (!user || !user.username || fetched.current) return;
    fetched.current = true;
    setUsername(user.username);
    userApi.getByUsername(user.username).then((profile) => {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setGender(profile.gender || "");
      setPhone(profile.phone || "");
      setBirthDate(profile.birthDate ? profile.birthDate.split("T")[0] : "");
      setAvatar(profile.avatar);
      setCoverImage(profile.coverImage);
    }).catch(() => {
      // fallback: just username is already set
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        username: username !== user?.username ? username : undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        location: location || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
      });
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
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB"); return; }

    setError(""); setSuccess(""); setUploadingAvatar(true);
    try {
      const updated = await userApi.uploadProfilePicture(file);
      setUser(updated as unknown as UserProfile);
      setAvatar(updated.avatar);
      setSuccess("Profile picture updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally { setUploadingAvatar(false); }
  };

  const handleDeleteAvatar = async () => {
    setError(""); setSuccess("");
    try {
      const updated = await userApi.deleteProfilePicture();
      setUser(updated as unknown as UserProfile);
      setAvatar(null);
      setSuccess("Profile picture removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Cover image must be less than 10MB"); return; }

    setError(""); setSuccess(""); setUploadingCover(true);
    try {
      const updated = await userApi.uploadCoverImage(file);
      setUser(updated as unknown as UserProfile);
      setCoverImage(updated.coverImage);
      setSuccess("Cover image updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload cover");
    } finally { setUploadingCover(false); }
  };

  const handleRemoveCover = async () => {
    setError(""); setSuccess("");
    try {
      const updated = await userApi.updateProfile({ coverImage: null });
      setUser(updated as unknown as UserProfile);
      setCoverImage(null);
      setSuccess("Cover image removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove cover");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Navbar */}
      <AppNavbar />

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-lg font-semibold text-foreground mb-6">Settings</h1>
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-3 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-sm text-center">{success}</div>
        )}

        {/* Preview Card */}
        <div className="mb-8 pb-8 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground mb-4">Preview</h2>
          <div className="relative h-32 sm:h-40 rounded-xl bg-gradient-to-br from-[#00C853]/20 to-[#0B1220] overflow-hidden">
            {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex items-end gap-4 -mt-10 px-4">
            <div className="w-20 h-20 rounded-full border-4 border-[#0B1220] bg-white/10 overflow-hidden flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-2">
                  {(user?.username?.[0] || "?").toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1">
              <p className="text-sm font-semibold text-foreground">{displayName || username || "Your Name"}</p>
              <p className="text-xs text-muted-2">@{username || "username"}</p>
            </div>
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="mb-8 pb-8 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground mb-4">Cover Image</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-line text-foreground text-xs hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              {uploadingCover ? "Uploading..." : "Upload Cover"}
            </button>
            {coverImage && (
              <button
                onClick={handleRemoveCover}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
              >
                Remove Cover
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>
        </div>

        {/* Avatar Section */}
        <div className="mb-8 pb-8 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-2">
                  {(user?.username?.[0] || "?").toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-semibold hover:bg-[#00E060] transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>
              {avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                >
                  Remove Photo
                </button>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <p className="text-xs text-muted-2">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="sp-username" className="block text-sm text-muted mb-1.5">Username</label>
            <input
              id="sp-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              minLength={3}
              maxLength={30}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
            <p className="text-xs text-faint mt-1">Must be unique. 3-30 characters.</p>
          </div>

          <div>
            <label htmlFor="sp-displayName" className="block text-sm text-muted mb-1.5">Display Name</label>
            <input
              id="sp-displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="sp-bio" className="block text-sm text-muted mb-1.5">Bio</label>
            <textarea
              id="sp-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors resize-none"
            />
            <p className="text-xs text-faint mt-1 text-right">{bio.length}/500</p>
          </div>

          <div>
            <label htmlFor="sp-location" className="block text-sm text-muted mb-1.5">Location</label>
            <input
              id="sp-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you based?"
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-3">Gender</label>
            <div className="flex items-center gap-6">
              {["Male", "Female", "Other"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={gender === option}
                      onChange={(e) => setGender(e.target.value)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border-2 border-line group-hover:border-white/40 transition-colors peer-checked:border-[#00C853] peer-checked:bg-[#00C853] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-sm text-muted group-hover:text-foreground transition-colors peer-checked:text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="sp-phone" className="block text-sm text-muted mb-1.5">Phone</label>
            <input
              id="sp-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="sp-birthDate" className="block text-sm text-muted mb-1.5">Birth Date</label>
            <input
              id="sp-birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-line text-foreground text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors [color-scheme:dark]"
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