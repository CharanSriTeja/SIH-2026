import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Camera,
  MapPin,
  Bell,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  PhoneCall,
  Navigation,
  Info,
  LogOut,
  Smartphone,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Car,
  CloudRain,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';

interface CitizenDashboardProps {
  user: { role: UserRole; name: string };
  onLogout: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

interface CitizenReportItem {
  id: string;
  category: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'INVESTIGATING';
  photoUrl: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  onLogout,
}) => {
  // Navigation Tabs: MY RISK | REPORT HAZARD | ALERTS | PROFILE
  const [activeTab, setActiveTab] = useState<'MY RISK' | 'REPORT HAZARD' | 'ALERTS' | 'PROFILE'>('MY RISK');

  // Interactive Report Form State
  const [reportType, setReportType] = useState('Ground Crack');
  const [description, setDescription] = useState('');
  const [locationMode, setLocationMode] = useState<'GPS' | 'REGISTERED'>('GPS');
  const [detectedGps] = useState('23.7742° N, 92.7301° E (Sector A, Durtlang Ridge)');
  const [photoSelected, setPhotoSelected] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('BR-2048');

  // Evacuation Route Modal State
  const [showEvacuationModal, setShowEvacuationModal] = useState(false);

  // Acknowledged Alerts
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState('+91 98620 54321');
  const [profileLocation, setProfileLocation] = useState('Sector A, Durtlang Ridge');
  const [profileDistrict, setProfileDistrict] = useState('Aizawl District, Mizoram');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [appAlertsEnabled, setAppAlertsEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Citizen's Local Reports History (Demonstrating verified vs pending verification)
  const [citizenReports, setCitizenReports] = useState<CitizenReportItem[]>([
    {
      id: 'BR-1092',
      category: 'Road Damage',
      description: 'Asphalt cracking and shoulder drop along Road R-204 near KM 14.',
      location: 'Road R-204 (Sector A Outer)',
      timestamp: 'Today, 09:15 AM',
      status: 'VERIFIED',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const handleAcknowledgeAlert = (id: string) => {
    if (!acknowledgedAlerts.includes(id)) {
      setAcknowledgedAlerts([...acknowledgedAlerts, id]);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `BR-${Math.floor(2000 + Math.random() * 8000)}`;
    setSubmittedReportId(newId);
    setIsSubmitted(true);

    const newReport: CitizenReportItem = {
      id: newId,
      category: reportType,
      description: description || 'Visual observation reported by resident.',
      location: locationMode === 'GPS' ? 'Sector A (GPS Encoded)' : profileLocation,
      timestamp: 'Just Now',
      status: 'PENDING_VERIFICATION',
      photoUrl: photoSelected,
    };

    setCitizenReports([newReport, ...citizenReports]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setProfileSavedSuccess(true);
    setTimeout(() => setProfileSavedSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col selection:bg-amber-500/30">
      {/* ==================================================== */}
      {/* CITIZEN TOP NAVIGATION BAR                           */}
      {/* Contains ONLY: BHURAKSHA 2.0 | MY RISK | REPORT HAZARD | ALERTS | PROFILE */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#0C121E]/95 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand + Citizen Safety Identifier */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider text-white">
                  BHURAKSHA 2.0
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CITIZEN
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-white/50 uppercase block">
                SAFETY &bull; {profileLocation}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {(['MY RISK', 'REPORT HAZARD', 'ALERTS', 'PROFILE'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono-code font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'ALERTS' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <span>{tab}</span>
                </button>
              );
            })}
          </nav>

          {/* User Badge & Log Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono-code font-bold text-white uppercase">
                {profileName}
              </span>
              <span className="text-[9px] font-mono-code text-amber-400">
                Registered Resident
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

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-white/5 no-scrollbar">
          {(['MY RISK', 'REPORT HAZARD', 'ALERTS', 'PROFILE'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono-code whitespace-nowrap uppercase font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================================================== */}
      {/* MAIN CITIZEN BODY                                    */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        {/* Subtle Demonstration Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono-code text-white/40 pb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONNECTED TO LOCAL DISTRICT SENTINEL</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
            DEMO / SYSTEM PREVIEW
          </span>
        </div>

        {/* ==================================================== */}
        {/* 1. MY RISK — CITIZEN HOME / MAIN DASHBOARD           */}
        {/* ==================================================== */}
        {activeTab === 'MY RISK' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Location Bar */}
            <div className="p-5 rounded-2xl bg-[#0C121E] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-white/40 block mb-1">
                  MY REGISTERED LOCATION
                </span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white uppercase tracking-tight">
                    {profileLocation}
                  </h1>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  {profileDistrict} &bull; Geofenced monitoring zone
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                <span className="text-[10px] font-mono-code uppercase text-white/40 block">
                  LAST UPDATED
                </span>
                <span className="text-xs font-mono-code font-bold text-white flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Today, 10:42 AM</span>
                </span>
                <span className="text-[10px] font-mono-code text-white/50 block">
                  Latest automated station reading
                </span>
              </div>
            </div>

            {/* Core Landslide Risk Status Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0C121E] via-[#121929] to-[#0C121E] border-2 border-orange-500/50 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono-code uppercase tracking-widest text-orange-300 font-bold block">
                    CURRENT LANDSLIDE RISK
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold font-heading text-orange-400 tracking-tight mt-1 uppercase">
                    HIGH
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-mono-code font-bold uppercase self-start sm:self-auto">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>HEIGHTENED VIGILANCE REQUIRED</span>
                  </span>
                  <span className="text-[11px] font-mono-code text-white/50">
                    Calculated from local rain + soil saturation
                  </span>
                </div>
              </div>

              {/* 3 Simple Environmental Readings for Citizens */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Rainfall */}
                <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code uppercase text-white/50">
                      🌧 RAINFALL
                    </span>
                    <span className="text-xs font-mono-code text-orange-400 font-bold">
                      HEAVY
                    </span>
                  </div>
                  <div className="text-lg font-bold font-heading text-white">
                    Heavy
                  </div>
                  <p className="text-[11px] text-white/60">
                    184 mm / 24h (Monsoon peak)
                  </p>
                </div>

                {/* Soil Moisture */}
                <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code uppercase text-white/50">
                      🌱 SOIL MOISTURE
                    </span>
                    <span className="text-xs font-mono-code text-orange-400 font-bold">
                      HIGH
                    </span>
                  </div>
                  <div className="text-lg font-bold font-heading text-white">
                    High
                  </div>
                  <p className="text-[11px] text-white/60">
                    89% volumetric saturation
                  </p>
                </div>

                {/* Risk Status */}
                <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code uppercase text-white/50">
                      ⚠️ RISK STATUS
                    </span>
                    <span className="text-xs font-mono-code text-red-400 font-bold">
                      TREND
                    </span>
                  </div>
                  <div className="text-lg font-bold font-heading text-orange-400">
                    Increasing
                  </div>
                  <p className="text-[11px] text-white/60">
                    Threshold exceeded on steep slopes
                  </p>
                </div>
              </div>
            </div>

            {/* "WHAT SHOULD I DO?" Actionable Safety Advice */}
            <div className="p-6 rounded-2xl bg-[#0C121E] border border-white/15 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold font-heading text-white uppercase">
                    WHAT SHOULD YOU DO RIGHT NOW?
                  </h2>
                  <span className="text-[10px] font-mono-code text-white/50 uppercase">
                    OFFICIAL LOCAL SAFETY GUIDELINES
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white block mb-0.5">Stay Clear of Slopes</strong>
                    Avoid standing near steep road cuts, retaining walls, or downhill ravines.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white block mb-0.5">Check for Warning Signs</strong>
                    Look for sudden cracks in soil, leaning utility poles, or muddy water bubbling.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white block mb-0.5">Prepare Emergency Go-Bag</strong>
                    Keep torch, medications, important documents, and charged phones readily accessible.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white block mb-0.5">Monitor SMS &amp; App Alerts</strong>
                    Keep your registered mobile on loud volume for emergency broadcasts.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('REPORT HAZARD')}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold uppercase transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-black">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-heading font-extrabold tracking-wider">
                      REPORT A HAZARD
                    </div>
                    <div className="text-xs font-sans font-normal text-black/80">
                      Submit observed cracks or road damage
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('ALERTS')}
                className="p-5 rounded-2xl bg-[#0C121E] hover:bg-white/[0.08] border border-white/15 text-white font-bold uppercase transition-all cursor-pointer shadow-xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-heading font-extrabold tracking-wider">
                      VIEW ACTIVE ALERTS
                    </div>
                    <div className="text-xs font-sans font-normal text-white/60">
                      2 warnings for your area today
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Designated Evacuation Point Banner */}
            <div className="p-6 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/30 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase tracking-wider text-emerald-400 font-bold block">
                      DESIGNATED EVACUATION POINT
                    </span>
                    <h3 className="text-base font-bold font-heading text-white uppercase">
                      COMMUNITY RELIEF CENTRE (ZEMABAWK)
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono-code font-bold uppercase self-start sm:self-auto">
                  AUTHORITY VERIFIED SAFE SHELTER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-code">
                <div className="text-white/70">
                  <span className="text-white/40 block text-[9px] uppercase">DISTANCE:</span>
                  <span className="text-white font-bold">2.4 KM from Sector A</span>
                </div>
                <div className="text-white/70">
                  <span className="text-white/40 block text-[9px] uppercase">SAFE CORRIDOR:</span>
                  <span className="text-emerald-400 font-bold">Via Village Road V-18</span>
                </div>
                <div className="text-white/70">
                  <span className="text-white/40 block text-[9px] uppercase">ROUTE STATUS:</span>
                  <span className="text-white font-bold">Verified by District Admin</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-white/50 italic">
                  * Only authority-designated relief locations are shown. Never seek shelter in unverified sites.
                </p>
                <button
                  onClick={() => setShowEvacuationModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-bold uppercase transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  VIEW EVACUATION ROUTE &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. REPORT HAZARD — CITIZEN GROUND REPORTING          */}
        {/* ==================================================== */}
        {activeTab === 'REPORT HAZARD' && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                CITIZEN GROUND OBSERVATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase tracking-tight">
                REPORT A HAZARD
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Notice a ground crack, rockfall, or road erosion? Submit your observation to assist authorized field officers.
              </p>
            </div>

            {isSubmitted ? (
              /* Submission Confirmation State */
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0C121E] border border-emerald-500/40 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono-code uppercase text-emerald-400 font-bold block tracking-wider">
                    REPORT SUBMITTED
                  </span>
                  <h3 className="text-xl font-bold font-heading uppercase text-white">
                    REFERENCE ID: {submittedReportId}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-code font-bold uppercase my-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>STATUS: PENDING VERIFICATION</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Your report has been sent to the Field Officer for verification.
                  </p>
                </div>

                {/* Important Realism Disclaimer */}
                <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/30 text-left max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-amber-300 uppercase">
                    <Info className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>IMPORTANT FIELD VERIFICATION PROTOCOL</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    A citizen report is ground-level supporting evidence. A photo submission does <strong>not</strong> automatically alter official regional hazard risk ratings. An authorized Field Officer must inspect and verify the report before it becomes operational intelligence.
                  </p>
                </div>

                {/* Action to submit another or view alerts */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setDescription('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-code text-xs uppercase font-bold transition-colors cursor-pointer"
                  >
                    SUBMIT ANOTHER REPORT
                  </button>
                  <button
                    onClick={() => setActiveTab('MY RISK')}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code text-xs uppercase font-bold transition-colors cursor-pointer"
                  >
                    RETURN TO MY RISK
                  </button>
                </div>
              </div>
            ) : (
              /* Report Input Form */
              <form onSubmit={handleSubmitReport} className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* 1. What problem did you observe? */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                    1. WHAT PROBLEM DID YOU OBSERVE?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      'Ground Crack',
                      'Soil Erosion',
                      'Water Seepage',
                      'Rockfall',
                      'Road Damage',
                      'Other',
                    ].map((type) => {
                      const isSelected = reportType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setReportType(type)}
                          className={`p-3 rounded-xl border text-xs font-mono-code font-bold uppercase transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                              : 'bg-[#080C14] border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Upload Photo / Video */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                    2. UPLOAD PHOTO / VIDEO
                  </label>
                  <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={photoSelected}
                        alt="Evidence Preview"
                        className="w-full sm:w-36 h-24 object-cover rounded-xl border border-white/20 shrink-0"
                      />
                      <div className="space-y-2 text-left flex-1">
                        <div className="flex items-center gap-2 text-xs font-mono-code text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PHOTO ATTACHED (GEO-TAG READY)</span>
                        </div>
                        <p className="text-xs text-white/60">
                          Clear photo allows the Field Officer to evaluate ground fissure width and water seepage before site inspection.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoSelected(
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
                              )
                            }
                            className="text-[10px] font-mono-code px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/80 hover:text-white cursor-pointer"
                          >
                            Sample A (Roadside Crack)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoSelected(
                                'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
                              )
                            }
                            className="text-[10px] font-mono-code px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/80 hover:text-white cursor-pointer"
                          >
                            Sample B (Road Mud Slump)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Location Detection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                    3. REPORT LOCATION
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLocationMode('GPS')}
                      className={`p-3.5 rounded-xl border text-xs font-mono-code font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        locationMode === 'GPS'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'bg-[#080C14] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>USE CURRENT LOCATION</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationMode('REGISTERED')}
                      className={`p-3.5 rounded-xl border text-xs font-mono-code font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        locationMode === 'REGISTERED'
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'bg-[#080C14] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span>USE REGISTERED ADDRESS</span>
                    </button>
                  </div>

                  {/* Location Confirmation Pill */}
                  <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 flex items-center gap-2.5 text-xs font-mono-code text-white/80">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-emerald-400 font-bold uppercase block text-[10px]">
                        📍 CURRENT LOCATION DETECTED
                      </span>
                      <span>
                        {locationMode === 'GPS' ? detectedGps : profileLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Describe the Problem */}
                <div className="space-y-2">
                  <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                    4. DESCRIBE THE PROBLEM
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you observed (e.g., 'Large crack observed beside the road after heavy rainfall. Water is seeping through the retaining wall.')..."
                    className="w-full p-3.5 bg-[#080C14] border border-white/15 rounded-xl text-xs font-sans text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Realism Reassurance */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-[11px] font-mono-code text-white/50">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Your report acts as vital supporting ground evidence. An authorized Field Officer reviews and verifies reports before official alerts are updated.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-amber-500/20"
                >
                  SUBMIT REPORT &rarr;
                </button>
              </form>
            )}

            {/* Recent Submitted Reports History */}
            <div className="rounded-2xl border border-white/10 bg-[#0C121E] p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono-code font-bold uppercase text-white/80">
                  YOUR RECENT CITIZEN REPORTS
                </span>
                <span className="text-[10px] font-mono-code text-white/40 uppercase">
                  VERIFICATION STATUS TRACKER
                </span>
              </div>

              <div className="space-y-2.5">
                {citizenReports.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#080C14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-code font-bold text-white uppercase">
                          {item.id} &bull; {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase ${
                            item.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.status === 'VERIFIED' ? 'VERIFIED BY OFFICER' : 'PENDING VERIFICATION'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        {item.description}
                      </p>
                      <div className="text-[10px] font-mono-code text-white/40">
                        {item.location} &bull; {item.timestamp}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {item.status === 'VERIFIED' ? (
                        <span className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Logged in Risk Model</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-code text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Field Officer Reviewing</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. ALERTS — CITIZEN WARNINGS & NOTIFICATIONS         */}
        {/* ==================================================== */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-red-400 font-bold block mb-1">
                  EMERGENCY WARNINGS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase tracking-tight">
                  MY ALERTS &bull; {profileLocation}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Targeted alerts based on your registered location and device position.
                </p>
              </div>

              {/* SMS + App Connection Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto text-xs font-mono-code">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-white/80">SMS + APP CONNECTED</span>
              </div>
            </div>

            {/* Connection Explanatory Banner */}
            <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/25 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed font-sans">
                <strong className="text-white font-mono-code block uppercase text-[11px] mb-0.5">
                  UNIFIED SMS + APP ALERT HISTORY
                </strong>
                Emergency warnings sent directly to your phone number via Twilio SMS are simultaneously synchronized here. No tracking of individual citizens is conducted without explicit permission.
              </div>
            </div>

            {/* Prominent Evacuation Alert Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-[#0C121E] to-red-950/30 border-2 border-red-500/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-red-300">
                        🚨 EVACUATION ALERT // READINESS ADVISORY
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-mono-code font-bold uppercase">
                        CRITICAL
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-heading uppercase text-white">
                      SECTOR A &bull; DURTLANG RIDGE UPPER CREST
                    </h3>
                  </div>
                </div>

                <div className="text-[10px] font-mono-code text-white/50">
                  <span>SOURCE: SMS + APP &bull; 10:42 AM</span>
                </div>
              </div>

              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                Your area has been identified as requiring heightened vigilance and potential evacuation. Heavy rainfall has saturated the slope. Follow instructions from local disaster-management authorities.
              </p>

              {/* Designated Evacuation Point & Route */}
              <div className="p-4 rounded-2xl bg-[#080C14] border border-emerald-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono-code font-bold text-emerald-400 uppercase">
                      DESIGNATED EVACUATION POINT: COMMUNITY RELIEF CENTRE (ZEMABAWK)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-code text-emerald-300 font-bold uppercase">
                    ROUTE STATUS: VERIFIED
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <strong className="text-white">Safe Route:</strong> Take Village Road V-18 towards Ridge Crest. Follow green reflective safety markers away from slope cuts.
                  </div>
                  <div className="text-white/50 text-[11px]">
                    * Only authority-designated relief locations are shown. Never seek shelter in unverified sites.
                  </div>
                </div>

                <button
                  onClick={() => setShowEvacuationModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code font-bold uppercase transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  VIEW EVACUATION ROUTE &rarr;
                </button>
              </div>

              {/* Acknowledge Button */}
              <div className="pt-1 flex items-center justify-end">
                {acknowledgedAlerts.includes('alert-evac') ? (
                  <span className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACKNOWLEDGED BY YOU</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledgeAlert('alert-evac')}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-red-500/20"
                  >
                    ACKNOWLEDGE WARNING &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Alert 2: Road Block */}
            <div className="p-5 rounded-2xl bg-[#0C121E] border border-amber-500/30 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono-code font-bold uppercase text-amber-300">
                      ⚠️ ROAD BLOCK // TRANSIT ALERT
                    </span>
                    <h3 className="text-sm font-bold font-heading uppercase text-white">
                      ROAD R-204 NEAR SECTOR A BLOCKED
                    </h3>
                  </div>
                </div>

                <div className="text-[10px] font-mono-code text-white/50">
                  <span>SOURCE: SMS + APP &bull; 9:58 AM</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Road R-204 near your area has been reported blocked due to mud slump. Avoid this route until further notice. Use Village Road V-18 as the safe detour corridor.
              </p>

              <div className="pt-1 flex items-center justify-end">
                {acknowledgedAlerts.includes('alert-road') ? (
                  <span className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACKNOWLEDGED</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledgeAlert('alert-road')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono-code text-xs font-bold uppercase cursor-pointer"
                  >
                    ACKNOWLEDGE
                  </button>
                )}
              </div>
            </div>

            {/* Alert 3: Weather Warning */}
            <div className="p-5 rounded-2xl bg-[#0C121E] border border-white/10 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono-code font-bold uppercase text-blue-300">
                      🟡 WEATHER WARNING // MONSOON SURGE
                    </span>
                    <h3 className="text-sm font-bold font-heading uppercase text-white">
                      CONTINUOUS HEAVY RAINFALL ACTIVE
                    </h3>
                  </div>
                </div>

                <div className="text-[10px] font-mono-code text-white/50">
                  <span>SOURCE: SYSTEM ALERT &bull; 9:20 AM</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Heavy rainfall is affecting your area (estimated 50–80mm expected over the next 6 hours). Stay away from steep slopes and monitor official alerts.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. PROFILE — CITIZEN ACCOUNT & PREFERENCES           */}
        {/* ==================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-amber-400 font-bold block mb-1">
                CITIZEN ACCOUNT
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase tracking-tight">
                PROFILE &bull; {profileName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Manage your registered residential location and emergency notification preferences.
              </p>
            </div>

            {profileSavedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono-code flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile information updated successfully!</span>
              </div>
            )}

            {isEditingProfile ? (
              /* Profile Edit Form */
              <form onSubmit={handleSaveProfile} className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 shadow-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block">
                    FULL NAME:
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block">
                    PHONE (SMS ALERTS):
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block">
                    REGISTERED LOCATION / AREA:
                  </label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full p-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono-code uppercase text-white/70 block">
                    DISTRICT / STATE:
                  </label>
                  <input
                    type="text"
                    value={profileDistrict}
                    onChange={(e) => setProfileDistrict(e.target.value)}
                    className="w-full p-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs uppercase cursor-pointer"
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-code font-bold text-xs uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Display Card */
              <div className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 shadow-xl text-xs font-mono-code">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">FULL NAME:</span>
                  <span className="text-white font-bold">{profileName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">PHONE (SMS ALERTS):</span>
                  <span className="text-emerald-400 font-bold">{profilePhone}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">REGISTERED LOCATION:</span>
                  <span className="text-white font-bold">{profileLocation}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">DISTRICT / STATE:</span>
                  <span className="text-white font-bold">{profileDistrict}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">ACCOUNT ROLE:</span>
                  <span className="text-amber-400 font-bold">CITIZEN (SAFETY TIER 1)</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50 uppercase">DEVICE LOCATION PERMISSION:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GRANTED FOR HAZARD REPORTS</span>
                  </span>
                </div>

                {/* Notification Preferences */}
                <div className="pt-2 space-y-2">
                  <span className="text-white/50 uppercase block text-[10px]">
                    NOTIFICATION PREFERENCES:
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#080C14] border border-white/10 cursor-pointer">
                      <span className="text-slate-200">Twilio SMS Emergency Warnings</span>
                      <input
                        type="checkbox"
                        checked={smsAlertsEnabled}
                        onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#080C14] border border-white/10 cursor-pointer">
                      <span className="text-slate-200">App Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={appAlertsEnabled}
                        onChange={(e) => setAppAlertsEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-3">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-code font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    EDIT PROFILE INFORMATION
                  </button>
                </div>
              </div>
            )}

            {/* Strict Role Security Notice */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono-code text-white/50 space-y-1">
              <div className="text-white/70 font-bold uppercase">SECURITY NOTICE:</div>
              <p>
                This account operates under the Citizen Access Tier. Administrative controls, Field Officer verification tools, and full GIS spatial layers are restricted to authorized disaster-management personnel.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* EVACUATION ROUTE GUIDANCE MODAL                      */}
      {/* ==================================================== */}
      {showEvacuationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in text-left">
          <div className="relative w-full max-w-lg bg-[#0C121E] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Navigation className="w-5 h-5" />
                <h3 className="text-base font-bold font-heading text-white uppercase">
                  AUTHORITY EVACUATION ROUTE
                </h3>
              </div>
              <button
                onClick={() => setShowEvacuationModal(false)}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shelter & Corridor Summary */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <span className="text-[10px] font-mono-code text-emerald-300 font-bold uppercase">
                DESIGNATED DESTINATION:
              </span>
              <div className="text-sm font-bold font-heading text-white uppercase">
                COMMUNITY RELIEF CENTRE (ZEMABAWK)
              </div>
              <div className="text-xs text-slate-300">
                Ridge Crest Road &bull; 2.4 KM from Sector A &bull; Verified Safe Elevation Corridor
              </div>
            </div>

            {/* Step-by-Step Evacuation Steps */}
            <div className="space-y-3">
              <span className="text-xs font-mono-code uppercase text-white/60 font-bold block">
                SAFE STEP-BY-STEP CORRIDOR:
              </span>

              <div className="space-y-2 text-xs font-mono-code">
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-white block">Exit Sector A via Upper Ridge Access</strong>
                    Follow the green reflective road markers pointing uphill. Do NOT take lower ravine trails.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-white block">Continue onto Village Road V-18</strong>
                    Road V-18 is monitored and cleared of debris. Road R-204 is currently closed.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#080C14] border border-white/10 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-white block">Arrive at Community Relief Centre</strong>
                    Disaster response officers will register evacuees, provide drinking water, and assign dry shelter beds.
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline Contacts */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono-code">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-white/70">EMERGENCY ASSISTANCE:</span>
              </div>
              <span className="text-emerald-400 font-bold">1070 / 112</span>
            </div>

            <button
              onClick={() => setShowEvacuationModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono-code font-bold text-xs uppercase cursor-pointer"
            >
              CLOSE ROUTE GUIDANCE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
