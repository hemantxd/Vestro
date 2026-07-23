"use client";

import { motion } from "framer-motion";

interface StockFeedCardProps {
  emoji: string;
  ticker: string;
  sentiment: "Bullish" | "Long" | "Watching";
  target?: string;
  reason: string;
  likes: number;
  comments: number;
  author: string;
  index: number;
  total: number;
}

const sentimentColors = {
  Bullish: "bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30",
  Long: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Watching: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
};

export default function StockFeedCard({
  emoji,
  ticker,
  sentiment,
  target,
  reason,
  likes,
  comments,
  author,
  index,
  total,
}: StockFeedCardProps) {
  const xOffset = (index - (total - 1) / 2) * 30;
  const yOffset = index * 20;
  const scale = 1 - index * 0.03;
  const zIndex = total - index;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 20 }}
      animate={{ opacity: 1, x: xOffset, y: yOffset }}
      transition={{
        duration: 0.8,
        delay: 0.6 + index * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      style={{ zIndex }}
      className="absolute w-[280px] sm:w-[320px]"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
        }}
        className="relative group cursor-pointer"
      >
        {/* Glow effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#00C853]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

        {/* Card */}
        <div className="relative bg-[#0D1525]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-[#00C853]/30 transition-all duration-300 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span className="font-bold text-white text-sm">{ticker}</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                sentimentColors[sentiment]
              }`}
            >
              {sentiment === "Bullish" ? "🚀 Bullish" : sentiment === "Long" ? "📈 Long" : "👀 Watching"}
            </span>
          </div>

          {/* Target */}
          {target && (
            <div className="mb-2">
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Target</span>
              <p className="text-lg font-bold text-[#00C853]">{target}</p>
            </div>
          )}

          {/* Reason */}
          <p className="text-sm text-white/70 leading-relaxed mb-4">{reason}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 hover:text-[#00C853] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                </svg>
                {likes}
              </span>
              <span className="flex items-center gap-1 hover:text-[#00C853] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {comments}
              </span>
            </div>
            <span className="text-white/30">@{author}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}