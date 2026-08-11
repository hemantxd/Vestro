"use client";

import { useEffect, useRef, useState } from "react";
import { postApi } from "@/lib/api/post";
import { CURRENCIES } from "@/constants/currencies";
import { useAuthStore } from "@/store/auth-store";
import type { Post } from "@/types/post";

const MAX_TICKERS = 5;
const MAX_MEDIA = 10;
const CURRENCY_SYMBOLS_REGEX = /[$₹¥€£₩₺₽₫₱₿]/g;

// Tickers are plain symbols — currency symbols ("$", "₹", "¥", ...) are
// stripped so entering "$AAPL, ₹RELIANCE" yields ["AAPL", "RELIANCE"].
function sanitizeTicker(raw: string): string {
  return raw
    .replace(CURRENCY_SYMBOLS_REGEX, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toUpperCase()
    .slice(0, 20);
}

function appendTicker(current: string[], value: string): string[] {
  const cleaned = sanitizeTicker(value);
  if (!cleaned) return current;
  if (current.includes(cleaned) || current.length >= MAX_TICKERS) return current;
  return [...current, cleaned];
}

interface PostComposerProps {
  onCreated?: (post: Post) => void;
}

interface PendingMedia {
  file: File;
  previewUrl: string;
  isVideo: boolean;
}

export default function PostComposer({ onCreated }: PostComposerProps) {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [text, setText] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tickerInput, setTickerInput] = useState("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Revoke any leaked object URLs on unmount
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const canSubmit =
    !submitting &&
    (text.trim().length > 0 || tickers.length > 0 || media.length > 0);

  const addTickerFromInput = (value: string) => {
    const cleaned = sanitizeTicker(value);
    if (cleaned) {
      setTickers((prev) => appendTicker(prev, cleaned));
    }
    setTickerInput("");
    setError("");
  };

  const handleTickerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (tickerInput.trim()) addTickerFromInput(tickerInput);
    } else if (e.key === "Backspace" && !tickerInput && tickers.length > 0) {
      setTickers((prev) => prev.slice(0, -1));
    }
  };

  const handleTickerBlur = () => {
    if (tickerInput.trim()) addTickerFromInput(tickerInput);
  };

  const removeTicker = (index: number) => {
    setTickers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError("");

    const remaining = MAX_MEDIA - media.length;
    if (remaining <= 0) {
      setError(`You can attach up to ${MAX_MEDIA} media files.`);
      return;
    }

    const next = Array.from(files)
      .slice(0, remaining)
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.push(previewUrl);
        return {
          file,
          previewUrl,
          isVideo: file.type.startsWith("video/"),
        };
      });

    if (next.length === 0 && files.length > 0) {
      setError("Only image and video files are supported.");
      return;
    }

    setMedia((prev) => [...prev, ...next]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const target = next[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== target.previewUrl
        );
      }
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    // Commit any ticker still being typed in the box
    const finalTickers = tickerInput.trim()
      ? appendTicker(tickers, tickerInput)
      : tickers;

    try {
      const post = await postApi.createPost({
        text: text.trim() || undefined,
        tickers: finalTickers,
        currency,
        media: media.map((m) => m.file),
      });

      media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      previewUrlsRef.current = [];
      setText("");
      setCurrency("USD");
      setTickerInput("");
      setTickers([]);
      setMedia([]);
      onCreated?.(post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
      {/* Composer header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/30">
              {user?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-white">
          Share a trade idea with the community
        </p>
      </div>

      {/* Text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? Add tickers below, mention traders with @username"
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
      />

      {/* Currency + Tickers */}
      <div className="mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            Currency
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 text-white text-xs py-1.5 px-2 focus:outline-none focus:border-[#00C853]/50 transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0D1525]">
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            Tickers
          </span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {tickers.map((t, i) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#00C853]/10 border border-[#00C853]/25 text-[#00C853] font-semibold"
              >
                {t}
                <button
                  onClick={() => removeTicker(i)}
                  className="hover:text-red-400 transition-colors"
                  aria-label={`Remove ${t}`}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {tickers.length < MAX_TICKERS && (
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(sanitizeTicker(e.target.value))}
                onKeyDown={handleTickerKeyDown}
                onBlur={handleTickerBlur}
                placeholder={tickers.length === 0 ? "AAPL, TSLA, ..." : "Add more"}
                maxLength={20}
                className="w-28 bg-transparent text-xs text-white placeholder:text-white/30 uppercase focus:outline-none"
              />
            )}
          </div>
        </div>
        <p className="mt-1.5 text-[10px] text-white/20">
          Type a ticker and press Enter (no $ symbol needed — currency is picked above).
        </p>
      </div>
{/* Media previews */}
      {media.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <div key={m.previewUrl} className="relative flex-shrink-0">
              {m.isVideo ? (
                <video src={m.previewUrl} className="w-20 h-20 rounded-lg object-cover bg-black/30" muted />
              ) : (
                <img src={m.previewUrl} alt="" className="w-20 h-20 rounded-lg object-cover bg-black/30" />
              )}
              <button
                onClick={() => removeMedia(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0B1220] border border-white/20 text-white/70 hover:text-white hover:border-red-400 transition-colors flex items-center justify-center"
                aria-label="Remove media"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00C853] hover:text-[#00E060] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Media
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-4 py-1.5 rounded-lg bg-[#00C853] text-[#0B1220] text-xs font-bold hover:bg-[#00E060] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}