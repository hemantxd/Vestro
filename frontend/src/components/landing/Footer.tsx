"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#0B1220]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="24"
              height="24"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <defs>
                <linearGradient id="footerLogo" x1="180" y1="380" x2="380" y2="120">
                  <stop offset="0%" stopColor="#00C853" />
                  <stop offset="100%" stopColor="#1DE46D" />
                </linearGradient>
              </defs>
              <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
              <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#footerLogo)" />
            </svg>
            <span className="text-sm font-bold tracking-tight">
              <span className="text-white">VES</span>
              <span className="text-[#00C853]">TRO</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-white/40 hover:text-white/60 transition-colors">Features</a>
            <a href="#community" className="text-xs text-white/40 hover:text-white/60 transition-colors">Community</a>
            <a href="#vision" className="text-xs text-white/40 hover:text-white/60 transition-colors">Vision</a>
            <a href="https://github.com/hemantxd/Vestro" className="text-xs text-white/40 hover:text-white/60 transition-colors">GitHub</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Vestro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}