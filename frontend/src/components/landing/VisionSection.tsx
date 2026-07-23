"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function VisionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative py-40 sm:py-56 bg-[#0B1220] overflow-hidden"
    >
      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12vw] font-black text-white/[0.015] leading-none tracking-tighter">
          VESTRO
        </span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0B1220] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1220] to-transparent" />

      <motion.div
        style={{ opacity, y, scale }}
        className="relative max-w-5xl mx-auto px-6 text-center"
      >
        <p className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white">
          {"We're building"}
          <br />
          <span className="text-[#00C853]">{"the internet's home"}</span>
          <br />
          <span className="text-white/80">for investors.</span>
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 text-lg text-white/30 max-w-lg mx-auto"
        >
          A place where conviction meets community. Where every trade idea is a conversation starter.
        </motion.p>
      </motion.div>
    </section>
  );
}