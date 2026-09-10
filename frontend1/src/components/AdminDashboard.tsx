import React, { useState, useEffect } from 'react';
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
  Trash2,
  PlusCircle,
  EyeOff,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { UserRole, DistrictAdminUser, StatesDistrictsResponse, CitizenReportItem } from '../types';
import {
  fetchStatesDistricts,
  fetchDistrictAdmins,
  createDistrictAdmin,
  deleteDistrictAdmin,
  fetchAllAdminReports,
  updateAdminReportStatus,
  fetchAuthorizedPhotoBlobUrl
} from '../services/districtAdminService';

import MapComponent from './MapComponent';

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

  // Live Citizen Reports Management State
  const [adminReports, setAdminReports] = useState<CitizenReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'verified' | 'dismissed'>('all');
  const [reportSearch, setReportSearch] = useState('');


  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSentSuccess(true);
    setTimeout(() => {
      setAlertSentSuccess(false);
    }, 4000);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'verified' | 'dismissed' | 'pending') => {
    try {
      setUpdatingReportId(id);
      await updateAdminReportStatus(id, newStatus);
      const refreshed = await fetchAllAdminReports();
      setAdminReports(refreshed);
    } catch (err: any) {
      console.error('Failed to update report status:', err);
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleViewReportPhoto = async (photoPath: string) => {
    try {
      setLoadingPhoto(true);
      const blobUrl = await fetchAuthorizedPhotoBlobUrl(photoPath);
      setSelectedPhotoUrl(blobUrl);
    } catch (err: any) {
      console.error('Failed to load report photo:', err);
      alert('Unable to load photo: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingPhoto(false);
    }
  };

  // District Administrators Provisioning & Jurisdiction
  const [statesDistricts, setStatesDistricts] = useState<StatesDistrictsResponse | null>(null);
  const [districtAdmins, setDistrictAdmins] = useState<DistrictAdminUser[]>([]);
  const [loadingDistAdmins, setLoadingDistAdmins] = useState(false);
  const [daName, setDaName] = useState('');
  const [daPhone, setDaPhone] = useState('+91');
  const [daPassword, setDaPassword] = useState('');
  const [showDaPassword, setShowDaPassword] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [daSubmitting, setDaSubmitting] = useState(false);
  const [daError, setDaError] = useState<string | null>(null);
  const [daSuccess, setDaSuccess] = useState<string | null>(null);

  const loadDistrictAdminsData = async () => {
    try {
      setLoadingDistAdmins(true);
      setLoadingReports(true);
      const [refData, adminList, reportsList] = await Promise.all([
        fetchStatesDistricts().catch(() => null),
        fetchDistrictAdmins().catch(() => []),
        fetchAllAdminReports().catch(() => [])
      ]);
      if (refData) {
        setStatesDistricts(refData);
        if (!selectedState && refData.states.length > 0) {
          setSelectedState(refData.states[0]);
          const firstStateDists = refData.districts_by_state[refData.states[0]] || [];
          if (firstStateDists.length > 0) {
            setSelectedDistrict(firstStateDists[0]);
          }
        }
      }
      setDistrictAdmins(adminList || []);
      setAdminReports(reportsList || []);
    } catch (err: any) {
      console.error('Failed to load district data:', err);
    } finally {
      setLoadingDistAdmins(false);
      setLoadingReports(false);
    }
  };


  useEffect(() => {
    loadDistrictAdminsData();
  }, []);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    if (statesDistricts && statesDistricts.districts_by_state[stateName]) {
      const dists = statesDistricts.districts_by_state[stateName];
      setSelectedDistrict(dists[0] || '');
    }
  };

  const handleCreateDistrictAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDaError(null);
    setDaSuccess(null);

    if (!daName.trim()) {
      setDaError('Full Name is required.');
      return;
    }
    const cleanPhone = daPhone.trim();
    if (!/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      setDaError('Phone number must be +91 followed by a valid 10-digit mobile number starting with 6-9.');
      return;
    }
    if (daPassword.length < 8) {
      setDaError('Password must be at least 8 characters long and contain letters and numbers.');
      return;
    }
    if (!selectedState || !selectedDistrict) {
      setDaError('Please select both a State and an assigned District jurisdiction.');
      return;
    }

    try {
      setDaSubmitting(true);
      const created = await createDistrictAdmin({
        name: daName.trim(),
        phone_number: cleanPhone,
        password: daPassword,
        state_name: selectedState,
        district_name: selectedDistrict
      });

      setDaSuccess(`District Administrator account created for ${created.name} (${selectedDistrict}, ${selectedState}).`);
      setDaName('');
      setDaPhone('+91');
      setDaPassword('');
      // Reload admins
      const updatedList = await fetchDistrictAdmins();
      setDistrictAdmins(updatedList);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create District Administrator.';
      setDaError(msg);
    } finally {
      setDaSubmitting(false);
    }
  };

  const handleDeleteDistrictAdminSubmit = async (adminId: string, adminName: string) => {
    if (!window.confirm(`Are you sure you want to revoke and delete the District Administrator account for ${adminName}?`)) {
      return;
    }
    try {
      await deleteDistrictAdmin(adminId);
      setDistrictAdmins((prev) => prev.filter((a) => a.id !== adminId));
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete account.';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-earth-100 text-earth-900 flex flex-col font-sans">
      {/* ==================================================== */}
      {/* TOP ADMIN COMMAND HEADER                             */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 border-b border-earth-300 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand + Admin Clearance Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800 shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-earth-900">
                  BHURAKSHA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-brand-100 text-brand-900 border border-brand-200">
                  ADMIN COMMAND
                </span>
              </div>
              <span className="text-[10px] font-mono text-earth-600 uppercase block">
                STATE DISASTER MANAGEMENT COMMISSION &bull; REGIONAL HQ
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
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono uppercase font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-earth-700 hover:text-earth-900 hover:bg-earth-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Right: Demo Switcher, Admin Info & Logout */}
          <div className="flex items-center gap-2.5">
            {onSwitchRole && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#EDE7DC] border-2 border-[#BCB29E] px-2 py-1 rounded-xl">
                <span className="text-[9px] font-mono uppercase text-[#6B7263] font-bold">SWITCH:</span>
                <button
                  onClick={() => onSwitchRole('citizen')}
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-[#141712] hover:bg-[#EAE4D7] border border-[#BCB29E] transition-colors cursor-pointer shadow-2xs"
                >
                  Citizen
                </button>
                <button
                  onClick={() => onSwitchRole('officer')}
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1E4B33] text-white hover:bg-[#143524] border border-[#143524] transition-colors cursor-pointer shadow-2xs"
                >
                  Officer
                </button>
              </div>
            )}

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-earth-900 uppercase">
                {user.name}
              </span>
              <span className="text-[10px] font-mono text-brand-700 font-semibold">
                Level-3 Admin Authority
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#BCB29E] bg-[#EDE7DC] hover:bg-[#FDF2F0] hover:border-[#F2BCA0] hover:text-[#8A2418] text-[#141712] text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOG OUT</span>
            </button>
          </div>
        </div>

        {/* Mobile / Compact Navigation Strip */}
        <div className="flex xl:hidden items-center gap-1 overflow-x-auto py-2 border-t border-earth-200 bg-earth-50 no-scrollbar">
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
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap uppercase font-bold transition-all ${
                activeTab === tab
                  ? 'bg-brand-700 text-white'
                  : 'text-earth-700 hover:text-earth-900'
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-300 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-700 font-bold block mb-1">
                  STATE DISASTER MANAGEMENT COMMISSION
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 uppercase">
                  REGIONAL COMMAND CENTER &bull; NER CLUSTER
                </h1>
                <p className="text-xs sm:text-sm text-earth-700 mt-1 font-sans">
                  Synchronized Telemetry: IMD Radar + Sentinel-1 InSAR + In-situ Piezometers + Ground Reports
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-risk-critical/15 border border-risk-critical/30 text-risk-critical text-xs font-mono font-bold uppercase animate-pulse">
                  REGIONAL RISK: HIGH (CODE RED)
                </span>
                <button
                  onClick={() => setActiveTab('ALERTS')}
                  className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  DISPATCH ALERT &rarr;
                </button>
              </div>
            </div>

            {/* 7 Core Administrative Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-risk-critical/30 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-earth-600 uppercase block font-semibold">
                  REGIONAL RISK
                </span>
                <div className="text-xl font-bold font-serif text-risk-critical">HIGH</div>
                <span className="text-[10px] font-mono text-earth-500">Multi-Hazard Sync</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-earth-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-earth-600 uppercase block font-semibold">
                  ACTIVE JURISDICTIONS
                </span>
                <div className="text-xl font-bold font-serif text-earth-900">
                  {statesDistricts?.states?.length || 8} States
                </div>
                <span className="text-[10px] font-mono text-earth-500">
                  {(statesDistricts?.all_districts || statesDistricts?.districts || []).length || 129} Districts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-earth-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-brand-800 uppercase font-bold block">
                  DISTRICT ADMINS
                </span>
                <div className="text-xl font-bold font-serif text-brand-900">
                  {districtAdmins.length}
                </div>
                <span className="text-[10px] font-mono text-earth-500">Provisioned Desks</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-earth-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-earth-700 uppercase font-bold block">
                  CITIZEN REPORTS
                </span>
                <div className="text-xl font-bold font-serif text-earth-900">
                  {adminReports.length}
                </div>
                <span className="text-[10px] font-mono text-earth-500">
                  {adminReports.filter(r => r.status === 'pending').length} Pending Review
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-amber-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-amber-800 uppercase font-bold block">
                  VERIFIED HAZARDS
                </span>
                <div className="text-xl font-bold font-serif text-amber-900">
                  {adminReports.filter(r => r.status === 'verified').length}
                </div>
                <span className="text-[10px] font-mono text-amber-700 font-semibold">Field Confirmed</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-earth-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-earth-600 uppercase block font-semibold">
                  DISMISSED / VOID
                </span>
                <div className="text-xl font-bold font-serif text-earth-800">
                  {adminReports.filter(r => r.status === 'dismissed').length}
                </div>
                <span className="text-[10px] font-mono text-earth-500">Filtered Records</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-emerald-300 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block">
                  TELEMETRY NODES
                </span>
                <div className="text-xl font-bold font-serif text-emerald-900">ONLINE</div>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">IMD + DB Live</span>
              </div>
            </div>

            {/* Risk Intelligence Inspector for Sector A */}
            <div className="rounded-3xl border border-earth-300 bg-[#FFFDF8] p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-accent-100 border border-accent-200 text-accent-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-earth-900 uppercase">
                      RISK INTELLIGENCE INSPECTOR &bull; SECTOR A (CRITICAL FOCUS)
                    </h2>
                    <span className="text-[10px] font-mono text-earth-600">
                      MULTI-FACTOR DATA FUSION MODEL (ENVIRONMENTAL + AI PREDICTION + GIS + FIELD EVIDENCE)
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 text-xs font-mono font-bold uppercase self-start sm:self-auto">
                  INTELLIGENCE SCORE: 82% (HIGH)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">RISK SCORE</span>
                  <span className="text-base font-bold text-risk-critical">82%</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">SEVERITY</span>
                  <span className="text-base font-bold text-risk-critical">HIGH</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">RAINFALL</span>
                  <span className="text-base font-bold text-accent-700">HIGH (42mm)</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">SOIL MOISTURE</span>
                  <span className="text-base font-bold text-accent-700">HIGH (78%)</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">SLOPE ANGLE</span>
                  <span className="text-base font-bold text-earth-900">38°</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">HISTORICAL</span>
                  <span className="text-base font-bold text-earth-900">07 Events</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">FIELD REPORTS</span>
                  <span className="text-base font-bold text-brand-800">03 Logs</span>
                </div>
                <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 space-y-1">
                  <span className="text-earth-600 text-[10px] uppercase block font-semibold">FIELD EVIDENCE</span>
                  <span className="text-base font-bold text-amber-800">PENDING</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 text-xs font-mono text-earth-700 flex items-center justify-between">
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
            <div className="rounded-3xl border border-earth-300 bg-[#FFFDF8] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-earth-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-100 border border-brand-200 text-brand-800">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-serif text-earth-900 uppercase">
                    FIELD INTELLIGENCE REPORT MANAGEMENT
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('FIELD INTELLIGENCE')}
                  className="text-xs font-mono text-brand-800 hover:text-brand-900 font-bold uppercase cursor-pointer"
                >
                  FULL WORKFLOW &rarr;
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-earth-300 bg-white shadow-2xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-earth-50 border-b border-earth-200 text-earth-600 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">REPORT ID</th>
                      <th className="py-2.5 px-3 font-semibold">JURISDICTION</th>
                      <th className="py-2.5 px-3 font-semibold">HAZARD TYPE</th>
                      <th className="py-2.5 px-3 font-semibold">DESCRIPTION</th>
                      <th className="py-2.5 px-3 font-semibold">EVIDENCE</th>
                      <th className="py-2.5 px-3 font-semibold">STATUS</th>
                      <th className="py-2.5 px-3 font-semibold">SUBMITTED</th>
                      <th className="py-2.5 px-3 text-right font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-200">
                    {adminReports.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs font-mono text-earth-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <FileCheck className="w-8 h-8 text-earth-400" />
                            <span className="text-earth-800 font-bold uppercase">No Citizen Hazard Reports In Database</span>
                            <span className="text-earth-600 text-[11px]">When citizens submit geotagged camera reports from the field, they will synchronize here live.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      adminReports.map((r) => (
                        <tr key={r.id} className="hover:bg-earth-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-earth-900 font-mono">
                            {r.id.slice(0, 8)}...
                          </td>
                          <td className="py-3 px-3 text-earth-800">
                            <div className="font-bold text-earth-900">{r.district_name || 'Assigned District'}</div>
                            <div className="text-[10px] text-earth-500">{r.state_name || 'NER'}</div>
                          </td>
                          <td className="py-3 px-3 text-accent-700 font-bold uppercase">{r.hazard_type}</td>
                          <td className="py-3 px-3 text-earth-700 max-w-xs truncate font-sans" title={r.description}>
                            {r.description || 'No description provided.'}
                          </td>
                          <td className="py-3 px-3">
                            {r.photo_path ? (
                              <button
                                type="button"
                                onClick={() => handleViewReportPhoto(r.photo_path!)}
                                className="px-2 py-1 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-900 border border-brand-200 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>VIEW PHOTO</span>
                              </button>
                            ) : (
                              <span className="text-earth-400 text-[10px]">No Photo</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                r.status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : r.status === 'dismissed'
                                  ? 'bg-red-100 text-red-900 border-red-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-earth-500 text-[10px]">
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            {r.status !== 'verified' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'verified')}
                                className="px-2.5 py-1 rounded-lg bg-[#1E4B33] hover:bg-[#143524] text-white border border-[#143524] text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                              >
                                Verify
                              </button>
                            )}
                            {r.status !== 'dismissed' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'dismissed')}
                                className="px-2.5 py-1 rounded-lg bg-[#FDF2F0] hover:bg-[#FCE3DF] text-[#8A2418] border border-[#F2BCA0] text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                              >
                                Dismiss
                              </button>
                            )}
                            {r.status !== 'pending' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'pending')}
                                className="px-2.5 py-1 rounded-lg bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] border border-[#BCB29E] text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                              >
                                Reset
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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

            {/* Real Interactive MapComponent */}
            <div className="relative rounded-3xl border border-white/15 bg-[#0C121E] h-[620px] overflow-hidden shadow-2xl">
              <MapComponent
                showNERBoundaries={true}
                showSusceptibility={layers.riskHeatmap}
                showRoads={layers.roads}
                showVillages={layers.villages}
                showHospitals={layers.hospitals}
                showLandslides={layers.historicalLandslides}
              />
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
                <span>ALERT BROADCAST DISPATCHED TO REGISTERED CITIZENS IN {alertZone.toUpperCase()} VIA SMS, APP &amp; WEB!</span>
              </div>
            )}

            <form onSubmit={handleSendAlert} className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 sm:p-8 space-y-5 shadow-2xl">
              {/* Target Risk Zone */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase text-white/70 block font-bold">
                  TARGET JURISDICTION / RISK ZONE
                </label>
                <select
                  value={alertZone}
                  onChange={(e) => setAlertZone(e.target.value)}
                  className="w-full h-11 bg-[#080C14] border border-white/15 rounded-xl px-3 text-xs font-mono-code text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="All NER Corridors (Regional Broadcast)">All NER Corridors (Regional Broadcast)</option>
                  {statesDistricts && statesDistricts.states ? (
                    statesDistricts.states.flatMap((st) =>
                      (statesDistricts.districts_by_state[st] || []).map((dist) => (
                        <option key={`${st}-${dist}`} value={`${dist} (${st})`}>
                          {dist} &bull; {st}
                        </option>
                      ))
                    )
                  ) : (
                    <>
                      <option value="Aizawl (Mizoram)">Aizawl &bull; Mizoram</option>
                      <option value="East Khasi Hills (Meghalaya)">East Khasi Hills &bull; Meghalaya</option>
                      <option value="Kohima (Nagaland)">Kohima &bull; Nagaland</option>
                    </>
                  )}
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
                  <span className="text-amber-400 font-bold">ALL LOCATION-ASSOCIATED CITIZENS IN JURISDICTION</span>
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

            {/* 4 Security Tiers Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0C121E] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-emerald-400">
                    PUBLIC CITIZENS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                    CITIZEN ROLE
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Citizens submit geotagged hazard photos. Incident reports are spatially routed to the nearest district administration.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Access: <span className="text-emerald-300 font-bold">Geotagged Camera Reports</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-blue-400">
                    FIELD OFFICERS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold">
                    FIELD ROLE
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Official credentials verified by SDMA administrators before field investigation and ground sensor deployment access.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Access: <span className="text-blue-300 font-bold">Ground Investigation &amp; Sensor Ops</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-purple-400">
                    DISTRICT ADMINS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">
                    DISTRICT SCOPED
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Assigned strictly to a specific district. Exclusive authority to review, verify, or dismiss local hazard reports.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Provisioned Admins:{' '}
                  <span className="text-purple-300 font-bold">{districtAdmins.length} Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121E] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-amber-400">
                    SDMA SUPER-ADMINS
                  </span>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                    COMMAND CLEARANCE
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Accounts provisioned strictly by system authority. Full jurisdiction across all states, districts, and telemetry systems.
                </p>
                <div className="text-[10px] font-mono-code text-white/40 pt-1">
                  Jurisdiction Scope:{' '}
                  <span className="text-amber-300 font-bold">
                    {statesDistricts && statesDistricts.states
                      ? `${statesDistricts.states.length} States • ${(statesDistricts.all_districts || statesDistricts.districts || []).length} Districts`
                      : '8 States • 129 Districts'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* DISTRICT ADMINISTRATORS PROVISIONING & JURISDICTION ROSTER */}
            {/* ========================================================= */}
            <div className="rounded-3xl border border-earth-300 bg-[#FFFDF8] p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-earth-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-100 border border-brand-200 text-brand-800">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-earth-900 uppercase">
                    DISTRICT ADMINISTRATORS PROVISIONING &amp; JURISDICTION
                  </h3>
                </div>
                <span className="text-xs font-mono text-earth-600">
                  Create and manage district-scoped administrative authorities
                </span>
              </div>

              {/* Create District Admin Form */}
              <form onSubmit={handleCreateDistrictAdminSubmit} className="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-brand-800 font-bold uppercase">
                  <PlusCircle className="w-4 h-4" />
                  <span>Provision New District Administrator</span>
                </div>

                {daError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-risk-critical text-xs font-mono">
                    {daError}
                  </div>
                )}
                {daSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                    {daSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-earth-700 block uppercase font-bold text-[11px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Officer T. Jamir"
                      value={daName}
                      onChange={(e) => setDaName(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-earth-300 rounded-xl text-earth-900 placeholder-earth-400 focus:outline-none focus:border-brand-600 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-earth-700 block uppercase font-bold text-[11px]">
                      Mobile Number (+91) *
                    </label>
                    <input
                      type="text"
                      placeholder="+919876543210"
                      value={daPhone}
                      onChange={(e) => setDaPhone(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-earth-300 rounded-xl text-earth-900 placeholder-earth-400 focus:outline-none focus:border-brand-600 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Password with toggle */}
                  <div className="space-y-1.5">
                    <label className="text-earth-700 block uppercase font-bold text-[11px]">
                      Temporary Password (8+ chars) *
                    </label>
                    <div className="relative">
                      <input
                        type={showDaPassword ? 'text' : 'password'}
                        placeholder="Min 8 chars, letters & digits"
                        value={daPassword}
                        onChange={(e) => setDaPassword(e.target.value)}
                        className="w-full h-10 pl-3 pr-10 bg-white border border-earth-300 rounded-xl text-earth-900 placeholder-earth-400 focus:outline-none focus:border-brand-600 shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowDaPassword(!showDaPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-500 hover:text-earth-800 cursor-pointer"
                      >
                        {showDaPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* State Select */}
                  <div className="space-y-1.5">
                    <label className="text-earth-700 block uppercase font-bold text-[11px]">
                      Assigned State *
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-earth-300 rounded-xl text-earth-900 focus:outline-none focus:border-brand-600 shadow-2xs cursor-pointer"
                      required
                    >
                      {statesDistricts ? (
                        statesDistricts.states.map((st) => (
                          <option key={st} value={st} className="bg-white text-earth-900">
                            {st}
                          </option>
                        ))
                      ) : (
                        <option value="">Loading states...</option>
                      )}
                    </select>
                  </div>

                  {/* District Select */}
                  <div className="space-y-1.5">
                    <label className="text-earth-700 block uppercase font-bold text-[11px]">
                      Assigned District Jurisdiction *
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-earth-300 rounded-xl text-earth-900 focus:outline-none focus:border-brand-600 shadow-2xs cursor-pointer"
                      required
                    >
                      {statesDistricts && selectedState && statesDistricts.districts_by_state[selectedState] ? (
                        statesDistricts.districts_by_state[selectedState].map((dist) => (
                          <option key={dist} value={dist} className="bg-white text-earth-900">
                            {dist}
                          </option>
                        ))
                      ) : (
                        <option value="">Select state first</option>
                      )}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={daSubmitting}
                      className="w-full h-10 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      {daSubmitting ? (
                        <span>PROVISIONING...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>PROVISION DISTRICT ADMIN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* District Admins Roster Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-earth-800 font-bold uppercase">
                    ACTIVE DISTRICT ADMINISTRATORS ROSTER ({districtAdmins.length})
                  </span>
                  <button
                    onClick={loadDistrictAdminsData}
                    disabled={loadingDistAdmins}
                    className="text-brand-800 hover:text-brand-900 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingDistAdmins ? 'animate-spin' : ''}`} />
                    <span>REFRESH</span>
                  </button>
                </div>

                {districtAdmins.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-earth-500 border border-earth-200 rounded-2xl bg-earth-50">
                    No District Administrators provisioned yet. Use the form above to add an administrator.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-earth-300 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="border-b border-earth-200 bg-earth-50 text-earth-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-3 font-semibold">Administrator</th>
                          <th className="p-3 font-semibold">Mobile Contact</th>
                          <th className="p-3 font-semibold">State</th>
                          <th className="p-3 font-semibold">Assigned District</th>
                          <th className="p-3 font-semibold">Jurisdiction Status</th>
                          <th className="p-3 font-semibold">Created</th>
                          <th className="p-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-earth-200">
                        {districtAdmins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-earth-50 transition-colors">
                            <td className="p-3">
                              <span className="text-earth-900 font-bold block">{admin.name}</span>
                              <span className="text-[10px] text-earth-500">{admin.id}</span>
                            </td>
                            <td className="p-3 text-earth-800">{admin.phone_number}</td>
                            <td className="p-3 text-earth-800">{admin.state_name || '—'}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200 text-[10px] font-bold">
                                {admin.district_name || 'Assigned District'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="flex items-center gap-1.5 text-brand-800 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" />
                                <span>ACTIVE</span>
                              </span>
                            </td>
                            <td className="p-3 text-earth-500 text-[10px]">
                              {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteDistrictAdminSubmit(admin.id, admin.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#FDF2F0] hover:bg-[#FCE3DF] text-[#8A2418] border-2 border-[#F2BCA0] text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                title="Revoke & Delete Administrator"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>REVOKE</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DEDICATED FIELD INTELLIGENCE & CITIZEN REPORTS */}
        {activeTab === 'FIELD INTELLIGENCE' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-blue-400 font-bold block mb-1">
                  SDMA REGIONAL AUDIT
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
                  CITIZEN FIELD HAZARD INTELLIGENCE
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Live reports submitted by registered citizens across all districts with geotags and field evidence photos.
                </p>
              </div>

              <button
                onClick={loadDistrictAdminsData}
                disabled={loadingReports}
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono-code font-bold uppercase transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
                <span>SYNC LIVE DATA</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0C121E] border border-white/10">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'ALL REPORTS', count: adminReports.length },
                  { key: 'pending', label: 'PENDING TRIAGE', count: adminReports.filter(r => r.status === 'pending').length },
                  { key: 'verified', label: 'VERIFIED', count: adminReports.filter(r => r.status === 'verified').length },
                  { key: 'dismissed', label: 'DISMISSED', count: adminReports.filter(r => r.status === 'dismissed').length }
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setReportStatusFilter(pill.key as any)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold uppercase transition-all cursor-pointer ${
                      reportStatusFilter === pill.key
                        ? 'bg-blue-500 text-white border-blue-400 shadow-md'
                        : 'bg-[#080C14] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {pill.label} ({pill.count})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter district or hazard..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-[#080C14] border border-white/15 rounded-xl text-xs font-mono-code text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Roster of live reports */}
            <div className="rounded-3xl border border-white/15 bg-[#0C121E] p-6 space-y-4 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-code">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase">
                      <th className="py-3 px-3">REPORT ID</th>
                      <th className="py-3 px-3">DISTRICT &amp; STATE</th>
                      <th className="py-3 px-3">HAZARD TYPE</th>
                      <th className="py-3 px-3">CITIZEN EVIDENCE &amp; DETAILS</th>
                      <th className="py-3 px-3">COORDINATES</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3">TIMESTAMP</th>
                      <th className="py-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(() => {
                      const filtered = adminReports.filter(r => {
                        if (reportStatusFilter !== 'all' && r.status !== reportStatusFilter) return false;
                        if (reportSearch.trim()) {
                          const q = reportSearch.toLowerCase();
                          const matchDist = (r.district_name || '').toLowerCase().includes(q);
                          const matchState = (r.state_name || '').toLowerCase().includes(q);
                          const matchHazard = (r.hazard_type || '').toLowerCase().includes(q);
                          const matchDesc = (r.description || '').toLowerCase().includes(q);
                          return matchDist || matchState || matchHazard || matchDesc;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-xs font-mono-code text-white/40">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <FileCheck className="w-8 h-8 text-white/20" />
                                <span className="text-white/60 font-bold uppercase">No matching reports found</span>
                                <span className="text-white/40 text-[11px]">
                                  {adminReports.length === 0 ? 'No hazard reports submitted in the database yet.' : 'Try adjusting your status or search filters.'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-bold text-white font-mono-code">
                            {r.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-white font-bold block">{r.district_name || 'District'}</span>
                            <span className="text-[10px] text-white/50">{r.state_name || 'State'}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                              {r.hazard_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-sm">
                            <div className="text-white/80">{r.description || 'No description.'}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {r.photo_path ? (
                                <button
                                  type="button"
                                  onClick={() => handleViewReportPhoto(r.photo_path!)}
                                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>VIEW PHOTO EVIDENCE</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-white/30">No photo attached</span>
                              )}
                              {r.citizen_name && (
                                <span className="text-[10px] text-white/40">
                                  &bull; By {r.citizen_name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-white/60 text-[10px] font-mono-code">
                            {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                r.status === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : r.status === 'dismissed'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-white/50 text-[10px]">
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            {r.status !== 'verified' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'verified')}
                                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Verify
                              </button>
                            )}
                            {r.status !== 'dismissed' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'dismissed')}
                                className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Dismiss
                              </button>
                            )}
                            {r.status !== 'pending' && (
                              <button
                                disabled={updatingReportId === r.id}
                                onClick={() => handleUpdateStatus(r.id, 'pending')}
                                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70 text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Reset
                              </button>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OTHER ADMIN TABS: RISK ANALYTICS, INFRASTRUCTURE, DATA SOURCES, SYSTEM */}
        {(activeTab === 'RISK ANALYTICS' ||
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

        {/* Modal for viewing citizen uploaded photo evidence */}
        {selectedPhotoUrl && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0C121E] border border-white/20 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold font-heading text-white uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>CITIZEN FIELD PHOTO EVIDENCE</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(selectedPhotoUrl);
                    setSelectedPhotoUrl(null);
                  }}
                  className="text-white/60 hover:text-white text-xs font-mono-code uppercase px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  CLOSE [✕]
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black max-h-[70vh] flex items-center justify-center">
                <img src={selectedPhotoUrl} alt="Hazard Evidence" className="max-h-[70vh] w-auto object-contain" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

