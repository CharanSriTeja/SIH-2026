import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface HeroContentProps {
  onExploreClick?: () => void;
  onWatchVideoClick?: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  onExploreClick,
  onWatchVideoClick,
}) => {
  return (
    <div className="flex flex-col items-start max-w-2xl text-left z-20">
      {/* Top Eyebrow: Horizontal Line + THE WORLD IS WAITING */}
      <div className="flex items-center gap-3.5 mb-6">
        <span className="w-8 h-[1.5px] bg-white" />
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-bold text-white/70">
          THE WORLD IS WAITING
        </span>
      </div>

      {/* Main Headline - Bold, architectural, high-contrast display */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-extrabold tracking-[-0.04em] uppercase text-white leading-[0.92] mb-7 select-none">
        Adventures
        <br />
        That Stay
        <br />
        With You
      </h1>

      {/* Paragraph Subtitle - Elegant Dark subheadline */}
      <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed max-w-lg mb-9">
        Discover breathtaking destinations, unique experiences and unforgettable
        memories across the globe.
      </p>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-5 sm:gap-7">
        {/* Primary CTA - Elegant Dark Architectural Button */}
        <button
          onClick={onExploreClick}
          className="flex items-center gap-3 border-[1.5px] border-white px-7 py-4 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white bg-transparent hover:bg-white hover:text-black transition-all duration-200 cursor-pointer group active:scale-95"
        >
          <span>Explore Destinations</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Secondary Action: Watch Video */}
        <button
          onClick={onWatchVideoClick}
          className="flex items-center gap-3.5 text-left group cursor-pointer py-2 px-3 border border-white/15 hover:border-white/40 transition-colors"
        >
          <div className="w-10 h-10 border border-white/60 bg-white/5 flex items-center justify-center text-white group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-200">
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-white leading-tight">
              Watch Video
            </span>
            <span className="text-[10px] text-white/50 tracking-wider uppercase mt-0.5">
              See Wanderlust in action
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

