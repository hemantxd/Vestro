"use client";

import { motion } from "framer-motion";

const traders = [
  {
    username: "tradingwizard",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tradingwizard",
    role: "Swing Trader",
    post: "NVDA breaking resistance. The AI trade is just getting started. Accumulating on dips.",
    ticker: "NVDA",
    color: "text-[#00C853]",
    bg: "bg-[#00C853]/10",
    followers: "12.4k",
  },
  {
    username: "valuehunter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=valuehunter",
    role: "Value Investor",
    post: "Accumulating Google. The market is sleeping on their AI infrastructure spend. Long term play.",
    ticker: "GOOGL",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    followers: "8.7k",
  },
  {
    username: "quantjane",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quantjane",
    role: "Quant Analyst",
    post: "My models are flagging a rotation into energy. Correlations are breaking down. Watch XLE.",
    ticker: "XLE",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    followers: "6.2k",
  },
  {
    username: "cryptosage",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptosage",
    role: "Crypto Trader",
    post: "BTC dominance is dropping. Alt season is loading. Layer 2s are the play this cycle.",
    ticker: "BTC",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    followers: "15.1k",
  },
];

export default function CommunitySection() {
  return (
    <section id="community" className="relative py-32 sm:py-40 bg-[#0B1220]">
      {/* Section header */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-xs font-medium mb-4">
            Community
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight">
            Meet your{" "}
            <span className="text-[#00C853]">community</span>
          </h2>
          <p className="text-white/50 text-lg mt-4 max-w-xl mx-auto">
            Connect with traders who share their process, not just their P&L.
          </p>
        </motion.div>
      </div>

      {/* Trader Cards Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {traders.map((trader, i) => (
            <motion.div
              key={trader.username}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="relative bg-[#0D1525]/80 border border-white/5 rounded-2xl p-6 transition-all duration-500 hover:border-[#00C853]/20 hover:shadow-lg hover:shadow-[#00C853]/5">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/10">
                    <img src={trader.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">@{trader.username}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${trader.bg} ${trader.color} font-medium`}>
                        {trader.ticker}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{trader.role} · {trader.followers} followers</p>
                  </div>
                </div>

                {/* Post */}
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  &ldquo;{trader.post}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1 hover:text-[#00C853] transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                    </svg>
                    Like
                  </span>
                  <span className="flex items-center gap-1 hover:text-[#00C853] transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Reply
                  </span>
                  <span className="flex items-center gap-1 hover:text-[#00C853] transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 2v4" />
                      <path d="M7 2v4" />
                      <path d="M3 10h18" />
                      <path d="M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                    </svg>
                    Follow
                  </span>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent via-[#00C853]/[0.02] to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}