"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import { chatApi } from "@/lib/api/chat";
import { formatRelativeTime } from "@/components/app/PostCard";
import type { Conversation } from "@/types/chat";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    chatApi
      .listConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load chats");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="pt-14 max-w-[600px] mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Messages</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && conversations.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface border border-line text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-foreground/40 text-sm">
              No messages yet. Go to a trader&apos;s profile and tap &quot;Message&quot; to start a chat.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-soft">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-3 -mx-2 rounded-xl hover:bg-foreground/5 transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-foreground/30">
                      {c.name[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    {c.lastMessageAt && (
                      <span className="text-[10px] text-foreground/40 flex-shrink-0 ml-2">
                        {formatRelativeTime(c.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground/50 truncate">
                      {c.lastMessage
                        ? `${c.lastMessageAuthor ? c.lastMessageAuthor + ": " : ""}${c.lastMessage}`
                        : c.type === "group"
                        ? `${c.participantCount} members`
                        : "Say hello 👋"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#00C853] text-[#0B1220] text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}