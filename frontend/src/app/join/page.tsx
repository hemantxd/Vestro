import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
          <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="joinLogo" x1="180" y1="380" x2="380" y2="120">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#1DE46D" />
              </linearGradient>
            </defs>
            <path d="M120 160 L220 360 L270 360 L170 160 Z" fill="#FFFFFF" />
            <path d="M220 360 L345 120 L300 100 L405 40 L410 165 L370 140 L270 360 Z" fill="url(#joinLogo)" />
          </svg>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">VES</span>
            <span className="text-[#00C853]">TRO</span>
          </span>
        </Link>

        <h1 className="text-3xl font-bold text-white mb-4">Join the Beta</h1>
        <p className="text-white/50 mb-8">
          {"We're still crafting the perfect experience. Leave your email and we'll notify you when we launch."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#00C853]/50 transition-colors"
          />
          <button className="px-6 py-3 rounded-full bg-[#00C853] text-[#0B1220] font-semibold text-sm hover:bg-[#00E060] transition-colors whitespace-nowrap">
            Get Notified
          </button>
        </div>
        <p className="mt-4 text-xs text-white/20">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}