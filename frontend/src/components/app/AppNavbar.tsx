"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

export default function AppNavbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
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

  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0B1220]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 group">
          <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="appLogo" x1="180" y1="380" x2="380" y2="120">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#1DE46D" />
              </linearGradient>
            </defs>
            <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
            <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#appLogo)" />
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
  );
}