import React, { useState } from 'react';
import { Cpu, ArrowDown, CheckCircle2, TrendingUp, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

export const AiPredictionSection: React.FC = () => {
  // Interactive test inputs with default demo values
  const [rainfall, setRainfall] = useState<number>(184);
  const [slope, setSlope] = useState<number>(38);
  const [soilMoisture, setSoilMoisture] = useState<'LOW' | 'MODERATE' | 'HIGH'>('HIGH');
  const [elevation, setElevation] = useState<number>(1240);
  const [historicalEvents, setHistoricalEvents] = useState<number>(7);
  const [landCover, setLandCover] = useState<string>('FOREST');

  // Dynamic calculated risk score based on inputs
  const soilWeight = soilMoisture === 'HIGH' ? 30 : soilMoisture === 'MODERATE' ? 18 : 8;
  const rainWeight = Math.min(35, (rainfall / 220) * 35);
  const slopeWeight = Math.min(25, (slope / 50) * 25);
  const historyWeight = Math.min(10, historicalEvents * 1.4);
  
  const rawScore = Math.round(rainWeight + slopeWeight + soilWeight + historyWeight);
  const predictedRisk = Math.min(96, Math.max(15, rawScore));
  const confidence = 91;

  const severityLevel = predictedRisk >= 75 ? 'HIGH' : predictedRisk >= 45 ? 'MODERATE' : 'LOW';
  const severityColor =
    severityLevel === 'HIGH'
      ? 'text-red-400 bg-red-500/10 border-red-500/30'
      : severityLevel === 'MODERATE'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  return (
    <section
      id="section-ai-engine"
      className="relative min-h-screen lg:min-h-0 lg:h-screen flex flex-col justify-center py-5 lg:py-6 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto w-full space-y-3.5 sm:space-y-4">
        {/* Header: Compact Row on Desktop */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-left border-b border-white/10 pb-3">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                02 / PREDICTIVE ANALYTICS
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              FROM ENVIRONMENTAL DATA <span className="text-amber-400">TO PREDICTED RISK.</span>
            </h2>

            <p className="text-xs text-slate-300 leading-normal font-normal">
              AI models analyze rainfall, terrain, soil, land-cover, and historical patterns to estimate ground vulnerability and forecast slope instability before movement occurs.
            </p>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono-code uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>DEMO DATA // NOT REAL-TIME MEASUREMENTS</span>
            </div>
          </div>
        </div>

        {/* AI Prediction Interface Card */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] overflow-hidden shadow-2xl">
          {/* Interface Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F1A] border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-white">
                  AI RISK ENGINE
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono-code text-white/50 uppercase">
                  SPATIO-TEMPORAL RANDOM FOREST + GRAPH NEURAL NETWORK
                </span>
              </div>
            </div>

            <div className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>MODEL INFERENCE ACTIVE</span>
            </div>
          </div>

          {/* Core Engine Layout: 3 Columns on Desktop */}
          <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Left Column (5 cols): INPUT SIGNALS (6 Parameters arranged in 2x3 compact grid) */}
            <div className="lg:col-span-5 rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2.5 text-left flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-white/80">
                  INPUT SIGNALS
                </span>
                <span className="text-[9px] font-mono-code text-white/40 uppercase">
                  6 PARAMETERS
                </span>
              </div>

              {/* 2-Column Compact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Rainfall */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono-code">
                    <span className="text-white/60">RAINFALL</span>
                    <span className="font-bold text-blue-400">{rainfall} mm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="240"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer h-1 bg-white/10 rounded-lg"
                  />
                </div>

                {/* 2. Slope */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono-code">
                    <span className="text-white/60">SLOPE</span>
                    <span className="font-bold text-amber-400">{slope}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="55"
                    value={slope}
                    onChange={(e) => setSlope(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1 bg-white/10 rounded-lg"
                  />
                </div>

                {/* 3. Soil Moisture */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono-code text-white/60">SOIL MOISTURE</div>
                  <div className="flex items-center gap-1">
                    {(['LOW', 'MODERATE', 'HIGH'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSoilMoisture(lvl)}
                        className={`flex-1 py-0.5 rounded text-[9px] uppercase font-bold transition-colors cursor-pointer ${
                          soilMoisture === lvl
                            ? 'bg-teal-500 text-black'
                            : 'bg-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Elevation */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-white/60">ELEVATION</span>
                  <span className="font-bold text-white">1,240 m</span>
                </div>

                {/* 5. Historical Events */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-white/60">PAST SCARPS</span>
                  <span className="font-bold text-purple-400">07 EVENTS</span>
                </div>

                {/* 6. Land Cover */}
                <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-white/60">LAND COVER</span>
                  <span className="font-bold text-emerald-400">FOREST</span>
                </div>
              </div>

              <div className="text-[9px] font-mono-code text-white/40 pt-1 border-t border-white/5 flex items-center justify-between">
                <span>INTERACTIVE SIMULATOR</span>
                <span>ADJUST SLIDERS TO TEST RISK</span>
              </div>
            </div>

            {/* Middle Column (3 cols): ML ANALYSIS */}
            <div className="lg:col-span-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col justify-center items-center text-center space-y-2.5">
              <div className="flex items-center gap-1.5 text-white/50">
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-amber-300 font-bold">
                  FEATURE TENSOR
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              </div>

              <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 w-full text-center space-y-1.5">
                <div className="inline-flex p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  ML INFERENCE
                </div>
                <div className="text-[10px] text-slate-300 leading-tight font-mono-code">
                  Weighted Factor Model + Dynamic Infinite Slope Stability Equation
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-white/50">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-emerald-300 font-bold">
                  PREDICTION VECTOR
                </span>
              </div>
            </div>

            {/* Right Column (4 cols): PREDICTED RISK & CONFIDENCE */}
            <div className="lg:col-span-4 rounded-lg border border-white/15 bg-[#080C14] p-3.5 text-left flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-white/80">
                    PREDICTED RISK
                  </span>
                  <span className={`text-[9px] font-mono-code uppercase font-bold px-2 py-0.5 rounded border ${severityColor}`}>
                    {severityLevel} RISK
                  </span>
                </div>

                {/* Big Risk Number */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-4xl sm:text-5xl font-extrabold font-heading text-white">
                      {predictedRisk}%
                    </div>
                    <div className="text-[10px] font-mono-code uppercase tracking-wider text-red-400 font-bold mt-0.5">
                      SLOPE FAILURE PROBABILITY
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] font-mono-code text-white/40 uppercase">STATUS</div>
                    <div className="text-xs font-mono-code font-bold text-amber-300">
                      ESCALATING
                    </div>
                  </div>
                </div>

                {/* Risk Trend Bar: LOW → MODERATE → HIGH */}
                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                  <div className="text-[9px] font-mono-code uppercase tracking-wider text-white/50">
                    RISK LEVEL THRESHOLD
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold">
                    <span className={predictedRisk < 45 ? 'text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded' : 'text-slate-500'}>LOW</span>
                    <span className="text-white/20">&rarr;</span>
                    <span className={predictedRisk >= 45 && predictedRisk < 75 ? 'text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded' : 'text-slate-500'}>MODERATE</span>
                    <span className="text-white/20">&rarr;</span>
                    <span className={predictedRisk >= 75 ? 'text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40' : 'text-slate-500'}>
                      HIGH
                    </span>
                  </div>
                </div>
              </div>

              {/* Prediction Confidence */}
              <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-white/60 uppercase">PREDICTION CONFIDENCE</span>
                  <span className="font-bold text-emerald-400">{confidence}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <div className="text-[8.5px] font-mono-code text-white/40 uppercase truncate">
                  CROSS-VALIDATED WITH GSI HISTORICAL BENCHMARKS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
