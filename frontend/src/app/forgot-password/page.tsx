"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <div className="w-12 h-12 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            We sent a 6-digit code to <strong className="text-white/70">{email}</strong>.
            It expires in 15 minutes.
          </p>
          <Link
            href="/reset-password"
            className="inline-block px-6 py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-bold hover:bg-[#00E060] transition-colors"
          >
            Enter code
          </Link>
          <div className="mt-6 text-xs text-white/30">
            <button onClick={() => setSent(false)} className="text-[#00C853] hover:text-[#00E060] transition-colors">
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fgLogo" x1="180" y1="380" x2="380" y2="120">
                  <stop offset="0%" stopColor="#00C853" />
                  <stop offset="100%" stopColor="#1DE46D" />
                </linearGradient>
              </defs>
              <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
              <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#fgLogo)" />
            </svg>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">VES</span>
              <span className="text-[#00C853]">TRO</span>
            </span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <h1 className="text-lg font-bold text-white mb-1">Forgot password</h1>
          <p className="text-sm text-white/50 mb-6">
            Enter the email address you used to sign up and we&apos;ll send you a code to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/50 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-bold hover:bg-[#00E060] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-[#00C853] hover:text-[#00E060] transition-colors">
              &larr; Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}