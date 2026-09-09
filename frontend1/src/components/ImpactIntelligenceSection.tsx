import React, { useState } from 'react';
import { Users, GraduationCap, Hospital, Route, MapPin, Eye } from 'lucide-react';
import { RISK_ZONES } from '../data/mockData';
import { RiskZone } from '../types';

export const ImpactIntelligenceSection: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<RiskZone>(RISK_ZONES[0]);

  return (
    <section
      id="section-impact"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Typography & Sector Selector (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>04 / IMPACT INTELLIGENCE</span>
          </div>

          {/* Headline */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            A RISK ZONE
            <br />
            ISN'T JUST A RED AREA.
          </h2>

          {/* Short 2-3 line explanation */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Once an active hazard zone is identified, the system maps which communities,
            lifeline roads, and critical civic infrastructure fall directly in harm's way.
          </p>

          {/* Sector Selector & Coordinates Pill */}
          <div className="p-3.5 rounded-2xl glass-panel border border-white/15 bg-white/[0.02]">
            <span className="text-[9.5px] font-mono-code uppercase tracking-wider text-white/40 block mb-2">
              ACTIVE SECTOR MONITOR:
            </span>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {RISK_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                    selectedZone.id === zone.id
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {zone.name.split('—')[0]}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-code text-white/50 pt-2 border-t border-white/10">
              <span>COORDS: {selectedZone.coordinates[0]}°N, {selectedZone.coordinates[1]}°E</span>
              <span className="text-emerald-400 font-semibold">{selectedZone.state}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Geographic Visualization with Floating Statistics (approx 50% width) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
          <div className="relative w-full max-w-xl h-72 sm:h-80 md:h-[380px] rounded-3xl bg-[#080C14]/90 border border-white/20 p-5 shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col justify-between">
            {/* Topographic Background Contour Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="topo-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo-grid)" />
              {/* Elevation contour circles */}
              <circle cx="55%" cy="50%" r="130" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="55%" cy="50%" r="90" fill="none" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="1.2" />
              <circle cx="55%" cy="50%" r="50" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1.5" />
            </svg>

            {/* Top Map Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping-slow" />
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-red-400 font-bold">
                  HAZARD PERIMETER // ACTIVE IMPACT ZONE
                </span>
              </div>
              <span className="text-[9.5px] font-mono-code text-white/50 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
                SCALE: 1:5000
              </span>
            </div>

            {/* Central Animated Center Pin */}
            <div className="relative z-10 my-auto flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 animate-ping-slow" />
                <div className="absolute w-8 h-8 rounded-full bg-red-500/30 border border-red-400 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Four Compact Floating Statistics Elements (Overlay) */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
              {/* 312 Residents */}
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="text-[9px] font-mono-code uppercase text-white/50">RESIDENTS</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold font-heading text-white leading-tight">
                  {selectedZone.peopleAtRisk}
                </div>
              </div>

              {/* 1 School */}
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <GraduationCap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-[9px] font-mono-code uppercase text-white/50">SCHOOL</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold font-heading text-white leading-tight">
                  {selectedZone.infrastructure.schools} School
                </div>
              </div>

              {/* 1 Healthcare Facility */}
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Hospital className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-[9px] font-mono-code uppercase text-white/50">HEALTH</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold font-heading text-white leading-tight">
                  {selectedZone.infrastructure.hospitals} Facility
                </div>
              </div>

              {/* 2 Roads */}
              <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Route className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="text-[9px] font-mono-code uppercase text-white/50">LIFELINES</span>
                </div>
                <div className="text-base sm:text-lg font-extrabold font-heading text-white leading-tight">
                  {selectedZone.infrastructure.roadSegments} Roads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
