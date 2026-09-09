import React from 'react';
import { ArrowUpRight, ArrowDownRight, GitFork } from 'lucide-react';

export const RiskFormationSection: React.FC = () => {
  const telemetryDynamics = [
    {
      label: 'RAINFALL',
      direction: '↑ RISING',
      isRising: true,
      current: '142 mm',
      threshold: 'Trigger: 120 mm',
      barPercent: 88,
    },
    {
      label: 'SOIL SATURATION',
      direction: '↑ RISING',
      isRising: true,
      current: '89% VWC',
      threshold: 'Pore press: 46 kPa',
      barPercent: 89,
    },
    {
      label: 'SLOPE STABILITY',
      direction: '↓ FALLING',
      isRising: false,
      current: 'FoS 1.04',
      threshold: 'Failure: FoS < 1.0',
      barPercent: 24,
    },
    {
      label: 'RISK INDEX',
      direction: '↑ RISING',
      isRising: true,
      current: '82% HIGH',
      threshold: 'Confidence: 94%',
      barPercent: 82,
    },
  ];

  return (
    <section
      id="section-formation"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Context & Convergence (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>02 / RISK FORMATION</span>
          </div>

          {/* Headline */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            WHEN THE SLOPE
            <br />
            STARTS TO CHANGE.
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Prolonged rainfall saturates vulnerable soil, elevating pore-water pressure and rapidly
            degrading effective shear strength along underlying clay strata.
          </p>

          {/* Geotechnical Synthesis Card */}
          <div className="glass-panel rounded-2xl p-4 border border-white/15 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono-code text-white/80 uppercase">
                <GitFork className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
                <span>Multi-Factor Geotechnical Core</span>
              </div>
              <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                FUSION ACTIVE
              </span>
            </div>
            <p className="text-xs text-white/65 leading-relaxed">
              Real-time infinite-slope stability modeling correlates pore pressure spikes with digital elevation gradients.
            </p>
          </div>
        </div>

        {/* Right Column: 4 Telemetry Dynamics Cards (approx 45% width, fitting in 55-60vh) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg lg:max-w-none ml-auto w-full">
          {telemetryDynamics.map((item) => {
            const isDanger = item.isRising ? item.barPercent > 70 : item.barPercent < 35;
            return (
              <div
                key={item.label}
                className={`glass-panel rounded-2xl p-4 sm:p-4.5 border transition-all text-left backdrop-blur-xl ${
                  isDanger
                    ? 'border-red-500/30 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
                    : 'border-white/15 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] font-mono-code text-white/70">
                    {item.label}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[11px] font-mono-code font-bold px-2 py-0.5 rounded ${
                      item.isRising
                        ? 'text-red-400 bg-red-500/10 border border-red-500/30'
                        : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    }`}
                  >
                    {item.isRising ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{item.direction}</span>
                  </div>
                </div>

                <div className="text-2xl sm:text-[26px] font-extrabold text-white font-heading tracking-tight mb-1">
                  {item.current}
                </div>

                <span className="text-[9.5px] font-mono-code text-white/50 block mb-2.5">
                  {item.threshold}
                </span>

                {/* Progress Bar Meter */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isDanger ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${item.barPercent}%` }}
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
