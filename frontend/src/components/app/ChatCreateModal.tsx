"use client";

import { useRef, useState } from "react";
import { chatApi } from "@/lib/api/chat";
import { userApi } from "@/lib/api/user";
import type { Conversation } from "@/types/chat";

interface PickableUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Conversation) => void;
}

export default function ChatCreateModal({ open, onClose, onCreated }: Props) {
  const [tab, setTab] = useState<"dm" | "group">("dm");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickableUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PickableUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTab("dm");
      setQuery("");
      setResults([]);
      setSelected([]);
      setGroupName("");
      setError("");
      setCreating(false);
    }
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      userApi
        .searchUsers(q, 10, 1)
        .then((users) =>
          setResults(
            users.map((u) => ({
              id: u.id,
              username: u.username,
              displayName: u.displayName,
              avatar: u.avatar,
            }))
          )
        )
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
  };

  if (!open) return null;

  const isSel = (id: string) => selected.some((u) => u.id === id);

  const toggle = (u: PickableUser) => {
    setSelected((prev) =>
      prev.some((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u]
    );
  };

  const startDm = async (u: PickableUser) => {
    setCreating(true);
    setError("");
    try {
      onCreated(await chatApi.getOrCreateDm(u.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start chat");
      setCreating(false);
    }
  };

  const createGroup = async () => {
    const name = groupName.trim();
    if (!name) {
      setError("Give your group a name");
      return;
    }
    if (selected.length === 0) {
      setError("Add at least one person to the group");
      return;
    }
    setCreating(true);
    setError("");
    try {
      onCreated(
        await chatApi.createConversation({
          type: "group",
          name,
          participantIds: selected.map((u) => u.id),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create group");
      setCreating(false);
    }
  };

  const UserRow = ({ u }: { u: PickableUser }) => (
    <div className="flex items-center gap-3 py-2.5 hover:bg-foreground/5 rounded-lg px-1 transition-colors">
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
        </p>
        <p className="text-xs text-muted-2 truncate">@{u.username}</p>
      </div>
      {tab === "dm" && (
        <button
          onClick={() => startDm(u)}
          disabled={creating}
          className="px-3 py-1.5 rounded-lg bg-[#00C853] text-[#0B1220] text-xs font-bold hover:brightness-110 transition disabled:opacity-50 flex-shrink-0"
        >
          Chat
        </button>
      )}
      {tab === "group" && (
        <button
          onClick={() => toggle(u)}
          className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
            isSel(u.id)
              ? "bg-[#00C853] border-[#00C853] text-[#0B1220]"
              : "border-line text-transparent hover:border-[#00C853]"
          }`}
          aria-label={isSel(u.id) ? "Remove" : "Add"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      )}
    </div>
  );

  const selCount = selected.length;
  const canCreate = groupName.trim().length > 0 && selCount > 0 && !creating;

  const tabBtn = (t: "dm" | "group") =>
    `flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      tab === t
        ? "bg-[#00C853]/15 text-[#00C853]"
        : "text-muted-2 hover:text-foreground hover:bg-foreground/5"
    }`;

  const inputCls =
    "w-full px-3 py-2 rounded-xl bg-foreground/5 border border-line text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-[#00C853]/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
          <h2 className="text-sm font-semibold text-foreground">New chat</h2>
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
        <div className="flex px-5 pt-3 gap-2">
          <button onClick={() => { setTab("dm"); setError(""); }} className={tabBtn("dm")}>
            Direct
          </button>
          <button onClick={() => { setTab("group"); setError(""); }} className={tabBtn("group")}>
            Group
          </button>
        </div>
        <div className="px-5 py-4">
          {tab === "group" && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              maxLength={100}
              className={`${inputCls} mb-2`}
            />
          )}
          {tab === "group" && selCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selected.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggle(u)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-[#00C853]/15 border border-[#00C853]/40 text-xs text-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-foreground/10 overflow-hidden flex-shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-foreground/40">
                        {u.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </span>
                  @{u.username}
                  <span className="text-foreground/50">x</span>
                </button>
              ))}
            </div>
          )}
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search traders by name or @username"
            className={inputCls}
          />
          <div className="mt-2 max-h-[40vh] overflow-y-auto divide-y divide-line-soft">
            {searching ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-muted-2 text-xs py-8">
                {query.trim() ? "No traders found" : "Type to search for traders to chat with"}
              </p>
            ) : (
              results.map((u) => <UserRow key={u.id} u={u} />)
            )}
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          {tab === "group" && (
            <button
              onClick={createGroup}
              disabled={!canCreate}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#00C853] text-[#0B1220] text-sm font-bold hover:brightness-110 transition disabled:opacity-40"
            >
              {creating ? "Creating..." : "Create group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
