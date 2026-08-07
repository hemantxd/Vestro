"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="loginLogo" x1="180" y1="380" x2="380" y2="120">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#1DE46D" />
              </linearGradient>
            </defs>
            <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
            <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#loginLogo)" />
          </svg>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">VES</span>
            <span className="text-[#00C853]">TRO</span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-white text-center mb-8">Sign in to Vestro</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <div className="mb-6">
          {googleLoading ? (
            <div className="w-full py-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-white/50">Connecting...</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) {
                    setError("Google authentication failed");
                    return;
                  }
                  setGoogleLoading(true);
                  setError("");
                  try {
                    await googleLogin(credentialResponse.credential);
                    router.push("/home");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Google sign in failed");
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                onError={() => setError("Google sign in failed")}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="pill"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or sign in with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white/60 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white/60 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#00C853] text-[#0B1220] font-semibold text-sm hover:bg-[#00E060] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/30">
          {"Don't have an account? "}
          <Link href="/register" className="text-[#00C853] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}