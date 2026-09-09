import React, { useState } from 'react';
import { INTELLIGENCE_STAGES } from '../data/mockData';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const IntelligenceLoopSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string>('01');
  const selectedStageData = INTELLIGENCE_STAGES.find((s) => s.step === activeStage) || INTELLIGENCE_STAGES[0];

  return (
    <section
      id="section-loop"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Typography & Active Stage Deep-Dive (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>07 / THE INTELLIGENCE LOOP</span>
          </div>

          {/* Headline: 2 lines max */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            PREDICT. MAP.
            <br />
            ALERT. EVACUATE.
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            One continuous operational loop that transforms environmental sensor data
            into coordinated early warning and life-saving community response.
          </p>

          {/* Active Stage Callout Card */}
          <div className="p-4 rounded-2xl glass-panel border border-white/15 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase font-mono-code text-emerald-400">
                STAGE {selectedStageData.step} // {selectedStageData.name}
              </span>
              <span className="text-[9px] font-mono-code text-white/40 uppercase">
                {selectedStageData.technology}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-3">
              {selectedStageData.fullDesc}
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono-code pt-2 border-t border-white/10">
              <span className="text-white/40 uppercase">CORE METRIC:</span>
              <span className="text-white/90 font-semibold">{selectedStageData.metrics}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 5-Stage Stepper (approx 50% width, fitting in 55-60vh) */}
        <div className="lg:col-span-7 space-y-2.5 max-w-xl ml-auto w-full">
          {INTELLIGENCE_STAGES.map((stage) => {
            const isActive = activeStage === stage.step;
            return (
              <div
                key={stage.step}
                onMouseEnter={() => setActiveStage(stage.step)}
                onClick={() => setActiveStage(stage.step)}
                className={`glass-panel rounded-2xl px-4 py-3 border transition-all duration-200 cursor-pointer text-left flex items-center justify-between backdrop-blur-xl ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] translate-x-1'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-lg font-extrabold font-mono-code ${
                      isActive ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                      {stage.name}
                    </h3>
                    <p className="text-[11px] text-white/60 line-clamp-1">
                      {stage.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[9.5px] font-mono-code text-white/40 uppercase">
                    {stage.technology}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-white/20'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
