import React from 'react';
import { CloudRain, Droplets, Mountain, Trees, History, Map, ArrowDown, Layers, Database, CheckCircle2 } from 'lucide-react';

export const Section2DataFusion: React.FC = () => {
  const sources = [
    {
      id: 'rainfall',
      name: 'Precipitation',
      detail: 'ISRO MOSDAC INSAT-3DR IMAGER (24h HEM) + IMD gridded fallback',
      icon: CloudRain,
      accent: 'text-[#2E4A3D]',
    },
    {
      id: 'soil',
      name: 'Soil Saturation',
      detail: 'NASA SMAP SPL3SMP_E (~9km) radiometric soil moisture',
      icon: Droplets,
      accent: 'text-[#B5551F]',
    },
    {
      id: 'terrain',
      name: 'Terrain & Slope',
      detail: 'CartoDEM / SRTM elevation, slope angle, aspect & curvature',
      icon: Mountain,
      accent: 'text-[#2E4A3D]',
    },
    {
      id: 'landcover',
      name: 'Land Cover',
      detail: 'ESA WorldCover (10m) vegetation & slope substrate classification',
      icon: Trees,
      accent: 'text-[#4F8F5B]',
    },
    {
      id: 'history',
      name: 'Landslide Inventory',
      detail: 'Geological Survey of India (GSI) historical failure polygons',
      icon: History,
      accent: 'text-[#B5551F]',
    },
    {
      id: 'exposure',
      name: 'Roads & Settlements',
      detail: 'OpenStreetMap transport arteries, village habitations & 129 districts',
      icon: Map,
      accent: 'text-[#2E4A3D]',
    },
  ];

  return (
    <section
      id="section-2"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col justify-center"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Layers className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 01 &bull; Ingestion &amp; Master Grid Alignment
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Multi-Source Data Ingestion
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            Raw observations originate from different satellites, agencies, and resolutions. The ingestion pipeline resamples dynamic meteorology, soil hydrology, and static terrain morphology into a unified 200-meter master grid across Northeast India.
          </p>
        </div>

        {/* Visual Flow Container */}
        <div className="rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-7 shadow-md space-y-6">
          {/* Top Stage: 6 Verified Real Data Streams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {sources.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-[#DDD6C4] bg-[#FFFDF8] flex flex-col items-center text-center space-y-3 shadow-xs hover:border-[#2E4A3D]/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F6F3EC] border border-[#DDD6C4] flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${src.accent}`} />
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-sans font-bold text-[#23261F]">
                      {src.name}
                    </div>
                    <div className="text-[11px] text-[#55594C] mt-1.5 leading-snug">
                      {src.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flow Indicator (Down Arrow) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7B8071]">
              Resampled to 200m Master Coordinate Grid (EPSG:4326)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E8EFEA] border border-[#CAD7CE] flex items-center justify-center text-[#2E4A3D] mt-2 shadow-xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Stage: Data Ingestion Summary */}
          <div className="rounded-xl border border-[#F6C8B3] bg-[#FDF1EB] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0 shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-serif font-bold text-[#23261F]">
                  Harmonized Regional Daily Feature Array
                </div>
                <div className="text-xs sm:text-[13px] text-[#55594C] leading-relaxed max-w-2xl mt-0.5">
                  Combines 24-hour accumulated rainfall, 7-day antecedent saturation, volumetric soil moisture, slope angle, and baseline susceptibility into an aligned spatial matrix ready for Model B risk inference.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <span className="px-3 py-1.5 rounded-lg bg-[#EEF7F0] border border-[#C2E3C9] text-xs font-sans font-semibold text-[#2D5D37] inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F8F5B]" />
                Pipeline Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
