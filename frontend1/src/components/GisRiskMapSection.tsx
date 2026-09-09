import React, { useState } from 'react';
import { Map, Layers, Navigation, ShieldAlert, Home, School, Hospital, Truck, Check, Eye, AlertOctagon, HelpCircle } from 'lucide-react';

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
      className="relative min-h-screen lg:min-h-0 lg:h-screen flex flex-col justify-center py-4 lg:py-5 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto w-full space-y-3 sm:space-y-3.5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-left border-b border-white/10 pb-2.5">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                03 / GEOSPATIAL INTELLIGENCE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              KNOW EXACTLY <span className="text-amber-400">WHERE THE RISK IS.</span>
            </h2>

            <p className="text-xs text-slate-300 leading-normal font-normal">
              AI predictions become actionable when mapped geographically. BHURAKSHA 2.0 connects dynamic landslide hazard zones with human settlements, road lifelines, and emergency infrastructure.
            </p>
          </div>

          {/* Risk Legend */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code shrink-0">
            <span className="text-white/40 uppercase mr-1">RISK:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              LOW
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              MOD
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
              HIGH
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold animate-pulse">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Large Sophisticated GIS Command Center Dashboard */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] overflow-hidden shadow-2xl">
          {/* Top GIS Status Bar */}
          <div className="p-2.5 sm:px-4 border-b border-white/10 bg-[#0A0F1A] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <Map className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  REAL-TIME GIS COMMAND SYSTEM
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono-code text-white/50 uppercase">
                  WGS-84 // UTM ZONE 46N // NE HILLS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono-code text-emerald-400 uppercase">TELEMETRY ACTIVE</span>
            </div>
          </div>

          {/* Main Grid: Map Display on Left (8 cols), Selected Zone & Analytics on Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* GIS Interactive Visual Canvas Area */}
            <div className="lg:col-span-8 p-3 sm:p-4 bg-[#070B14] relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 select-none">
              {/* Map Layer Controls Bar */}
              <div className="flex flex-wrap items-center gap-1.5 z-10 pb-2">
                <span className="text-[10px] font-mono-code text-white/50 uppercase tracking-widest mr-1">
                  LAYERS:
                </span>
                {[
                  { key: 'heatmap', label: 'AI HEATMAP' },
                  { key: 'zones', label: 'LANDSLIDE ZONES' },
                  { key: 'villages', label: 'VILLAGES' },
                  { key: 'roads', label: 'ROADS' },
                  { key: 'infrastructure', label: 'SCHOOLS/HOSPITALS' },
                  { key: 'shelters', label: 'SHELTERS' },
                  { key: 'history', label: 'HISTORICAL' },
                ].map((l) => {
                  const isActive = activeLayers[l.key as keyof typeof activeLayers];
                  return (
                    <button
                      key={l.key}
                      onClick={() => toggleLayer(l.key as keyof typeof activeLayers)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono-code uppercase font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>

              {/* Vector GIS Map Representation */}
              <div className="relative w-full h-[310px] sm:h-[340px] lg:h-[350px] rounded-lg border border-white/10 bg-[#090D18] overflow-hidden my-auto">
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full object-cover"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Coordinate Grid Background */}
                  <defs>
                    <pattern id="gisGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="highRiskHeatA" cx="45%" cy="40%" r="28%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#F97316" stopOpacity="0.35" />
                      <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="moderateRiskHeatB" cx="72%" cy="65%" r="22%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="70%" stopColor="#10B981" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect width="800" height="500" fill="url(#gisGrid)" />

                  {/* Topographic Elevation Contours */}
                  <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
                    <path d="M 20 180 Q 200 120 400 160 T 780 140" />
                    <path d="M 20 230 Q 180 190 380 210 T 780 200" />
                    <path d="M 20 280 Q 220 250 420 270 T 780 260" />
                    <path d="M 20 340 Q 240 320 440 330 T 780 320" />
                    <path d="M 20 400 Q 260 380 460 390 T 780 390" />
                  </g>

                  {/* AI Risk Heatmap Polygons */}
                  {activeLayers.heatmap && (
                    <g>
                      <circle cx="360" cy="200" r="140" fill="url(#highRiskHeatA)" />
                      <circle cx="580" cy="320" r="110" fill="url(#moderateRiskHeatB)" />
                    </g>
                  )}

                  {/* Roads / Highway Corridors */}
                  {activeLayers.roads && (
                    <g>
                      {/* Main Lifeline Highway NH-10 */}
                      <path
                        d="M 60 450 Q 240 380 360 210 T 720 80"
                        stroke="#F59E0B"
                        strokeWidth="3.5"
                        fill="none"
                        strokeDasharray="6 3"
                      />
                      <text x="180" y="340" fill="#F59E0B" fontSize="10" fontFamily="monospace">
                        NH-10 (AT RISK)
                      </text>

                      {/* Arterial Road R-204 */}
                      <path
                        d="M 360 210 Q 420 240 500 290"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <text x="440" y="250" fill="#EF4444" fontSize="9" fontFamily="monospace">
                        ROAD R-204 (BLOCKED)
                      </text>

                      {/* Village Road V-18 */}
                      <path
                        d="M 360 210 Q 300 280 250 380"
                        stroke="#10B981"
                        strokeWidth="2"
                        fill="none"
                      />
                      <text x="260" y="320" fill="#10B981" fontSize="9" fontFamily="monospace">
                        V-18 (OPEN)
                      </text>
                    </g>
                  )}

                  {/* Landslide Risk Zones Geofence Polygons */}
                  {activeLayers.zones && (
                    <g>
                      {/* Sector A Perimeter */}
                      <polygon
                        points="300,140 430,160 450,260 330,280 280,210"
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="cursor-pointer hover:fill-red-500/30 transition-all"
                        onClick={() => setSelectedSector('sector-a')}
                      />
                      <rect x="325" y="145" width="80" height="20" rx="3" fill="#EF4444" />
                      <text x="365" y="159" fill="#000" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        SECTOR A (82%)
                      </text>

                      {/* Sector B */}
                      <polygon
                        points="520,270 650,280 640,380 530,370"
                        fill="rgba(245, 158, 11, 0.15)"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="cursor-pointer"
                        onClick={() => setSelectedSector('sector-b')}
                      />
                      <text x="585" y="320" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        SECTOR B (54%)
                      </text>
                    </g>
                  )}

                  {/* Village Settlements */}
                  {activeLayers.villages && (
                    <g>
                      <circle cx="340" cy="240" r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="340" y="260" fill="#93C5FD" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        Durtlang Ridge (Vill.)
                      </text>

                      <circle cx="610" cy="350" r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
                      <text x="610" y="370" fill="#93C5FD" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        Lower Bawk
                      </text>
                    </g>
                  )}

                  {/* Infrastructure: Schools, Hospitals, Bridges */}
                  {activeLayers.infrastructure && (
                    <g>
                      {/* School in Sector A */}
                      <rect x="385" y="195" width="12" height="12" fill="#8B5CF6" stroke="#FFF" strokeWidth="1" />
                      <text x="391" y="190" fill="#C4B5FD" fontSize="8" textAnchor="middle" fontFamily="monospace">
                        School
                      </text>

                      {/* Primary Health Clinic */}
                      <circle cx="320" cy="180" r="6" fill="#EC4899" stroke="#FFF" strokeWidth="1" />
                      <text x="320" y="170" fill="#F472B6" fontSize="8" textAnchor="middle" fontFamily="monospace">
                        PHC Clinic
                      </text>

                      {/* Teesta Valley Bridge */}
                      <rect x="235" y="370" width="16" height="6" fill="#F59E0B" stroke="#000" strokeWidth="1" />
                      <text x="243" y="390" fill="#FCD34D" fontSize="8" textAnchor="middle" fontFamily="monospace">
                        Bridge #12
                      </text>
                    </g>
                  )}

                  {/* Safe Shelters */}
                  {activeLayers.shelters && (
                    <g>
                      <polygon points="210,320 220,305 230,320" fill="#10B981" stroke="#FFF" strokeWidth="1" />
                      <text x="220" y="335" fill="#6EE7B7" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        SHELTER 01 (RELIEF CTR)
                      </text>
                    </g>
                  )}

                  {/* Historical Landslide Scarps */}
                  {activeLayers.history && (
                    <g>
                      <path d="M 390 230 L 410 245 L 395 255 Z" fill="#6B7280" stroke="#EF4444" strokeWidth="1" />
                      <text x="430" y="245" fill="#9CA3AF" fontSize="8" fontFamily="monospace">
                        HISTORIC SCARP (2018)
                      </text>
                    </g>
                  )}
                </svg>

                {/* Map Bottom Metadata Overlay */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono-code text-white/50 bg-[#080C14]/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                  <span>GPS: 23°43&apos;42&quot;N 92°43&apos;18&quot;E | ELEV: 1,240M</span>
                  <span className="text-amber-400 font-bold">CLICK SECTOR FOR RISK INSPECTION</span>
                </div>
              </div>
            </div>

            {/* Selected High-Risk Zone Inspector Panel (4 cols) */}
            <div className="lg:col-span-4 p-3.5 sm:p-4 bg-[#0A0E18] space-y-2.5 text-left flex flex-col justify-between">
              <div>
                {/* Sector Header */}
                <div className="border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono-code uppercase tracking-wider text-white/50">
                      SELECTED HIGH-RISK ZONE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 font-mono-code font-bold text-[9px] uppercase animate-pulse">
                      HIGH SEVERITY
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-white uppercase">
                      SECTOR A
                    </h3>
                    <span className="text-[10px] font-mono-code text-slate-400">
                      Durtlang Ridge
                    </span>
                  </div>
                </div>

                {/* Risk Score Highlight */}
                <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-mono-code uppercase tracking-wider text-red-300">
                      VULNERABILITY SCORE
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-red-400">
                      82%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono-code uppercase text-white/40">
                      STATUS
                    </div>
                    <div className="text-xs font-mono-code font-bold text-red-300">
                      IMMINENT
                    </div>
                  </div>
                </div>

                {/* Affected Entities Statistics Grid (2x2 + full row) */}
                <div className="grid grid-cols-2 gap-2 text-left mb-2">
                  <div className="p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="text-[9px] font-mono-code uppercase text-white/50">
                      POPULATION
                    </div>
                    <div className="text-base font-bold font-heading text-white">
                      312
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="text-[9px] font-mono-code uppercase text-white/50">
                      HOUSEHOLDS
                    </div>
                    <div className="text-base font-bold font-heading text-white">
                      78
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="text-[9px] font-mono-code uppercase text-white/50">
                      SCHOOLS
                    </div>
                    <div className="text-base font-bold font-heading text-purple-400">
                      01
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="text-[9px] font-mono-code uppercase text-white/50">
                      HEALTHCARE
                    </div>
                    <div className="text-base font-bold font-heading text-pink-400">
                      01
                    </div>
                  </div>

                  <div className="col-span-2 p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono-code uppercase text-white/50">ROAD SEGMENTS</span>
                      <span className="text-xs font-bold font-heading text-amber-400">02 IMPACTED</span>
                    </div>
                    <div className="text-[9px] font-mono-code text-white/60 mt-0.5 truncate">
                      NH-10 (AT RISK) &bull; ROAD R-204 (BLOCKED)
                    </div>
                  </div>
                </div>
              </div>

              {/* The Core Question Statement Box */}
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
                <div className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-amber-300">
                  A RISK MAP MUST ANSWER MORE THAN &quot;WHERE?&quot;
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono-code text-white pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>WHO IS AFFECTED?</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>WHAT IS AT RISK?</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>HOW TO RESPOND?</span>
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
