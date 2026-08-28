"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppNavbar from "@/components/app/AppNavbar";
import PostCard from "@/components/app/PostCard";
import { userApi } from "@/lib/api/user";
import { postApi } from "@/lib/api/post";
import type { UserProfile } from "@/types/user";
import type { Post } from "@/types/post";

type SearchMode = "users" | "tickers";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get("ticker");

  const [mode, setMode] = useState<SearchMode>(initialTicker ? "tickers" : "users");
  const [query, setQuery] = useState(initialTicker ?? "");
  interface SearchResult<T> {
    query: string;
    items: T[];
  }

  const [userResult, setUserResult] = useState<SearchResult<UserProfile> | null>(null);
  const [tickerResult, setTickerResult] = useState<SearchResult<Post> | null>(null);
  const [loading, setLoading] = useState(!!initialTicker);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) return;

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      if (mode === "users") {
        userApi
          .searchUsers(trimmed)
          .then((data) => {
            setUserResult({ query: trimmed, items: data });
          })
          .catch(() => {
            setUserResult({ query: trimmed, items: [] });
          })
          .finally(() => setLoading(false));
      } else {
        postApi
          .getPostsByTicker(trimmed.toUpperCase(), { limit: 20, page: 1 })
          .then((data) => {
            setTickerResult({ query: trimmed.toUpperCase(), items: data });
          })
          .catch(() => {
            setTickerResult({ query: trimmed.toUpperCase(), items: [] });
          })
          .finally(() => setLoading(false));
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode]);

  const switchMode = (next: SearchMode) => {
    setMode(next);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Navbar */}
      <AppNavbar />

      <div className="pt-14 max-w-2xl mx-auto px-6 py-6">
        {/* Mode tabs */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => switchMode("users")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              mode === "users"
                ? "bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/40"
                : "bg-white/5 text-muted border border-line hover:text-foreground"
            }`}
          >
            Traders
          </button>
          <button
            onClick={() => switchMode("tickers")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              mode === "tickers"
                ? "bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/40"
                : "bg-white/5 text-muted border border-line hover:text-foreground"
            }`}
          >
            Tickers
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2"
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
            onChange={(e) =>
              setQuery(mode === "tickers" ? e.target.value.toUpperCase() : e.target.value)
            }
            placeholder={mode === "tickers" ? "Search ticker... e.g. AAPL" : "Search by username..."}
            autoFocus
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Ticker results */}
        {!loading &&
          mode === "tickers" &&
          tickerResult &&
          tickerResult.query === query.trim().toUpperCase() &&
          (tickerResult.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-2 text-sm">
                No posts tagged ${query.trim().toUpperCase()} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-2 mb-4">
                {tickerResult.items.length} post{tickerResult.items.length !== 1 ? "s" : ""} tagged {query.trim().toUpperCase()}
              </p>
              {tickerResult.items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDeleted={(postId) =>
                    setTickerResult((prev) =>
                      prev
                        ? { ...prev, items: prev.items.filter((p) => p.id !== postId) }
                        : prev
                    )
                  }
                />
              ))}
            </div>
          ))}

        {/* User results */}
        {!loading &&
          mode === "users" &&
          userResult &&
          userResult.query === query.trim() &&
          (userResult.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-2 text-sm">No users found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-2 mb-4">
                Found {userResult.items.length} result{userResult.items.length !== 1 ? "s" : ""}
              </p>
              {userResult.items.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-line-soft hover:bg-white/[0.04] hover:border-line transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-2">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.displayName || user.username}
                      </p>
                      {user.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#00C853" className="flex-shrink-0">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-muted-2 truncate">@{user.username}</p>
                  </div>

                  {/* Bio preview */}
                  {user.bio && (
                    <p className="text-xs text-muted-2 hidden sm:block max-w-[200px] truncate">
                      {user.bio}
                    </p>
                  )}

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-faint group-hover:text-muted-2 transition-colors flex-shrink-0"
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
          ))}

        {/* Initial state */}
        {!loading &&
          !(mode === "users" && userResult && userResult.query === query.trim()) &&
          !(
            mode === "tickers" &&
            tickerResult &&
            tickerResult.query === query.trim().toUpperCase()
          ) && (
            <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-faint mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-sm text-faint">
              {mode === "tickers"
                ? "Search a stock ticker to see what traders are saying"
                : "Search for traders by username"}
            </p>
          </div>
          )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}