import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export interface MapLocationInfo {
  id: string;
  name: string;
  type: 'zone' | 'report' | 'hazard' | 'village' | 'road' | 'bridge' | 'historical';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  nearbyVillage: string;
  nearbyRoad: string;
  recentReports: number;
  environmentalInfo: {
    rainfall24h: string;
    soilSaturation: string;
    slope: string;
  };
  notes?: string;
  linkedReportNumber?: string;
}

interface OfficerRiskMapProps {
  onNavigateToVerification?: () => void;
  onViewReport?: (reportNumber: string) => void;
  selectedSectorFromParent?: string | null;
}

export const OfficerRiskMap: React.FC<OfficerRiskMapProps> = ({
  onNavigateToVerification,
  onViewReport,
  selectedSectorFromParent,
}) => {
  // Simple Filters
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [showReports, setShowReports] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);

  // Selected Location Info
  const [selectedLocation, setSelectedLocation] = useState<MapLocationInfo | null>({
    id: 'zone-durtlang',
    name: 'Durtlang Ridge (Sector A)',
    type: 'zone',
    riskLevel: 'HIGH',
    nearbyVillage: 'Durtlang Village (0.6 km)',
    nearbyRoad: 'NH-54 Mountain Highway (adjacent)',
    recentReports: 3,
    environmentalInfo: {
      rainfall24h: '142 mm',
      soilSaturation: '88%',
      slope: '42° steep escarpment',
    },
    notes: 'Active tension fissures observed near ridge crest. Saturated clayey soil.',
  });

  // Risk Zones Data
  const riskZones: {
    id: string;
    name: string;
    level: 'HIGH' | 'MODERATE' | 'LOW';
    path: string;
    labelX: number;
    labelY: number;
    info: MapLocationInfo;
  }[] = [
    {
      id: 'zone-durtlang',
      name: 'Durtlang Ridge (Sector A)',
      level: 'HIGH',
      path: 'M 140,80 L 320,70 L 360,180 L 260,250 L 120,210 Z',
      labelX: 220,
      labelY: 150,
      info: {
        id: 'zone-durtlang',
        name: 'Durtlang Ridge (Sector A)',
        type: 'zone',
        riskLevel: 'HIGH',
        nearbyVillage: 'Durtlang Village (0.6 km)',
        nearbyRoad: 'NH-54 Highway (adjacent)',
        recentReports: 3,
        environmentalInfo: {
          rainfall24h: '142 mm',
          soilSaturation: '88%',
          slope: '42° steep escarpment',
        },
        notes: 'Active tension crack observed near ridge crest. Saturated clayey soil.',
      },
    },
    {
      id: 'zone-tuirial',
      name: 'Tuirial Valley (Sector B)',
      level: 'MODERATE',
      path: 'M 380,120 L 590,110 L 630,260 L 450,290 L 390,220 Z',
      labelX: 490,
      labelY: 190,
      info: {
        id: 'zone-tuirial',
        name: 'Tuirial Valley (Sector B)',
        type: 'zone',
        riskLevel: 'MODERATE',
        nearbyVillage: 'Tuirial Settlement (1.2 km)',
        nearbyRoad: 'Tuirial Bypass Link Road',
        recentReports: 2,
        environmentalInfo: {
          rainfall24h: '98 mm',
          soilSaturation: '72%',
          slope: '28° moderate slope',
        },
        notes: 'Moderate surface runoff and minor rock debris near bridge approach.',
      },
    },
    {
      id: 'zone-ramhlun',
      name: 'Ramhlun Slope (Sector C)',
      level: 'HIGH',
      path: 'M 200,280 L 370,260 L 420,400 L 280,440 L 170,380 Z',
      labelX: 280,
      labelY: 340,
      info: {
        id: 'zone-ramhlun',
        name: 'Ramhlun Slope (Sector C)',
        type: 'zone',
        riskLevel: 'HIGH',
        nearbyVillage: 'Ramhlun North (0.4 km)',
        nearbyRoad: 'Ramhlun Main Arterial',
        recentReports: 4,
        environmentalInfo: {
          rainfall24h: '135 mm',
          soilSaturation: '85%',
          slope: '39° slope',
        },
        notes: 'Water seepage along retaining walls and minor pavement deformation.',
      },
    },
    {
      id: 'zone-bawngkawn',
      name: 'Bawngkawn Basin (Sector D)',
      level: 'LOW',
      path: 'M 440,310 L 620,290 L 670,420 L 510,450 L 430,380 Z',
      labelX: 530,
      labelY: 370,
      info: {
        id: 'zone-bawngkawn',
        name: 'Bawngkawn Basin (Sector D)',
        type: 'zone',
        riskLevel: 'LOW',
        nearbyVillage: 'Bawngkawn Outskirts (0.2 km)',
        nearbyRoad: 'Bawngkawn Junction Road',
        recentReports: 0,
        environmentalInfo: {
          rainfall24h: '65 mm',
          soilSaturation: '54%',
          slope: '18° gentle gradient',
        },
        notes: 'Adequate drainage capacity. No significant slope movement reported.',
      },
    },
    {
      id: 'zone-zemabawk',
      name: 'Zemabawk Escarpment (Sector E)',
      level: 'HIGH',
      path: 'M 600,80 L 760,70 L 790,220 L 660,240 Z',
      labelX: 690,
      labelY: 150,
      info: {
        id: 'zone-zemabawk',
        name: 'Zemabawk Escarpment (Sector E)',
        type: 'zone',
        riskLevel: 'HIGH',
        nearbyVillage: 'Zemabawk Village (0.8 km)',
        nearbyRoad: 'NH-54 Eastbound Corridor',
        recentReports: 2,
        environmentalInfo: {
          rainfall24h: '150 mm',
          soilSaturation: '91%',
          slope: '44° cut slope',
        },
        notes: 'High debris accumulation in roadside gutters. Steep cut-slope unstable.',
      },
    },
  ];

  // Citizen Reports Markers
  const citizenReportMarkers = [
    {
      id: 'rep-1052',
      reportNum: '#1052',
      hazard: 'Ground Crack',
      x: 230,
      y: 130,
      info: {
        id: 'rep-1052',
        name: 'Citizen Report #1052',
        type: 'report' as const,
        riskLevel: 'HIGH' as const,
        nearbyVillage: 'Durtlang Village (400 m)',
        nearbyRoad: 'NH-54 Km 14.2',
        recentReports: 1,
        environmentalInfo: {
          rainfall24h: '142 mm',
          soilSaturation: '88%',
          slope: '42°',
        },
        notes: 'Citizen submitted photo of 15-meter ground fissure crossing hillside road.',
      },
    },
    {
      id: 'rep-1051',
      reportNum: '#1051',
      hazard: 'Road Damage',
      x: 480,
      y: 170,
      info: {
        id: 'rep-1051',
        name: 'Citizen Report #1051',
        type: 'report' as const,
        riskLevel: 'MODERATE' as const,
        nearbyVillage: 'Tuirial Settlement (800 m)',
        nearbyRoad: 'Tuirial Bypass',
        recentReports: 1,
        environmentalInfo: {
          rainfall24h: '98 mm',
          soilSaturation: '72%',
          slope: '28°',
        },
        notes: 'Pavement subsidence on outer shoulder. Vehicles passing on single lane.',
      },
    },
    {
      id: 'rep-1048',
      reportNum: '#1048',
      hazard: 'Rockfall on Slope',
      x: 320,
      y: 350,
      info: {
        id: 'rep-1048',
        name: 'Citizen Report #1048',
        type: 'report' as const,
        riskLevel: 'HIGH' as const,
        nearbyVillage: 'Ramhlun North (300 m)',
        nearbyRoad: 'Ramhlun Hill Path',
        recentReports: 1,
        environmentalInfo: {
          rainfall24h: '135 mm',
          soilSaturation: '85%',
          slope: '39°',
        },
        notes: 'Boulders falling into drainage ditch behind residential cluster.',
      },
    },
  ];

  // Verified Hazards Markers
  const verifiedHazardMarkers = [
    {
      id: 'haz-1042',
      reportNum: '#1042',
      title: 'Verified Ground Crack',
      x: 270,
      y: 170,
      info: {
        id: 'haz-1042',
        name: 'Verified Hazard #1042',
        type: 'hazard' as const,
        riskLevel: 'HIGH' as const,
        nearbyVillage: 'Durtlang Upper (500 m)',
        nearbyRoad: 'NH-54 Ridge Section',
        recentReports: 2,
        environmentalInfo: {
          rainfall24h: '142 mm',
          soilSaturation: '88%',
          slope: '42°',
        },
        notes: 'Officer inspected: Fissure width 12 cm. Speed restrictions enforced.',
      },
    },
    {
      id: 'haz-1039',
      reportNum: '#1039',
      title: 'Verified Water Seepage',
      x: 240,
      y: 310,
      info: {
        id: 'haz-1039',
        name: 'Verified Hazard #1039',
        type: 'hazard' as const,
        riskLevel: 'HIGH' as const,
        nearbyVillage: 'Ramhlun North (250 m)',
        nearbyRoad: 'Sector C Access Road',
        recentReports: 1,
        environmentalInfo: {
          rainfall24h: '135 mm',
          soilSaturation: '85%',
          slope: '39°',
        },
        notes: 'Muddy water welling up through retaining wall base. Monitoring underway.',
      },
    },
  ];

  // Villages
  const villages = [
    { name: 'Durtlang Village', x: 210, y: 190 },
    { name: 'Tuirial Settlement', x: 520, y: 230 },
    { name: 'Ramhlun North', x: 310, y: 310 },
    { name: 'Bawngkawn', x: 500, y: 390 },
    { name: 'Zemabawk', x: 710, y: 180 },
  ];

  // Bridges
  const bridges = [
    { name: 'Tuirial River Bridge', x: 440, y: 240 },
    { name: 'Chite Lui Crossing', x: 380, y: 340 },
  ];

  // Historical Landslides
  const historicalLandslides = [
    {
      id: 'hist-2023-durtlang',
      name: '2023 Durtlang Scarp Slide',
      x: 180,
      y: 110,
      info: {
        id: 'hist-2023-durtlang',
        name: '2023 Durtlang Scarp Slide (Historical Incident)',
        type: 'historical' as const,
        riskLevel: 'HIGH' as const,
        nearbyVillage: 'Durtlang Upper (300 m)',
        nearbyRoad: 'NH-54 Old Alignment',
        recentReports: 0,
        environmentalInfo: {
          rainfall24h: 'Trigger: 280 mm monsoon event',
          soilSaturation: '92% during slide',
          slope: '45° crown escarpment',
        },
        notes: 'Major rotational debris slide in July 2023. Slope stabilization and gabion retaining works commissioned in 2024.',
      },
    },
    {
      id: 'hist-2021-tuirial',
      name: '2021 Tuirial River Valley Slump',
      x: 580,
      y: 160,
      info: {
        id: 'hist-2021-tuirial',
        name: '2021 Tuirial River Valley Slump (Historical Incident)',
        type: 'historical' as const,
        riskLevel: 'MODERATE' as const,
        nearbyVillage: 'Tuirial Settlement (600 m)',
        nearbyRoad: 'Tuirial River Valley Road',
        recentReports: 0,
        environmentalInfo: {
          rainfall24h: 'Trigger: High river scour',
          soilSaturation: '84%',
          slope: '32° saturated colluvium',
        },
        notes: 'Embankment slump along river corridor. Retaining berm and drainage culverts placed in 2022.',
      },
    },
  ];

  // Synchronize sector selection from parent (e.g. Risk Status jump)
  React.useEffect(() => {
    if (!selectedSectorFromParent) return;
    const targetZone = riskZones.find(
      (z) => z.id.toLowerCase().includes(selectedSectorFromParent.toLowerCase()) ||
             z.name.toLowerCase().includes(selectedSectorFromParent.toLowerCase())
    );
    if (targetZone) {
      setSelectedLocation(targetZone.info);
    }
  }, [selectedSectorFromParent]);

  // Filtered zones
  const filteredZones = riskZones.filter((zone) => {
    if (riskFilter === 'ALL') return true;
    return zone.level === riskFilter;
  });

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-4rem)] bg-earth-50 text-earth-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. SIMPLE MAP FILTER TOOLBAR                                              */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFDF8] border-b border-earth-300 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-earth-600 font-medium">Risk Level:</span>
            <div className="inline-flex rounded-lg bg-earth-100 p-0.5 border border-earth-300">
              {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setRiskFilter(lvl)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    riskFilter === lvl
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-earth-700 hover:text-earth-900'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Risks' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Layer Toggles */}
          <div className="flex items-center gap-4 text-earth-800">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showReports}
                onChange={(e) => setShowReports(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white border-earth-300 text-brand-700 focus:ring-0"
              />
              <span>Reports</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white border-earth-300 text-brand-700 focus:ring-0"
              />
              <span>Roads</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showVillages}
                onChange={(e) => setShowVillages(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white border-earth-300 text-brand-700 focus:ring-0"
              />
              <span>Villages</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showHistorical}
                onChange={(e) => setShowHistorical(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white border-earth-300 text-purple-700 focus:ring-0"
              />
              <span>Historical Landslides</span>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN MAP AREA                                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 relative flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Map Container */}
        <div className="relative w-full h-[520px] sm:h-[580px] bg-[#0A0F1D] rounded-2xl border border-slate-700/70 overflow-hidden shadow-md">
          <svg
            viewBox="0 0 900 520"
            className="w-full h-full select-none"
            style={{ backgroundColor: '#090E1A' }}
          >
            {/* Gentle topographic contours */}
            <g opacity="0.15" stroke="#94A3B8" strokeWidth="1" fill="none">
              <path d="M 50,120 Q 200,60 400,100 T 750,80" />
              <path d="M 40,180 Q 220,130 450,160 T 800,140" />
              <path d="M 60,260 Q 250,210 500,240 T 840,220" />
              <path d="M 70,340 Q 280,300 550,330 T 850,300" />
              <path d="M 90,430 Q 320,380 600,420 T 880,390" />
            </g>

            {/* Landslide Risk Zones */}
            {filteredZones.map((zone) => {
              const isSelected = selectedLocation?.id === zone.id;
              const isHigh = zone.level === 'HIGH';
              const isMod = zone.level === 'MODERATE';

              return (
                <g
                  key={zone.id}
                  onClick={() => setSelectedLocation(zone.info)}
                  className="cursor-pointer transition-opacity"
                >
                  <path
                    d={zone.path}
                    fill={isHigh ? '#EF4444' : isMod ? '#F59E0B' : '#10B981'}
                    fillOpacity={isSelected ? 0.35 : 0.18}
                    stroke={isHigh ? '#EF4444' : isMod ? '#F59E0B' : '#10B981'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray={zone.level === 'MODERATE' ? '4 2' : undefined}
                  />
                  <text
                    x={zone.labelX}
                    y={zone.labelY}
                    fill="#F1F5F9"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow"
                  >
                    {zone.name}
                  </text>
                  <text
                    x={zone.labelX}
                    y={zone.labelY + 14}
                    fill={isHigh ? '#FCA5A5' : isMod ? '#FCD34D' : '#6EE7B7'}
                    fontSize="9.5"
                    fontWeight="500"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.level} RISK
                  </text>
                </g>
              );
            })}

            {/* Roads */}
            {showRoads && (
              <g>
                {/* NH-54 Mountain Highway */}
                <path
                  d="M 60,60 Q 200,120 340,160 T 650,220 T 880,300"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <path
                  d="M 60,60 Q 200,120 340,160 T 650,220 T 880,300"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <text
                  x="120"
                  y="75"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  NH-54 (Main Highway)
                </text>

                {/* Tuirial Link Road */}
                <path
                  d="M 340,160 Q 430,220 540,240 T 780,270"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
                <text x="450" y="225" fill="#94A3B8" fontSize="8.5" fontWeight="500">
                  Tuirial Bypass
                </text>

                {/* Ramhlun Hill Arterial */}
                <path
                  d="M 230,200 Q 260,280 290,370"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  opacity="0.7"
                />
              </g>
            )}

            {/* Bridges */}
            {showRoads &&
              bridges.map((b) => (
                <g
                  key={b.name}
                  onClick={() =>
                    setSelectedLocation({
                      id: b.name,
                      name: b.name,
                      type: 'bridge',
                      riskLevel: 'MODERATE',
                      nearbyVillage: 'River Sector Corridor',
                      nearbyRoad: 'Connected Road Crossing',
                      recentReports: 1,
                      environmentalInfo: {
                        rainfall24h: '110 mm',
                        soilSaturation: '78%',
                        slope: 'River bank scour',
                      },
                      notes: 'Bridge pier foundation stable. Water level monitored.',
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x={b.x - 10}
                    y={b.y - 4}
                    width="20"
                    height="8"
                    rx="2"
                    fill="#38BDF8"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={b.x}
                    y={b.y - 8}
                    fill="#BAE6FD"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Bridge
                  </text>
                </g>
              ))}

            {/* Villages */}
            {showVillages &&
              villages.map((v) => (
                <g
                  key={v.name}
                  onClick={() =>
                    setSelectedLocation({
                      id: v.name,
                      name: v.name,
                      type: 'village',
                      riskLevel: 'MODERATE',
                      nearbyVillage: v.name,
                      nearbyRoad: 'Local village access road',
                      recentReports: 1,
                      environmentalInfo: {
                        rainfall24h: '95 mm',
                        soilSaturation: '68%',
                        slope: '22° hillside',
                      },
                      notes: 'Habitation zone with primary road connection.',
                    })
                  }
                  className="cursor-pointer"
                >
                  <circle cx={v.x} cy={v.y} r="5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx={v.x} cy={v.y} r="2" fill="#3B82F6" />
                  <text
                    x={v.x}
                    y={v.y + 14}
                    fill="#CBD5E1"
                    fontSize="10"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {v.name}
                  </text>
                </g>
              ))}

            {/* Citizen Reports */}
            {showReports &&
              citizenReportMarkers.map((rep) => {
                const isSelected = selectedLocation?.id === rep.id;
                return (
                  <g
                    key={rep.id}
                    onClick={() => setSelectedLocation(rep.info)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={rep.x}
                      cy={rep.y}
                      r={isSelected ? 9 : 7}
                      fill="#3B82F6"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={rep.x}
                      y={rep.y + 3.5}
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      C
                    </text>
                    <text
                      x={rep.x}
                      y={rep.y - 10}
                      fill="#93C5FD"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {rep.reportNum}
                    </text>
                  </g>
                );
              })}

            {/* Verified Hazards */}
            {showReports &&
              verifiedHazardMarkers.map((haz) => {
                const isSelected = selectedLocation?.id === haz.id;
                return (
                  <g
                    key={haz.id}
                    onClick={() => setSelectedLocation(haz.info)}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={`${haz.x},${haz.y - 9} ${haz.x + 8},${haz.y + 7} ${haz.x - 8},${haz.y + 7}`}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={haz.x}
                      y={haz.y + 4}
                      fill="#FFFFFF"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      !
                    </text>
                    <text
                      x={haz.x}
                      y={haz.y - 12}
                      fill="#FCA5A5"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {haz.reportNum}
                    </text>
                  </g>
                );
              })}

            {/* Historical Landslide Locations */}
            {showHistorical &&
              historicalLandslides.map((hist) => {
                const isSelected = selectedLocation?.id === hist.id;
                return (
                  <g
                    key={hist.id}
                    onClick={() => setSelectedLocation(hist.info)}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={`${hist.x},${hist.y - 8} ${hist.x + 8},${hist.y} ${hist.x},${hist.y + 8} ${hist.x - 8},${hist.y}`}
                      fill="#A855F7"
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2 : 1.2}
                    />
                    <text
                      x={hist.x}
                      y={hist.y + 3}
                      fill="#FFFFFF"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      H
                    </text>
                    <text
                      x={hist.x}
                      y={hist.y - 11}
                      fill="#E9D5FF"
                      fontSize="8.5"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {hist.name.split(' ')[0]} Hist.
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Simple Map Legend (bottom left) */}
          <div className="absolute bottom-3 left-3 bg-[#FFFDF8]/95 backdrop-blur-sm border border-earth-300 rounded-lg p-2.5 text-[11px] text-earth-800 space-y-1.5 shadow-sm pointer-events-none">
            <div className="font-semibold text-earth-900 text-xs mb-1 font-serif">Map Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500/50 border border-red-500 inline-block" />
              <span>High Risk Area</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500/50 border border-amber-500 inline-block" />
              <span>Moderate Risk Area</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white inline-block" />
              <span>Citizen Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-red-600 inline-block" />
              <span>Verified Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded-sm bg-sky-500 border border-white inline-block" />
              <span>Bridge / Crossing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rotate-45 bg-purple-600 border border-white inline-block" />
              <span>Historical Landslide</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BASIC INFORMATION CARD FOR CLICKED LOCATION                            */}
        {/* ========================================================================= */}
        {selectedLocation && (
          <div className="mt-4 bg-[#FFFDF8] border border-earth-300 rounded-xl p-4 sm:p-5 shadow-sm text-earth-900">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Left Details */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base sm:text-lg font-semibold text-earth-900 font-serif">
                    {selectedLocation.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold font-mono ${
                      selectedLocation.riskLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : selectedLocation.riskLevel === 'MODERATE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {selectedLocation.riskLevel} RISK
                  </span>
                  <span className="text-earth-600 text-xs">
                    Type: <span className="text-earth-900 capitalize font-medium">{selectedLocation.type}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-earth-700 pt-1">
                  <div>
                    <span className="text-earth-500">Nearby Village:</span>{' '}
                    <span className="text-earth-900 font-medium">
                      {selectedLocation.nearbyVillage}
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-500">Nearby Road:</span>{' '}
                    <span className="text-earth-900 font-medium">
                      {selectedLocation.nearbyRoad}
                    </span>
                  </div>
                </div>

                {/* Environmental Information */}
                <div className="p-2.5 rounded-lg bg-earth-50 border border-earth-200 grid grid-cols-3 gap-2 text-xs shadow-xs">
                  <div>
                    <span className="text-earth-500 block text-[11px] font-mono">24h Rainfall</span>
                    <span className="text-earth-900 font-medium font-mono">
                      {selectedLocation.environmentalInfo.rainfall24h}
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-500 block text-[11px] font-mono">Soil Saturation</span>
                    <span className="text-earth-900 font-medium font-mono">
                      {selectedLocation.environmentalInfo.soilSaturation}
                    </span>
                  </div>
                  <div>
                    <span className="text-earth-500 block text-[11px] font-mono">Slope Angle</span>
                    <span className="text-earth-900 font-medium font-mono">
                      {selectedLocation.environmentalInfo.slope}
                    </span>
                  </div>
                </div>

                {selectedLocation.notes && (
                  <p className="text-xs text-earth-700 leading-relaxed">
                    <span className="text-earth-500 font-medium font-mono">Field Observation: </span>
                    {selectedLocation.notes}
                  </p>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedLocation(null)}
                  className="px-3 py-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  Close Info
                </button>

                {selectedLocation.type === 'report' && onNavigateToVerification && (
                  <button
                    type="button"
                    onClick={onNavigateToVerification}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Open in Verification</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {selectedLocation.type === 'hazard' && onViewReport && (
                  <button
                    type="button"
                    onClick={() => {
                      const repNum = selectedLocation.id === 'haz-1042' ? '#1042' : '#1039';
                      onViewReport(repNum);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>View Verified Field Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
