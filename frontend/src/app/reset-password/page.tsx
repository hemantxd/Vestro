"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email.trim(), otp.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <div className="w-12 h-12 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Password reset</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-bold hover:bg-[#00E060] transition-colors"
          >
            Log in
          </Link>
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
                <linearGradient id="rsLogo" x1="180" y1="380" x2="380" y2="120">
                  <stop offset="0%" stopColor="#00C853" />
                  <stop offset="100%" stopColor="#1DE46D" />
                </linearGradient>
              </defs>
              <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
              <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#rsLogo)" />
            </svg>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">VES</span>
              <span className="text-[#00C853]">TRO</span>
            </span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <h1 className="text-lg font-bold text-white mb-1">Reset password</h1>
          <p className="text-sm text-white/50 mb-6">
            Enter the code sent to your email along with your new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-white/50 mb-1.5">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-xs font-semibold text-white/50 mb-1.5">
                6-digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm text-center tracking-[8px] font-mono focus:outline-none focus:border-[#00C853]/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-white/50 mb-1.5">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
              />
            </div>
<div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-white/50 mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={
                loading || !email.trim() || otp.length !== 6 || !password || !confirmPassword
              }
              className="w-full py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] text-sm font-bold hover:bg-[#00E060] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset password"}
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