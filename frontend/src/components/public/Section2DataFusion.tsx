import React from 'react';
import { CloudRain, Droplets, Mountain, Satellite, History, Cpu, ArrowDown, Layers, Database } from 'lucide-react';

export const Section2DataFusion: React.FC = () => {
  const sources = [
    {
      id: 'rainfall',
      name: 'RAINFALL',
      detail: 'Precipitation & Doppler telemetry',
      icon: CloudRain,
      accent: 'text-blue-400',
      border: 'border-blue-500/25',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'soil',
      name: 'SOIL MOISTURE',
      detail: 'In-situ volumetric water saturation',
      icon: Droplets,
      accent: 'text-teal-400',
      border: 'border-teal-500/25',
      bg: 'bg-teal-500/10',
    },
    {
      id: 'terrain',
      name: 'TERRAIN / SLOPE',
      detail: 'Digital elevation model & slope angles',
      icon: Mountain,
      accent: 'text-amber-400',
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/10',
    },
    {
      id: 'satellite',
      name: 'SATELLITE DATA',
      detail: 'InSAR deformation & optical indices',
      icon: Satellite,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/25',
      bg: 'bg-cyan-500/10',
    },
    {
      id: 'history',
      name: 'HISTORICAL LANDSLIDES',
      detail: 'Spatial records of past slip planes',
      icon: History,
      accent: 'text-purple-400',
      border: 'border-purple-500/25',
      bg: 'bg-purple-500/10',
    },
    {
      id: 'sensors',
      name: 'SENSORS',
      detail: 'Subsurface tilt & pore pressure probes',
      icon: Cpu,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/25',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section
      id="section-2"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em]">
              02 // INGESTION &amp; HARMONIZATION
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading uppercase tracking-tight">
            DATA FUSION
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            These different data sources are combined to build a more complete picture of landslide conditions.
            By continuously synchronizing weather, ground sensors, satellite radar, and topography, the platform produces a single source of truth for hazard evaluation.
          </p>
        </div>

        {/* Visual Flow Container */}
        <div className="rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl p-5 sm:p-6 lg:p-7 shadow-2xl">
          {/* Top Stage: 6 Incoming Data Streams */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sources.map((src, index) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.id}
                  className={`p-3.5 rounded-xl border ${src.border} ${src.bg} backdrop-blur-md flex flex-col items-center text-center space-y-2 transition-all`}
                >
                  <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${src.accent}`} />
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-mono-code font-bold text-white uppercase tracking-wider">
                      {src.name}
                    </div>
                    <div className="text-[10px] text-white/50 line-clamp-2 mt-1 leading-snug">
                      {src.detail}
                    </div>
                  </div>
                  {index < sources.length - 1 && (
                    <div className="hidden lg:block text-white/30 text-xs font-mono-code">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flow Indicator (Down Arrow) */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-white/50">
                MULTI-STREAM INGESTION PIPELINE
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-amber-400 mt-1">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Stage: Data Fusion Center */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-mono-code font-bold uppercase tracking-wider text-amber-300">
                  DATA FUSION ENGINE
                </div>
                <div className="text-xs text-slate-300 leading-relaxed max-w-xl mt-0.5">
                  Normalized geospatial intelligence layer ready for predictive modeling. Resolves spatial and temporal discrepancies across all 6 telemetry inputs.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono-code text-white/80 uppercase">
                STATUS: SYNCHRONIZED
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
