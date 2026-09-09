import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  Activity,
  MapPin,
  BellRing,
  Navigation,
  Send,
  Sliders,
  CheckCircle2,
  Route,
  CloudRain,
  Radio,
  Layers,
  Sparkles,
  Smartphone,
  Users,
  Compass,
  FileText,
  Clock,
  Eye,
  Camera,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Wifi,
  WifiOff,
  Flame,
} from 'lucide-react';
import {
  RISK_ZONES,
  ROAD_LIFELINES,
  INITIAL_FIELD_REPORTS,
  IMD_WEATHER_STATIONS,
  IN_SITU_SENSORS,
  MULTILINGUAL_BROADCASTS,
} from '../data/mockData';
import { RiskZone, FieldIncidentReport, RoadLifeline, MultilingualBroadcast } from '../types';

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldReports: FieldIncidentReport[];
  onOpenReportModal: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

export const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  isOpen,
  onClose,
  fieldReports,
  onOpenReportModal,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'gis' | 'ml_engine' | 'roads' | 'broadcast' | 'telemetry' | 'reports'>('gis');
  
  // Selected Zone for GIS inspection
  const [selectedZone, setSelectedZone] = useState<RiskZone>(RISK_ZONES[0]);

  // GIS Layer Toggles
  const [showRadar, setShowRadar] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // AI/ML Interactive Simulation Parameters
  const [simRainfall, setSimRainfall] = useState(184);
  const [simSoilSaturation, setSimSoilSaturation] = useState(89);
  const [simSlopeAngle, setSimSlopeAngle] = useState(38);
  const [simPorePressure, setSimPorePressure] = useState(48);
  const [simLithology, setSimLithology] = useState<'fractured_shale' | 'sandstone' | 'clay_interbed' | 'granite'>('fractured_shale');

  // Multi-lingual broadcast state
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'lus' | 'as' | 'hi' | 'bn'>('en');
  const [broadcastDispatched, setBroadcastDispatched] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  // Field Reports local state (allows updating triage status)
  const [reportsList, setReportsList] = useState<FieldIncidentReport[]>(fieldReports);

  // Keep synced with parent props if added
  React.useEffect(() => {
    setReportsList(fieldReports);
  }, [fieldReports]);

  // Dynamic ML Predictive Calculations
  const calculatedMetrics = useMemo(() => {
    // Factor of safety heuristic calculation
    // Base strength ~ 2.2 for dry 30 deg slope; drops with rain, pore pressure, and slope
    const lithologyCohesion = {
      fractured_shale: 0.85,
      clay_interbed: 0.72,
      sandstone: 1.15,
      granite: 1.6,
    }[simLithology];

    const slopeRad = (simSlopeAngle * Math.PI) / 180;
    const resistingForce = Math.cos(slopeRad) * (100 - simPorePressure * 0.9) * lithologyCohesion;
    const drivingForce = Math.sin(slopeRad) * (60 + simRainfall * 0.25);
    
    let fos = Math.max(0.65, Math.min(2.8, (resistingForce / drivingForce) * 1.8));
    fos = Number(fos.toFixed(2));

    // Failure probability inverse of FoS
    let prob = Math.round(Math.max(5, Math.min(98, (1 / (1 + Math.exp((fos - 1.1) * 3.5))) * 100)));
    
    // Risk level
    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (fos < 1.0) level = 'CRITICAL';
    else if (fos < 1.25) level = 'HIGH';
    else if (fos < 1.5) level = 'MODERATE';

    // Lead time estimate
    let leadTime = '> 48 hrs';
    if (fos < 0.9) leadTime = '1 - 3 hrs (IMMINENT)';
    else if (fos < 1.1) leadTime = '6 - 12 hrs';
    else if (fos < 1.3) leadTime = '18 - 24 hrs';

    return { fos, prob, level, leadTime };
  }, [simRainfall, simSoilSaturation, simSlopeAngle, simPorePressure, simLithology]);

  // Trigger simulated multi-lingual alert broadcast
  const handleDispatchAlert = () => {
    if (broadcastDispatched) return;
    setBroadcastDispatched(true);
    setDispatchProgress(0);

    const interval = setInterval(() => {
      setDispatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleTriageReport = (id: string, newStatus: FieldIncidentReport['status']) => {
    setReportsList((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, status: newStatus } : rep))
    );
  };

  if (!isOpen) return null;

  const currentBroadcast = MULTILINGUAL_BROADCASTS.find((b) => b.languageCode === selectedLanguage) || MULTILINGUAL_BROADCASTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-7xl h-[94vh] bg-[#070B12] border border-white/20 rounded-3xl flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden text-left">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#0A0F1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white font-heading tracking-wide uppercase">
                  BHURAKSHA 2.0 Unified Command Center
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  NER REGIONAL HUB
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-white/50 block">
                MULTI-HAZARD EARLY WARNING SYSTEM // MEGHALAYA • MIZORAM • SIKKIM • NAGALAND • ASSAM
              </span>
            </div>
          </div>

          {/* Quick Header Actions: Offline Switch & Report Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Low-Bandwidth / Offline Mode Simulation Switch */}
            <button
              onClick={onToggleOfflineMode}
              title="Toggle Remote Low-Network / Offline Storage Sync Mode"
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono-code font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>OFFLINE CACHE ACTIVE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ONLINE // CLOUD SYNCED</span>
                </>
              )}
            </button>

            {/* Quick Report Citizen Incident */}
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-code text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ REPORT HAZARD</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Navigation Tabs */}
        <div className="px-5 py-2 border-b border-white/10 bg-white/[0.01] flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'gis', label: 'GIS Dashboard & Heatmaps', icon: MapPin, badge: '5 SECTORS' },
            { id: 'ml_engine', label: 'AI/ML Predictive Analytics', icon: Cpu, badge: 'ST-GNN' },
            { id: 'roads', label: 'Lifeline Highway Status', icon: Route, badge: '5 HIGHWAYS' },
            { id: 'broadcast', label: 'Multi-Lingual Alerts (CAP)', icon: BellRing, badge: '5 LANGUAGES' },
            { id: 'telemetry', label: 'In-Situ Sensors & IMD Radar', icon: Activity, badge: 'LIVE' },
            { id: 'reports', label: 'Citizen Field Reports', icon: Camera, badge: `${reportsList.length} LOGGED` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 rounded-xl text-xs font-mono-code uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-extrabold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-black/15 text-black' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Viewports */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080C14]">
          
          {/* TAB 1: REAL-TIME GIS DASHBOARD & RISK HEATMAPS */}
          {activeTab === 'gis' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              {/* Left Column: Interactive GIS Map Stage */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl bg-[#03070E] border border-white/15 overflow-hidden shadow-inner flex flex-col justify-between p-4">
                  {/* Map Layer Overlay Background with Contour Topography */}
                  <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" />
                      </pattern>
                      <radialGradient id="radarSweep" cx="45%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                        <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="80%" stopColor="#10b981" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gis-grid)" />
                    
                    {/* Topographic elevation contours of North Eastern hill ranges */}
                    <path d="M 40 180 Q 220 80 440 160 T 800 120" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                    <path d="M 20 280 Q 260 210 520 280 T 900 240" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                    <path d="M 60 380 Q 310 320 600 390 T 880 340" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />

                    {/* IMD Radar Sweep cloud layer */}
                    {showRadar && (
                      <circle cx="48%" cy="42%" r="220" fill="url(#radarSweep)" />
                    )}

                    {/* Lifeline Highway Vector Polyline */}
                    {showRoads && (
                      <>
                        <path
                          d="M 120 440 L 220 360 L 320 300 L 460 210 L 590 180 L 760 140"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="3.5"
                          strokeDasharray="6 3"
                          className="opacity-70"
                        />
                        {/* Blocked section highlighted */}
                        <path
                          d="M 320 300 L 360 270"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>

                  {/* Top Floating GIS Controls Bar */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping-slow" />
                      <span className="text-[11px] font-mono-code font-bold uppercase text-white tracking-wider">
                        NER SPATIAL GIS LAYER // LIVE TELEMETRY
                      </span>
                    </div>

                    {/* Layer Toggles */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-code">
                      <button
                        onClick={() => setShowRadar(!showRadar)}
                        className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showRadar
                            ? 'bg-red-500/20 border-red-500/40 text-red-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        IMD Radar
                      </button>
                      <button
                        onClick={() => setShowRoads(!showRoads)}
                        className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showRoads
                            ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        Road Arteries
                      </button>
                      <button
                        onClick={() => setShowSensors(!showSensors)}
                        className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showSensors
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        IoT Sensors
                      </button>
                      <button
                        onClick={() => setShowReports(!showReports)}
                        className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showReports
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        Field Reports
                      </button>
                    </div>
                  </div>

                  {/* Interactive Hazard Zone Node Pins on Map */}
                  <div className="relative z-10 my-auto grid grid-cols-2 sm:grid-cols-3 gap-6 p-4">
                    {RISK_ZONES.map((zone) => {
                      const isSelected = selectedZone.id === zone.id;
                      return (
                        <div
                          key={zone.id}
                          onClick={() => setSelectedZone(zone)}
                          className={`p-3 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-red-950/40 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-105'
                              : 'bg-black/50 border-white/15 hover:border-white/30 hover:bg-black/70'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-mono-code uppercase tracking-wider text-white/50">
                              {zone.state}
                            </span>
                            <span
                              className={`text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                                zone.riskLevel === 'CRITICAL'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {zone.riskLevel}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white uppercase font-heading truncate">
                            {zone.name.split('—')[1] || zone.name}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] font-mono-code text-white/60 mt-2">
                            <span>Rain: {zone.rainfall24h}mm</span>
                            <span className="font-bold text-white">{zone.riskScore}% RISK</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Map Bottom Legend & Scale */}
                  <div className="relative z-10 flex items-center justify-between text-[9.5px] font-mono-code text-white/50 bg-black/60 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical Zone (&gt;80%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Warning (60-80%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Highway Lifeline
                      </span>
                    </div>
                    <span>DATUM: WGS-84 // GSI HAZARD ATLAS</span>
                  </div>
                </div>

                {/* Road Lifelines Mini Overview under GIS */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono-code text-white">
                      <Route className="w-3.5 h-3.5 text-sky-400" />
                      <span>CRITICAL ARTERIAL CORRIDORS STATUS</span>
                    </div>
                    <span className="text-[10px] font-mono-code text-white/40">BORDER ROADS ORG (BRO) FEED</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-code">
                    {ROAD_LIFELINES.slice(0, 3).map((road) => (
                      <div key={road.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{road.highwayCode}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              road.status === 'BLOCKED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : road.status === 'RESTRICTED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {road.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate">{road.corridorName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Sector Deep Geotechnical & Impact Inspector */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-5 border border-white/15 bg-white/[0.02] backdrop-blur-xl text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div>
                      <span className="text-[9.5px] font-mono-code uppercase tracking-wider text-emerald-400 block">
                        ACTIVE TARGET SECTOR
                      </span>
                      <h3 className="text-base font-extrabold text-white font-heading uppercase">
                        {selectedZone.name}
                      </h3>
                      <span className="text-[10px] font-mono-code text-white/50">
                        {selectedZone.region}, {selectedZone.state}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-white font-heading block leading-none">
                        {selectedZone.riskScore}%
                      </span>
                      <span className="text-[9px] font-mono-code text-red-400 font-bold uppercase">
                        {selectedZone.riskLevel} SEVERITY
                      </span>
                    </div>
                  </div>

                  {/* 4 Sensor Telemetry Rows */}
                  <div className="space-y-2 mb-4 text-xs font-mono-code">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-white/60">Rainfall (24h)</span>
                      <span className="font-bold text-white">{selectedZone.rainfall24h} mm</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-white/60">Soil Moisture (VWC)</span>
                      <span className="font-bold text-emerald-400">{selectedZone.soilSaturation}%</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-white/60">Slope Incline</span>
                      <span className="font-bold text-white">{selectedZone.slopeAngle}° Steep</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-white/60">Substrate Formation</span>
                      <span className="font-bold text-amber-400">Weathered Shale Interbed</span>
                    </div>
                  </div>

                  {/* Impacted Demographics & Infrastructure */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 mb-4">
                    <span className="text-[9.5px] font-mono-code uppercase tracking-wider text-white/40 block mb-2">
                      VULNERABLE ASSETS IDENTIFIED
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono-code">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[9px] text-white/40 block">POPULATION</span>
                        <span className="text-sm font-extrabold text-white font-heading">
                          {selectedZone.peopleAtRisk}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[9px] text-white/40 block">RECIPIENTS</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-heading">
                          {selectedZone.registeredRecipients}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[9px] text-white/40 block">CIVIC ASSETS</span>
                        <span className="text-sm font-extrabold text-white font-heading">
                          {selectedZone.infrastructure.schools + selectedZone.infrastructure.hospitals} Facilities
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[9px] text-white/40 block">ROAD CUTS</span>
                        <span className="text-sm font-extrabold text-white font-heading">
                          {selectedZone.infrastructure.roadSegments} Segments
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evacuation Target Shelter Quick Card */}
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono-code text-emerald-400 font-bold uppercase">
                        DESIGNATED SAFE HAVEN
                      </span>
                      <span className="text-[9px] font-mono-code text-white/50">{selectedZone.shelter.distanceKm} km</span>
                    </div>
                    <h5 className="text-xs font-bold text-white font-heading uppercase">
                      {selectedZone.shelter.name}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] font-mono-code text-white/60 mt-2">
                      <span>Capacity: {selectedZone.shelter.capacity}</span>
                      <span className="text-emerald-300 font-bold">
                        {selectedZone.shelter.currentOccupancy} Occupied
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI/ML PREDICTIVE ANALYTICS ENGINE */}
          {activeTab === 'ml_engine' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-left">
              {/* Left Column: Interactive Telemetry Sliders & Parameters */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-6 border border-white/15 bg-white/[0.02] backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-base font-extrabold text-white font-heading uppercase">
                          AI Geotechnical Stability Simulator
                        </h3>
                        <span className="text-[10px] font-mono-code text-white/50">
                          SPATIAL-TEMPORAL GRAPH NEURAL NET + LIMIT EQUILIBRIUM
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSimRainfall(184);
                        setSimSoilSaturation(89);
                        setSimSlopeAngle(38);
                        setSimPorePressure(48);
                        setSimLithology('fractured_shale');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono-code transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* 4 Interactive Parameter Sliders */}
                  <div className="space-y-4 font-mono-code text-xs">
                    {/* Slider 1: 24h Rainfall */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 uppercase">24-Hour Precipitation (IMD / Radar)</span>
                        <span className="text-base font-bold text-white font-heading">{simRainfall} mm</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="350"
                        value={simRainfall}
                        onChange={(e) => setSimRainfall(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-white/40 mt-1">
                        <span>Light (20mm)</span>
                        <span>Threshold (120mm)</span>
                        <span>Cloudburst (350mm)</span>
                      </div>
                    </div>

                    {/* Slider 2: Soil Moisture VWC */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 uppercase">Soil Volumetric Water Content</span>
                        <span className="text-base font-bold text-emerald-400 font-heading">{simSoilSaturation}% VWC</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="98"
                        value={simSoilSaturation}
                        onChange={(e) => setSimSoilSaturation(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-white/40 mt-1">
                        <span>Dry (30%)</span>
                        <span>Field Cap (70%)</span>
                        <span>Liquefaction (98%)</span>
                      </div>
                    </div>

                    {/* Slider 3: Slope Angle */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 uppercase">Critical Slope Angle (LiDAR DEM)</span>
                        <span className="text-base font-bold text-white font-heading">{simSlopeAngle}° Incline</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        value={simSlopeAngle}
                        onChange={(e) => setSimSlopeAngle(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-white/40 mt-1">
                        <span>Gentle (15°)</span>
                        <span>Critical (35°)</span>
                        <span>Escarpment (60°)</span>
                      </div>
                    </div>

                    {/* Slider 4: Pore-Water Pressure */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 uppercase">Subsurface Pore Pressure (Piezometer)</span>
                        <span className="text-base font-bold text-red-400 font-heading">{simPorePressure} kPa</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={simPorePressure}
                        onChange={(e) => setSimPorePressure(Number(e.target.value))}
                        className="w-full accent-red-400 cursor-pointer"
                      />
                    </div>

                    {/* Lithology Selector */}
                    <div>
                      <span className="text-[10px] text-white/50 uppercase block mb-1.5">
                        Geological Substrate Stratification
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'fractured_shale', label: 'Weathered Shale' },
                          { id: 'clay_interbed', label: 'Clay Interbed' },
                          { id: 'sandstone', label: 'Jointed Sandstone' },
                          { id: 'granite', label: 'Massive Granite' },
                        ].map((litho) => (
                          <button
                            key={litho.id}
                            type="button"
                            onClick={() => setSimLithology(litho.id as typeof simLithology)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              simLithology === litho.id
                                ? 'bg-white text-black font-bold border-white'
                                : 'bg-white/[0.02] text-white/60 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <span className="text-[11px] block">{litho.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Model Inferred Outcomes */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-6 border border-white/15 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                      <span className="text-xs font-bold uppercase font-mono-code text-white">
                        INSTANTANEOUS INFERENCE RESULTS
                      </span>
                      <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                        LATENCY: 12ms
                      </span>
                    </div>

                    {/* Big Factor of Safety & Risk Gauge */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <span className="text-[9.5px] font-mono-code uppercase text-white/50 block mb-1">
                          FACTOR OF SAFETY (FoS)
                        </span>
                        <div
                          className={`text-3xl sm:text-4xl font-extrabold font-heading ${
                            calculatedMetrics.fos < 1.0
                              ? 'text-red-400'
                              : calculatedMetrics.fos < 1.25
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {calculatedMetrics.fos}
                        </div>
                        <span className="text-[9px] font-mono-code text-white/40 block mt-1">
                          {calculatedMetrics.fos < 1.0 ? 'FAILURE IMMINENT' : 'STABLE MARGIN'}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <span className="text-[9.5px] font-mono-code uppercase text-white/50 block mb-1">
                          FAILURE PROBABILITY
                        </span>
                        <div className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                          {calculatedMetrics.prob}%
                        </div>
                        <span
                          className={`text-[9px] font-mono-code font-bold uppercase block mt-1 ${
                            calculatedMetrics.level === 'CRITICAL'
                              ? 'text-red-400'
                              : calculatedMetrics.level === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {calculatedMetrics.level} LEVEL
                        </span>
                      </div>
                    </div>

                    {/* Estimated Lead Time Callout */}
                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 mb-5 text-left">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-mono-code font-bold uppercase mb-1">
                        <Clock className="w-4 h-4" />
                        <span>ESTIMATED LEAD TIME TO COLLAPSE</span>
                      </div>
                      <div className="text-xl font-extrabold text-white font-heading">
                        {calculatedMetrics.leadTime}
                      </div>
                      <p className="text-[10px] text-white/60 font-mono-code mt-1">
                        Computed by temporal decay curve analysis over continuous rainfall saturation vectors.
                      </p>
                    </div>

                    {/* Model Architecture Stack */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono-code space-y-2">
                      <span className="text-[9.5px] text-white/40 uppercase block">ACTIVE MODEL PIPELINE</span>
                      <div className="flex justify-between text-white/70">
                        <span>Spatial Model</span>
                        <span className="text-white">Spatial-Temporal GNN (PyG)</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Ensemble Verifier</span>
                        <span className="text-white">XGBoost + Random Forest</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Validation Dataset</span>
                        <span className="text-white">15 yrs GSI NER Landslide Atlas</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Confidence Score</span>
                        <span className="text-emerald-400 font-bold">94.8% Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIFELINE HIGHWAYS & ROAD CONNECTIVITY */}
          {activeTab === 'roads' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-heading uppercase">
                    North Eastern Arterial Road Network & Blockage Tracker
                  </h3>
                  <span className="text-xs font-mono-code text-white/50">
                    REAL-TIME TRANSIT CORRIDORS MONITORING (BRO, NHIDCL & STATE PWD)
                  </span>
                </div>
                <span className="text-xs font-mono-code text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  UPDATED 8 MINS AGO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROAD_LIFELINES.map((road) => (
                  <div
                    key={road.id}
                    className={`p-5 rounded-3xl border transition-all text-left backdrop-blur-xl ${
                      road.status === 'BLOCKED'
                        ? 'bg-red-950/15 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                        : road.status === 'RESTRICTED'
                        ? 'bg-amber-950/15 border-amber-500/40'
                        : 'bg-white/[0.02] border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono-code font-bold text-xs">
                          {road.highwayCode}
                        </span>
                        <span className="text-xs font-mono-code text-white/50">{road.state}</span>
                      </div>
                      <span
                        className={`text-xs font-mono-code font-bold px-2.5 py-0.5 rounded-full ${
                          road.status === 'BLOCKED'
                            ? 'bg-red-500 text-white'
                            : road.status === 'RESTRICTED'
                            ? 'bg-amber-500 text-black'
                            : 'bg-emerald-500 text-black'
                        }`}
                      >
                        {road.status}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-white font-heading uppercase mb-2">
                      {road.corridorName}
                    </h4>

                    {/* Blockage Cause / Road conditions */}
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-3 text-xs font-mono-code space-y-1.5">
                      {road.blockageCause && (
                        <div>
                          <span className="text-[9.5px] text-white/40 uppercase block">Hazard Impact:</span>
                          <span className="text-white/90">{road.blockageCause}</span>
                        </div>
                      )}
                      {road.estimatedClearance && (
                        <div>
                          <span className="text-[9.5px] text-white/40 uppercase block">Transit Advisory:</span>
                          <span className="text-amber-300 font-semibold">{road.estimatedClearance}</span>
                        </div>
                      )}
                      {road.bypassRouteName && (
                        <div>
                          <span className="text-[9.5px] text-white/40 uppercase block">Designated Bypass Route:</span>
                          <span className="text-emerald-400 font-semibold">{road.bypassRouteName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-code text-white/50 pt-2 border-t border-white/10">
                      <span>Machinery: {road.activeMachinery}</span>
                      <span className="text-white font-bold">{road.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATED MULTI-LINGUAL EARLY WARNING SYSTEM (CAP) */}
          {activeTab === 'broadcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-left">
              {/* Left Column: Language Selector & Multi-Channel Dispatch */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-6 border border-white/15 bg-white/[0.02] backdrop-blur-xl">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 mb-4">
                    <Radio className="w-5 h-5 text-red-400" />
                    <div>
                      <h3 className="text-base font-extrabold text-white font-heading uppercase">
                        Emergency Alert Broadcaster
                      </h3>
                      <span className="text-[10px] font-mono-code text-white/50">
                        COMMON ALERTING PROTOCOL (CAP V1.2) CELL BROADCAST
                      </span>
                    </div>
                  </div>

                  {/* Regional Languages Switcher */}
                  <div className="mb-4">
                    <label className="text-[10px] font-mono-code text-white/50 uppercase block mb-2">
                      Select Target Language / Region:
                    </label>
                    <div className="space-y-1.5 font-mono-code text-xs">
                      {MULTILINGUAL_BROADCASTS.map((lang) => (
                        <button
                          key={lang.languageCode}
                          onClick={() => setSelectedLanguage(lang.languageCode)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedLanguage === lang.languageCode
                              ? 'bg-white text-black font-bold border-white'
                              : 'bg-white/[0.03] text-white/70 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{lang.nativeLabel}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              selectedLanguage === lang.languageCode ? 'bg-black/20 text-black' : 'text-white/40'
                            }`}
                          >
                            {lang.languageName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience Statistics */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 text-xs font-mono-code space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-white/60">Geofence Polygon:</span>
                      <span className="text-white font-bold">Sector A (Durtlang Hill)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Registered Phone Numbers:</span>
                      <span className="text-emerald-400 font-bold">2,481 Devices</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Cell-Broadcast Towers:</span>
                      <span className="text-white">4 Base Stations</span>
                    </div>
                  </div>

                  {/* Broadcast Trigger Button */}
                  <button
                    onClick={handleDispatchAlert}
                    disabled={broadcastDispatched && dispatchProgress < 100}
                    className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-[0.2em] font-mono-code flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-60"
                  >
                    {broadcastDispatched ? (
                      dispatchProgress < 100 ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>DISPATCHING ({dispatchProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ALERTS DISPATCHED (2,481 SENT)</span>
                        </>
                      )
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>DISPATCH CAP EMERGENCY BROADCAST</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Mobile Notification Simulator */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="glass-panel rounded-3xl p-6 border border-white/15 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <span className="text-xs font-bold uppercase font-mono-code text-white">
                        DEVICE CELL BROADCAST PREVIEW // {currentBroadcast.languageName.toUpperCase()}
                      </span>
                      <span className="text-[9.5px] font-mono-code text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                        PRESIDENTIAL SEVERITY LEVEL
                      </span>
                    </div>

                    {/* Smartphone Notification Display */}
                    <div className="rounded-3xl border-2 border-red-500/50 bg-[#060A14] p-5 shadow-2xl relative overflow-hidden mb-5">
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2 text-red-400">
                          <BellRing className="w-4 h-4 animate-bounce" />
                          <span className="text-xs font-bold font-mono-code uppercase tracking-wider">
                            NATIONAL DISASTER ALERT // CAP-IN
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-code text-white/50">LIVE NOW</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-extrabold text-white font-heading uppercase mb-2">
                        {currentBroadcast.headline}
                      </h4>

                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans mb-3">
                        {currentBroadcast.messageBody}
                      </p>

                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 leading-relaxed mb-3">
                        <strong className="block mb-0.5 text-red-300 uppercase font-mono-code text-[11px]">
                          ACTION REQUIRED:
                        </strong>
                        {currentBroadcast.actionGuidance}
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                        <strong className="block mb-0.5 text-emerald-300 uppercase font-mono-code text-[11px]">
                          DESIGNATED SAFE LOCATION:
                        </strong>
                        {currentBroadcast.safetyShelter}
                      </div>
                    </div>
                  </div>

                  {/* CAP XML Payload Snippet */}
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[9.5px] font-mono-code text-white/50 overflow-x-auto">
                    <code>
                      &lt;alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"&gt;
                      &lt;identifier&gt;NER-DDMA-{Date.now()}&lt;/identifier&gt;
                      &lt;scope&gt;Restricted&lt;/scope&gt;
                      &lt;language&gt;{selectedLanguage}&lt;/language&gt;
                      &lt;areaDesc&gt;Sector A, Durtlang Ridge, Mizoram&lt;/areaDesc&gt;
                      &lt;/alert&gt;
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IN-SITU SENSORS & IMD WEATHER RADAR */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6 text-left">
              {/* IMD Radar Stations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-heading uppercase">
                      IMD Doppler Weather Radars & Automatic Stations
                    </h3>
                  </div>
                  <span className="text-xs font-mono-code text-white/50">INDIA METEOROLOGICAL DEPT (IMD) FEED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {IMD_WEATHER_STATIONS.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/15 text-left text-xs font-mono-code"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-white/50 uppercase">{station.district}, {station.state}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            station.warningColor === 'RED'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {station.warningColor} ALERT
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase font-heading truncate mb-2">
                        {station.stationName}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-center my-2">
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-[8.5px] text-white/40 block">24H RAINFALL</span>
                          <span className="text-sm font-extrabold text-white font-heading">
                            {station.rainfall24hMm} mm
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-[8.5px] text-white/40 block">RADAR ECHO</span>
                          <span className="text-sm font-extrabold text-emerald-400 font-heading">
                            {station.radarEchoDbz} dBZ
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/60 line-clamp-2 mt-1">{station.forecast72hText}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Situ IoT Sensor Nodes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-heading uppercase">
                      In-Situ Geotechnical IoT Telemetry Nodes
                    </h3>
                  </div>
                  <span className="text-xs font-mono-code text-white/50">SAMPLING: 10 HZ VIA LORAWAN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {IN_SITU_SENSORS.map((sensor) => (
                    <div
                      key={sensor.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/15 text-left text-xs font-mono-code"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 font-bold">{sensor.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            sensor.status === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {sensor.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase font-heading mb-1">{sensor.sensorType}</h4>
                      <p className="text-[10px] text-white/50 mb-3">{sensor.location}</p>
                      
                      <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 mb-2">
                        <span className="text-2xl font-extrabold text-white font-heading">{sensor.value}</span>
                        <span className="text-xs text-white/60 font-mono-code">{sensor.unit}</span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-white/40 pt-1 border-t border-white/10">
                        <span>Threshold: {sensor.threshold} {sensor.unit}</span>
                        <span>Uplink: {sensor.telemetrySource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CITIZEN FIELD INCIDENT REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-heading uppercase">
                    Field Incident Reports & Ground Truth Verification
                  </h3>
                  <span className="text-xs font-mono-code text-white/50">
                    CROWD-SOURCED CITIZEN & FIELD OFFICIAL OBSERVATIONS WITH GEO-TAGS
                  </span>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono-code text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Submit New Field Incident</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-3xl bg-white/[0.02] border border-white/15 hover:border-white/30 transition-all text-left backdrop-blur-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Header info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-mono-code font-bold px-2 py-0.5 rounded-full ${
                              rep.severity === 'CRITICAL'
                                ? 'bg-red-500 text-white'
                                : rep.severity === 'HIGH'
                                ? 'bg-amber-500 text-black'
                                : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {rep.severity}
                          </span>
                          <span className="text-xs font-mono-code text-white/60 capitalize">
                            {rep.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-code text-white/40">{rep.timestamp}</span>
                      </div>

                      {/* Photo and description */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                        {rep.photoUrl && (
                          <div className="sm:col-span-5 h-28 rounded-2xl overflow-hidden border border-white/15 bg-black/40">
                            <img
                              src={rep.photoUrl}
                              alt={rep.category}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className={rep.photoUrl ? 'sm:col-span-7' : 'sm:col-span-12'}>
                          <h4 className="text-xs font-bold text-white uppercase font-heading mb-1 line-clamp-1">
                            {rep.locationName}
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed line-clamp-3 mb-2 font-mono-code">
                            {rep.description}
                          </p>
                          <div className="text-[10px] font-mono-code text-white/50">
                            <span>Reporter: {rep.reporterName}</span>
                            <span className="block text-emerald-400">
                              Coords: {rep.coordinates[0]}°N, {rep.coordinates[1]}°E
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Triage Action Buttons */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono-code">
                      <span className="text-[9px] text-white/40 uppercase">
                        Status: <strong className="text-white">{rep.status.replace('_', ' ')}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {rep.status === 'PENDING_VERIFICATION' && (
                          <button
                            onClick={() => handleTriageReport(rep.id, 'VERIFIED')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        {rep.status !== 'QRT_DEPLOYED' && rep.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleTriageReport(rep.id, 'QRT_DEPLOYED')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Deploy Crew
                          </button>
                        )}
                        {rep.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleTriageReport(rep.id, 'RESOLVED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
