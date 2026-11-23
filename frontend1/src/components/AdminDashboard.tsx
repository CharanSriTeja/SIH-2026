import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  PlusCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Camera,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  X,
  PhoneCall,
  Lock,
  ChevronDown,
  Terminal,
  Database
} from 'lucide-react';
import {
  UserRole,
  DistrictAdminUser,
  StatesDistrictsResponse,
  CitizenReportItem
} from '../types';
import {
  fetchStatesDistricts,
  fetchDistrictAdmins,
  createDistrictAdmin,
  deleteDistrictAdmin,
  fetchAllAdminReports,
  fetchAuthorizedPhotoBlobUrl,
  triggerDataPipeline,
  fetchDataDates,
  deleteDataDate,
  fetchPipelineLogs
} from '../services/districtAdminService';

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
  // Exactly three operational tabs:
  // 1. DISTRICT ADMINISTRATOR MANAGEMENT (default)
  // 2. HAZARD REPORTS — STATE & DISTRICT-WISE OVERSIGHT
  // 3. DATA MANAGEMENT - historical data and pipelines
  const [activeTab, setActiveTab] = useState<'DISTRICT_ADMINS' | 'HAZARD_REPORTS' | 'DATA_MANAGEMENT'>('DISTRICT_ADMINS');

  // =========================================================================
  // TAB 1: DISTRICT ADMINISTRATORS MANAGEMENT STATE
  // =========================================================================
  const [statesDistricts, setStatesDistricts] = useState<StatesDistrictsResponse | null>(null);
  const [districtAdmins, setDistrictAdmins] = useState<DistrictAdminUser[]>([]);
  const [loadingDistAdmins, setLoadingDistAdmins] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStateFilter, setAdminStateFilter] = useState('all');

  // Form State for creating new District Admin
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [daName, setDaName] = useState('');
  const [daPhone, setDaPhone] = useState('');
  const [daPassword, setDaPassword] = useState('');
  const [daState, setDaState] = useState('');
  const [daDistrict, setDaDistrict] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================================================================
  // TAB 2: CITIZEN HAZARD REPORTS OVERSIGHT STATE
  // =========================================================================
  const [reports, setReports] = useState<CitizenReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportStateFilter, setReportStateFilter] = useState('all');
  const [reportDistrictFilter, setReportDistrictFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'verified' | 'dismissed'>('all');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  // Photo viewer modal state
  const [inspectReport, setInspectReport] = useState<CitizenReportItem | null>(null);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [loadingModalPhoto, setLoadingModalPhoto] = useState(false);
  const [photoBlobUrls, setPhotoBlobUrls] = useState<Record<string, string>>({});

  // =========================================================================
  // TAB 3: DATA MANAGEMENT STATE
  // =========================================================================
  const [dataDates, setDataDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string>('');
  
  // Pipeline trigger state
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------------------
  const loadReferenceData = async () => {
    try {
      const data = await fetchStatesDistricts();
      setStatesDistricts(data);
      if (data.states && data.states.length > 0 && !daState) {
        setDaState(data.states[0]);
        const districts = data.districts_by_state[data.states[0]] || [];
        if (districts.length > 0) {
          setDaDistrict(districts[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load states & districts reference:', err);
    }
  };

  const loadDistrictAdmins = async () => {
    try {
      setLoadingDistAdmins(true);
      const list = await fetchDistrictAdmins();
      setDistrictAdmins(list);
    } catch (err) {
      console.error('Failed to load district administrators:', err);
    } finally {
      setLoadingDistAdmins(false);
    }
  };

  const loadAllReports = async () => {
    try {
      setLoadingReports(true);
      const fetched = await fetchAllAdminReports({
        state: reportStateFilter === 'all' ? undefined : reportStateFilter,
        district: reportDistrictFilter === 'all' ? undefined : reportDistrictFilter,
        status: reportStatusFilter === 'all' ? undefined : reportStatusFilter,
        date_from: reportDateFrom || undefined,
        date_to: reportDateTo || undefined,
      });
      setReports(fetched);

      // Fetch thumbnails
      fetched.forEach(async (rep) => {
        const photoKey = rep.photo_path || rep.photo_url;
        if (photoKey && !photoBlobUrls[rep.id]) {
          try {
            const blobUrl = await fetchAuthorizedPhotoBlobUrl(photoKey);
            setPhotoBlobUrls((prev) => ({ ...prev, [rep.id]: blobUrl }));
          } catch (e) {
            console.warn('Failed to load thumbnail for report', rep.id, e);
          }
        }
      });
    } catch (err) {
      console.error('Failed to load admin hazard reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadDataDates = async () => {
    try {
      setLoadingDates(true);
      const dates = await fetchDataDates();
      setDataDates(dates);
    } catch (err) {
      console.error('Failed to load data dates:', err);
    } finally {
      setLoadingDates(false);
    }
  };

  const handleDeleteDataDate = async (dateStr: string) => {
    if (!window.confirm(`Are you sure you want to delete all raw and processed data for ${dateStr}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteDataDate(dateStr);
      await loadDataDates(); // refresh
    } catch (err) {
      console.error('Failed to delete data:', err);
      alert('Failed to delete data. See console for details.');
    }
  };

  useEffect(() => {
    loadReferenceData();
    loadDistrictAdmins();
  }, []);

  useEffect(() => {
    if (activeTab === 'HAZARD_REPORTS') {
      loadAllReports();
    } else if (activeTab === 'DATA_MANAGEMENT') {
      loadDataDates();
    }
  }, [activeTab, reportStateFilter, reportDistrictFilter, reportStatusFilter, reportDateFrom, reportDateTo]);

  // Polling for pipeline logs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTerminal || triggeringPipeline) {
      const fetchLogs = async () => {
        try {
          const logs = await fetchPipelineLogs();
          setPipelineLogs(logs);
        } catch (e) {
          console.error("Failed to fetch pipeline logs", e);
        }
      };
      fetchLogs(); // initial fetch
      interval = setInterval(fetchLogs, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showTerminal, triggeringPipeline]);

  // Handle State selection change in Create Form
  const handleStateChange = (newState: string) => {
    setDaState(newState);
    if (statesDistricts) {
      const districts = statesDistricts.districts_by_state[newState] || [];
      setDaDistrict(districts[0] || '');
    }
  };

  // Handle District Admin Creation
  const handleCreateDistrictAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!daName.trim() || !daPhone.trim() || !daPassword.trim() || !daState || !daDistrict) {
      setFormError('Please fill out all required fields.');
      return;
    }

    try {
      setCreateSubmitting(true);
      await createDistrictAdmin({
        name: daName.trim(),
        phone_number: daPhone.trim(),
        password: daPassword,
        state_name: daState,
        district_name: daDistrict
      });

      setFormSuccess(`District Administrator account for ${daName} created successfully.`);
      setDaName('');
      setDaPhone('');
      setDaPassword('');
      setShowCreateForm(false);
      await loadDistrictAdmins();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create district administrator.';
      setFormError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle District Admin Removal
  const handleDeleteDistrictAdmin = async (adminId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove the District Administrator account for ${name}?`)) {
      return;
    }

    try {
      setDeletingId(adminId);
      await deleteDistrictAdmin(adminId);
      setDistrictAdmins((prev) => prev.filter((da) => da.id !== adminId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete district administrator.');
    } finally {
      setDeletingId(null);
    }
  };

  // Photo Inspection Modal
  const handleOpenPhotoModal = async (report: CitizenReportItem) => {
    setInspectReport(report);
    const photoKey = report.photo_path || report.photo_url;
    if (photoBlobUrls[report.id]) {
      setModalPhotoUrl(photoBlobUrls[report.id]);
    } else if (photoKey) {
      try {
        setLoadingModalPhoto(true);
        const url = await fetchAuthorizedPhotoBlobUrl(photoKey);
        setModalPhotoUrl(url);
        setPhotoBlobUrls((prev) => ({ ...prev, [report.id]: url }));
      } catch (err) {
        console.error('Failed to load full photo in inspect modal:', err);
        setModalPhotoUrl(null);
      } finally {
        setLoadingModalPhoto(false);
      }
    } else {
      setModalPhotoUrl(null);
    }
  };

  const handleTriggerPipeline = async () => {
    if (!window.confirm('Are you sure you want to trigger the data fetching pipeline? This will run in the background.')) return;
    try {
      setTriggeringPipeline(true);
      setShowTerminal(true);
      setActiveTab('DATA_MANAGEMENT');
      const res = await triggerDataPipeline();
      // Optional: alert(res.message || 'Pipeline triggered successfully.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to trigger pipeline.');
    } finally {
      setTimeout(() => setTriggeringPipeline(false), 5000); // keep triggering indicator for a bit
    }
  };

  // Filtered District Admins Roster
  const filteredAdmins = districtAdmins.filter((adm) => {
    if (adminStateFilter !== 'all' && adm.state_name !== adminStateFilter) {
      return false;
    }
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return (
        adm.name.toLowerCase().includes(q) ||
        adm.phone_number.includes(q) ||
        (adm.district_name && adm.district_name.toLowerCase().includes(q)) ||
        (adm.state_name && adm.state_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Citizen Reports (client search filtering on top of server filters)
  const filteredReports = reports.filter((rep) => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return (
      (rep.hazard_type && rep.hazard_type.toLowerCase().includes(q)) ||
      (rep.description && rep.description.toLowerCase().includes(q)) ||
      (rep.citizen_name && rep.citizen_name.toLowerCase().includes(q)) ||
      (rep.citizen_phone && rep.citizen_phone.includes(q)) ||
      (rep.district_name && rep.district_name.toLowerCase().includes(q)) ||
      (rep.state_name && rep.state_name.toLowerCase().includes(q)) ||
      (rep.reviewed_by_name && rep.reviewed_by_name.toLowerCase().includes(q))
    );
  });

  // List of districts available for currently selected filter state
  const filterDistricts =
    reportStateFilter !== 'all' && statesDistricts
      ? statesDistricts.districts_by_state[reportStateFilter] || []
      : [];

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#141712] flex flex-col font-sans">
      {/* ==================================================== */}
      {/* 1. TOP HEADER: REGIONAL SDMA COMMAND                */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 border-b-2 border-[#BCB29E] backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] border-2 border-[#1E4B33] flex items-center justify-center text-[#1E4B33] shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-[#141712]">
                  BHURAKSHA
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4EE] text-[#1E4B33] border border-[#1E4B33]">
                  SUPER-ADMIN DESK
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#474C3F] block font-bold">
                STATE &amp; REGIONAL DISASTER MANAGEMENT COMMAND
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <div className="hidden md:flex items-center gap-1.5 bg-[#EDE7DC] border-2 border-[#C9C0AD] px-2 py-1 rounded-xl">
                <span className="text-[9px] font-mono uppercase text-[#474C3F] font-bold">SWITCH:</span>
                <button
                  onClick={() => onSwitchRole('citizen')}
                  className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-white text-[#141712] hover:bg-[#F0ECE1] border border-[#C9C0AD] transition-all cursor-pointer"
                >
                  Citizen
                </button>
                <button
                  onClick={() => onSwitchRole('district_admin')}
                  className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-[#1E4B33] text-white hover:bg-[#143524] border border-[#143524] transition-all cursor-pointer"
                >
                  District Desk
                </button>
              </div>
            )}

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-[#141712] uppercase">
                {user.name || 'System Administrator'}
              </span>
              <span className="text-[10px] font-mono text-[#1E4B33] font-semibold">
                Super-Admin Clearance
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-[#FDF2F0] hover:bg-[#FCE3DF] text-[#8A2418] hover:text-[#6D1B12] border-2 border-[#F2BCA0] transition-all cursor-pointer shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. TAB SELECTION BAR (EXACTLY TWO FUNCTIONS)         */}
      {/* ==================================================== */}
      <div className="bg-[#FFFFFF] border-b-2 border-[#BCB29E] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3 py-2.5">
          {/* TAB 1: DISTRICT ADMINISTRATOR MANAGEMENT (FIRST / DEFAULT) */}
          <button
            onClick={() => setActiveTab('DISTRICT_ADMINS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'DISTRICT_ADMINS'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>District Administrator Management</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'DISTRICT_ADMINS' ? 'bg-white/20 text-white' : 'bg-[#ECE7DC] text-[#141712]'
              }`}
            >
              {districtAdmins.length}
            </span>
          </button>

          {/* TAB 2: HAZARD REPORTS — STATE & DISTRICT-WISE OVERSIGHT */}
          <button
            onClick={() => setActiveTab('HAZARD_REPORTS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'HAZARD_REPORTS'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hazard Reports Oversight</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'HAZARD_REPORTS' ? 'bg-white/20 text-white' : 'bg-[#ECE7DC] text-[#141712]'
              }`}
            >
              {reports.length}
            </span>
          </button>
        {/* TAB 3: DATA MANAGEMENT */}
          <button
            onClick={() => setActiveTab('DATA_MANAGEMENT')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'DATA_MANAGEMENT'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Management</span>
          </button>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-3 py-2.5">
          <button
            onClick={handleTriggerPipeline}
            disabled={triggeringPipeline}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 bg-[#F0ECE1] text-[#141712] border-[#C9C0AD] hover:bg-[#E2DFD3] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-4 h-4 ${triggeringPipeline ? 'animate-spin' : ''}`} />
            <span>{triggeringPipeline ? 'Triggering...' : 'Run Data Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT                            */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ================================================== */}
        {/* TAB 1: DISTRICT ADMINISTRATOR MANAGEMENT           */}
        {/* ================================================== */}
        {activeTab === 'DISTRICT_ADMINS' && (
          <div className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold">
                  DECENTRALIZED JURISDICTION ACCESS CONTROL
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-tight text-[#141712]">
                  District Administrator Management
                </h1>
                <p className="text-xs sm:text-sm text-[#474C3F] max-w-2xl font-sans">
                  Provision and oversee District Administrators for each administrative district in Northeast India. District Admins possess sole authority to verify citizen hazard reports in their jurisdiction.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{showCreateForm ? 'Close Form' : 'Create District Admin'}</span>
                </button>

                <button
                  onClick={loadDistrictAdmins}
                  disabled={loadingDistAdmins}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#F0ECE1] text-[#141712] border-2 border-[#BCB29E] transition-all cursor-pointer shadow-xs"
                  title="Refresh Roster"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDistAdmins ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Notification Messages */}
            {formSuccess && (
              <div className="p-4 rounded-2xl bg-[#EAF4EC] border-2 border-[#A8D9B2] text-xs font-mono text-[#1E4A26] flex items-center justify-between">
                <span>{formSuccess}</span>
                <button onClick={() => setFormSuccess(null)} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {formError && (
              <div className="p-4 rounded-2xl bg-[#FCEEEB] border-2 border-[#EABEB7] text-xs font-mono text-[#8A2418] flex items-center justify-between">
                <span>{formError}</span>
                <button onClick={() => setFormError(null)} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* "Create District Administrator" Provisioning Form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreateDistrictAdmin}
                className="p-6 rounded-3xl bg-white border-2 border-[#1E4B33] shadow-md space-y-4 animate-fade-in"
              >
                <div className="border-b border-[#DFD8CA] pb-3">
                  <h3 className="text-base font-serif font-bold uppercase text-[#141712]">
                    Provision New District Administrator
                  </h3>
                  <p className="text-xs text-[#474C3F]">
                    Assign official credentials and bind the administrator directly to a specific district.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-[#474C3F] block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={daName}
                      onChange={(e) => setDaName(e.target.value)}
                      placeholder="e.g. Tenzing Norbu"
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-[#474C3F] block">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <PhoneCall className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6B7263]" />
                      <input
                        type="tel"
                        required
                        value={daPhone}
                        onChange={(e) => setDaPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-[#474C3F] block">
                      Password (min 8 chars, letter+num) *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6B7263]" />
                      <input
                        type="password"
                        required
                        value={daPassword}
                        onChange={(e) => setDaPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* State Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-[#474C3F] block">
                      Assigned State *
                    </label>
                    <select
                      value={daState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                    >
                      {statesDistricts?.states?.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Dropdown (filtered by State) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-[#474C3F] block">
                      Assigned District *
                    </label>
                    <select
                      value={daDistrict}
                      onChange={(e) => setDaDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                    >
                      {statesDistricts && daState && statesDistricts.districts_by_state[daState]?.map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono font-bold uppercase text-[#474C3F] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {createSubmitting ? 'Creating Administrator...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {/* Administrators Roster Table / List */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD8CA] pb-3">
                <div>
                  <h3 className="text-base font-serif font-bold uppercase text-[#141712]">
                    Active District Administrators Roster
                  </h3>
                  <p className="text-xs text-[#474C3F]">
                    List of all provisioned district administrators across Northeast India.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Filter by State */}
                  <select
                    value={adminStateFilter}
                    onChange={(e) => setAdminStateFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  >
                    <option value="all">All States</option>
                    {statesDistricts?.states?.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7263]" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Search admin name..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {loadingDistAdmins ? (
                <div className="p-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-[#1E4B33] border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-mono uppercase text-[#474C3F]">Loading roster...</span>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#EDE7DC]/40 border-2 border-dashed border-[#BCB29E] space-y-2">
                  <Users className="w-8 h-8 text-[#6B7263] mx-auto opacity-60" />
                  <span className="text-xs font-mono uppercase text-[#474C3F] block font-bold">
                    No District Administrators Found
                  </span>
                  <p className="text-xs text-[#474C3F] font-sans">
                    Use the "Create District Admin" button above to provision an administrator for a district.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#BCB29E] text-[10px] font-mono uppercase text-[#474C3F]">
                        <th className="py-2.5 px-3">Administrator</th>
                        <th className="py-2.5 px-3">Mobile Contact</th>
                        <th className="py-2.5 px-3">Assigned Jurisdiction</th>
                        <th className="py-2.5 px-3">Created Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFD8CA] text-xs font-mono">
                      {filteredAdmins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-[#F0ECE1]/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-[#141712]">
                            {adm.name}
                          </td>
                          <td className="py-3 px-3 text-[#474C3F]">
                            {adm.phone_number}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4EE] text-[#1E4B33] border border-[#9EC4AF]">
                              {adm.district_name || 'District'}, {adm.state_name || 'State'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#6B7263]">
                            {adm.created_at ? new Date(adm.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#EAF4EC] text-[#1E4A26] border border-[#A8D9B2]">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteDistrictAdmin(adm.id, adm.name)}
                              disabled={deletingId === adm.id}
                              className="px-2.5 py-1 rounded-lg bg-[#FCEEEB] hover:bg-[#F9D4CD] text-[#8A2418] border border-[#EABEB7] text-[10px] font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Deactivate / Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Deactivate</span>
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
        )}

        {/* ================================================== */}
        {/* TAB 2: HAZARD REPORTS — REGION-WIDE OVERSIGHT      */}
        {/* ================================================== */}
        {activeTab === 'HAZARD_REPORTS' && (
          <div className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold">
                  NATIONAL &amp; REGIONAL SDMA OVERSIGHT
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-tight text-[#141712]">
                  Citizen Hazard Reports Oversight
                </h1>
                <p className="text-xs sm:text-sm text-[#474C3F] max-w-2xl font-sans">
                  Comprehensive, state- and district-wise monitoring of all citizen hazard reports submitted across Northeast India. Read-only oversight with district verification accountability.
                </p>
              </div>

              <button
                onClick={loadAllReports}
                disabled={loadingReports}
                className="px-4 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-xs self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
                <span>Refresh Oversight Feed</span>
              </button>
            </div>

            {/* Filter Bar: State, District, Status, Date Range */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#BCB29E] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFD8CA] pb-2">
                <span className="text-xs font-mono font-bold uppercase text-[#141712] flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#1E4B33]" />
                  <span>Oversight Filters</span>
                </span>
                <span className="text-[10px] font-mono text-[#6B7263]">
                  Showing {filteredReports.length} reports
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#474C3F] block">
                    State
                  </label>
                  <select
                    value={reportStateFilter}
                    onChange={(e) => {
                      setReportStateFilter(e.target.value);
                      setReportDistrictFilter('all');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  >
                    <option value="all">All States</option>
                    {statesDistricts?.states?.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown (dynamically populated) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#474C3F] block">
                    District
                  </label>
                  <select
                    value={reportDistrictFilter}
                    onChange={(e) => setReportDistrictFilter(e.target.value)}
                    disabled={reportStateFilter === 'all'}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none disabled:opacity-50"
                  >
                    <option value="all">All Districts</option>
                    {filterDistricts.map((dst) => (
                      <option key={dst} value={dst}>
                        {dst}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#474C3F] block">
                    Review Status
                  </label>
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                {/* Date From */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#474C3F] block">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={reportDateFrom}
                    onChange={(e) => setReportDateFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#474C3F] block">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={reportDateTo}
                    onChange={(e) => setReportDateTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Search Bar + Reset */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7263]" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="Search submitter, hazard type, district..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:outline-none"
                  />
                </div>

                {(reportStateFilter !== 'all' || reportDistrictFilter !== 'all' || reportStatusFilter !== 'all' || reportDateFrom || reportDateTo || reportSearch) && (
                  <button
                    onClick={() => {
                      setReportStateFilter('all');
                      setReportDistrictFilter('all');
                      setReportStatusFilter('all');
                      setReportDateFrom('');
                      setReportDateTo('');
                      setReportSearch('');
                    }}
                    className="text-xs font-mono text-[#8A2418] hover:underline font-bold cursor-pointer self-end"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Oversight Table / Report List */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] shadow-sm space-y-4">
              {loadingReports ? (
                <div className="p-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-[#1E4B33] border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-mono uppercase text-[#474C3F]">Loading regional reports...</span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#EDE7DC]/40 border-2 border-dashed border-[#BCB29E] space-y-2">
                  <FileText className="w-8 h-8 text-[#6B7263] mx-auto opacity-60" />
                  <span className="text-xs font-mono uppercase text-[#474C3F] block font-bold">
                    No Hazard Reports Found
                  </span>
                  <p className="text-xs text-[#474C3F] font-sans">
                    No citizen hazard reports match the selected state, district, or status filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#BCB29E] text-[10px] font-mono uppercase text-[#474C3F]">
                        <th className="py-2.5 px-3">Photo</th>
                        <th className="py-2.5 px-3">Submitter</th>
                        <th className="py-2.5 px-3">State &amp; District</th>
                        <th className="py-2.5 px-3">Hazard Type</th>
                        <th className="py-2.5 px-3">Submitted Time</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Reviewed By (District Admin)</th>
                        <th className="py-2.5 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFD8CA] text-xs font-mono">
                      {filteredReports.map((rep) => {
                        const isPending = rep.status.toLowerCase() === 'pending';
                        const isVerified = rep.status.toLowerCase() === 'verified';
                        const isDismissed = rep.status.toLowerCase() === 'dismissed';

                        return (
                          <tr key={rep.id} className="hover:bg-[#F0ECE1]/50 transition-colors">
                            {/* Thumbnail */}
                            <td className="py-2.5 px-3">
                              <div
                                onClick={() => handleOpenPhotoModal(rep)}
                                className="w-12 h-12 rounded-lg bg-[#ECE7DC] border border-[#BCB29E] overflow-hidden cursor-pointer relative group flex items-center justify-center shrink-0"
                              >
                                {photoBlobUrls[rep.id] ? (
                                  <img
                                    src={photoBlobUrls[rep.id]}
                                    alt="Hazard"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Camera className="w-4 h-4 text-[#6B7263]" />
                                )}
                              </div>
                            </td>

                            {/* Submitter */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[#141712]">{rep.citizen_name || 'Citizen'}</div>
                              <div className="text-[10px] text-[#6B7263]">{rep.citizen_phone || 'N/A'}</div>
                            </td>

                            {/* Jurisdiction */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[#141712]">{rep.district_name || 'Unknown District'}</div>
                              <div className="text-[10px] text-[#1E4B33] font-semibold">{rep.state_name || 'NER'}</div>
                            </td>

                            {/* Hazard Type */}
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ECE7DC] text-[#141712] border border-[#BCB29E]">
                                {rep.hazard_type || 'Hazard'}
                              </span>
                            </td>

                            {/* Submitted Date */}
                            <td className="py-2.5 px-3 text-[#474C3F]">
                              {rep.submitted_at
                                ? new Date(rep.submitted_at).toLocaleString([], {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })
                                : 'N/A'}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                  isVerified
                                    ? 'bg-[#EAF4EC] text-[#1E4A26] border-[#A8D9B2]'
                                    : isDismissed
                                    ? 'bg-[#FCEEEB] text-[#5C170F] border-[#EABEB7]'
                                    : 'bg-[#FDF4E6] text-[#694008] border-[#F0CE91]'
                                }`}
                              >
                                {rep.status}
                              </span>
                            </td>

                            {/* Reviewing District Admin */}
                            <td className="py-2.5 px-3">
                              {rep.reviewed_by_name ? (
                                <div className="text-[#1E4B33] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-[#1E4B33]" />
                                  <span>{rep.reviewed_by_name}</span>
                                </div>
                              ) : isPending ? (
                                <span className="text-[10px] text-[#B87217] font-semibold">
                                  Awaiting District Review
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#6B7263]">Reviewed</span>
                              )}
                            </td>

                            {/* Inspect */}
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenPhotoModal(rep)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F0ECE1] text-[#141712] border border-[#BCB29E] text-[10px] font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. TAB 3: DATA MANAGEMENT & TERMINAL                 */}
        {/* ==================================================== */}
        {activeTab === 'DATA_MANAGEMENT' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left Column: Data Dates */}
              <div className="w-full md:w-1/3 space-y-4">
                <div className="bg-white border-2 border-[#BCB29E] rounded-3xl p-5 sm:p-6 shadow-xs h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#141712] flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#1E4B33]" />
                      Historical Archives
                    </h2>
                    <button
                      onClick={loadDataDates}
                      className="p-1.5 rounded-lg bg-[#F0ECE1] hover:bg-[#E2DECA] text-[#141712] transition-colors"
                      title="Refresh Dates"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingDates ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  {loadingDates ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[#6B7263]">
                      <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                      <span className="text-xs font-mono">Scanning archives...</span>
                    </div>
                  ) : dataDates.length === 0 ? (
                    <div className="bg-[#F0ECE1] rounded-2xl p-6 text-center text-[#6B7263]">
                      <p className="text-xs font-mono font-bold">No historical data archives found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                      {dataDates.map(date => (
                        <div key={date} className="flex items-center justify-between bg-[#F0ECE1] p-3 rounded-xl border border-[#C9C0AD]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1E4B33]" />
                            <span className="text-xs font-mono font-bold text-[#141712]">{date}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteDataDate(date)}
                            className="p-1.5 bg-[#FDF2F0] hover:bg-[#FCE3DF] border border-[#F2BCA0] text-[#8A2418] hover:text-[#6D1B12] rounded-lg transition-colors"
                            title="Delete Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column: Pipeline Terminal */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="bg-[#141712] border-2 border-[#474C3F] rounded-3xl p-5 sm:p-6 shadow-xs h-full flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between mb-4 border-b border-[#2C3026] pb-3">
                    <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#EBF4EE] flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#A8D9B2]" />
                      Live Pipeline Terminal
                    </h2>
                    <div className="flex items-center gap-2">
                      {triggeringPipeline && (
                        <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase bg-[#1E4B33] text-[#A8D9B2] px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                          Running
                        </span>
                      )}
                      <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors border ${
                          showTerminal 
                            ? 'bg-[#1E4B33] border-[#1E4B33] text-white' 
                            : 'bg-transparent border-[#474C3F] text-[#BCB29E] hover:bg-[#2C3026]'
                        }`}
                      >
                        {showTerminal ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-black rounded-xl p-4 overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar border border-[#2C3026]">
                    <pre className="text-[10px] sm:text-xs font-mono leading-relaxed text-[#A8D9B2] whitespace-pre-wrap break-all">
                      {!showTerminal && !triggeringPipeline ? (
                        <span className="text-[#6B7263]">Terminal disconnected. Click Connect to stream logs or trigger pipeline.</span>
                      ) : pipelineLogs ? (
                        pipelineLogs
                      ) : (
                        <span className="text-[#6B7263]">Waiting for logs...</span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* 4. PHOTO INSPECTION MODAL (READ-ONLY OVERSIGHT)      */}
      {/* ==================================================== */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-[#BCB29E] overflow-hidden shadow-2xl space-y-4 text-left flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b-2 border-[#BCB29E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold block">
                  SDMA INCIDENT OVERSIGHT INSPECTOR
                </span>
                <h3 className="text-lg font-serif font-bold text-[#141712] uppercase">
                  {inspectReport.hazard_type || 'Citizen Observation'}
                </h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="p-1.5 rounded-xl hover:bg-[#F0ECE1] text-[#6B7263] hover:text-[#141712] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 overflow-y-auto space-y-4 flex-1">
              <div className="w-full h-64 sm:h-72 rounded-2xl bg-[#ECE7DC] border-2 border-[#BCB29E] overflow-hidden flex items-center justify-center relative">
                {loadingModalPhoto ? (
                  <div className="flex flex-col items-center gap-2 text-[#474C3F]">
                    <div className="w-6 h-6 border-2 border-[#1E4B33] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono">Loading high-resolution photo...</span>
                  </div>
                ) : modalPhotoUrl ? (
                  <img
                    src={modalPhotoUrl}
                    alt="Inspected hazard"
                    className="w-full h-full object-contain bg-black/5"
                  />
                ) : (
                  <div className="text-center p-4 text-[#6B7263] space-y-1">
                    <Camera className="w-8 h-8 mx-auto opacity-50" />
                    <span className="text-xs font-mono block">Photo not available on disk</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs font-mono bg-[#ECE7DC] p-3.5 rounded-xl border border-[#C9C0AD]">
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Jurisdiction:</span>
                  <span className="font-bold text-[#141712]">
                    {inspectReport.district_name || 'District'}, {inspectReport.state_name || 'State'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Submitter:</span>
                  <span className="font-bold text-[#141712]">{inspectReport.citizen_name || 'Citizen'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Phone:</span>
                  <span className="font-bold text-[#141712]">{inspectReport.citizen_phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">GPS Coordinates:</span>
                  <span className="font-bold text-[#1E4B33]">
                    {inspectReport.latitude.toFixed(5)}&deg;N, {inspectReport.longitude.toFixed(5)}&deg;E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Submitted:</span>
                  <span className="font-bold text-[#141712]">
                    {new Date(inspectReport.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Review Status:</span>
                  <span className="font-bold uppercase text-[#141712]">{inspectReport.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7263]">Reviewing Admin:</span>
                  <span className="font-bold text-[#1E4B33]">{inspectReport.reviewed_by_name || 'Awaiting District Admin'}</span>
                </div>
                {inspectReport.description && (
                  <div className="pt-2 border-t border-[#BCB29E]">
                    <span className="text-[#6B7263] block mb-0.5">Description:</span>
                    <p className="font-sans text-xs text-[#141712] leading-relaxed">
                      {inspectReport.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t-2 border-[#BCB29E] flex items-center justify-end">
              <button
                onClick={() => setInspectReport(null)}
                className="px-5 py-2 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
