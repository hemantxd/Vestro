"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setSearched(true);
      userApi
        .searchUsers(query.trim())
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Shared Navbar */}
      <AppNavbar />

      <div className="pt-14 max-w-2xl mx-auto px-6 py-6">
        {/* Search Input */}
        <div className="relative mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            autoFocus
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm">No users found for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 mb-4">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/30">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || user.username}
                    </p>
                    {user.verified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" className="flex-shrink-0">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate">@{user.username}</p>
                </div>

                {/* Bio preview */}
                {user.bio && (
                  <p className="text-xs text-white/30 hidden sm:block max-w-[200px] truncate">
                    {user.bio}
                  </p>
                )}

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-white/10 mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-sm text-white/20">Search for traders by username</p>
          </div>
        )}
      </div>
    </div>
  );
}