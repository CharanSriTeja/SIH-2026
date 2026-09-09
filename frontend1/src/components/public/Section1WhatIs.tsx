import React from 'react';
import { Activity, ArrowRight, ChevronDown, MapPin, Radio } from 'lucide-react';
import slopeImage from '../../assets/images/slope_risk_monitoring_1788844784799.jpg';

interface Section1WhatIsProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onExplore: () => void;
}

export const Section1WhatIs: React.FC<Section1WhatIsProps> = ({
  onOpenAuth,
  onExplore,
}) => {
  return (
    <section
      id="section-1"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Platform Introduction */}
        <div className="lg:col-span-6 space-y-5 text-left">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em]">
              DISASTER INTELLIGENCE PLATFORM
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white font-heading uppercase leading-[1.05]">
              BHURAKSHA 2.0
            </h1>
            <p className="text-sm sm:text-base font-mono-code font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 uppercase">
              AI-POWERED LANDSLIDE RISK MONITORING &amp; EARLY WARNING
            </p>
          </div>

          {/* Core Explanation */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
            The platform combines environmental, terrain, satellite, historical, and sensor data with AI/ML to identify areas with elevated landslide risk and support early warning and disaster response.
          </p>

          {/* Minimal Supporting Labels */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono-code text-white/70 uppercase">
              MULTI-SOURCE FUSION
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono-code text-white/70 uppercase">
              AI / ML PREDICTION
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono-code text-white/70 uppercase">
              TARGETED WARNINGS
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onExplore}
              className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>EXPLORE HOW IT WORKS</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onOpenAuth('signin')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-white font-mono-code font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              <span>SIGN IN TO ACCESS</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Geographic Note */}
          <div className="pt-3 flex items-center gap-4 text-[11px] font-mono-code text-slate-400 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>NORTH EAST INDIA</span>
            </div>
            <span className="text-white/25">•</span>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>CONTINUOUS SURVEILLANCE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Strong Cinematic Visual */}
        <div className="lg:col-span-6">
          <div className="relative rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl overflow-hidden shadow-2xl group">
            {/* Image */}
            <div className="aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden relative">
              <img
                src={slopeImage}
                alt="Natural mountainous hill slope with environmental conditions and vulnerable slope area"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C121E] via-transparent to-black/30" />
            </div>

            {/* Visual Explanatory Caption */}
            <div className="p-4 border-t border-white/10 bg-[#0C121E]/85 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono-code text-white/90 uppercase font-semibold">
                  SLOPE MONITORING // RAINFALL &amp; TERRAIN
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-amber-300 uppercase">
                ENVIRONMENTAL RISK EVALUATION
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
