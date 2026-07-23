"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const problems = [
  { platform: "Twitter", issue: "is noisy.", color: "text-blue-400" },
  { platform: "Discord", issue: "is fragmented.", color: "text-indigo-400" },
  { platform: "Reddit", issue: "is chaotic.", color: "text-orange-400" },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, 0]);

  return (
    <section
      ref={sectionRef}
      id="why"
      className="relative py-32 sm:py-40 bg-[#0B1220] overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00C853]/3 rounded-full blur-[150px]" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          style={{ opacity, y }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight mb-8"
        >
          <span className="text-white">Why </span>
          <span className="text-[#00C853]">Vestro</span>
          <span className="text-white"> Exists</span>
        </motion.h2>

        <motion.div style={{ opacity, y }} className="space-y-4 mb-12">
          {problems.map((p, i) => (
            <motion.p
              key={p.platform}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold"
            >
              <span className={p.color}>{p.platform}</span>{" "}
              <span className="text-white/40">{p.issue}</span>
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          style={{ opacity, y }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="inline-block px-6 py-3 rounded-full bg-[#00C853]/10 border border-[#00C853]/20">
            <p className="text-lg sm:text-xl text-white/80 font-medium">
              Vestro is built specifically{" "}
              <span className="text-[#00C853]">for investors and traders.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}