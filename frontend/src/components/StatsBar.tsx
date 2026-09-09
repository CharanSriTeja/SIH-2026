import React from 'react';
import { Star } from 'lucide-react';

export const StatsBar: React.FC = () => {
  return (
    <div className="w-full border-t border-white/15 pt-7 pb-7 relative z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 items-center justify-between text-left">
          {/* Stat 1: 500+ Destinations */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              500+
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.12em] font-semibold">
              Destinations
            </span>
          </div>

          {/* Stat 2: 10K+ Happy Travelers */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              10K+
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.12em] font-semibold">
              Happy Travelers
            </span>
          </div>

          {/* Stat 3: 150+ Travel Experts */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              150+
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.12em] font-semibold">
              Travel Experts
            </span>
          </div>

          {/* Stat 4: 4.9 Average Rating + Stars */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                4.9
              </span>
              <div className="flex items-center gap-0.5 text-white">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-white text-white" />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.12em] font-semibold">
              Average Rating
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

