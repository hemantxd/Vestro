"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import { useAuthStore } from "@/store/auth-store";

export default function LandingPageRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Once auth initialization finishes, redirect logged-in users to /home
    if (!isLoading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isLoading, isAuthenticated, router]);

  // While checking auth state, show a minimal loading screen to avoid
  // flashing the landing page for authenticated users.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → show landing page.
  return <LandingPage />;
}