import React from 'react';
import { Cpu, ArrowRight, ArrowDown, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const Section3AiPrediction: React.FC = () => {
  const steps = [
    { title: 'ENVIRONMENTAL DATA', detail: 'Rainfall, soil, slope, satellite, sensors' },
    { title: 'AI / ML ANALYSIS', detail: 'Gradient-boosted spatial risk model' },
    { title: 'RISK ASSESSMENT', detail: 'Dynamic probability & factor weighting' },
    { title: 'SEVERITY TIER', detail: 'LOW • MODERATE • HIGH • CRITICAL' },
  ];

  const exampleInputs = [
    { label: 'RAINFALL', value: 'HIGH', detail: '184 mm / 24h (Monsoon peak)' },
    { label: 'SOIL MOISTURE', value: 'HIGH', detail: '88% volumetric saturation' },
    { label: 'SLOPE', value: 'STEEP', detail: '38° inclination angle' },
    { label: 'HISTORICAL ACTIVITY', value: 'PRESENT', detail: 'Prior 2022 debris slide' },
  ];

  return (
    <section
      id="section-3"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em]">
              03 // MACHINE LEARNING INFERENCE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading uppercase tracking-tight">
            AI RISK PREDICTION
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            The machine learning engine evaluates multi-parameter indicators against historical landslide patterns to forecast slope failure probability and assign accurate severity tiers before disaster strikes.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Conceptual Inference Pipeline */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-white/90">
                PREDICTIVE WORKFLOW
              </div>
              <p className="text-xs text-white/50 mt-1">
                How raw telemetry is transformed into actionable risk intelligence.
              </p>
            </div>

            {/* Vertical Flow */}
            <div className="space-y-2 py-2">
              {steps.map((step, idx) => (
                <div key={step.title} className="space-y-1.5">
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono-code font-bold text-white uppercase tracking-wider">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5">
                        {step.detail}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-code text-white/30 font-bold">
                      0{idx + 1}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center text-white/30 py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Classification Tiers */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code">
              <span className="text-emerald-400 font-bold">LOW</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-amber-400 font-bold">MODERATE</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-orange-400 font-bold">HIGH</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-red-400 font-bold">CRITICAL</span>
            </div>
          </div>

          {/* Right Column: Example Risk Prediction Visualization */}
          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-4 flex flex-col justify-between">
            {/* Header & Demo Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  RISK PREDICTION SCENARIO
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono-code text-amber-300 font-bold uppercase">
                DEMO / SYSTEM PREVIEW
              </span>
            </div>

            {/* Example Input Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {exampleInputs.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code text-white/50 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-mono-code font-bold text-amber-400 uppercase">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 font-mono-code">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Inference Arrow */}
            <div className="flex items-center justify-center py-1">
              <div className="flex items-center gap-2 text-xs font-mono-code text-white/40 uppercase">
                <span>AI INFERENCE EVALUATION</span>
                <ArrowDown className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>

            {/* Resulting Predicted Risk */}
            <div className="p-4 sm:p-5 rounded-xl border border-orange-500/30 bg-orange-500/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono-code uppercase tracking-wider text-orange-300">
                    PREDICTED RISK
                  </div>
                  <div className="text-2xl font-bold font-heading text-orange-400 uppercase">
                    HIGH
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Trigger threshold exceeded: Steep slope + heavy saturation.
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[9px] font-mono-code text-white/40 uppercase">
                  CONFIDENCE SCORE
                </div>
                <div className="text-lg font-mono-code font-bold text-white">
                  87.4%
                </div>
                <span className="inline-block px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-mono-code font-bold mt-1">
                  ACTION REQUIRED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
