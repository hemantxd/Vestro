"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

const trendingTickers = ["NVDA", "TSLA", "AAPL", "GOOGL", "AMZN", "META", "MSFT", "SPY"];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      userApi.searchUsers(searchQuery.trim())
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0B1220]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
              <defs>
                <linearGradient id="homeLogo" x1="180" y1="380" x2="380" y2="120">
                  <stop offset="0%" stopColor="#00C853" />
                  <stop offset="100%" stopColor="#1DE46D" />
                </linearGradient>
              </defs>
              <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
              <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#homeLogo)" />
            </svg>
            <span className="text-base font-bold tracking-tight">
              <span className="text-white">VES</span>
              <span className="text-[#00C853]">TRO</span>
            </span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearch(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traders..."
              className="w-56 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
            {showSearch && (searchQuery.trim() || searchResults.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-[#0D1525] border border-white/10 shadow-xl overflow-hidden">
                {searching && <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" /></div>}
                {!searching && searchResults.length === 0 && searchQuery.trim() && (
                  <p className="text-xs text-white/30 text-center py-4">No users found</p>
                )}
                {searchResults.map((u) => (
                  <Link key={u.id} href={`/profile/${u.username}`} onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">{u.username[0].toUpperCase()}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{u.displayName || u.username}</p>
                      <p className="text-[10px] text-white/40 truncate">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-5">
            <Link href="/home" className="text-white/70 hover:text-[#00C853] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            </Link>
            <Link href="/explore" className="text-white/40 hover:text-[#00C853] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </Link>
            <Link href={user ? `/profile/${user.username}` : "/login"} className="text-white/40 hover:text-white transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-8">
          {/* Feed Column */}
          <div className="flex-1 max-w-[600px] mx-auto">
            {/* Trending Tickers Marquee */}
            <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                <span className="text-[10px] font-semibold text-[#00C853] uppercase tracking-wider">Trending</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {trendingTickers.map((ticker) => (
                  <span key={ticker} className="px-2.5 py-1 rounded-md bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-[10px] font-semibold whitespace-nowrap hover:bg-[#00C853]/20 transition-colors cursor-pointer">
                    ${ticker}
                  </span>
                ))}
              </div>
            </div>

            {/* Feed posts placeholder */}
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-colors">
                  {/* Post header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">U</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">username</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00C853]/10 text-[#00C853] font-medium">$TICKER</span>
                        <span className="text-[10px] text-white/30">2h ago</span>
                      </div>
                    </div>
                    <button className="text-white/20 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </button>
                  </div>
                  {/* Post content - trade idea card */}
                  <div className="px-4 pb-3">
                    <div className="p-3 rounded-lg bg-[#00C853]/5 border border-[#00C853]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🚀</span>
                        <span className="text-xs font-bold text-white">Bullish on TICKER</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00C853]/20 text-[#00C853] font-semibold">Bullish</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-[10px] text-white/40 uppercase">Target</span>
                        <p className="text-sm font-bold text-[#00C853]">$XXX</p>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Analysis and reasoning for this trade idea will appear here once the community starts posting.
                      </p>
                    </div>
                  </div>
                  {/* Post actions */}
                  <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5">
                    <button className="flex items-center gap-1 text-white/40 hover:text-red-400 transition-colors text-xs">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-1 text-white/40 hover:text-[#00C853] transition-colors text-xs">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center gap-1 text-white/40 hover:text-[#00C853] transition-colors text-xs ml-auto">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      <span>Share</span>
                    </button>
                  </div>
                  {/* Post stats */}
                  <div className="px-4 pb-3">
                    <p className="text-[10px] text-white/30">0 likes &middot; 0 comments</p>
                  </div>
                </div>
              ))}
            </div>
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
                  <p className="text-sm font-semibold text-white truncate">{user?.displayName || user?.username}</p>
                  <p className="text-xs text-white/40 truncate">@{user?.username}</p>
                </div>
                <button onClick={logout} className="text-xs font-semibold text-[#00C853] hover:text-[#00E060] transition-colors">Log out</button>
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{s.ticker}</span>
                        <span className="text-[10px] text-white/30">{s.price}</span>
                      </div>
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
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/20">?</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">trader_{i}</p>
                        <p className="text-[10px] text-white/30 truncate">New to Vestro</p>
                      </div>
                      <button className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#00C853]/10 text-[#00C853] hover:bg-[#00C853]/20 transition-colors">Follow</button>
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