import React, { useState } from 'react';
import { CloudRain, Satellite, Droplets, Mountain, History, Cpu, ArrowDown, Database, CpuIcon, Layers, CheckCircle2 } from 'lucide-react';

export const DataFusionSection: React.FC = () => {
  const [activeSource, setActiveSource] = useState<number>(0);

  const sources = [
    {
      id: 'rainfall',
      name: 'RAINFALL',
      description: 'Weather observations and forecasts',
      icon: CloudRain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      telemetry: '184 mm / 24h peak',
      stream: 'IMD Doppler & AWS Stations (Cherrapunji & Aizawl)',
      frequency: 'Every 15 mins',
    },
    {
      id: 'satellite',
      name: 'SATELLITE',
      description: 'Earth observation data',
      icon: Satellite,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      telemetry: 'InSAR deformation ±2mm',
      stream: 'Sentinel-1 SAR Interferometry & Landsat NDVI',
      frequency: '6-day cycle / Revisit',
    },
    {
      id: 'soil',
      name: 'SOIL',
      description: 'Moisture and soil conditions',
      icon: Droplets,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      telemetry: 'Volumetric Water 42.8%',
      stream: 'In-situ TDR Moisture Sensors & SMAP Model',
      frequency: 'Real-time telemetry',
    },
    {
      id: 'terrain',
      name: 'TERRAIN',
      description: 'Elevation, slope and aspect',
      icon: Mountain,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      telemetry: 'Slope 38° | Concave aspect',
      stream: 'Cartosat-1 10m High-Resolution DEM',
      frequency: 'Topographic Baseline',
    },
    {
      id: 'history',
      name: 'HISTORY',
      description: 'Historical landslide records',
      icon: History,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      telemetry: '7 past slope failures logged',
      stream: 'Geological Survey of India (GSI) 30-Year Compendium',
      frequency: 'Permanent Historical GIS',
    },
    {
      id: 'sensors',
      name: 'SENSORS',
      description: 'Field and IoT observations',
      icon: Cpu,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      telemetry: 'Piezometer 64 kPa | Tilt 2.1°',
      stream: 'LoRaWAN Micro-Tiltmeters & Piezometric Probes',
      frequency: 'Live 5-min telemetry',
    },
  ];

  return (
    <section
      id="section-intelligence"
      className="relative min-h-screen lg:min-h-0 lg:h-screen flex flex-col justify-center py-5 lg:py-6 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto w-full space-y-3.5 sm:space-y-4">
        {/* Section Header: Compact Single Row on Desktop */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-left border-b border-white/10 pb-3">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                01 / DATA FUSION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              ONE LANDSCAPE. <span className="text-slate-400">MANY SIGNALS.</span>
            </h2>

            <p className="text-xs text-slate-300 leading-normal font-normal">
              Landslide risk cannot be understood from a single data source. BHURAKSHA 2.0 combines environmental, terrain, satellite, sensor, and historical records to construct a unified ground vulnerability matrix.
            </p>
          </div>

          <div className="shrink-0">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-amber-400 font-bold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30">
              MULTI-SOURCE ENVIRONMENTAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Technical Pipeline Flow: 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Left Column (7 cols): Step 1 - 6 Heterogeneous Data Sources in 3x2 Grid */}
          <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#0C121E] p-3 sm:p-4 flex flex-col justify-between space-y-2.5">
            {/* Step 1 Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-white">
                  STEP 1: 6 HETEROGENEOUS DATA SOURCES
                </span>
              </div>
              <span className="text-[9px] font-mono-code text-white/50 uppercase">
                STREAM INGESTION // 24/7 ACTIVE
              </span>
            </div>

            {/* 3x2 Grid of Sources */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sources.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = activeSource === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSource(idx)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                      isSelected
                        ? `${item.borderColor} ${item.bgColor} shadow-md`
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-md ${item.bgColor} border ${item.borderColor} ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] font-mono-code uppercase text-white/40">
                        SRC 0{idx + 1}
                      </span>
                    </div>

                    <div className="text-xs font-bold font-heading uppercase text-white tracking-wide">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                      {item.description}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/10 space-y-0.5 text-[9px] font-mono-code">
                      <div className="flex items-center justify-between text-white/70">
                        <span className="text-white/40">VAL:</span>
                        <span className="font-semibold text-white truncate max-w-[95px]">{item.telemetry}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/70">
                        <span className="text-white/40">FREQ:</span>
                        <span className="text-slate-300 truncate max-w-[95px]">{item.frequency}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Telemetry Inspector Bar */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between text-[10px] font-mono-code">
              <div className="flex items-center gap-2 truncate text-slate-300">
                <span className="text-amber-400 font-bold uppercase shrink-0">
                  {sources[activeSource].name} ACTIVE:
                </span>
                <span className="truncate text-white/70">{sources[activeSource].stream}</span>
              </div>
              <span className="text-emerald-400 shrink-0 font-semibold text-[9px]">
                {sources[activeSource].telemetry}
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Step 2 (Data Fusion) & Step 3 (Landslide Intelligence) */}
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0C121E] p-3 sm:p-4 flex flex-col justify-between space-y-2.5">
            {/* Step 2 Box */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3 text-left space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-code uppercase tracking-widest text-amber-300 font-bold">
                      STEP 2: DATA FUSION
                    </div>
                    <div className="text-xs sm:text-sm font-bold font-heading text-white uppercase leading-snug">
                      MULTI-LAYER SPATIAL NORMALIZATION
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-code text-slate-300 pt-1 border-t border-amber-500/20">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">TEMPORAL RESAMPLING</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">GEO-GRID 10M RES</span>
                </div>
              </div>
            </div>

            {/* Pipeline Conduit Indicator */}
            <div className="flex items-center justify-center gap-2 text-slate-400 py-0.5">
              <div className="h-px flex-1 bg-white/15" />
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/15 text-[9px] font-mono-code uppercase tracking-wider text-emerald-300">
                <ArrowDown className="w-3 h-3 text-emerald-400" />
                <span>SPATIO-TEMPORAL FUSION PIPELINE</span>
              </div>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Step 3 Box */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 text-left space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono-code uppercase tracking-widest text-emerald-300 font-bold">
                      STEP 3: LANDSLIDE INTELLIGENCE
                    </div>
                    <div className="text-xs sm:text-sm font-bold font-heading text-white uppercase leading-snug">
                      HIGH-RESOLUTION GROUND VULNERABILITY MODEL
                    </div>
                  </div>
                </div>

                <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono-code font-bold uppercase shrink-0">
                  &lt; 420 MS
                </div>
              </div>

              <div className="text-[10px] font-mono-code text-slate-300 leading-tight pt-1 border-t border-emerald-500/20">
                Continuous tensor feeding into Graph Neural Network (GNN) and probabilistic hazard model.
              </div>
            </div>

            {/* Ingestion Integrity Footnote */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between text-[9px] font-mono-code text-white/50">
              <span>PIPELINE HEALTH: OPTIMAL (100% COVERAGE)</span>
              <span className="text-emerald-400 font-semibold">ZERO DATA LOSS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
