"use client";

import Navbar from "@/components/hero/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CommunitySection from "@/components/landing/CommunitySection";
import VisionSection from "@/components/landing/VisionSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0B1220] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <FeaturesSection />
      <CommunitySection />
      <VisionSection />
      <CTASection />
      <Footer />
    </main>
  );
}