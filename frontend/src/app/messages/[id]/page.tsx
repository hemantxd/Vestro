"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppNavbar from "@/components/app/AppNavbar";
import { chatApi } from "@/lib/api/chat";
import { API_BASE_URL } from "@/constants/env";
import { useAuthStore } from "@/store/auth-store";
import { formatRelativeTime } from "@/components/app/PostCard";
import GroupMembersModal from "@/components/app/GroupMembersModal";
import type { ChatMessage, Conversation } from "@/types/chat";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = params.id;
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(() => {
    chatApi
      .getConversation(conversationId)
      .then(setConversation)
      .catch(() => {});
  }, [conversationId]);

  const loadMessages = useCallback(() => {
    chatApi
      .getMessages(conversationId, 100, 1)
      .then((data) => {
        setMessages(data);
        chatApi.markRead(conversationId).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    loadConversation();
    loadMessages();
  }, [conversationId, loadConversation, loadMessages]);

  // Scroll to bottom on load / new message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Realtime: connect to chat WebSocket and receive new messages live.
  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");
    if (!token) return;

    const apiBase = API_BASE_URL.replace(/\/api\/v1$/, "").replace(/^http/, "ws");
    const wsUrl = `${apiBase}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", conversationIds: [conversationId] }));
    };
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(typeof event.data === "string" ? event.data : event.data);
        if (payload.type === "message:new" && payload.data?.conversationId === conversationId) {
          const msg = payload.data;
          setMessages((prev) => {
            // Ignore my own messages echoed back by realtime — the optimistic
            // send + REST response already render my side once. This prevents
            // the "sent message appearing twice" bug.
            if (msg.authorId === currentUserId) return prev;
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          chatApi.markRead(conversationId).catch(() => {});
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId,
      authorId: currentUserId || "",
      authorUsername: "",
      authorDisplayName: null,
      authorAvatar: null,
      text: trimmed,
      type: "text",
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    try {
      const saved = await chatApi.sendMessage(conversationId, trimmed);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="pt-14 max-w-[600px] mx-auto px-4 flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center gap-3 py-3 border-b border-line-soft">
          <button
            onClick={() => router.push("/messages")}
            className="text-foreground/50 hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {conversation && (
            <button
              onClick={() => {
                if (conversation.type === "group") setShowMembers(true);
              }}
              className={`flex items-center gap-2.5 flex-1 min-w-0 text-left ${
                conversation.type === "group" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
                {conversation.avatar ? (
                  <img src={conversation.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground/30">
                    {conversation.name[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{conversation.name}</p>
                {conversation.type === "group" && (
                  <p className="text-[10px] text-foreground/40">{conversation.participantCount} members · tap to view</p>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2.5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-foreground/40 text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.authorId === currentUserId;
              return (
                <div key={m.id} className={`flex items-start gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {/* Sender avatar (not shown for own messages) */}
                  {!mine && (
                    <div className="w-7 h-7 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
                      {m.authorAvatar ? (
                        <img src={m.authorAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-foreground/30">
                          {(m.authorDisplayName || m.authorUsername || "?")[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-snug whitespace-pre-line break-words ${
                      mine
                        ? "bg-[#00C853]/15 border border-[#00C853]/40 text-foreground rounded-br-md"
                        : "bg-surface border border-line text-foreground rounded-bl-md"
                    }`}
                  >
                    {/* Sender name for incoming (essential in groups) */}
                    {!mine && conversation?.type === "group" && (
                      <p className="mb-0.5 text-[11px] font-semibold text-[#00C853]">
                        {m.authorDisplayName || m.authorUsername}
                      </p>
                    )}
                    {m.text}
                    <div className={`mt-0.5 text-[10px] text-foreground/40`}>
                      {formatRelativeTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="py-3 border-t border-line-soft flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-surface border border-line text-foreground placeholder:text-foreground/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="px-4 py-2.5 rounded-full bg-[#00C853] text-[#0B1220] text-sm font-bold hover:bg-[#00E060] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
      <GroupMembersModal
        open={showMembers}
        conversation={conversation}
        currentUserId={currentUserId}
        onClose={() => setShowMembers(false)}
        onUpdated={(c) => setConversation(c)}
        onLeft={() => router.push("/messages")}
      />
    </div>
  );
}
