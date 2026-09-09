import React from 'react';
import { MapPin, BellRing, Building2, Car, Compass, ShieldAlert, ArrowRight, ArrowDown } from 'lucide-react';
import mapVisual from '../../assets/images/conceptual_risk_map_1788844803426.jpg';

export const Section4MapAndWarn: React.FC = () => {
  const assets = [
    { label: 'VILLAGES', detail: 'Hillside settlements & resident clusters', icon: Building2, color: 'text-amber-400' },
    { label: 'ROADS', detail: 'National highways & lifeline evacuation routes', icon: Car, color: 'text-blue-400' },
    { label: 'BRIDGES', detail: 'River crossings & arterial viaducts', icon: Compass, color: 'text-teal-400' },
    { label: 'INFRASTRUCTURE', detail: 'Power substations & municipal water pipelines', icon: ShieldAlert, color: 'text-purple-400' },
  ];

  return (
    <section
      id="section-4"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em]">
              04 // GEOSPATIAL INTELLIGENCE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading uppercase tracking-tight">
            MAP, IDENTIFY &amp; WARN
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            BHURAKSHA 2.0 can identify where the risk is and what may be affected.
            Predicted hazard polygons are intersected with critical infrastructure layers so that targeted early warnings can be delivered directly to registered users and responsible authorities.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Conceptual Map-Style Visual */}
          <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="aspect-[16/10] w-full overflow-hidden relative">
              <img
                src={mapVisual}
                alt="Conceptual GIS risk map showing highlighted risk zone, nearby village settlement, valley road, and alert notification"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C121E] via-transparent to-black/20" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono-code text-white uppercase">
                CONCEPTUAL RISK MAP
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0C121E]/85 backdrop-blur-md flex items-center justify-between text-xs font-mono-code">
              <span className="text-amber-400 font-bold uppercase">
                RISK AREA &amp; NEARBY ASSETS
              </span>
              <span className="text-white/40 uppercase">
                TARGETED WARNING DISPATCH
              </span>
            </div>
          </div>

          {/* Right Column: Conceptual Flow & Exposed Assets */}
          <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-white/90">
                CONCEPTUAL PROCESS FLOW
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono-code text-white/50 mt-1 flex-wrap">
                <span className="text-purple-300">AI RISK PREDICTION</span>
                <span>&rarr;</span>
                <span className="text-amber-300">RISK ZONE</span>
                <span>&rarr;</span>
                <span className="text-cyan-300">IDENTIFY NEARBY</span>
                <span>&rarr;</span>
                <span className="text-emerald-300 font-bold">EARLY WARNING</span>
              </div>
            </div>

            {/* Identify Nearby Assets Breakdown */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-white/40">
                IDENTIFY NEARBY CRITICAL ASSETS:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assets.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-white/[0.05] shrink-0 mt-0.5">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-mono-code font-bold text-white uppercase">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-white/50 leading-snug mt-0.5">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Early Warning Delivery Banner */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-emerald-300">
                    TARGETED EARLY WARNING
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Actionable advisories delivered to registered residents, district authorities, and emergency response units.
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
