"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  MessageCircle,
  Shield,
  Building2,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Share Trade Ideas",
    description: "Post your analysis with price targets, charts, and reasoning. Get feedback from the community.",
    gradient: "from-[#00C853]/20 to-transparent",
    border: "border-[#00C853]/20",
    iconColor: "text-[#00C853]",
  },
  {
    icon: Users,
    title: "Follow Investors",
    description: "Build a feed of traders you trust. Learn from their strategies and track records.",
    gradient: "from-blue-500/20 to-transparent",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: MessageCircle,
    title: "Discuss Stocks",
    description: "Real-time discussions on specific stocks, sectors, and market movements.",
    gradient: "from-purple-500/20 to-transparent",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Build Reputation",
    description: "Earn reputation points for quality contributions. Verified traders get highlighted.",
    gradient: "from-yellow-500/20 to-transparent",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Building2,
    title: "Market Communities",
    description: "Join communities for specific markets — crypto, equities, forex, and more.",
    gradient: "from-pink-500/20 to-transparent",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: MessageSquare,
    title: "Real Conversations",
    description: "No algorithms. No noise. Just authentic discussions from real investors.",
    gradient: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 sm:py-40 bg-[#0B1220]">
      {/* Section header */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] text-xs font-medium mb-4">
            Everything you need
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight">
            Built for{" "}
            <span className="text-[#00C853]">traders</span>
            <br />
            <span className="text-white/60">by traders</span>
          </h2>
        </motion.div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative"
            >
              <div
                className={`relative h-full bg-gradient-to-b ${feature.gradient} rounded-2xl border ${feature.border} p-6 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00C853]/5`}
              >
                {/* Background shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}