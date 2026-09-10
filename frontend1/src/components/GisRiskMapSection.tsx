import React, { useState } from 'react';
import { Map, Layers, Navigation, ShieldAlert, Home, School, Hospital, Truck, Check, Eye, AlertOctagon, HelpCircle } from 'lucide-react';
import MapComponent from './MapComponent';

export const GisRiskMapSection: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    zones: true,
    villages: true,
    roads: true,
    infrastructure: true,
    shelters: true,
    history: true,
  });

  const [selectedSector, setSelectedSector] = useState<'sector-a' | 'sector-b' | 'sector-c'>('sector-a');

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <section
      id="section-risk-map"
      className="relative min-h-screen lg:min-h-0 lg:h-screen flex flex-col justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 bg-earth-100 border-t border-earth-300"
    >
      <div className="max-w-7xl mx-auto w-full space-y-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-left border-b border-earth-300 pb-3">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-brand-300 bg-brand-50 text-brand-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                03 / GEOSPATIAL INTELLIGENCE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-earth-900 font-serif uppercase leading-tight">
              KNOW EXACTLY <span className="text-accent-700">WHERE THE RISK IS.</span>
            </h2>

            <p className="text-xs sm:text-sm text-earth-700 leading-relaxed font-sans">
              AI predictions become actionable when mapped geographically. BHURAKSHA connects dynamic landslide hazard zones with human settlements, road lifelines, and emergency infrastructure.
            </p>
          </div>

          {/* Risk Legend */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
            <span className="text-earth-600 uppercase font-semibold mr-1">RISK:</span>
            <span className="px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low border border-risk-low/30 font-bold">
              LOW
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-moderate/15 text-risk-moderate border border-risk-moderate/30 font-bold">
              MOD
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-high/15 text-risk-high border border-risk-high/30 font-bold">
              HIGH
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-bold">
              CRITICAL
            </span>
          </div>
        </div>

        {/* GIS Command Center Dashboard */}
        <div className="rounded-3xl border border-earth-300 bg-[#FFFDF8] overflow-hidden shadow-md">
          {/* Top GIS Status Bar */}
          <div className="p-3 sm:px-5 border-b border-earth-200 bg-earth-50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-accent-100 border border-accent-200 text-accent-700">
                <Map className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-earth-900">
                  REAL-TIME GIS SPATIAL INTELLIGENCE
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-earth-600 uppercase">
                  WGS-84 &bull; UTM ZONE 46N &bull; NORTHEAST REGION
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
              <span className="text-[10px] font-mono text-brand-800 font-bold uppercase">TELEMETRY ACTIVE</span>
            </div>
          </div>

          {/* Main Grid: Map Display on Left (8 cols), Selected Zone & Analytics on Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* GIS Interactive Visual Canvas Area */}
            <div className="lg:col-span-8 p-3 sm:p-4 bg-earth-50 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-earth-200 select-none">
              {/* Map Layer Controls Bar */}
              <div className="flex flex-wrap items-center gap-1.5 z-10 pb-2">
                <span className="text-[10px] font-mono text-earth-600 uppercase tracking-widest mr-1 font-bold">
                  LAYERS:
                </span>
                {[
                  { key: 'heatmap', label: 'AI HEATMAP' },
                  { key: 'zones', label: 'LANDSLIDE ZONES' },
                  { key: 'villages', label: 'VILLAGES' },
                  { key: 'roads', label: 'ROADS' },
                  { key: 'infrastructure', label: 'HOSPITALS' },
                  { key: 'history', label: 'HISTORICAL' },
                ].map((l) => {
                  const isActive = activeLayers[l.key as keyof typeof activeLayers];
                  return (
                    <button
                      key={l.key}
                      onClick={() => toggleLayer(l.key as keyof typeof activeLayers)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer border shadow-2xs ${
                        isActive
                          ? 'bg-brand-700 text-white border-brand-800'
                          : 'bg-white text-earth-700 border-earth-300 hover:text-earth-900 hover:bg-earth-100'
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>

              {/* Vector GIS Map Representation */}
              <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[390px] rounded-2xl border border-earth-300 bg-white overflow-hidden my-auto shadow-inner">
                <MapComponent
                  showNERBoundaries={true}
                  showSusceptibility={activeLayers.heatmap}
                  showRoads={activeLayers.roads}
                  showLandslides={activeLayers.history}
                  showHospitals={activeLayers.infrastructure}
                />

                {/* Map Bottom Metadata Overlay */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-earth-700 bg-white/90 px-3 py-1.5 rounded-xl border border-earth-300 backdrop-blur-sm shadow-xs">
                  <span>GPS: 23°43&apos;42&quot;N 92°43&apos;18&quot;E | ELEV: 1,240M</span>
                  <span className="text-accent-700 font-bold">CLICK SECTOR FOR RISK INSPECTION</span>
                </div>
              </div>
            </div>

            {/* Selected High-Risk Zone Inspector Panel (4 cols) */}
            <div className="lg:col-span-4 p-4 sm:p-5 bg-[#FFFDF8] space-y-3 text-left flex flex-col justify-between">
              <div>
                {/* Sector Header */}
                <div className="border-b border-earth-200 pb-2.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-earth-600 font-bold">
                      SELECTED HIGH-RISK ZONE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 border border-risk-critical/30 text-risk-critical font-mono font-bold text-[10px] uppercase">
                      CRITICAL SEVERITY
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-earth-900 uppercase">
                      SECTOR A
                    </h3>
                    <span className="text-xs font-mono text-earth-600">
                      Durtlang Ridge
                    </span>
                  </div>
                </div>

                {/* Risk Score Highlight */}
                <div className="p-3 rounded-2xl border border-risk-critical/30 bg-risk-critical/10 mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-risk-critical font-bold">
                      VULNERABILITY SCORE
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-risk-critical mt-0.5">
                      82%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-earth-600">
                      STATUS
                    </div>
                    <div className="text-xs font-mono font-bold text-risk-critical uppercase">
                      IMMINENT
                    </div>
                  </div>
                </div>

                {/* Affected Entities Statistics Grid (2x2 + full row) */}
                <div className="grid grid-cols-2 gap-2 text-left mb-3">
                  <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                    <div className="text-[10px] font-mono uppercase text-earth-600">
                      POPULATION
                    </div>
                    <div className="text-lg font-bold font-mono text-earth-900">
                      312
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                    <div className="text-[10px] font-mono uppercase text-earth-600">
                      HOUSEHOLDS
                    </div>
                    <div className="text-lg font-bold font-mono text-earth-900">
                      78
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                    <div className="text-[10px] font-mono uppercase text-earth-600">
                      SCHOOLS
                    </div>
                    <div className="text-lg font-bold font-mono text-accent-700">
                      01
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                    <div className="text-[10px] font-mono uppercase text-earth-600">
                      HEALTHCARE
                    </div>
                    <div className="text-lg font-bold font-mono text-brand-700">
                      01
                    </div>
                  </div>

                  <div className="col-span-2 p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-earth-600">ROAD SEGMENTS</span>
                      <span className="text-xs font-mono font-bold text-risk-high">02 IMPACTED</span>
                    </div>
                    <div className="text-[11px] font-mono text-earth-700 mt-1 truncate">
                      NH-10 (AT RISK) &bull; ROAD R-204 (BLOCKED)
                    </div>
                  </div>
                </div>
              </div>

              {/* The Core Question Statement Box */}
              <div className="p-3 rounded-2xl border border-brand-300 bg-brand-50 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-900">
                  ACTIONABLE SPATIAL INTELLIGENCE
                </div>
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-brand-800 gap-1 pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
                    <span>WHO IS AFFECTED</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
                    <span>WHAT IS AT RISK</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
                    <span>HOW TO RESPOND</span>
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
