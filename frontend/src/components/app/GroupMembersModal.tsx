"use client";

import { useState } from "react";
import { chatApi } from "@/lib/api/chat";
import { userApi } from "@/lib/api/user";
import type { Conversation, ConversationUser } from "@/types/chat";

interface Props {
  open: boolean;
  conversation: Conversation | null;
  currentUserId?: string;
  onClose: () => void;
  onUpdated: (c: Conversation) => void;
  onLeft: () => void;
}

export default function GroupMembersModal({
  open,
  conversation,
  currentUserId,
  onClose,
  onUpdated,
  onLeft,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ConversationUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    setError("");
    const q = value.trim();
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const exclude = new Set((conversation?.members ?? []).map((m) => m.id));
    userApi
      .searchUsers(q, 10, 1)
      .then((users) =>
        setResults(
          users
            .filter((u) => !exclude.has(u.id))
            .map((u) => ({
              id: u.id,
              username: u.username,
              displayName: u.displayName,
              avatar: u.avatar,
              role: "member",
            }))
        )
      )
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  };

  const handleAdd = async (userId: string) => {
    if (!conversation) return;
    setBusy(true);
    setError("");
    try {
      const updated = await chatApi.addMembers(conversation.id, [userId]);
      setQuery("");
      setResults([]);
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add member");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!conversation) return;
    setBusy(true);
    setError("");
    try {
      await chatApi.removeMember(conversation.id, userId);
      const updated = await chatApi.getConversation(conversation.id);
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!conversation) return;
    setBusy(true);
    setError("");
    try {
      await chatApi.leaveGroup(conversation.id);
      onLeft();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave group");
    } finally {
      setBusy(false);
    }
  };

  if (!open || !conversation) return null;

  const members = conversation.members ?? [];
  const memberIds = new Set(members.map((m) => m.id));
  const myRole = members.find((m) => m.id === currentUserId)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const inputCls =
    "w-full px-3 py-2 rounded-xl bg-foreground/5 border border-line text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-[#00C853]/60";

  const row = (u: ConversationUser, action: "add" | "remove") => (
    <div
      key={u.id}
      className="flex items-center gap-3 py-2.5 hover:bg-foreground/5 rounded-lg px-1 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
        {u.avatar ? (
          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground/30">
            {u.username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {u.displayName || u.username}
          {u.id === currentUserId && (
            <span className="ml-1.5 text-[10px] font-medium text-foreground/40">(you)</span>
          )}
        </p>
        <p className="text-xs text-muted-2 truncate">
          @{u.username}
          {u.role === "owner" && " · Owner"}
          {u.role === "admin" && " · Admin"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground">
            {conversation.name} · {members.length} member{members.length === 1 ? "" : "s"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-2 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">
          {canManage && (
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search traders to add"
              className={`${inputCls} mb-1`}
            />
          )}
      {canManage && query.trim() && (
        <div className="max-h-[24vh] overflow-y-auto divide-y divide-line-soft mb-2">
          {searching ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-2 text-xs py-4">No traders found</p>
          ) : (
            results.map((u) => (
              <div key={u.id} className="flex items-center">
                <div className="flex-1">{row(u, "add")}</div>
                <button
                  onClick={() => handleAdd(u.id)}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-lg bg-[#00C853] text-[#0B1220] text-xs font-bold hover:brightness-110 transition disabled:opacity-50 flex-shrink-0"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40 mt-1 mb-1">
        Members ({members.length})
      </p>
      <div className="max-h-[36vh] overflow-y-auto divide-y divide-line-soft">
        {members.map((m) => (
          <div key={m.id} className="flex items-center">
            <div className="flex-1">{row(m, "remove")}</div>
            {canManage && m.id !== currentUserId && m.role !== "owner" && (
              <button
                onClick={() => handleRemove(m.id)}
                disabled={busy}
                className="px-2.5 py-1 rounded-lg border border-red-400/40 text-red-400 text-xs font-semibold hover:bg-red-400/10 transition disabled:opacity-50 flex-shrink-0"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <button
        onClick={handleLeave}
        disabled={busy}
        className="w-full mt-3 py-2 rounded-xl border border-line text-foreground/60 text-xs font-semibold hover:text-red-400 hover:border-red-400/50 transition disabled:opacity-50"
      >
        Leave group
      </button>
        </div>
      </div>
    </div>
  );
}
