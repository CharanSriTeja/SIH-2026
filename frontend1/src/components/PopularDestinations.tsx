import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { POPULAR_DESTINATIONS, Destination } from '../data/destinations';

interface PopularDestinationsProps {
  onSelectDestination?: (dest: Destination) => void;
  onViewAllClick?: () => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  onSelectDestination,
  onViewAllClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full relative z-20">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-[2px] bg-white inline-block" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white">
            Popular Destinations
          </h3>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          View all //
        </button>
      </div>

      {/* Carousel Container with side arrows */}
      <div className="relative group/carousel">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          aria-label="Previous destination"
          className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-md bg-black border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Cards Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onSelectDestination?.(dest)}
              className="relative w-[150px] sm:w-[170px] lg:w-[185px] h-[130px] sm:h-[145px] rounded-xl overflow-hidden shrink-0 group border border-white/20 hover:border-white transition-all duration-300 cursor-pointer shadow-lg bg-black"
            >
              {/* Destination Image */}
              <img
                src={dest.imageUrl}
                alt={dest.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-105"
              />

              {/* Dark Gradient Overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              {/* Bottom Content Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-white leading-tight">
                    {dest.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/60 font-medium mt-0.5">
                    {dest.country}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/30">
                  <Star className="w-2.5 h-2.5 fill-white text-white" />
                  <span className="text-[10px] font-bold text-white tracking-wider">
                    {dest.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          aria-label="Next destination"
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-md bg-black border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
