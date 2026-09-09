import React from 'react';
import { ArrowRight, Compass, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onHowItWorksClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onHowItWorksClick,
}) => {
  return (
    <section
      id="section-hero"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-between pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      {/* Central Content */}
      <div className="flex flex-col items-start max-w-2xl text-left my-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono-code font-semibold text-white/80">
            AI-POWERED LANDSLIDE INTELLIGENCE
          </span>
        </div>

        {/* Main Headline with responsive clamp */}
        <h1 className="text-[clamp(2.4rem,4.5vw,4.2rem)] font-extrabold tracking-[-0.03em] uppercase text-white font-heading leading-[1.02] mb-5 select-none">
          PREDICT THE DANGER.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
            PROTECT THE COMMUNITY.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed max-w-[540px] mb-8">
          Turning environmental signals into early, location-specific landslide risk
          intelligence for vulnerable communities across North-East India.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl border border-white bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:border-emerald-400 transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.15)] group active:scale-95"
          >
            <span>EXPLORE RISK</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onHowItWorksClick}
            className="flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl border border-white/20 bg-white/[0.03] hover:bg-white/10 hover:border-white/50 text-white font-semibold text-xs uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>HOW IT WORKS</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Spatial Bar */}
      <div className="w-full pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 text-xs font-mono-code text-white/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>REGION: BARIAL & PATKAI RANGES</span>
          </div>
          <span className="hidden md:inline text-white/20">•</span>
          <span className="hidden md:inline">12 ACTIVE VULNERABLE DISTRICTS</span>
        </div>

        <button
          onClick={onHowItWorksClick}
          className="flex items-center gap-1.5 uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer group text-[11px]"
        >
          <span>SCROLL TO DISCOVER</span>
          <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
};
