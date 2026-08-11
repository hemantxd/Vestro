"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import PostCard from "@/components/app/PostCard";
import PostComposer from "@/components/app/PostComposer";
import { postApi } from "@/lib/api/post";
import { useAuthStore } from "@/store/auth-store";
import type { Post } from "@/types/post";

const trendingTickers = ["NVDA", "TSLA", "AAPL", "GOOGL", "AMZN", "META", "MSFT", "SPY"];
const PAGE_SIZE = 10;

interface FeedSectionProps {
  ticker: string | null;
  onDeleted?: (postId: string) => void;
}

// Owns the post list state so it can be reset by remounting via `key`
// when the selected ticker changes (initial loading is the default state).
function FeedSection({ ticker, onDeleted }: FeedSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = ticker
          ? await postApi.getPostsByTicker(ticker, { limit: PAGE_SIZE, page: 1 })
          : await postApi.getFeed({ limit: PAGE_SIZE, page: 1 });
        if (cancelled) return;
        setPosts(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load posts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = Math.floor(posts.length / PAGE_SIZE) + 1;
      const data = ticker
        ? await postApi.getPostsByTicker(ticker, { limit: PAGE_SIZE, page: nextPage })
        : await postApi.getFeed({ limit: PAGE_SIZE, page: nextPage });
      setPosts((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white/[0.02] border border-red-400/20 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <p className="mt-3 text-xs text-white/40">{ticker ? `Posts tagged $${ticker}` : "Your feed"} could not be loaded.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-white/30">
          {ticker
            ? `No posts tagged $${ticker} yet. Be the first to share one!`
            : "Your feed is empty. Follow traders or tag a ticker to get started."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(postId) => {
              setPosts((prev) => prev.filter((p) => p.id !== postId));
              onDeleted?.(postId);
            }}
          />
        ))}
      </div>

      {error && posts.length > 0 && (
        <p className="mt-3 text-center text-[11px] text-red-400">{error}</p>
      )}

      {hasMore && !loadingMore && (
        <div className="mt-5 text-center">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#00C853]/40 text-xs font-semibold transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const urlTicker = searchParams.get("ticker");

  const [activeTicker, setActiveTicker] = useState<string | null>(
    urlTicker ? urlTicker.toUpperCase() : null
  );
  const [prevUrlTicker, setPrevUrlTicker] = useState<string | null>(urlTicker);
  const [refreshKey, setRefreshKey] = useState(0);

  // Keep activeTicker in sync with ?ticker= in the URL (adjust state during render)
  if (urlTicker && prevUrlTicker !== urlTicker) {
    setPrevUrlTicker(urlTicker);
    setActiveTicker(urlTicker.toUpperCase());
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/");
  }, [isLoading, isAuthenticated, router]);

  const handlePostCreated = () => {
    // Remount the feed so the new post shows up at the top
    setRefreshKey((key) => key + 1);
  };

  const toggleTicker = (ticker: string) => {
    setActiveTicker((prev) => (prev === ticker ? null : ticker));
  };

  const chipClass = (active: boolean) =>
    `px-2.5 py-1 rounded-md border text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
      active
        ? "bg-[#00C853]/20 border-[#00C853]/40 text-[#00C853]"
        : "bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853] hover:bg-[#00C853]/20"
    }`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Shared Navbar */}
      <AppNavbar />

      {/* Main Content */}
      <div className="pt-14">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-8">
          {/* Feed Column */}
          <div className="flex-1 max-w-[600px] mx-auto">
            {/* Trending Tickers Marquee */}
            <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                <span className="text-[10px] font-semibold text-[#00C853] uppercase tracking-wider">
                  Trending
                </span>
                {activeTicker && (
                  <button
                    onClick={() => setActiveTicker(null)}
                    className="ml-auto text-[10px] font-semibold text-white/50 hover:text-white transition-colors"
                  >
                    Clear ${activeTicker} filter &times;
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setActiveTicker(null)} className={chipClass(activeTicker === null)}>
                  Following
                </button>
                {trendingTickers.map((ticker) => (
                  <button key={ticker} onClick={() => toggleTicker(ticker)} className={chipClass(activeTicker === ticker)}>
                    ${ticker}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <PostComposer onCreated={handlePostCreated} />

            {/* Feed */}
            <FeedSection
              key={`${activeTicker ?? "following"}-${refreshKey}`}
              ticker={activeTicker}
            />
          </div>
{/* Right Sidebar */}
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="fixed top-14 w-[300px] py-6 max-h-screen overflow-y-auto">
              {/* Current user */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/30">
                      {user?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user?.username}`} className="block">
                    <p className="text-sm font-semibold text-white truncate">{user?.displayName || user?.username}</p>
                  </Link>
                  <p className="text-xs text-white/40 truncate">@{user?.username}</p>
                </div>
                <button onClick={logout} className="text-xs font-semibold text-[#00C853] hover:text-[#00E060] transition-colors">
                  Log out
                </button>
              </div>

              {/* Market Overview */}
              <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                  <span className="text-[10px] font-semibold text-[#00C853] uppercase tracking-wider">Market Pulse</span>
                </div>
                <div className="space-y-2">
                  {[
                    { ticker: "NVDA", price: "$124.50", change: "+2.3%", up: true },
                    { ticker: "TSLA", price: "$245.80", change: "-1.2%", up: false },
                    { ticker: "AAPL", price: "$198.30", change: "+0.8%", up: true },
                  ].map((s) => (
                    <div key={s.ticker} className="flex items-center justify-between py-1.5">
                      <button onClick={() => setActiveTicker(s.ticker)} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{s.ticker}</span>
                        <span className="text-[10px] text-white/30">{s.price}</span>
                      </button>
                      <span className={`text-[10px] font-semibold ${s.up ? "text-[#00C853]" : "text-red-400"}`}>
                        {s.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
{/* Suggestions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-white/50">Traders to follow</p>
                  <Link href="/explore" className="text-[10px] font-semibold text-[#00C853] hover:text-[#00E060] transition-colors">See All</Link>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/20">?</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">trader_{i}</p>
                        <p className="text-[10px] text-white/30 truncate">New to Vestro</p>
                      </div>
                      <Link href="/explore" className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#00C853]/10 text-[#00C853] hover:bg-[#00C853]/20 transition-colors">
                        Follow
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6">
                <p className="text-[10px] text-white/20 leading-relaxed">
                  About &middot; Privacy &middot; Terms &middot; API &middot; Help
                </p>
                <p className="text-[10px] text-white/20 mt-3">&copy; 2026 VESTRO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}