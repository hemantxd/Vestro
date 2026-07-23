"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "GitHub", href: "https://github.com/hemantxd/Vestro" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0B1220]/80 backdrop-blur-xl border-b border-[#00C853]/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <svg
            width="32"
            height="32"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="navLogo" x1="180" y1="380" x2="380" y2="120">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#1DE46D" />
              </linearGradient>
            </defs>
            <path
              d="M120 160 L220 360 L270 360 L170 160 Z"
              fill="#FFFFFF"
            />
            <path
              d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z"
              fill="url(#navLogo)"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">VES</span>
            <span className="text-[#00C853]">TRO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors duration-200 hidden sm:block"
          >
            Login
          </Link>
          <Link
            href="/join"
            className="text-sm font-medium px-4 py-2 rounded-full bg-[#00C853] text-[#0B1220] hover:bg-[#00E060] transition-all duration-200 shadow-lg shadow-[#00C853]/20"
          >
            Join Vestro
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}