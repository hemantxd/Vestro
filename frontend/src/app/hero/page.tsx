import Navbar from "@/components/hero/Navbar";
import HeroSection from "@/components/hero/HeroSection";

export const metadata = {
  title: "Vestro — The Social Network for Traders",
  description:
    "Share ideas. Build conviction. Learn from real investors. Vestro is the social network built specifically for traders and investors.",
  openGraph: {
    title: "Vestro — The Social Network for Traders",
    description:
      "Share ideas. Build conviction. Learn from real investors.",
  },
};

export default function HeroPage() {
  return (
    <main className="min-h-screen bg-[#0B1220] overflow-x-hidden">
      <Navbar />
      <HeroSection />
    </main>
  );
}