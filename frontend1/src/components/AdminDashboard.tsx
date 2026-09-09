import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Layers,
  AlertTriangle,
  Send,
  Users,
  Database,
  Sliders,
  Radio,
  FileCheck,
  MapPin,
  Compass,
  Sparkles,
  RefreshCw,
  LogOut,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Building,
  HeartPulse,
  Truck,
  Server,
  Zap,
  ChevronRight,
  Filter,
  Search,
  Lock,
  PhoneCall,
  UserCheck,
  UserX,
  FileBadge2
} from 'lucide-react';
import { UserRole, OfficerAccessRequest } from '../types';
import { AuthService } from '../services/authService';

interface AdminDashboardProps {
  user: { role: UserRole; name: string };
  onLogout: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'COMMAND CENTER'
    | 'RISK MAP'
    | 'RISK ANALYTICS'
    | 'FIELD INTELLIGENCE'
    | 'ALERTS'
    | 'RESPONSE'
    | 'INFRASTRUCTURE'
    | 'USERS'
    | 'DATA SOURCES'
    | 'SYSTEM'
  >('COMMAND CENTER');

  // GIS Map Layer Toggles
  const [layers, setLayers] = useState({
    riskHeatmap: true,
    riskZones: true,
    villages: true,
    roads: true,
    schools: false,
    hospitals: true,
    bridges: true,
    shelters: true,
    historicalLandslides: true,
    fieldReports: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Alert Composer State
  const [alertZone, setAlertZone] = useState('Sector A (Durtlang Ridge)');
  const [alertSeverity, setAlertSeverity] = useState<'HIGH' | 'CRITICAL' | 'MODERATE'>('HIGH');
  const [alertChannels, setAlertChannels] = useState({ sms: true, app: true, web: true });
  const [alertMessage, setAlertMessage] = useState(
    'High landslide risk has been detected in Sector A due to intense rainfall and slope saturation. Residents are advised to move toward designated safe shelters.'
  );
  const [alertSentSuccess, setAlertSentSuccess] = useState(false);

  // Field Reports Management State
  const [adminReports, setAdminReports] = useState([
    {
      id: 'BR-2048',
      location: 'Sector A',
      type: 'Ground Crack',
      severity: 'HIGH',
      aiObservation: 'Tension Crack 86%',
      status: 'PENDING VERIFICATION',
      assignedOfficer: 'Officer T. Sangma',
      time: '14:32',
    },
    {
      id: 'BR-2049',
      location: 'Sector B',
      type: 'Water Seepage',
      severity: 'MEDIUM',
      aiObservation: 'Saturation 79%',
      status: 'ASSIGNED',
      assignedOfficer: 'Officer K. Lalhruaia',
      time: '13:15',
    },
    {
      id: 'BR-2050',
      location: 'Sector C',
      type: 'Road Damage',
      severity: 'HIGH',
      aiObservation: 'Road Slump 91%',
      status: 'VERIFIED',
      assignedOfficer: 'Officer T. Sangma',
      time: '12:40',
    },
    {
      id: 'BR-2051',
      location: 'Sector A',
      type: 'Rockfall',
      severity: 'MEDIUM',
      aiObservation: 'Boulder Fall 84%',
      status: 'PENDING VERIFICATION',
      assignedOfficer: 'Unassigned',
      time: '11:05',
    },
  ]);

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSentSuccess(true);
    setTimeout(() => {
      setAlertSentSuccess(false);
    }, 4000);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setAdminReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Officer Access Verification Requests (Security RBAC)
  const [officerRequests, setOfficerRequests] = useState<OfficerAccessRequest[]>(() =>
    AuthService.getOfficerRequests()
  );

  const handleApproveOfficer = (requestId: string) => {
    const success = AuthService.approveOfficerRequest(requestId);
    if (success) {
      setOfficerRequests(AuthService.getOfficerRequests());
    }
  };

  const handleRejectOfficer = (requestId: string) => {
    const success = AuthService.rejectOfficerRequest(requestId);
    if (success) {
      setOfficerRequests(AuthService.getOfficerRequests());
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col selection:bg-amber-500/30">
      {/* ==================================================== */}
      {/* TOP ADMIN COMMAND HEADER                             */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#0C121E]/95 border-b border-amber-500/30 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand + Admin Clearance Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider text-white">
                  BHURAKSHA 2.0
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ADMIN COMMAND CENTER
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-white/50 uppercase block">
                STATE DISASTER MANAGEMENT AUTHORITY &bull; REGIONAL HQ
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {(
              [
                'COMMAND CENTER',
                'RISK MAP',
                'RISK ANALYTICS',
                'FIELD INTELLIGENCE',
                'ALERTS',
                'RESPONSE',
                'INFRASTRUCTURE',
                'USERS',
                'DATA SOURCES',
                'SYSTEM',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono-code font-bold uppercase transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Right: Demo Switcher, Admin Info & Logout */}
          <div className="flex items-center gap-2.5">
            {onSwitchRole && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-2 py-1 rounded-xl">
                <span className="text-[9px] font-mono-code uppercase text-white/40">SWITCH:</span>
                <button
                  onClick={() => onSwitchRole('citizen')}
                  className="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  Citizen
                </button>
                <button
                  onClick={() => onSwitchRole('officer')}
                  className="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold bg-blue-500/15 text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  Officer
                </button>
              </div>
            )}

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono-code font-bold text-white uppercase">
                {user.name}
              </span>
              <span className="text-[9px] font-mono-code text-amber-400">
                Level-3 Admin Authority
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 text-white/70 text-xs font-mono-code font-bold uppercase transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOG OUT</span>
            </button>
          </div>
        </div>

        {/* Mobile / Compact Navigation Strip */}
        <div className="flex xl:hidden items-center gap-1 overflow-x-auto py-2 border-t border-white/5 no-scrollbar">
          {(
            [
              'COMMAND CENTER',
              'RISK MAP',
              'RISK ANALYTICS',
              'FIELD INTELLIGENCE',
              'ALERTS',
              'RESPONSE',
              'INFRASTRUCTURE',
              'USERS',
              'DATA SOURCES',
              'SYSTEM',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono-code whitespace-nowrap uppercase font-bold transition-all ${
                activeTab === tab
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ==================================================== */}
      {/* MAIN ADMIN DASHBOARD CONTENT                         */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        {/* TAB 1: OVERALL COMMAND CENTER */}
        {activeTab === 'COMMAND CENTER' && (
          <div className="space-y-6">
            {/* Header Status Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                  STATE DISASTER MANAGEMENT COMMISSION
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                  REGIONAL COMMAND CENTER &bull; NER CLUSTER
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Synchronized Telemetry: IMD Radar + Sentinel-1 InSAR + In-situ Piezometers + Ground Reports
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono-code font-bold uppercase animate-pulse">
                  REGIONAL RISK: HIGH (CODE RED)
                </span>
                <button
                  onClick={() => setActiveTab('ALERTS')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  DISPATCH ALERT &rarr;
                </button>
              </div>
            </div>

            {/* 7 Core Administrative Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="p-4 rounded-2xl bg-[#0C121E] border border-red-500/30 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-white/40 uppercase block">
                  REGIONAL RISK
                </span>
                <div className="text-xl font-extrabold font-heading text-red-400">HIGH</div>
                <span className="text-[9px] font-mono-code text-white/50">82% Peak Index</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-white/10 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-white/40 uppercase block">
                  ACTIVE ZONES
                </span>
                <div className="text-xl font-extrabold font-heading text-white">12</div>
                <span className="text-[9px] font-mono-code text-white/50">Sectors Online</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-red-500/30 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-red-400 uppercase font-bold block">
                  HIGH-RISK ZONES
                </span>
                <div className="text-xl font-extrabold font-heading text-red-400">05</div>
                <span className="text-[9px] font-mono-code text-white/50">Immediate Watch</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-blue-500/30 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-blue-300 uppercase font-bold block">
                  FIELD REPORTS
                </span>
                <div className="text-xl font-extrabold font-heading text-blue-300">08</div>
                <span className="text-[9px] font-mono-code text-white/50">03 Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-amber-500/30 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-amber-400 uppercase font-bold block">
                  ACTIVE WARNINGS
                </span>
                <div className="text-xl font-extrabold font-heading text-amber-400">03</div>
                <span className="text-[9px] font-mono-code text-white/50">Dispatched Today</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-white/10 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-white/40 uppercase block">
                  ROADS AT RISK
                </span>
                <div className="text-xl font-extrabold font-heading text-white">17</div>
                <span className="text-[9px] font-mono-code text-red-400">R-204 Blocked</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-white/10 space-y-1 shadow-lg">
                <span className="text-[9px] font-mono-code text-white/40 uppercase block">
                  INFRASTRUCTURE
                </span>
                <div className="text-xl font-extrabold font-heading text-white">24</div>
                <span className="text-[9px] font-mono-code text-emerald-400">Shelters Ready</span>
              </div>
            </div>

            {/* Risk Intelligence Inspector for Sector A */}
            <div className="rounded-3xl border border-amber-500/30 bg-[#0C121E] p-6 space-y-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-heading text-white uppercase">
                      RISK INTELLIGENCE INSPECTOR &bull; SECTOR A (CRITICAL FOCUS)
                    </h2>
                    <span className="text-[10px] font-mono-code text-white/50">
                      MULTI-FACTOR DATA FUSION MODEL (ENVIRONMENTAL + AI PREDICTION + GIS + FIELD EVIDENCE)
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono-code font-bold uppercase self-start sm:self-auto">
                  INTELLIGENCE SCORE: 82% (HIGH)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono-code">
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">RISK SCORE</span>
                  <span className="text-base font-bold text-red-400">82%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">SEVERITY</span>
                  <span className="text-base font-bold text-red-400">HIGH</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">RAINFALL</span>
                  <span className="text-base font-bold text-amber-400">HIGH (42mm)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">SOIL MOISTURE</span>
                  <span className="text-base font-bold text-amber-400">HIGH (78%)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">SLOPE ANGLE</span>
                  <span className="text-base font-bold text-white">38°</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">HISTORICAL</span>
                  <span className="text-base font-bold text-white">07 Events</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">FIELD REPORTS</span>
                  <span className="text-base font-bold text-blue-400">03 Logs</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 space-y-1">
                  <span className="text-white/40 text-[9px] uppercase block">FIELD EVIDENCE</span>
                  <span className="text-base font-bold text-amber-400">PENDING</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-mono-code text-white/70 flex items-center justify-between">
                <span>
                  CROSS-FACTOR CONFIRMATION: InSAR deformation (-14mm/month) + Saturated soil + Verified roadside tension fissure.
                </span>
                <button
                  onClick={() => setActiveTab('RISK MAP')}
                  className="text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1 cursor-pointer shrink-0 ml-4"
                >
                  <span>VIEW ON GIS MAP</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field Intelligence Management Table */}
            <div className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base sm:text-lg font-bold font-heading text-white uppercase">
                    FIELD INTELLIGENCE REPORT MANAGEMENT
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('FIELD INTELLIGENCE')}
                  className="text-xs font-mono-code text-blue-400 hover:text-blue-300 font-bold uppercase"
                >
                  FULL WORKFLOW &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-code">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase">
                      <th className="py-2.5 px-3">REPORT ID</th>
                      <th className="py-2.5 px-3">LOCATION</th>
                      <th className="py-2.5 px-3">TYPE</th>
                      <th className="py-2.5 px-3">SEVERITY</th>
                      <th className="py-2.5 px-3">AI OBSERVATION</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">ASSIGNED OFFICER</th>
                      <th className="py-2.5 px-3">TIME</th>
                      <th className="py-2.5 px-3 text-right">ADMIN ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminReports.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-bold text-white">{r.id}</td>
                        <td className="py-3 px-3 text-white/80">{r.location}</td>
                        <td className="py-3 px-3 text-white">{r.type}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.severity === 'HIGH'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {r.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white/60">{r.aiObservation}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : r.status === 'ASSIGNED'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white/70">{r.assignedOfficer}</td>
                        <td className="py-3 px-3 text-white/40">{r.time}</td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'VERIFIED')}
                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'ASSIGNED')}
                            className="px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold uppercase transition-colors"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                            className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold uppercase transition-colors"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LARGE GIS MAP WITH TOGGLEABLE LAYERS */}
        {activeTab === 'RISK MAP' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                SPATIAL GIS INTELLIGENCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                STATE GIS RISK MAP &amp; INFRASTRUCTURE LAYERS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Full-scale spatial mapping correlating landslide susceptibility, lifelines, shelters, and citizen reports.
              </p>
            </div>

            {/* Toggleable Layer Pills */}
            <div className="p-4 rounded-2xl bg-[#0C121E] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono-code uppercase text-white/50 block font-bold">
                TOGGLE GIS LAYERS:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'riskHeatmap', label: 'RISK HEATMAP' },
                  { key: 'riskZones', label: 'RISK ZONES' },
                  { key: 'villages', label: 'VILLAGES' },
                  { key: 'roads', label: 'ROADS' },
                  { key: 'schools', label: 'SCHOOLS' },
                  { key: 'hospitals', label: 'HOSPITALS' },
                  { key: 'bridges', label: 'BRIDGES' },
                  { key: 'shelters', label: 'SHELTERS' },
                  { key: 'historicalLandslides', label: 'HISTORICAL LANDSLIDES' },
                  { key: 'fieldReports', label: 'FIELD REPORTS' },
                ].map((l) => {
                  const k = l.key as keyof typeof layers;
                  const active = layers[k];
                  return (
                    <button
                      key={l.key}
                      onClick={() => toggleLayer(k)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold uppercase transition-all cursor-pointer ${
                        active
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'bg-[#080C14] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Canvas with Active Elements */}
            <div className="relative rounded-3xl border border-white/15 bg-[#0C121E] min-h-[500px] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#060910] opacity-95" />
              {/* Grid Lines */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#F59E0B 1px, transparent 1px), radial-gradient(#F59E0B 1px, #060910 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Dynamic Interactive Layer Elements */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {layers.riskZones && (
                  <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 backdrop-blur-md space-y-1 text-xs font-mono-code">
                    <span className="text-red-400 font-bold block">SECTOR A &bull; 82% RISK</span>
                    <span className="text-white/70">Population: 1,420 &bull; Durtlang Ridge</span>
                  </div>
                )}
                {layers.shelters && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md space-y-1 text-xs font-mono-code">
                    <span className="text-emerald-400 font-bold block">COMMUNITY RELIEF CENTRE A</span>
                    <span className="text-white/70">Occupancy: 183/500 &bull; Status: Available</span>
                  </div>
                )}
                {layers.roads && (
                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 backdrop-blur-md space-y-1 text-xs font-mono-code">
                    <span className="text-amber-400 font-bold block">ROAD R-204 (BLOCKED)</span>
                    <span className="text-white/70">Detour Route: Village Road V-18 (Open)</span>
                  </div>
                )}
              </div>

              {/* Bottom GIS Status Footer */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-20 text-xs font-mono-code text-white/60 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span>DATUM: WGS 84 / UTM ZONE 46N</span>
                  <span>SRTM 30m DEM + ALOS PALSAR</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ALL 10 GIS TELEMETRY STREAMS SYNCHRONIZED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALERT MANAGEMENT INTERFACE */}
        {activeTab === 'ALERTS' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-red-400 font-bold block mb-1">
                EMERGENCY DISPATCH SYSTEM
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                CREATE &amp; BROADCAST WARNING
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Dispatch targeted alerts directly to location-associated citizens and on-duty field officers.
              </p>
            </div>

            {alertSentSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center gap-3 text-emerald-300 text-xs font-mono-code font-bold uppercase">
                <CheckCircle2 className="w-5 h-5" />
                <span>ALERT BROADCAST DISPATCHED TO 247 REGISTERED RECIPIENTS IN SECTOR A VIA SMS, APP &amp; WEB!</span>
              </div>
            )}

            <form onSubmit={handleSendAlert} className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 sm:p-8 space-y-5 shadow-2xl">
              {/* Target Risk Zone */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                  TARGET RISK ZONE
                </label>
                <select
                  value={alertZone}
                  onChange={(e) => setAlertZone(e.target.value)}
                  className="w-full h-11 bg-[#080C14] border border-white/15 rounded-xl px-3 text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                >
                  <option>Sector A (Durtlang Ridge)</option>
                  <option>Sector B (Tuirial Valley)</option>
                  <option>Sector C (Zuangtui Highway)</option>
                  <option>Sector D (Bethlehem Veng)</option>
                </select>
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                  ALERT SEVERITY LEVEL
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MODERATE', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setAlertSeverity(sev)}
                      className={`py-2.5 rounded-xl border text-xs font-mono-code font-bold uppercase transition-all cursor-pointer ${
                        alertSeverity === sev
                          ? sev === 'CRITICAL' || sev === 'HIGH'
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-amber-400 text-black border-amber-400'
                          : 'bg-[#080C14] border-white/10 text-white/50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients & Multi-Channel */}
              <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-3">
                <div className="flex justify-between text-xs font-mono-code">
                  <span className="text-white/50 uppercase">TARGET RECIPIENTS:</span>
                  <span className="text-amber-400 font-bold">247 LOCATION-ASSOCIATED REGISTERED USERS</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono-code uppercase text-white/50 block font-bold">
                    DELIVERY CHANNELS:
                  </span>
                  <div className="flex gap-4 text-xs font-mono-code">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertChannels.sms}
                        onChange={(e) => setAlertChannels({ ...alertChannels, sms: e.target.checked })}
                      />
                      <span>SMS Broadcast (NIC-SMS Gateway)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertChannels.app}
                        onChange={(e) => setAlertChannels({ ...alertChannels, app: e.target.checked })}
                      />
                      <span>App Push Notification</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertChannels.web}
                        onChange={(e) => setAlertChannels({ ...alertChannels, web: e.target.checked })}
                      />
                      <span>Web Alert Banner</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Message Composer */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                  WARNING MESSAGE CONTENT
                </label>
                <textarea
                  rows={4}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="w-full p-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-400 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SEND EMERGENCY ALERT TO CITIZENS &rarr;</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: ADMIN RESPONSE CENTER */}
        {activeTab === 'RESPONSE' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                INCIDENT MANAGEMENT
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                ADMIN RESPONSE &amp; EVACUATION COORDINATION
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Real-time status of priority zones, transportation lifelines, and emergency relief shelters.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* High Priority Areas */}
              <div className="p-6 rounded-3xl bg-[#0C121E] border border-red-500/30 space-y-4 shadow-xl">
                <h3 className="text-base font-bold font-heading text-white uppercase flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>HIGH PRIORITY AREAS</span>
                </h3>
                <div className="space-y-3 text-xs font-mono-code">
                  <div className="p-3 rounded-xl bg-[#080C14] border border-red-500/20">
                    <span className="text-red-400 font-bold block">01 SECTOR A (HIGH RISK)</span>
                    <span className="text-white/60">Durtlang Ridge Escarpment &bull; 1,420 Residents</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080C14] border border-red-500/20">
                    <span className="text-red-400 font-bold block">02 SECTOR C (HIGH RISK)</span>
                    <span className="text-white/60">Zuangtui Highway Corridor &bull; Active Scarp</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080C14] border border-amber-500/20">
                    <span className="text-amber-400 font-bold block">03 SECTOR D (MODERATE &rarr; HIGH)</span>
                    <span className="text-white/60">Bethlehem Veng Upper Ridge &bull; Creep Monitored</span>
                  </div>
                </div>
              </div>

              {/* Road Status */}
              <div className="p-6 rounded-3xl bg-[#0C121E] border border-white/10 space-y-4 shadow-xl">
                <h3 className="text-base font-bold font-heading text-white uppercase flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>LIFELINE ROAD STATUS</span>
                </h3>
                <div className="space-y-3 text-xs font-mono-code">
                  <div className="p-3 rounded-xl bg-[#080C14] border border-amber-500/20">
                    <span className="text-amber-400 font-bold block">NH-10 (AT RISK)</span>
                    <span className="text-white/60">Restricted to light emergency traffic only.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080C14] border border-red-500/20">
                    <span className="text-red-400 font-bold block">ROAD R-204 (BLOCKED)</span>
                    <span className="text-white/60">Mud debris clearing team dispatched.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080C14] border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold block">VILLAGE ROAD V-18 (OPEN)</span>
                    <span className="text-emerald-300">Designated primary evacuation corridor.</span>
                  </div>
                </div>
              </div>

              {/* Relief Shelter */}
              <div className="p-6 rounded-3xl bg-emerald-500/[0.04] border border-emerald-500/30 space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold font-heading text-white uppercase flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" />
                    <span>RELIEF SHELTER LOGISTICS</span>
                  </h3>
                  <div className="mt-3 space-y-2 text-xs font-mono-code">
                    <div className="p-3 rounded-xl bg-[#080C14] border border-emerald-500/20 space-y-1">
                      <span className="text-emerald-400 font-bold block">
                        COMMUNITY RELIEF CENTRE A
                      </span>
                      <div className="flex justify-between text-white/70">
                        <span>Capacity:</span>
                        <span className="text-white font-bold">500 Persons</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Current Occupancy:</span>
                        <span className="text-amber-400 font-bold">183 Persons</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Remaining Beds:</span>
                        <span className="text-emerald-400 font-bold">317 Available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 text-[11px] font-mono-code text-white/60">
                  Rations: 7 Days &bull; Potable Water: 12,000L &bull; Medical Staff: 2 Officers on site.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USERS & ROLE-BASED ACCESS CONTROL */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                SECURITY &amp; ACCESS CONTROL DESK
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                PERSONNEL AUTHORIZATION &amp; ROLE MANAGEMENT
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Enforce role separation: Public Citizens, Departmentally Verified Field Officers, and Level-3 SDMA Administrators.
              </p>
            </div>

            {/* 3 Security Tiers Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0C121E] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-emerald-400">
                    PUBLIC CITIZENS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                    FREE REGISTRATION
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Citizens register freely with name, contact, and district. Access restricted to public safety alerts and incident reporting.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Active Citizens in Database: <span className="text-white font-bold">1,842</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-blue-400">
                    FIELD OFFICERS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold">
                    VERIFICATION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  No public self-registration. Official credentials verified by SDMA administrators before operational access is granted.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Pending Approvals:{' '}
                  <span className="text-amber-400 font-bold">
                    {officerRequests.filter((r) => r.status === 'PENDING_VERIFICATION').length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-amber-400">
                    SDMA ADMINISTRATORS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                    RESTRICTED LOGIN ONLY
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Accounts provisioned strictly by system authority. Multi-factor command clearance required.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Active Command Staff: <span className="text-white font-bold">04 Officers</span>
                </div>
              </div>
            </div>

            {/* Officer Access Requests List */}
            <div className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileBadge2 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold font-heading text-white uppercase">
                    OFFICER ACCESS VERIFICATION REQUESTS
                  </h3>
                </div>
                <span className="text-xs font-mono-code text-white/60">
                  Official clearance review queue
                </span>
              </div>

              {officerRequests.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono-code text-white/40">
                  No officer access requests currently in queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {officerRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-[#080C14] border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs font-mono-code"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-blue-400 font-bold">{req.id}</span>
                          <span className="text-white/40">&bull;</span>
                          <span className="text-white font-bold text-sm">{req.fullName}</span>
                          <span className="text-white/40">&bull;</span>
                          <span className="text-white/70">{req.designation}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-white/60 pt-1 text-[11px]">
                          <div>
                            <span className="text-white/40 uppercase">DEPT: </span>
                            <span className="text-white/80">{req.department}</span>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase">OFFICIAL ID: </span>
                            <span className="text-white/80">{req.officialId}</span>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase">CONTACT: </span>
                            <span className="text-white/80">{req.officialContact}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-white/40">
                          Assigned Jurisdiction: <span className="text-white/70">{req.assignedDistrict}</span> &bull; Submitted: {req.submittedAt}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'PENDING_VERIFICATION' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveOfficer(req.id)}
                              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono-code font-bold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>APPROVE &amp; AUTHORIZE</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOfficer(req.id)}
                              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-white/60 font-mono-code font-bold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>REJECT</span>
                            </button>
                          </>
                        ) : req.status === 'APPROVED' ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>OFFICER AUTHORIZED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>REQUEST REJECTED</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OTHER ADMIN TABS: RISK ANALYTICS, INFRASTRUCTURE, DATA SOURCES, SYSTEM */}
        {(activeTab === 'RISK ANALYTICS' ||
          activeTab === 'FIELD INTELLIGENCE' ||
          activeTab === 'INFRASTRUCTURE' ||
          activeTab === 'DATA SOURCES' ||
          activeTab === 'SYSTEM') && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                ENTERPRISE SYSTEM MODULE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                {activeTab} &bull; ADMINISTRATION
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Authorized State Disaster Authority configuration and diagnostic telemetry.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 text-xs font-mono-code shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-sm">
                <Server className="w-4 h-4" />
                <span>SYSTEM HEALTH: OPTIMAL (100% NODES ACTIVE)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10">
                  <span className="text-white/40 block text-[9px] uppercase">POSTGRESQL DB</span>
                  <span className="text-white font-bold">Connected (3ms)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10">
                  <span className="text-white/40 block text-[9px] uppercase">IMD API FEED</span>
                  <span className="text-emerald-400 font-bold">Live Doppler Sync</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10">
                  <span className="text-white/40 block text-[9px] uppercase">AI INFERENCE</span>
                  <span className="text-blue-400 font-bold">Antigravity Core V2</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10">
                  <span className="text-white/40 block text-[9px] uppercase">SMS GATEWAY</span>
                  <span className="text-emerald-400 font-bold">99.8% Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
