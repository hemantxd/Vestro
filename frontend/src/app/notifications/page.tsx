"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import { notificationApi } from "@/lib/api/notification";
import { formatRelativeTime } from "@/components/app/PostCard";
import type { AppNotification, NotificationType } from "@/types/notification";

const TYPE_LABEL: Record<NotificationType, string> = {
  follow: "Follow",
  like: "Like",
  comment: "Comment",
  mention: "Mention",
  message: "Message",
};

const TYPE_ICON: Record<NotificationType, string> = {
  follow: "👤",
  like: "❤️",
  comment: "💬",
  mention: "@",
  message: "✉️",
};

function notificationHref(n: AppNotification): string {
  // Follow (and message) notifications have no post entity — go to the actor's profile.
  if (n.type === "follow" || n.type === "message" || !n.entityId) {
    return `/profile/${n.actorUsername}`;
  }
  // Like/comment/mention all carry the related POST id in `entityId`:
  //   - post like  → entityId = postId (entityType "post")
  //   - comment like → entityId = the post's id (entityType "comment", set so)
  //   - comment / mention → entityId = postId
  // So they all route to the same post page.
  return `/post/${n.entityId}`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationApi.getNotifications(50, 1);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load (async — setState happens in callbacks, not the effect body).
  useEffect(() => {
    let cancelled = false;
    notificationApi
      .getNotifications(50, 1)
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load notifications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = async (n: AppNotification) => {
    if (!n.read) {
      // Optimistically mark read, then update the API
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      notificationApi.markAsRead(n.id).catch(() => {});
    }
    router.push(notificationHref(n));
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    notificationApi.markAllAsRead().catch(() => load());
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    notificationApi.deleteNotification(id).catch(() => load());
  };

  return (
    <div className="min-h-screen bg-[#0B1220]">
      <AppNavbar />

      <div className="pt-14 max-w-[600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs font-semibold text-[#00C853] hover:text-[#00E060] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  n.read
                    ? "bg-white/[0.02] border-white/5"
                    : "bg-[#00C853]/[0.04] border-[#00C853]/20"
                }`}
                onClick={() => handleOpen(n)}
              >
                {/* Actor avatar */}
                <Link
                  href={`/profile/${n.actorUsername}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0"
                >
                  {n.actorAvatar ? (
                    <img src={n.actorAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/30">
                      {n.actorUsername[0].toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" aria-hidden>{TYPE_ICON[n.type]}</span>
                    <span className="text-[10px] font-semibold text-white/40">{TYPE_LABEL[n.type]}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#00C853] flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-white/80 leading-snug mt-0.5">
                    <Link href={`/profile/${n.actorUsername}`} className="font-semibold text-white hover:underline">
                      {n.actorDisplayName || n.actorUsername}
                    </Link>{" "}
                    <span className="text-white/70">{n.message || ""}</span>
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 self-center"
                  aria-label="Delete notification"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}