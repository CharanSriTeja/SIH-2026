import React from 'react';
import { CloudRain, Droplets, Mountain, Layers, Activity } from 'lucide-react';

export const EnvironmentalSignalsSection: React.FC = () => {
  const signalCards = [
    {
      id: 'rainfall',
      title: 'RAINFALL',
      value: '48.2 mm/h',
      metric: 'PRECIPITATION RATE',
      state: 'INTENSIFYING',
      trend: '+32% / 6h',
      icon: CloudRain,
      tag: 'RADAR DOPPLER',
    },
    {
      id: 'soil',
      title: 'SOIL',
      value: '78% VWC',
      metric: 'WATER CONTENT',
      state: 'SATURATING',
      trend: 'Pore pressure ↑',
      icon: Droplets,
      tag: 'TDR SENSORS',
    },
    {
      id: 'slope',
      title: 'SLOPE',
      value: '38° INCLINE',
      metric: 'CRITICAL ANGLE',
      state: 'HIGH LOAD',
      trend: 'Threshold >35°',
      icon: Mountain,
      tag: 'SAR DEM',
    },
    {
      id: 'terrain',
      title: 'TERRAIN',
      value: 'WEATHERED SHALE',
      metric: 'SUBSTRATE',
      state: 'FRACTURED',
      trend: 'Fault zone: 420m',
      icon: Layers,
      tag: 'LITHOLOGY',
    },
  ];

  return (
    <section
      id="section-signals"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Typography (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>01 / ENVIRONMENTAL SIGNALS</span>
          </div>

          {/* Headline */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            IT BEGINS
            <br />
            WITH THE LAND.
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Rainfall, terrain, soil moisture, and slope steepness interact to reveal when a landscape
            crosses the threshold into active vulnerability.
          </p>

          {/* Supporting sensor convergence line */}
          <div className="p-3.5 rounded-xl glass-panel border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono-code mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>SENSOR CONVERGENCE</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Continuous multi-source telemetry feeds real-time predictive hazard models.
            </p>
          </div>
        </div>

        {/* Right Column: Four Compact Data Cards (approx 45% width, fitting in 55-60vh) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg lg:max-w-none ml-auto w-full">
          {signalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="glass-panel rounded-2xl p-4 sm:p-4.5 border border-white/15 relative overflow-hidden group text-left backdrop-blur-xl hover:border-white/30 transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/[0.04] flex items-center justify-center text-white">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white font-mono-code block">
                        {card.title}
                      </span>
                      <span className="text-[9px] font-mono-code uppercase tracking-wider text-white/40">
                        {card.tag}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono-code uppercase tracking-wider text-emerald-400/90 px-2 py-0.5 rounded bg-white/[0.03] border border-white/10">
                    {card.state}
                  </span>
                </div>

                {/* Primary Metric Value */}
                <div className="mb-2.5">
                  <div className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight font-heading leading-tight">
                    {card.value}
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider font-mono-code text-white/50">
                    {card.metric}
                  </span>
                </div>

                {/* Trend Footer */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[9.5px] font-mono-code text-white/40">
                  <span>TELEMETRY</span>
                  <span className="text-white/80 font-semibold">{card.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
