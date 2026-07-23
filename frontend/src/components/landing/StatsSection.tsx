"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function AnimatedCounter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.5 1"],
  });
  const count = useTransform(scrollYProgress, [0, 1], [0, end]);
  const rounded = useTransform(count, (v) => Math.round(v));

  return (
    <div ref={ref} className="text-center">
      <motion.div className="text-4xl sm:text-5xl font-bold text-[#00C853]">
        <motion.span>{rounded}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-sm sm:text-base text-white/50 mt-2">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative py-24 sm:py-32 bg-[#0B1220] border-y border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div style={{ opacity, y }} className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          <AnimatedCounter end={10} suffix="k+" label="Future Traders" />
          <AnimatedCounter end={100} suffix="k+" label="Ideas Shared" />
          <AnimatedCounter end={24} suffix="/7" label="Market Discussion" />
        </motion.div>
      </div>
    </section>
  );
}