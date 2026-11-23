import React from 'react';
import { BellRing, Building2, Car, Compass, ShieldAlert } from 'lucide-react';
import mapVisual from '../../assets/images/conceptual_risk_map_1788844803426.jpg';

export const Section4MapAndWarn: React.FC = () => {
  const assets = [
    {
      label: 'Highway Arteries',
      detail: 'National & State Highways, mountain passes & emergency transport corridors',
      icon: Car,
      color: 'text-[#2E4A3D]',
    },
    {
      label: 'Hillside Settlements',
      detail: 'Village habitations, schools & resident clusters located in hazard zones',
      icon: Building2,
      color: 'text-[#B5551F]',
    },
    {
      label: 'Bridges & Culverts',
      detail: 'Stream crossings & river gorges susceptible to debris flows and blockages',
      icon: Compass,
      color: 'text-[#55594C]',
    },
    {
      label: 'District Emergency Centers',
      detail: '129 District Disaster Management Authorities (DDMAs) across 8 states',
      icon: ShieldAlert,
      color: 'text-[#B5551F]',
    },
  ];

  return (
    <section
      id="section-4"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col justify-center"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Compass className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 03 &bull; Geospatial Exposure &amp; Warning
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Map, Identify &amp; Warn
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            A risk score is only actionable if authorities know what lies in its path. BHURAKSHA 2.0 intersects the daily 200-meter risk raster with road networks, settlements, and district boundaries to deliver targeted early warnings before disaster strikes.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Conceptual Map-Style Visual */}
          <div className="lg:col-span-6 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] overflow-hidden shadow-md flex flex-col justify-between">
            <div className="aspect-[16/10] w-full overflow-hidden relative bg-[#EDE8DE]">
              <img
                src={mapVisual}
                alt="Conceptual GIS risk map showing highlighted risk zone, nearby village settlement, valley road, and alert notification"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDD6C4] text-[11px] font-mono font-semibold text-[#23261F] shadow-xs">
                GEOSPATIAL EXPOSURE OVERLAY
              </div>
            </div>

            <div className="p-4 border-t border-[#DDD6C4] bg-[#FFFDF8] flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-[#B5551F]">
                Model B Hazard Surface &bull; 200m Spatial Cells
              </span>
              <span className="font-mono text-[#55594C]">
                VECTOR ASSET INTERSECTION
              </span>
            </div>
          </div>

          {/* Right Column: Infrastructure Exposure & Delivery */}
          <div className="lg:col-span-6 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-md space-y-5 flex flex-col justify-between">
            <div>
              <div className="text-base font-serif font-bold text-[#23261F]">
                Asset Vulnerability Identification
              </div>
              <div className="flex items-center gap-2 text-xs font-sans font-medium text-[#55594C] mt-1.5 flex-wrap">
                <span className="text-[#2E4A3D] font-semibold">200m Risk Raster</span>
                <span>&rarr;</span>
                <span className="text-[#B5551F] font-semibold">Infrastructure Overlays</span>
                <span>&rarr;</span>
                <span className="text-[#23261F] font-semibold">Targeted District Alert</span>
              </div>
            </div>

            {/* Evaluated Infrastructure Layers */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#7B8071]">
                Intersected Civil Protection Layers:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assets.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-xl border border-[#DDD6C4] bg-[#F6F3EC] flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-[#FFFDF8] border border-[#DDD6C4] shrink-0 mt-0.5 shadow-2xs">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-sans font-bold text-[#23261F]">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-[#55594C] leading-snug mt-0.5">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Early Warning Delivery Banner */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#CAD7CE] bg-[#E8EFEA] flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-11 h-11 rounded-xl bg-[#FFFDF8] border border-[#CAD7CE] flex items-center justify-center text-[#2E4A3D] shrink-0 shadow-xs">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-[#2E4A3D]">
                    Targeted Early Warning Dispatched
                  </div>
                  <div className="text-xs text-[#55594C] mt-0.5 leading-relaxed">
                    Prioritized alerts routed directly to District Magistrates, field response officers, and residents within exposed sectors.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
