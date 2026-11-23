import React from 'react';
import { Cpu, ArrowDown, Activity, Layers, Zap } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';

export const Section3AiPrediction: React.FC = () => {
  const pipelineStages = [
    {
      title: 'Static Terrain Baseline',
      detail: 'CartoDEM slope, elevation, curvature, and ESA WorldCover classes',
      step: '01',
    },
    {
      title: 'Model A: Susceptibility Score',
      detail: 'Machine learning model trained on Geological Survey of India (GSI) historical failure inventory',
      step: '02',
    },
    {
      title: 'Dynamic Trigger Ingestion',
      detail: 'ISRO INSAT-3DR 24h rainfall + NASA SMAP volumetric soil saturation',
      step: '03',
    },
    {
      title: 'Model B: 200m Risk Raster',
      detail: 'Fuses susceptibility with dynamic weather to output regional risk probabilities',
      step: '04',
    },
  ];

  const exampleInputs = [
    { label: '24-Hour Rainfall', value: '142 mm', detail: 'Monsoon precipitation threshold exceeded' },
    { label: 'Soil Saturation', value: '82% VWC', detail: 'High antecedent moisture approaching saturation' },
    { label: 'Terrain Slope Angle', value: '36° Incline', detail: 'Steep escarpment corridor' },
    { label: 'Model A Susceptibility', value: '74% Baseline', detail: 'High geomorphological hazard probability' },
  ];

  return (
    <section
      id="section-3"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col justify-center"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Cpu className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 02 &bull; Dual-Model Machine Learning
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            AI Landslide Risk Prediction
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            Slope failures require both vulnerable terrain and an environmental trigger. BHURAKSHA 2.0 decouples static geological susceptibility (Model A) from daily dynamic weather drivers (Model B) to accurately evaluate probability before disaster strikes.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Conceptual Inference Pipeline */}
          <div className="lg:col-span-5 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-5">
            <div>
              <div className="text-base font-serif font-bold text-[#23261F]">
                Dual-Model Architecture Workflow
              </div>
              <p className="text-xs text-[#55594C] mt-1 leading-relaxed">
                How static terrain characteristics combine with live meteorological observations.
              </p>
            </div>

            {/* Vertical Flow */}
            <div className="space-y-2.5">
              {pipelineStages.map((stage, idx) => (
                <div key={stage.title} className="space-y-1.5">
                  <div className="p-3.5 rounded-xl border border-[#DDD6C4] bg-[#F6F3EC] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-sans font-bold text-[#23261F]">
                        {stage.title}
                      </div>
                      <div className="text-[11px] text-[#55594C] mt-0.5 leading-snug">
                        {stage.detail}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#2E4A3D] bg-[#E8EFEA] px-2.5 py-1 rounded-md shrink-0">
                      {stage.step}
                    </span>
                  </div>
                  {idx < pipelineStages.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-[#7B8071]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 4 Standardized Risk Tiers */}
            <div className="pt-3 border-t border-[#DDD6C4] flex flex-wrap items-center justify-between gap-2">
              <RiskBadge level="low" size="sm" />
              <RiskBadge level="moderate" size="sm" />
              <RiskBadge level="high" size="sm" />
              <RiskBadge level="critical" size="sm" />
            </div>
          </div>

          {/* Right Column: Concrete Scenario Evaluation */}
          <div className="lg:col-span-7 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-md space-y-5 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6C4] pb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#B5551F]" />
                <span className="text-sm sm:text-base font-serif font-bold text-[#23261F]">
                  Model B Risk Inference Sample
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#FDF1EB] border border-[#F6C8B3] text-[11px] font-mono font-semibold text-[#823B10]">
                25.647°N, 91.763°E
              </span>
            </div>

            {/* Input Factors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exampleInputs.map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-xl border border-[#DDD6C4] bg-[#F6F3EC] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-medium text-[#55594C]">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#B5551F]">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7B8071] leading-snug">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Process Arrow */}
            <div className="flex items-center justify-center py-0.5">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#55594C] uppercase tracking-wider bg-[#F6F3EC] border border-[#DDD6C4] px-3 py-1 rounded-md">
                <Zap className="w-3.5 h-3.5 text-[#B5551F]" />
                <span>Model B Dynamic Inference</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#B5551F]" />
              </div>
            </div>

            {/* Resulting Output Box */}
            <div className="p-5 rounded-xl border border-[#F6C8B3] bg-[#FDF0EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0 shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-sans font-semibold text-[#823B10] uppercase tracking-wider">
                    Computed Hazard Classification
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#823B10]">
                    High Landslide Risk (68%)
                  </div>
                  <div className="text-xs text-[#55594C] mt-0.5">
                    Precipitation accumulation has saturated soil above shear resistance threshold.
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <RiskBadge level="high" size="md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
