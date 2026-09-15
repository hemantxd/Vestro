"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/app/AppNavbar";
import ChatCreateModal from "@/components/app/ChatCreateModal";
import { chatApi } from "@/lib/api/chat";
import { formatRelativeTime } from "@/components/app/PostCard";
import type { Conversation } from "@/types/chat";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00C853] text-[#0B1220] text-xs font-bold hover:brightness-110 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

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
            <p className="text-foreground/40 text-sm mb-4">
              No messages yet. Start a chat or create a group.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl bg-[#00C853] text-[#0B1220] text-sm font-bold hover:brightness-110 transition"
            >
              New chat
            </button>
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

      <ChatCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(conv) => {
          setShowCreate(false);
          router.push(`/messages/${conv.id}`);
        }}
      />
    </div>
  );
}
