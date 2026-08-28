"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { followApi, type FollowUser } from "@/lib/api/follow";

interface FollowListModalProps {
  open: boolean;
  title: string;
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}

export default function FollowListModal({
  open,
  title,
  userId,
  type,
  onClose,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError("");
    setUsers([]);
    const fetcher = type === "followers" ? followApi.getFollowers : followApi.getFollowing;
    fetcher(userId)
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [open, userId, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-red-400 text-sm py-10">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-2 text-sm py-10">
              No {type === "followers" ? "followers" : "following"} yet
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                  <Link href={`/profile/${u.username}`} className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-2">
                          {u.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.displayName || u.username}
                      </p>
                      <p className="text-xs text-muted-2 truncate">
                        @{u.username}
                        {u.isFollowingBack ? " · Follows you" : ""}
                      </p>
                    </div>
                  </Link>
                  {u.isFollowingBack && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C853]/10 text-[#00C853] font-medium flex-shrink-0">
                      Following
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}