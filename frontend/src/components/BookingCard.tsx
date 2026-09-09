import React, { useState } from 'react';
import {
  Plane,
  Building2,
  Sparkles,
  ArrowUpDown,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const BookingCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'experiences'>('flights');
  const [fromCity, setFromCity] = useState('New York (JFK)');
  const [toCity, setToCity] = useState('Bali, Indonesia');
  const [dates, setDates] = useState('May 20 – May 30');
  const [travelers, setTravelers] = useState('2 Adults');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchFeedback(`Found 14 available ${activeTab} for ${toCity}!`);
      setTimeout(() => setSearchFeedback(null), 4000);
    }, 600);
  };

  return (
    <div className="w-full max-w-md bg-black border-[1.5px] border-white/20 rounded-xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative z-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-[0.05em] text-white">
            Where to next?
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
            BOOKING // 01
          </span>
        </div>
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/50 mt-1">
          Find your perfect escape
        </p>
      </div>

      {/* 3 Tabs: Flights, Hotels, Experiences */}
      <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('flights')}
          className={`flex items-center gap-2 pb-1 text-xs uppercase tracking-[0.15em] font-bold transition-colors relative cursor-pointer ${
            activeTab === 'flights' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Flights</span>
          {activeTab === 'flights' && (
            <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hotels')}
          className={`flex items-center gap-2 pb-1 text-xs uppercase tracking-[0.15em] font-bold transition-colors relative cursor-pointer ${
            activeTab === 'hotels' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hotels</span>
          {activeTab === 'hotels' && (
            <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('experiences')}
          className={`flex items-center gap-2 pb-1 text-xs uppercase tracking-[0.15em] font-bold transition-colors relative cursor-pointer ${
            activeTab === 'experiences' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Experiences</span>
          {activeTab === 'experiences' && (
            <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-white" />
          )}
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-3.5">
        {/* From Field */}
        <div className="relative rounded-lg bg-white/[0.02] border border-white/15 p-3 hover:border-white/35 focus-within:border-white transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-white inline-block" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">
                  From
                </span>
              </div>
              <input
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full bg-transparent text-white font-medium text-sm focus:outline-none placeholder-white/30 tracking-wide"
                placeholder="Departure city"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To"
              className="w-8 h-8 rounded-md border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white flex items-center justify-center transition cursor-pointer ml-2 shrink-0 active:scale-95"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* To Field */}
        <div className="rounded-lg bg-white/[0.02] border border-white/15 p-3 hover:border-white/35 focus-within:border-white transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-white/50 inline-block" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">
              To
            </span>
          </div>
          <input
            type="text"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full bg-transparent text-white font-medium text-sm focus:outline-none placeholder-white/30 tracking-wide"
            placeholder="Destination city"
          />
        </div>

        {/* Two-Column Grid: Dates & Travelers */}
        <div className="grid grid-cols-2 gap-3">
          {/* Dates */}
          <div className="rounded-lg bg-white/[0.02] border border-white/15 p-3 hover:border-white/35 focus-within:border-white transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3 h-3 text-white/50" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">Dates</span>
            </div>
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="w-full bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none"
            />
          </div>

          {/* Travelers */}
          <div className="rounded-lg bg-white/[0.02] border border-white/15 p-3 hover:border-white/35 focus-within:border-white transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3 h-3 text-white/50" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">Travelers</span>
            </div>
            <input
              type="text"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button: Search Flights / Hotels / Experiences - Elegant Dark CTA */}
        <button
          type="submit"
          disabled={isSearching}
          className="w-full mt-2 py-4 px-6 border-[1.5px] border-white text-white bg-transparent hover:bg-white hover:text-black font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer group active:scale-[0.98] disabled:opacity-60"
        >
          {isSearching ? (
            <span className="inline-block tracking-[0.15em] uppercase animate-pulse">Searching best rates...</span>
          ) : (
            <>
              <span>
                Search {activeTab === 'flights' ? 'Flights' : activeTab === 'hotels' ? 'Hotels' : 'Experiences'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Feedback Message */}
        {searchFeedback && (
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white bg-white/5 px-3 py-2.5 rounded-md border border-white/20 mt-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{searchFeedback}</span>
          </div>
        )}
      </form>
    </div>
  );
};
