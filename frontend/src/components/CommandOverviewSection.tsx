import React from 'react';
import { ShieldAlert, ArrowRight, Activity, MapPin, Radio, Users, AlertTriangle, Building2, ChevronDown } from 'lucide-react';

interface CommandOverviewSectionProps {
  onEnterCommandCenter: () => void;
  onExploreSystem: () => void;
}

export const CommandOverviewSection: React.FC<CommandOverviewSectionProps> = ({
  onEnterCommandCenter,
  onExploreSystem,
}) => {
  return (
    <section
      id="section-overview"
      className="relative min-h-screen lg:min-h-0 lg:h-screen flex flex-col justify-center pt-20 lg:pt-16 pb-6 px-4 sm:px-6 lg:px-8 bg-[#080C14]"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Mission & Core Messaging */}
          <div className="lg:col-span-6 space-y-3.5 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono-code font-semibold uppercase tracking-[0.2em]">
                AI-POWERED LANDSLIDE INTELLIGENCE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white font-heading uppercase leading-[1.08]">
              PREDICT THE RISK.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                PROTECT THE COMMUNITY.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
              BHURAKSHA 2.0 is an AI-powered monitoring and early-warning platform designed to identify landslide-prone areas, understand their impact, and help authorities act before risk becomes disaster.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1.5">
              <button
                onClick={onEnterCommandCenter}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreSystem}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-white font-mono-code font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                <span>EXPLORE THE SYSTEM</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>

            {/* Region Footnote */}
            <div className="pt-2.5 flex items-center gap-4 text-[11px] font-mono-code text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>NORTH EAST INDIA</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>CONTINUOUS MONITORING</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Command-Center Preview */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-white/15 bg-[#0D1424] p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                    OPERATIONAL DASHBOARD
                  </span>
                </div>
                <span className="text-[9px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                  SYSTEM PREVIEW / DEMO DATA
                </span>
              </div>

              {/* Regional Risk Highlight Banner */}
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono-code uppercase tracking-wider text-red-300">
                    REGIONAL RISK
                  </div>
                  <div className="text-xl font-bold font-heading text-red-400 uppercase tracking-wide">
                    HIGH
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono-code text-white/50 uppercase">
                    SECTOR ALERT LEVEL
                  </div>
                  <div className="text-xs font-mono-code text-red-300 font-bold">
                    CRITICAL WATCH 24H
                  </div>
                </div>
              </div>

              {/* Four Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Metric 1: Active Risk Zones */}
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between text-white/50 mb-0.5">
                    <span className="text-[9px] font-mono-code uppercase tracking-wider">
                      ACTIVE RISK ZONES
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    12
                  </div>
                  <div className="text-[9px] font-mono-code text-amber-400/80 mt-0.5">
                    4 ESCALATING RISK
                  </div>
                </div>

                {/* Metric 2: People in Vulnerable Areas */}
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between text-white/50 mb-0.5">
                    <span className="text-[9px] font-mono-code uppercase tracking-wider">
                      PEOPLE IN VULNERABLE AREAS
                    </span>
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    18,420
                  </div>
                  <div className="text-[9px] font-mono-code text-blue-300/80 mt-0.5">
                    ACROSS 6 DISTRICTS
                  </div>
                </div>

                {/* Metric 3: Active Warnings */}
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between text-white/50 mb-0.5">
                    <span className="text-[9px] font-mono-code uppercase tracking-wider">
                      ACTIVE WARNINGS
                    </span>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    08
                  </div>
                  <div className="text-[9px] font-mono-code text-rose-300/80 mt-0.5">
                    DISPATCHED VIA SMS/APP
                  </div>
                </div>

                {/* Metric 4: Critical Infrastructure */}
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between text-white/50 mb-0.5">
                    <span className="text-[9px] font-mono-code uppercase tracking-wider">
                      CRITICAL INFRASTRUCTURE
                    </span>
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-white">
                    47
                  </div>
                  <div className="text-[9px] font-mono-code text-emerald-300/80 mt-0.5">
                    BRIDGES, ROADS & CLINICS
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>AI SPATIAL ENGINE ACTIVE</span>
                </div>
                <button
                  onClick={onEnterCommandCenter}
                  className="text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>OPEN LIVE CONSOLE</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
