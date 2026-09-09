import React, { useState } from 'react';
import { Shield, ArrowDown, Navigation, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EvacuationSection: React.FC = () => {
  const [routeActive, setRouteActive] = useState(true);

  return (
    <section
      id="section-evacuation"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Focused Narrative (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>06 / EVACUATION ACTION</span>
          </div>

          {/* Headline */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            KNOWING THE RISK
            <br />
            ISN'T ENOUGH.
          </h2>

          {/* Short 2-3 line explanation */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Actionable warnings pair immediate alerts with dynamic evacuation corridors,
            directing threatened residents along stable ridge-lines to reinforced shelters.
          </p>

          <div className="p-3.5 rounded-xl glass-panel border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono-code mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OPTIMIZED CORRIDOR ROUTING</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Evacuation routes bypass predicted landslide runoff paths and low-lying choke points.
            </p>
          </div>
        </div>

        {/* Right Column: Animated Route Flow & Compact Shelter Card (approx 45% width) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl text-left">
            {/* Ambient Emerald Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono-code">
                  EVACUATION CORRIDOR
                </span>
              </div>
              <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                ROUTE CLEAR
              </span>
            </div>

            {/* Animated Route Sequence: RISK ZONE -> SAFE ROUTE -> SHELTER */}
            <div className="space-y-1.5 mb-5">
              {/* 1. Risk Zone */}
              <div className="px-3.5 py-2 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-300 font-mono-code block">
                      RISK ZONE
                    </span>
                    <span className="text-[9.5px] font-mono-code text-white/40">
                      Sector A Slip Perimeter
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono-code text-red-400 font-bold uppercase">HAZARD</span>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              </div>

              {/* 2. Safe Route */}
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono-code block">
                      SAFE ROUTE
                    </span>
                    <span className="text-[9.5px] font-mono-code text-white/40">
                      North Contour Ridge Bypass
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono-code text-emerald-400 font-bold uppercase">STABLE</span>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              </div>

              {/* 3. Shelter */}
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white font-mono-code block">
                      SHELTER
                    </span>
                    <span className="text-[9.5px] font-mono-code text-white/40">
                      Reinforced Community Complex
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono-code text-white/80 font-bold uppercase">SECURE</span>
              </div>
            </div>

            {/* Below it: Compact Shelter Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-heading uppercase tracking-wide">
                  COMMUNITY RELIEF CENTRE
                </span>
                <span className="text-[9.5px] font-mono-code text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  OPEN
                </span>
              </div>

              {/* Metrics: 2.4 KM | CAPACITY 500 | OCCUPANCY 183 */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 mb-3 text-center">
                <div>
                  <span className="text-[9px] font-mono-code uppercase text-white/40 block">DISTANCE</span>
                  <span className="text-sm font-extrabold font-heading text-white">2.4 KM</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono-code uppercase text-white/40 block">CAPACITY</span>
                  <span className="text-sm font-extrabold font-heading text-white">500</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono-code uppercase text-white/40 block">OCCUPANCY</span>
                  <span className="text-sm font-extrabold font-heading text-emerald-400">183</span>
                </div>
              </div>

              {/* View Evacuation Button */}
              <button
                onClick={() => setRouteActive(!routeActive)}
                className="w-full py-2.5 rounded-xl border border-white bg-white text-black hover:bg-emerald-400 hover:border-emerald-400 font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>VIEW EVACUATION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
