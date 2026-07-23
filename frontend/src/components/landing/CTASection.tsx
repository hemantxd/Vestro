"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section id="cta" className="relative py-32 sm:py-40 bg-[#0B1220] overflow-hidden">
      {/* Animated glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[400px] h-[400px] bg-[#00C853]/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-xs font-medium mb-6">
            Get early access
          </span>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-4">
            Join <span className="text-[#00C853]">Vestro</span> Today
          </h2>

          <p className="text-lg sm:text-xl text-white/50 max-w-md mx-auto mb-10">
            Be early. Shape the future community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/join"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#00C853] text-[#0B1220] font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,200,83,0.5)]"
            >
              <span className="relative z-10">Join Beta</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
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
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.a>

            <a
              href="https://github.com/hemantxd/Vestro"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-base font-medium transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          <p className="mt-6 text-xs text-white/20">
            No spam. No noise. Just early access when we launch.
          </p>
        </motion.div>
      </div>
    </section>
  );
}