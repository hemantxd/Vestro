"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { commentApi } from "@/lib/api/comment";
import { likeApi } from "@/lib/api/like";
import LikersModal from "@/components/app/LikersModal";
import { useAuthStore } from "@/store/auth-store";
import { formatRelativeTime } from "./PostCard";
import type { Comment } from "@/types/comment";

interface CommentSectionProps {
  postId: string;
  onCommentsCountChange?: (delta: number) => void;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  currentUserId?: string;
  onReply: (parentId: string, username: string) => void;
  onDeleted: (commentId: string) => void;
}

function CommentItem({
  comment,
  isReply,
  currentUserId,
  onReply,
  onDeleted,
}: CommentItemProps) {
  const [liked, setLiked] = useState(Boolean(comment.isLiked));
  const [likeCount, setLikeCount] = useState(comment.likesCount);
  const [deleting, setDeleting] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const isOwn = currentUserId === comment.authorId;

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const result = await commentApi.toggleCommentLike(comment.id);
      setLiked(result.liked);
    } catch {
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await commentApi.deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-10" : ""} flex gap-2.5`}>
      {/* Avatar */}
      <Link
        href={`/profile/${comment.authorUsername}`}
        className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0"
      >
        {comment.authorAvatar ? (
          <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-2">
            {comment.authorUsername[0].toUpperCase()}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-white/[0.03] border border-line-soft px-3 py-2">
          <Link href={`/profile/${comment.authorUsername}`} className="block">
            <p className="text-xs font-semibold text-foreground truncate">
              {comment.authorDisplayName || comment.authorUsername}
              <span className="text-muted-2 font-normal"> @{comment.authorUsername}</span>
            </p>
          </Link>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mt-0.5">
            {comment.text}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-muted-2">{formatRelativeTime(comment.createdAt)}</span>
          {!isReply && (
            <button
              onClick={() => onReply(comment.id, comment.authorUsername)}
              className="text-[10px] font-semibold text-muted-2 hover:text-[#00C853] transition-colors"
            >
              Reply
            </button>
          )}
          <button
            onClick={handleLike}
            aria-label={liked ? "Unlike comment" : "Like comment"}
            className={`transition-colors ${liked ? "text-red-500" : "text-muted-2 hover:text-red-400"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            </svg>
          </button>
          <button
            onClick={() => likeCount > 0 && setShowLikers(true)}
            disabled={likeCount === 0}
            aria-label="View comment likers"
            className={`text-[10px] transition-colors disabled:cursor-default ${
              likeCount > 0 ? "text-muted-2 hover:text-[#00C853]" : "text-faint"
            }`}
          >
            {likeCount}
          </button>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[10px] font-semibold text-faint hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {deleting ? "..." : "Delete"}
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                currentUserId={currentUserId}
                onReply={onReply}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )}

        {/* Comment likers modal */}
        <LikersModal
          open={showLikers}
          title="Likes"
          onClose={() => setShowLikers(false)}
          loadLikers={() => likeApi.getCommentLikers(comment.id)}
        />
      </div>
    </div>
  );
}
export default function CommentSection({ postId, onCommentsCountChange }: CommentSectionProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const user = useAuthStore((s) => s.user);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const loadComments = useCallback(() => {
    setLoading(true);
    setError("");
    commentApi
      .getComments(postId)
      .then(setComments)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load comments"))
      .finally(() => setLoading(false));
  }, [postId]);

  // Initial load: fetch comments on mount / when postId changes without
  // resetting `loading` synchronously (kept as the default state).
  useEffect(() => {
    let cancelled = false;
    commentApi
      .getComments(postId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load comments");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await commentApi.createComment(postId, {
        text: text.trim(),
        parentId: replyTo?.id,
      });
      setText("");
      setReplyTo(null);
      onCommentsCountChange?.(1);
      loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) =>
      prev
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== commentId) || [],
        }))
        .filter((c) => c.id !== commentId)
    );
    onCommentsCountChange?.(-1);
  };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Comments</h2>
        {comments.length > 0 && (
          <span className="text-xs text-muted-2">{comments.length}</span>
        )}
      </div>

      {/* Composer */}
      <div className="mb-4">
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-2">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            {replyTo && (
              <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                <span className="text-muted-2">
                  Replying to <span className="text-[#00C853]">@{replyTo.username}</span>
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-2 hover:text-foreground transition-colors"
                  aria-label="Cancel reply"
                >
                  &times;
                </button>
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Add a comment..."}
              rows={2}
              className="w-full resize-none rounded-lg bg-white/5 border border-line text-foreground placeholder:text-muted-2 text-sm p-2.5 focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
            <div className="flex justify-end mt-1.5">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="px-4 py-1.5 rounded-lg bg-[#00C853] text-[#0B1220] text-xs font-bold hover:bg-[#00E060] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-2 text-sm py-6">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={(id, username) => setReplyTo({ id, username })}
              onDeleted={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}