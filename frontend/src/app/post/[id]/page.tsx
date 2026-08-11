"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppNavbar from "@/components/app/AppNavbar";
import PostCard from "@/components/app/PostCard";
import { postApi } from "@/lib/api/post";
import type { Post } from "@/types/post";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    postApi
      .getPost(postId)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Post not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Shared Navbar */}
      <AppNavbar />

      <div className="pt-14 max-w-[600px] mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error || !post ? (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-lg font-semibold text-white mb-2">Post not found</p>
            <p className="text-sm text-white/50 mb-6">{error || "This post doesn't exist or was removed."}</p>
            <button
              onClick={() => router.push("/home")}
              className="text-[#00C853] hover:text-[#00E060] transition-colors text-sm font-semibold"
            >
              Back to feed
            </button>
          </div>
        ) : (
          <PostCard
            post={post}
            onDeleted={() => {
              setPost(null);
              setError("Post deleted.");
            }}
          />
        )}

        <div className="mt-6 text-center">
          <Link href="/home" className="text-xs font-semibold text-white/40 hover:text-[#00C853] transition-colors">
            &larr; Back to feed
          </Link>
        </div>
      </div>
    </div>
  );
}