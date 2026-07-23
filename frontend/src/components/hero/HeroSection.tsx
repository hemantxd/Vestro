"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import StockFeedCard from "./StockFeedCard";

const feedItems = [
  {
    emoji: "🚀",
    ticker: "NVDA",
    sentiment: "Bullish" as const,
    target: "$210",
    reason: "AI demand continues growing. Data center revenue up 400% YoY.",
    likes: 124,
    comments: 38,
    author: "tradingwizard",
  },
  {
    emoji: "📈",
    ticker: "TSLA",
    sentiment: "Long" as const,
    reason: "Watching earnings closely. Energy storage is the hidden gem.",
    likes: 89,
    comments: 42,
    author: "valuehunter",
  },
  {
    emoji: "👀",
    ticker: "AAPL",
    sentiment: "Watching" as const,
    target: "$260",
    reason: "Services margin expansion is underappreciated by the market.",
    likes: 56,
    comments: 21,
    author: "quantjane",
  },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Stable random particles - generated once with rounded values for SSR consistency
  const particles = useMemo(() => {
    const positions = [
      [35, 25], [53, 46], [98, 35], [42, 96], [19, 86],
      [41, 97], [78, 67], [48, 98], [3, 9], [57, 11],
      [47, 29], [45, 18], [30, 37], [19, 67], [9, 89],
      [86, 17], [37, 38], [36, 76], [11, 36], [96, 40],
    ];
    const durations = [3.2, 4.1, 5.0, 3.5, 4.3, 5.5, 3.8, 4.7, 5.2, 3.0,
                       4.5, 3.3, 5.8, 4.0, 3.6, 5.3, 4.2, 3.1, 4.8, 5.6];
    const delays = [0.1, 0.8, 1.5, 0.3, 1.0, 1.8, 0.5, 1.2, 0.0, 0.7,
                    1.4, 0.2, 0.9, 1.6, 0.4, 1.1, 0.6, 1.3, 0.0, 0.5];
    return positions.map(([l, t], i) => ({
      left: `${l}%`,
      top: `${t}%`,
      duration: durations[i],
      delay: delays[i],
    }));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0B1220]"
    >
      {/* Parallax Background Grid */}
      <motion.div
        style={{ y: backgroundY, opacity }}
        className="absolute inset-0 bg-grid"
      />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00C853]/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00C853]/3 rounded-full blur-[100px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00C853]/30 rounded-full"
            style={{
              left: p.left,
              top: p.top,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-32 lg:py-40">
          {/* Left Side - Content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
              The future of social trading
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-4"
            >
              <span className="text-white">The Social Network</span>
              <br />
              <span className="text-[#00C853]">for Traders</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-lg sm:text-xl text-white/50 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Share ideas. Build conviction. Learn from real investors.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <a
                href="/join"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00C853] text-[#0B1220] font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,83,0.4)]"
              >
                <span className="relative z-10">Join Beta</span>
                <svg
                  className="relative z-10 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </a>
              <a
                href="#vision"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-medium transition-all duration-200"
              >
                Explore Vision
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
              className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-xs text-white/30"
            >
              <div className="flex -space-x-2">
                {[
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=trader1",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=trader2",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=trader3",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=trader4",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0B1220] bg-white/10 overflow-hidden"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span>
                <span className="text-white/60 font-semibold">500+</span> early
                traders joined
              </span>
            </motion.div>
          </div>

          {/* Right Side - Floating Feed Cards */}
          <div className="flex-1 relative w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="relative w-[320px] sm:w-[360px] h-[500px]">
              {feedItems.map((item, index) => (
                <StockFeedCard
                  key={item.ticker}
                  {...item}
                  index={index}
                  total={feedItems.length}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-6 rounded-full border border-white/20 flex justify-center pt-1.5"
        >
          <motion.div className="w-1 h-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}