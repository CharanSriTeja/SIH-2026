import React from 'react';
import { CloudRain, Droplets, Mountain, Satellite, History, Cpu, ArrowDown, Layers, Database } from 'lucide-react';

export const Section2DataFusion: React.FC = () => {
  const sources = [
    {
      id: 'rainfall',
      name: 'Precipitation',
      detail: 'IMD Doppler radar & live rainfall sensors',
      icon: CloudRain,
      accent: 'text-[#2E4A3D]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
    },
    {
      id: 'soil',
      name: 'Soil Saturation',
      detail: 'Volumetric water content & pore pressure',
      icon: Droplets,
      accent: 'text-[#B5551F]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
    },
    {
      id: 'terrain',
      name: 'DEM & Slope',
      detail: 'Digital elevation model, aspect & curvature',
      icon: Mountain,
      accent: 'text-[#2E4A3D]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
    },
    {
      id: 'satellite',
      name: 'Satellite InSAR',
      detail: 'Surface deformation & Sentinel-2 vegetation index',
      icon: Satellite,
      accent: 'text-[#55594C]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
    },
    {
      id: 'history',
      name: 'Historical Inventory',
      detail: 'GSI mapped past slide polygons & slip planes',
      icon: History,
      accent: 'text-[#B5551F]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
    },
    {
      id: 'sensors',
      name: 'Field IoT Probes',
      detail: 'Subsurface inclinometers & tiltmeters',
      icon: Cpu,
      accent: 'text-[#2E4A3D]',
      border: 'border-[#DDD6C4]',
      bg: 'bg-[#FFFDF8]',
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Layers className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 01 &bull; Ingestion &amp; Spatial Alignment
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Multi-Source Data Fusion
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            By harmonizing dynamic meteorology, soil hydrology, satellite radar interferometry, and high-resolution terrain models, the platform resolves spatial and temporal discrepancies to establish a unified situational foundation.
          </p>
        </div>

        {/* Visual Flow Container */}
        <div className="rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 lg:p-7 shadow-[0_4px_16px_rgba(35,38,31,0.06)]">
          {/* Top Stage: 6 Incoming Data Streams */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sources.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.id}
                  className={`p-4 rounded-xl border ${src.border} ${src.bg} flex flex-col items-center text-center space-y-2.5 shadow-xs hover:border-[#2E4A3D]/50 transition-colors`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F6F3EC] border border-[#DDD6C4] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${src.accent}`} />
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-sans font-bold text-[#23261F]">
                      {src.name}
                    </div>
                    <div className="text-[11px] text-[#55594C] line-clamp-2 mt-1 leading-snug">
                      {src.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flow Indicator (Down Arrow) */}
          <div className="py-4 flex flex-col items-center justify-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7B8071]">
              Continuous Spatial Harmonization Pipeline
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] border border-[#CAD7CE] flex items-center justify-center text-[#2E4A3D] mt-1.5 shadow-xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Stage: Data Fusion Center */}
          <div className="rounded-xl border border-[#F6C8B3] bg-[#FDF1EB] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0 shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-serif font-bold text-[#23261F]">
                  Unified Multi-Dimensional Feature Tensor
                </div>
                <div className="text-xs text-[#55594C] leading-relaxed max-w-xl mt-0.5">
                  Resampled to 200m spatial cells with 24-hour rainfall rolling accumulation, antecedent soil moisture indices, and topographic wetness indices ready for AI inference.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-md bg-[#EEF7F0] border border-[#C2E3C9] text-xs font-sans font-semibold text-[#2D5D37]">
                Pipeline Synchronized
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#4F8F5B] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
