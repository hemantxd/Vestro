"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { userApi } from "@/lib/api/user";
import { followApi } from "@/lib/api/follow";
import type { SuggestedUser } from "@/types/user";

interface TradersToFollowProps {
  limit?: number;
  title?: string;
}

export default function TradersToFollow({
  limit = 3,
  title = "Traders to follow",
}: TradersToFollowProps) {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userApi
      .getSuggested(limit)
      .then((data) => {
        if (!cancelled) setSuggestions(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load suggestions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const handleFollow = async (userId: string) => {
    if (busyId) return;
    setBusyId(userId);
    // Optimistically remove the trader from the list once followed
    setSuggestions((prev) => prev.filter((u) => u.id !== userId));
    try {
      await followApi.follow(userId);
    } catch {
      // Re-add on failure
      setSuggestions((prev) => {
        const failed = suggestions.find((u) => u.id === userId);
        return failed ? [...prev, failed] : prev;
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || suggestions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white/50">{title}</p>
        <Link
          href="/explore"
          className="text-[10px] font-semibold text-[#00C853] hover:text-[#00E060] transition-colors"
        >
          See All
        </Link>
      </div>

      <div className="space-y-1">
        {suggestions.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <Link
              href={`/profile/${u.username}`}
              className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0"
            >
              {u.avatar ? (
                <img src={u.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">
                  {u.username[0].toUpperCase()}
                </div>
              )}
            </Link>

            <Link href={`/profile/${u.username}`} className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {u.displayName || u.username}
                {u.verified && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#00C853" className="inline-block ml-1">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
              </p>
              <p className="text-[10px] text-white/30 truncate">@{u.username}</p>
            </Link>

            <button
              onClick={() => handleFollow(u.id)}
              disabled={busyId === u.id}
              className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#00C853] text-[#0B1220] hover:bg-[#00E060] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busyId === u.id ? "..." : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}