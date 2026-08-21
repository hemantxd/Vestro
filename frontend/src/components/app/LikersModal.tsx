"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LikeUser } from "@/lib/api/like";

interface LikersModalProps {
  open: boolean;
  title: string;
  loadLikers: () => Promise<LikeUser[]>;
  onClose: () => void;
}

export default function LikersModal({ open, title, loadLikers, onClose }: LikersModalProps) {
  const [likers, setLikers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadLikers()
      .then((data) => {
        if (!cancelled) setLikers(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load likers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, loadLikers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0D1525] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close"
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
          ) : likers.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-10">No likes yet</p>
          ) : (
            <div className="divide-y divide-white/5">
              {likers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                  <Link href={`/profile/${user.username}`} className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/30">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-xs text-white/40 truncate">@{user.username}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}