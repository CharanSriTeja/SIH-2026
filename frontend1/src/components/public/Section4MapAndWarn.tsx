import React from 'react';
import { BellRing, Building2, Car, Compass, ShieldAlert, Layers } from 'lucide-react';
import mapVisual from '../../assets/images/conceptual_risk_map_1788844803426.jpg';

export const Section4MapAndWarn: React.FC = () => {
  const assets = [
    { label: 'Settlements & Villages', detail: 'Hillside habitations, schools & resident clusters', icon: Building2, color: 'text-[#B5551F]' },
    { label: 'Transport Arteries', detail: 'National highways, mountain passes & evacuation corridors', icon: Car, color: 'text-[#2E4A3D]' },
    { label: 'Bridges & Culverts', detail: 'River crossings, gorges & strategic viaducts', icon: Compass, color: 'text-[#55594C]' },
    { label: 'Lifeline Infrastructure', detail: 'Power grid substations, telecom towers & water mains', icon: ShieldAlert, color: 'text-[#B5551F]' },
  ];

  return (
    <section
      id="section-4"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Compass className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 03 &bull; Geospatial Intersection
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Map, Identify &amp; Warn
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            Predicted hazard polygons are dynamically intersected with spatial infrastructure layers, allowing targeted early warnings to be dispatched directly to vulnerable habitations and district emergency coordinators.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Conceptual Map-Style Visual */}
          <div className="lg:col-span-6 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] overflow-hidden shadow-[0_4px_16px_rgba(35,38,31,0.06)] flex flex-col justify-between">
            <div className="aspect-[16/10] w-full overflow-hidden relative">
              <img
                src={mapVisual}
                alt="Conceptual GIS risk map showing highlighted risk zone, nearby village settlement, valley road, and alert notification"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDD6C4] text-xs font-mono font-semibold text-[#23261F] shadow-xs">
                GEOSPATIAL EXPOSURE OVERLAY
              </div>
            </div>

            <div className="p-4 border-t border-[#DDD6C4] bg-[#FFFDF8] flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-[#B5551F]">
                Hazard Zone &bull; 200m Risk Buffers
              </span>
              <span className="font-mono text-[#55594C]">
                TARGETED CELL BROADCAST
              </span>
            </div>
          </div>

          {/* Right Column: Conceptual Flow & Exposed Assets */}
          <div className="lg:col-span-6 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-[0_4px_16px_rgba(35,38,31,0.06)] space-y-4 flex flex-col justify-between">
            <div>
              <div className="text-sm font-serif font-bold text-[#23261F]">
                Geospatial Impact Intersection
              </div>
              <div className="flex items-center gap-2 text-xs font-sans font-medium text-[#55594C] mt-1.5 flex-wrap">
                <span className="text-[#2E4A3D] font-semibold">AI Risk Polygon</span>
                <span>&rarr;</span>
                <span className="text-[#B5551F] font-semibold">Critical Asset Buffer</span>
                <span>&rarr;</span>
                <span className="text-[#23261F] font-semibold">District Alert Dispatch</span>
              </div>
            </div>

            {/* Identify Nearby Assets Breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#7B8071]">
                Evaluated Infrastructure Layers:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assets.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-lg border border-[#DDD6C4] bg-[#F6F3EC] flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-md bg-[#FFFDF8] border border-[#DDD6C4] shrink-0 mt-0.5 shadow-2xs">
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
            <div className="p-4 rounded-xl border border-[#CAD7CE] bg-[#E8EFEA] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFDF8] border border-[#CAD7CE] flex items-center justify-center text-[#2E4A3D] shrink-0 shadow-xs">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#2E4A3D]">
                    Civil Protection Notification Dispatched
                  </div>
                  <div className="text-xs text-[#55594C] mt-0.5">
                    Prioritized alerts routed simultaneously to district magistrates, field response officers, and registered citizens.
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
