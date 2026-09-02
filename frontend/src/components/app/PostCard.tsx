"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postApi } from "@/lib/api/post";
import { likeApi } from "@/lib/api/like";
import LikersModal from "@/components/app/LikersModal";
import { getCurrency } from "@/constants/currencies";
import { useAuthStore } from "@/store/auth-store";
import type { Post, PostMedia } from "@/types/post";

export function formatRelativeTime(value: string | Date): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MediaGrid({ media }: { media: PostMedia[] }) {
  if (media.length === 0) return null;

  if (media.length === 1) {
    const item = media[0];
    if (item.type === "video") {
      return (
        <video
          src={item.url}
          poster={item.thumbnail ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="w-full max-h-[420px] object-contain bg-black/20"
        />
      );
    }
    return (
      <img
        src={item.url}
        alt=""
        loading="lazy"
        className="w-full max-h-[420px] object-cover"
      />
    );
  }

  const gridClass = media.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-0.5`}>
      {media.map((item) =>
        item.type === "video" ? (
          <video
            key={item.id}
            src={item.url}
            poster={item.thumbnail ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full aspect-square object-cover"
          />
        ) : (
          <img
            key={item.id}
            src={item.url}
            alt=""
            loading="lazy"
            className="w-full h-full aspect-square object-cover"
          />
        )
      )}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: string) => void;
}

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isOwnPost = currentUserId === post.authorId;

  // Local like state so we can optimistically update without mutating props.
  const [liked, setLiked] = useState(Boolean(post.isLiked));
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [prevPostId, setPrevPostId] = useState(post.id);

  // When the post data changes (different post id or refreshed like status),
  // reconcile this card's local state with the server-provided values. Done
  // during render (references React's documented "adjust state during render"
  // pattern) so we don't violate the set-state-in-effect rule.
  if (post.id !== prevPostId) {
    setPrevPostId(post.id);
    setLiked(Boolean(post.isLiked));
    setLikesCount(post.likesCount);
    setLikeBusy(false);
  } else if (post.isLiked !== liked && !likeBusy) {
    setLiked(Boolean(post.isLiked));
    setLikesCount(post.likesCount);
  }

  const handleLike = async () => {
    if (likeBusy) return;
    // Optimistic toggle
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    setLikeBusy(true);
    try {
      const result = await likeApi.togglePostLike(post.id);
      // Reconcile with the server truth
      setLiked(result.liked);
      setLikesCount((count) =>
        result.liked === nextLiked
          ? count
          : result.liked
          ? count + 1
          : Math.max(0, count - 1)
      );
    } catch {
      // Revert on failure
      setLiked(!nextLiked);
      setLikesCount((count) => Math.max(0, count + (nextLiked ? -1 : 1)));
    } finally {
      setLikeBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await postApi.deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete post");
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-xl border border-line-soft bg-white/[0.02] overflow-hidden hover:border-line transition-colors">
      {/* Post header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          href={`/profile/${post.authorUsername}`}
          className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0"
        >
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-2">
              {post.authorUsername[0].toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.authorUsername}`} className="block">
            <p className="text-xs truncate">
              {post.authorDisplayName ? (
                <>
                  <span className="font-semibold text-foreground">{post.authorDisplayName}</span>
                  <span className="text-muted-2"> @{post.authorUsername}</span>
                </>
              ) : (
                <span className="text-muted-2">@{post.authorUsername}</span>
              )}
            </p>
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {post.tickers.slice(0, 5).map((ticker) => (
              <Link
                key={ticker}
                href={`/home?ticker=${encodeURIComponent(ticker)}`}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[#00C853]/10 text-[#00C853] font-medium hover:bg-[#00C853]/20 transition-colors"
              >
                {ticker}
              </Link>
            ))}
            <span className="text-[10px] text-muted-2">
              {formatRelativeTime(post.createdAt)}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-muted-2">
              {getCurrency(post.currency).symbol}
              <span>{post.currency}</span>
            </span>
          </div>
        </div>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-faint hover:text-red-400 transition-colors disabled:opacity-40"
            aria-label="Delete post"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
          </button>
        )}
      </div>

      {deleteError && (
        <p className="px-4 pb-2 text-[10px] text-red-400">{deleteError}</p>
      )}

      {/* Post body */}
      <Link href={`/post/${post.id}`} className="block">
        {post.text && (
          <div className="px-4 pb-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {post.text}
            </p>
          </div>
        )}
        {post.hasMedia && post.media.length > 0 && <MediaGrid media={post.media} />}
      </Link>

      {/* Post actions */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-line-soft">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleLike}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`transition-colors ${liked ? "text-red-500" : "text-muted-2 hover:text-red-400"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            </svg>
          </button>
          <button
            onClick={() => likesCount > 0 && setShowLikers(true)}
            disabled={likesCount === 0}
            aria-label="View post likers"
            className={`text-xs transition-colors disabled:cursor-default ${
              likesCount > 0 ? "text-muted-2 hover:text-[#00C853]" : "text-faint"
            }`}
          >
            {likesCount}
          </button>
        </div>
        <button
          onClick={() => router.push(`/post/${post.id}`)}
          className="flex items-center gap-1 text-muted-2 hover:text-[#00C853] transition-colors text-xs"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.commentsCount}</span>
        </button>
        <button
          onClick={() => router.push(`/post/${post.id}`)}
          className="flex items-center gap-1 text-muted-2 hover:text-[#00C853] transition-colors text-xs ml-auto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>{post.sharesCount}</span>
        </button>
      </div>

      {/* Likers modal */}
      <LikersModal
        open={showLikers}
        title="Likes"
        onClose={() => setShowLikers(false)}
        loadLikers={() => likeApi.getPostLikers(post.id)}
      />
    </article>
  );
}