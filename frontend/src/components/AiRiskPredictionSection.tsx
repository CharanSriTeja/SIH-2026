import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

export const AiRiskPredictionSection: React.FC = () => {
  return (
    <section
      id="section-intelligence"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Focused Narrative (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>03 / AI RISK INTELLIGENCE</span>
          </div>

          {/* Headline: 2 lines maximum */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            FROM SIGNALS
            <br />
            TO RISK.
          </h2>

          {/* Short 2-3 line explanation */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Our machine-learning model analyzes environmental streams and historical landslide
            inventories to estimate real-time slope failure risk.
          </p>

          {/* Small technical information panel */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white uppercase font-mono-code block">
                Spatial-Temporal Neural Ensemble
              </span>
              <span className="text-[11px] text-white/60 leading-normal block mt-0.5">
                Calibrated on 15+ years of Geological Survey of India (GSI) landslide datasets.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Visually Dominant Compact Glass Risk Card (approx 45% width, fitting in 55-65vh) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-md glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Top ambient glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono-code uppercase tracking-[0.18em] text-white/50 block">
                    SECTOR A // INFERENCE
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    LANDSLIDE RISK
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono-code uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                HIGH RISK
              </span>
            </div>

            {/* Big Risk Percentage Display */}
            <div className="flex items-baseline justify-between mb-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
              <div>
                <span className="text-[9.5px] font-mono-code uppercase tracking-[0.16em] text-white/50 block mb-0.5">
                  ESTIMATED PROBABILITY
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-none">
                  82%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono-code text-red-400 font-bold block">
                  HIGH SEVERITY
                </span>
                <span className="text-[10px] font-mono-code text-white/40 block mt-0.5">
                  LEAD TIME ~14H
                </span>
              </div>
            </div>

            {/* 4 Compact Data Rows */}
            <div className="space-y-2 mb-4 text-xs font-mono-code">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="uppercase text-white/60">Rainfall</span>
                <span className="font-bold text-white">184 mm / 24h</span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="uppercase text-white/60">Slope</span>
                <span className="font-bold text-white">38°</span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="uppercase text-white/60">Historical Events</span>
                <span className="font-bold text-white">7</span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="uppercase text-white/60">Terrain</span>
                <span className="font-bold text-red-400">UNSTABLE</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code text-white/40">
              <span>ENSEMBLE CONFIDENCE</span>
              <span className="text-emerald-400 font-bold">94.2% HIGH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
