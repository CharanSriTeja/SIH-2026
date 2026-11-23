import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RefreshCw,
  LogOut,
  Camera,
  Eye,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Map as MapIcon,
  Activity,
  Calendar,
  AlertCircle,
  FileText,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { CitizenReportItem, DistrictOverviewResponse, DistrictVillageItem } from '../../types';
import {
  fetchDistrictReports,
  fetchDistrictOverview,
  updateDistrictReportStatus,
  fetchAuthorizedPhotoBlobUrl,
  fetchDistrictVillages
} from '../../services/districtAdminService';
import MapComponent from '../MapComponent';
import { ShelterManagement } from './ShelterManagement';

interface DistrictAdminDashboardProps {
  user: {
    id?: string;
    role: string;
    name: string | null;
    phone_number?: string;
    district_id?: string | null;
  };
  onLogout: () => void;
  onSwitchRole?: (newRole: any) => void;
}

export const DistrictAdminDashboard: React.FC<DistrictAdminDashboardProps> = ({
  user,
  onLogout,
  onSwitchRole
}) => {
  // Navigation tabs: Overview / Hazard Reports / GIS Map / Active Risk Areas / Shelters
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'map' | 'risk_areas' | 'shelters'>('overview');

  // Overview data
  const [overview, setOverview] = useState<DistrictOverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Scoped reports data
  const [reports, setReports] = useState<CitizenReportItem[]>([]);
  const [districtInfo, setDistrictInfo] = useState<{
    id: string;
    state_name: string;
    district_name: string;
    centroid_lat?: number | null;
    centroid_lon?: number | null;
  } | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Villages & Terrain Risk data
  const [villages, setVillages] = useState<DistrictVillageItem[]>([]);
  const [totalVillagesCount, setTotalVillagesCount] = useState(0);
  const [villagesBreakdown, setVillagesBreakdown] = useState<{
    Critical: number;
    High: number;
    Moderate: number;
    Low: number;
  }>({ Critical: 0, High: 0, Moderate: 0, Low: 0 });
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [villageRiskFilter, setVillageRiskFilter] = useState<'all' | 'alert_only' | 'critical' | 'high' | 'moderate' | 'low'>('all');
  const [villageSearch, setVillageSearch] = useState<string>('');
  const [mapCenterOverride, setMapCenterOverride] = useState<[number, number] | null>(null);

  // Filter controls for citizen reports
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'dismissed'>('all');
  const [hazardFilter, setHazardFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Photo viewer modal state
  const [inspectReport, setInspectReport] = useState<CitizenReportItem | null>(null);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [loadingModalPhoto, setLoadingModalPhoto] = useState(false);

  // Highlighted report from Map click
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);

  // Thumbnail photo blobs cache
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  // 1. Load Overview summary statistics
  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      const data = await fetchDistrictOverview();
      setOverview(data);
      if (data.district) {
        setDistrictInfo(data.district);
      }
    } catch (err: any) {
      console.warn('Failed to load district overview stats:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // 2. Load district citizen reports
  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setError(null);
      const data = await fetchDistrictReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(data.reports || []);
      if (data.district && !districtInfo) {
        setDistrictInfo(data.district);
      }

      // Fetch photo thumbnails in background
      data.reports.forEach(async (rep) => {
        const photoKey = rep.photo_path || rep.photo_url;
        if (photoKey && !photoUrls[rep.id]) {
          try {
            const blobUrl = await fetchAuthorizedPhotoBlobUrl(photoKey);
            setPhotoUrls((prev) => ({ ...prev, [rep.id]: blobUrl }));
          } catch (e) {
            console.warn('Failed to load photo thumbnail for report', rep.id, e);
          }
        }
      });
    } catch (err: any) {
      console.error('Failed to load district reports:', err);
      const msg = err.response?.data?.detail || err.message || 'Unable to fetch district reports.';
      setError(msg);
    } finally {
      setLoadingReports(false);
    }
  };

  // 3. Load district villages with real dynamic risk scores
  const loadVillages = async (riskFilter?: string, search?: string) => {
    try {
      setLoadingVillages(true);
      const rf = riskFilter !== undefined ? riskFilter : villageRiskFilter;
      const q = search !== undefined ? search : villageSearch;
      const data = await fetchDistrictVillages({
        risk_filter: rf === 'all' ? undefined : rf,
        search: q.trim() || undefined
      });
      setVillages(data.villages || []);
      setTotalVillagesCount(data.total_villages || 0);
      if (data.breakdown) {
        setVillagesBreakdown(data.breakdown);
      }
      if (data.district && !districtInfo) {
        setDistrictInfo(data.district);
      }
    } catch (err: any) {
      console.warn('Failed to load district villages:', err);
    } finally {
      setLoadingVillages(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadReports();
    loadVillages();
  }, [statusFilter]);

  useEffect(() => {
    loadVillages(villageRiskFilter, villageSearch);
  }, [villageRiskFilter, villageSearch]);

  const handleStatusChange = async (reportId: string, newStatus: 'verified' | 'dismissed') => {
    try {
      setUpdatingId(reportId);
      await updateDistrictReportStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: newStatus, reviewed_at: new Date().toISOString() }
            : r
        )
      );
      if (inspectReport && inspectReport.id === reportId) {
        setInspectReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      // Refresh overview statistics after verification
      loadOverview();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update report status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenInspectModal = async (report: CitizenReportItem) => {
    setInspectReport(report);
    const photoKey = report.photo_path || report.photo_url;
    if (photoUrls[report.id]) {
      setModalPhotoUrl(photoUrls[report.id]);
    } else if (photoKey) {
      try {
        setLoadingModalPhoto(true);
        const url = await fetchAuthorizedPhotoBlobUrl(photoKey);
        setModalPhotoUrl(url);
        setPhotoUrls((prev) => ({ ...prev, [report.id]: url }));
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

  // Map marker click callback: navigate to reports and highlight
  const handleReportMarkerClick = (reportId: string) => {
    setHighlightedReportId(reportId);
    setActiveTab('reports');
    // Scroll to the card after rendering
    setTimeout(() => {
      const el = document.getElementById(`report-card-${reportId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  // Unique hazard types present in reports for the filter dropdown
  const uniqueHazardTypes = Array.from(
    new Set(reports.map((r) => r.hazard_type).filter(Boolean))
  );

  // Multi-criteria client filtering
  const filteredReports = reports.filter((rep) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rep.hazard_type?.toLowerCase().includes(q) ||
        rep.description?.toLowerCase().includes(q) ||
        (rep.citizen_name && rep.citizen_name.toLowerCase().includes(q)) ||
        (rep.citizen_phone && rep.citizen_phone.includes(q));
      if (!matchesSearch) return false;
    }

    // Hazard type filter
    if (hazardFilter !== 'all' && rep.hazard_type !== hazardFilter) {
      return false;
    }

    // Date range filter
    if (dateFrom) {
      const repDate = new Date(rep.submitted_at);
      const fromDate = new Date(dateFrom);
      if (repDate < fromDate) return false;
    }
    if (dateTo) {
      const repDate = new Date(rep.submitted_at);
      const toDate = new Date(dateTo);
      // include end of the chosen day
      toDate.setHours(23, 59, 59, 999);
      if (repDate > toDate) return false;
    }

    return true;
  });

  const pendingCount = overview?.pending_count ?? reports.filter((r) => r.status.toLowerCase() === 'pending').length;
  const verifiedCount = overview?.verified_count ?? reports.filter((r) => r.status.toLowerCase() === 'verified').length;
  const verifiedThisWeek = overview?.verified_this_week_count ?? 0;
  const activeRiskCount = overview?.active_risk_count ?? 0;
  const totalCount = overview?.total_reports_count ?? reports.length;

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#141712] flex flex-col font-sans">
      {/* ==================================================== */}
      {/* 1. HEADER: JURISDICTION ASSIGNMENT & COMMAND INFO   */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 border-b-2 border-[#BCB29E] backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand + Scoped District Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] border-2 border-[#1E4B33] flex items-center justify-center text-[#1E4B33] shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-[#141712]">
                  BHURAKSHA
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4EE] text-[#0D2619] border border-[#1E4B33]">
                  OPERATIONAL COMMAND
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#474C3F] block font-bold">
                {districtInfo
                  ? `${districtInfo.district_name.toUpperCase()} DISTRICT, ${districtInfo.state_name.toUpperCase()}`
                  : 'DISTRICT JURISDICTION ASSIGNMENT'}
              </span>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <div className="hidden md:flex items-center gap-1.5 bg-[#EDE7DC] border-2 border-[#C9C0AD] px-2 py-1 rounded-xl">
                <span className="text-[9px] font-mono uppercase text-[#474C3F] font-bold">SWITCH:</span>
                <button
                  onClick={() => onSwitchRole('citizen')}
                  className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-white text-[#141712] hover:bg-[#F0ECE1] border border-[#C9C0AD] transition-all cursor-pointer"
                >
                  Citizen
                </button>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-[#1E4B33] text-white hover:bg-[#143524] border border-[#143524] transition-all cursor-pointer"
                >
                  Super-Admin
                </button>
              </div>
            )}

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-[#141712] uppercase">
                {user.name || 'District Administrator'}
              </span>
              <span className="text-[10px] font-mono text-[#1E4B33] font-semibold">
                {districtInfo ? `${districtInfo.district_name} Command Desk` : 'District Desk'}
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
      {/* 2. TAB NAVIGATION BAR                                 */}
      {/* ==================================================== */}
      <div className="bg-[#FFFFFF] border-b-2 border-[#BCB29E] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'overview'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-transparent hover:border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#B5551F] text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'reports'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-transparent hover:border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hazard Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ECE7DC] text-[#141712]">
              {reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'map'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-transparent hover:border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_areas')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'risk_areas'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-transparent hover:border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Villages & Risk Sectors</span>
            {activeRiskCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#B5551F] text-white">
                {activeRiskCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ECE7DC] text-[#141712]">
                {totalVillagesCount || overview?.total_villages_count || 0}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
              activeTab === 'shelters'
                ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                : 'bg-white text-[#474C3F] border-transparent hover:border-[#C9C0AD] hover:bg-[#F0ECE1]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Manage Shelters</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                       */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* -------------------------------------------------- */}
        {/* TAB 1: OVERVIEW / SUMMARY SECTION                  */}
        {/* -------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            {/* District Jurisdiction Intro Banner */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold">
                  DISTRICT DISASTER MANAGEMENT DESK
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#141712] uppercase tracking-tight">
                  {districtInfo ? `${districtInfo.district_name}, ${districtInfo.state_name}` : 'District Operational Command'}
                </h1>
                <p className="text-xs sm:text-sm text-[#474C3F] max-w-2xl font-sans">
                  Real-time operational overview for citizen hazard submissions and terrain risk management strictly bounded to your administrative district.
                </p>
              </div>

              <button
                onClick={() => {
                  loadOverview();
                  loadReports();
                  loadVillages();
                }}
                disabled={loadingOverview || loadingReports || loadingVillages}
                className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOverview || loadingReports || loadingVillages ? 'animate-spin' : ''}`} />
                <span>Refresh Overview</span>
              </button>
            </div>

            {/* Core Metrics 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Pending Hazard Reports */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#474C3F] font-bold">
                    Pending Review
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FDF4E6] border border-[#F0CE91] flex items-center justify-center text-[#B87217]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-black text-[#B87217]">
                    {pendingCount}
                  </div>
                  <p className="text-[11px] text-[#474C3F] mt-0.5">
                    Citizen reports awaiting verification
                  </p>
                </div>
                {pendingCount > 0 ? (
                  <button
                    onClick={() => {
                      setStatusFilter('pending');
                      setActiveTab('reports');
                    }}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#FDF4E6] hover:bg-[#FBE8CC] text-[#694008] border border-[#F0CE91] text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer text-center"
                  >
                    Verify Reports Now &rarr;
                  </button>
                ) : (
                  <div className="text-[10px] font-mono text-[#3E7B49] font-semibold pt-2">
                    Queue clear &bull; All reviewed
                  </div>
                )}
              </div>

              {/* Card 2: Verified Reports (Total & This Week) */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#474C3F] font-bold">
                    Verified Hazards
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] border border-[#9EC4AF] flex items-center justify-center text-[#1E4B33]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-black text-[#1E4B33]">
                    {verifiedCount}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4EE] text-[#1E4B33] border border-[#9EC4AF]">
                      +{verifiedThisWeek} this week
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('verified');
                    setActiveTab('reports');
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white hover:bg-[#F0ECE1] text-[#141712] border border-[#BCB29E] text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer text-center"
                >
                  View Verified List
                </button>
              </div>

              {/* Card 3: Active Risk Areas / High-Alert Villages */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#474C3F] font-bold">
                    Active Risk Settlements
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    activeRiskCount > 0 ? 'bg-[#FDF0E8] border-[#F2BCA0] text-[#BD5015]' : 'bg-[#EBF4EE] border-[#9EC4AF] text-[#1E4B33]'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl font-serif font-black ${
                    activeRiskCount > 0 ? 'text-[#BD5015]' : 'text-[#1E4B33]'
                  }`}>
                    {activeRiskCount}
                  </div>
                  <p className="text-[10px] font-mono text-[#474C3F] mt-0.5">
                    {activeRiskCount > 0 ? 'Villages in High/Critical warning' : 'All settlements within safe limits'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVillageRiskFilter('alert_only');
                    setActiveTab('risk_areas');
                  }}
                  className={`w-full mt-2 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer text-center border ${
                    activeRiskCount > 0
                      ? 'bg-[#FDF0E8] hover:bg-[#FBE4D8] text-[#732C05] border-[#F2BCA0]'
                      : 'bg-white hover:bg-[#F0ECE1] text-[#141712] border-[#BCB29E]'
                  }`}
                >
                  Inspect Settlement Risk &rarr;
                </button>
              </div>

              {/* Card 4: Total Incident Submissions */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#474C3F] font-bold">
                    Total Processed
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#EDE7DC] border border-[#C9C0AD] flex items-center justify-center text-[#141712]">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-black text-[#141712]">
                    {totalCount}
                  </div>
                  <p className="text-[11px] text-[#474C3F] mt-0.5">
                    District hazard submissions lifetime
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setActiveTab('reports');
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white hover:bg-[#F0ECE1] text-[#141712] border border-[#BCB29E] text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer text-center"
                >
                  Inspect All Reports
                </button>
              </div>
            </div>

            {/* Risk Level Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Breakdown Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFD8CA] pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#141712] uppercase tracking-wider">
                      Terrain Risk Level Distribution
                    </h3>
                    <p className="text-[11px] text-[#474C3F]">
                      Inhabited villages classified by Model B risk in {districtInfo?.district_name || 'District'} ({totalVillagesCount || overview?.total_villages_count || 0} tracked)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {overview?.last_updated && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono text-[#474C3F] bg-[#EDE7DC] border border-[#BCB29E]">
                        Computed: {new Date(overview.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#EBF4EE] text-[#1E4B33] border border-[#9EC4AF]">
                      Model B 200m
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setVillageRiskFilter('low');
                      setActiveTab('risk_areas');
                    }}
                    className="p-3.5 rounded-xl border-2 border-[#A8D9B2] bg-[#EAF4EC] hover:bg-[#DEEFE1] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-[#1E4A26] block">Low Risk</span>
                    <div className="text-2xl font-serif font-bold text-[#1E4A26] mt-1">
                      {overview?.risk_level_breakdown?.Low ?? villagesBreakdown.Low ?? 0}
                    </div>
                    <span className="text-[9px] font-mono text-[#3E7B49]">Stable terrain</span>
                  </button>

                  <button
                    onClick={() => {
                      setVillageRiskFilter('moderate');
                      setActiveTab('risk_areas');
                    }}
                    className="p-3.5 rounded-xl border-2 border-[#F0CE91] bg-[#FDF4E6] hover:bg-[#FBEBD2] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-[#694008] block">Moderate</span>
                    <div className="text-2xl font-serif font-bold text-[#694008] mt-1">
                      {overview?.risk_level_breakdown?.Moderate ?? villagesBreakdown.Moderate ?? 0}
                    </div>
                    <span className="text-[9px] font-mono text-[#B87217]">Advisory monitoring</span>
                  </button>

                  <button
                    onClick={() => {
                      setVillageRiskFilter('high');
                      setActiveTab('risk_areas');
                    }}
                    className="p-3.5 rounded-xl border-2 border-[#F2BCA0] bg-[#FDF0E8] hover:bg-[#FBE4D8] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-[#732C05] block">High Risk</span>
                    <div className="text-2xl font-serif font-bold text-[#732C05] mt-1">
                      {overview?.risk_level_breakdown?.High ?? villagesBreakdown.High ?? 0}
                    </div>
                    <span className="text-[9px] font-mono text-[#BD5015]">Slope saturation</span>
                  </button>

                  <button
                    onClick={() => {
                      setVillageRiskFilter('critical');
                      setActiveTab('risk_areas');
                    }}
                    className="p-3.5 rounded-xl border-2 border-[#EABEB7] bg-[#FCEEEB] hover:bg-[#FADFD9] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-[#5C170F] block">Critical</span>
                    <div className="text-2xl font-serif font-bold text-[#5C170F] mt-1">
                      {overview?.risk_level_breakdown?.Critical ?? villagesBreakdown.Critical ?? 0}
                    </div>
                    <span className="text-[9px] font-mono text-[#8A2418]">Evacuation ready</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#EDE7DC] border border-[#BCB29E] text-[10px] font-mono text-[#474C3F] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#1E4B33] shrink-0" />
                    <span>
                      Live terrain risk computed via MOSDAC 24h rainfall, NASA SMAP soil moisture, and Model A COG susceptibility.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setVillageRiskFilter('all');
                      setActiveTab('risk_areas');
                    }}
                    className="text-[#1E4B33] hover:underline font-bold shrink-0 cursor-pointer"
                  >
                    View All Villages &rarr;
                  </button>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#141712] uppercase tracking-wider border-b border-[#DFD8CA] pb-3">
                    Command Shortcuts
                  </h3>
                  <div className="space-y-2.5 mt-4">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="w-full p-3 rounded-xl bg-[#EBF4EE] hover:bg-[#D7EAE0] border-2 border-[#9EC4AF] text-[#1E4B33] font-mono text-xs font-bold uppercase flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <MapIcon className="w-4 h-4" />
                        Open District GIS Map
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setStatusFilter('pending');
                        setActiveTab('reports');
                      }}
                      className="w-full p-3 rounded-xl bg-[#FDF4E6] hover:bg-[#FBE8CC] border-2 border-[#F0CE91] text-[#694008] font-mono text-xs font-bold uppercase flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Review Pending ({pendingCount})
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('risk_areas')}
                      className="w-full p-3 rounded-xl bg-white hover:bg-[#F0ECE1] border-2 border-[#BCB29E] text-[#141712] font-mono text-xs font-bold uppercase flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#BD5015]" />
                        Active Risk Areas
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DFD8CA] text-[10px] font-mono text-[#474C3F]">
                  Centroid: {districtInfo?.centroid_lat?.toFixed(3) ?? '26.1'}&deg;N, {districtInfo?.centroid_lon?.toFixed(3) ?? '91.7'}&deg;E
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 2: HAZARD REPORTS SECTION (IMPROVED WITH DATES)*/}
        {/* -------------------------------------------------- */}
        {activeTab === 'reports' && (
          <div className="space-y-6 text-left">
            {/* Reports Control Header */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif uppercase tracking-tight text-[#141712]">
                    Citizen Hazard Observation Verification
                  </h2>
                  <p className="text-xs text-[#474C3F] font-sans">
                    Citizen reports submitted within {districtInfo?.district_name || 'your assigned district'}. Verify field validity or dismiss invalid submissions.
                  </p>
                </div>

                <button
                  onClick={loadReports}
                  disabled={loadingReports}
                  className="px-4 py-2 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-xs self-start md:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
                  <span>Refresh Reports</span>
                </button>
              </div>

              {/* Filter Tabs: All / Pending / Verified / Dismissed */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#DFD8CA] pb-3">
                {[
                  { key: 'all', label: 'All Incidents', count: reports.length },
                  { key: 'pending', label: 'Pending Review', count: pendingCount },
                  { key: 'verified', label: 'Verified', count: verifiedCount },
                  { key: 'dismissed', label: 'Dismissed', count: overview?.dismissed_count ?? reports.filter(r => r.status === 'dismissed').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-2 ${
                      statusFilter === tab.key
                        ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                        : 'bg-white text-[#474C3F] border-[#C9C0AD] hover:bg-[#F0ECE1]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                        statusFilter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ECE7DC] text-[#141712]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Multi-Criteria Filters Bar: Search, Hazard Type, Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Search query */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6B7263]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search submitter, notes..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                  />
                </div>

                {/* Hazard Type Filter Dropdown */}
                <div>
                  <select
                    value={hazardFilter}
                    onChange={(e) => setHazardFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono focus:border-[#1E4B33] focus:outline-none"
                  >
                    <option value="all">All Hazard Types</option>
                    {uniqueHazardTypes.map((ht) => (
                      <option key={ht} value={ht}>
                        {ht}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div className="flex items-center gap-1.5 bg-white border-2 border-[#BCB29E] px-2.5 py-1.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#6B7263] uppercase font-bold">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-xs font-mono bg-transparent focus:outline-none"
                  />
                </div>

                {/* Date To */}
                <div className="flex items-center gap-1.5 bg-white border-2 border-[#BCB29E] px-2.5 py-1.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#6B7263] uppercase font-bold">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-xs font-mono bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {(searchQuery || hazardFilter !== 'all' || dateFrom || dateTo) && (
                <div className="flex items-center justify-between text-xs font-mono text-[#474C3F] pt-2">
                  <span>Filtered: showing {filteredReports.length} of {reports.length} reports</span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setHazardFilter('all');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="text-[#8A2418] hover:underline font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Reports List / Cards */}
            {loadingReports ? (
              <div className="p-12 text-center rounded-3xl bg-white border-2 border-[#BCB29E] space-y-3">
                <div className="w-8 h-8 border-3 border-[#1E4B33] border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs font-mono uppercase text-[#474C3F] block font-bold">
                  Loading district hazard observations...
                </span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border-2 border-[#BCB29E] space-y-3">
                <FileText className="w-10 h-10 text-[#6B7263] mx-auto opacity-50" />
                <h3 className="text-base font-serif font-bold text-[#141712]">No Hazard Reports Found</h3>
                <p className="text-xs text-[#474C3F] font-mono max-w-md mx-auto">
                  No citizen hazard reports match your active filters in this district.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => {
                  const isPending = report.status.toLowerCase() === 'pending';
                  const isVerified = report.status.toLowerCase() === 'verified';
                  const isDismissed = report.status.toLowerCase() === 'dismissed';
                  const isHighlighted = highlightedReportId === report.id;

                  return (
                    <div
                      key={report.id}
                      id={`report-card-${report.id}`}
                      className={`p-5 rounded-2xl bg-white border-2 shadow-xs transition-all space-y-3 flex flex-col justify-between ${
                        isHighlighted
                          ? 'border-[#1E4B33] ring-2 ring-[#1E4B33]/30'
                          : 'border-[#BCB29E] hover:border-[#1E4B33]/50'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Card Header: Hazard Type & Status */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#DFD8CA] pb-2.5">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#ECE7DC] text-[#141712] border border-[#BCB29E]">
                              {report.hazard_type || 'Hazard'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6B7263] block mt-1">
                              {new Date(report.submitted_at).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              isVerified
                                ? 'bg-[#EAF4EC] text-[#1E4A26] border-[#A8D9B2]'
                                : isDismissed
                                ? 'bg-[#FCEEEB] text-[#5C170F] border-[#EABEB7]'
                                : 'bg-[#FDF4E6] text-[#694008] border-[#F0CE91]'
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>

                        {/* Card Body: Photo & Details */}
                        <div className="flex gap-3.5">
                          {/* Photo Thumbnail */}
                          <div
                            onClick={() => handleOpenInspectModal(report)}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#ECE7DC] border-2 border-[#BCB29E] overflow-hidden shrink-0 relative group cursor-pointer"
                          >
                            {photoUrls[report.id] ? (
                              <img
                                src={photoUrls[report.id]}
                                alt="Hazard observation"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[#6B7263] gap-1 p-2 text-center">
                                <Camera className="w-5 h-5 opacity-60" />
                                <span className="text-[8px] font-mono uppercase">View Photo</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Submitter & Description */}
                          <div className="flex-1 min-w-0 space-y-1 text-left">
                            <div className="text-xs font-mono font-bold text-[#141712]">
                              {report.citizen_name || 'Citizen User'}
                            </div>
                            <div className="text-[11px] font-mono text-[#474C3F]">
                              Phone: {report.citizen_phone || 'N/A'}
                            </div>
                            <div className="text-[10px] font-mono text-[#1E4B33] font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>
                                {report.latitude.toFixed(4)}&deg;N, {report.longitude.toFixed(4)}&deg;E
                              </span>
                            </div>
                            {report.description && (
                              <p className="text-xs text-[#474C3F] line-clamp-2 pt-1 font-sans leading-relaxed">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Review Actions */}
                      <div className="pt-3 border-t border-[#DFD8CA] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenInspectModal(report)}
                          className="px-3 py-1.5 rounded-lg bg-[#ECE7DC] hover:bg-[#DFD8CA] text-[#141712] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(report.id, 'dismissed')}
                              disabled={updatingId === report.id}
                              className="px-3 py-1.5 rounded-lg bg-[#FCEEEB] hover:bg-[#F9D4CD] text-[#8A2418] border border-[#EABEB7] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Dismiss</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.id, 'verified')}
                              disabled={updatingId === report.id}
                              className="px-3 py-1.5 rounded-lg bg-[#1E4B33] hover:bg-[#143524] text-white border border-[#143524] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          </div>
                        )}

                        {!isPending && report.reviewed_at && (
                          <span className="text-[10px] font-mono text-[#6B7263]">
                            Reviewed: {new Date(report.reviewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 3: GIS MAP SECTION (FULL LAYER ACCESS)         */}
        {/* -------------------------------------------------- */}
        {activeTab === 'map' && (
          <div className="space-y-4 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#BCB29E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold uppercase text-[#141712]">
                  District Operational Spatial Intelligence
                </h2>
                <p className="text-xs text-[#474C3F] font-mono">
                  Full administrative layer access &bull; Susceptibility Model A &bull; Historical Landslides &bull; Scoped Citizen Reports
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EBF4EE] text-[#1E4B33] border border-[#9EC4AF]">
                  District Centered
                </span>
              </div>
            </div>

            {/* Embedded MapComponent */}
            <div className="w-full h-[650px] rounded-3xl border-2 border-[#BCB29E] overflow-hidden shadow-md">
              <MapComponent
                role="district_admin"
                initialCenter={
                  mapCenterOverride || (
                    districtInfo?.centroid_lon && districtInfo?.centroid_lat
                      ? [districtInfo.centroid_lon, districtInfo.centroid_lat]
                      : undefined
                  )
                }
                initialZoom={mapCenterOverride ? 12 : 9.5}
                showNERBoundaries={true}
                showRoads={true}
                showLandslides={true}
                showSusceptibility={true}
                showHospitals={true}
                showVillages={true}
                showReports={true}
                onReportClick={handleReportMarkerClick}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 4: SETTLEMENTS & TERRAIN RISK DIRECTORY        */}
        {/* -------------------------------------------------- */}
        {activeTab === 'risk_areas' && (
          <div className="space-y-6 text-left">
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#BCB29E] shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFD8CA] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold">
                      TERRAIN INTELLIGENCE &bull; SETTLEMENT RISK
                    </span>
                    {activeRiskCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FDF0E8] text-[#BD5015] border border-[#F2BCA0] animate-pulse">
                        {activeRiskCount} Settlement Alert{activeRiskCount > 1 ? 's' : ''} Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EAF4EC] text-[#1E4A26] border border-[#A8D9B2]">
                        All Settlements Within Safe Limits
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif uppercase tracking-tight text-[#141712] mt-1">
                    {districtInfo?.district_name || 'District'} Settlements & Landslide Risk Directory
                  </h2>
                  <p className="text-xs text-[#474C3F] font-sans mt-0.5">
                    Live settlement-level terrain risk classified from the latest 200m regional landslide risk grid and daily alert thresholds.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {overview?.last_updated && (
                    <span className="hidden md:inline-flex px-2.5 py-1 rounded-xl text-[10px] font-mono text-[#474C3F] bg-[#EDE7DC] border border-[#BCB29E]">
                      Updated: {new Date(overview.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button
                    onClick={() => loadVillages(villageRiskFilter, villageSearch)}
                    disabled={loadingVillages}
                    className="px-3 py-2 rounded-xl bg-[#EDE7DC] hover:bg-[#DFD8CA] text-[#141712] font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border border-[#BCB29E] cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingVillages ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Quick Filter Tabs Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-mono font-bold uppercase">
                <button
                  onClick={() => setVillageRiskFilter('all')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    villageRiskFilter === 'all'
                      ? 'bg-[#1E4B33] text-white border-[#1E4B33] shadow-xs'
                      : 'bg-white text-[#474C3F] border-[#BCB29E] hover:bg-[#F0ECE1]'
                  }`}
                >
                  All Settlements ({totalVillagesCount})
                </button>

                <button
                  onClick={() => setVillageRiskFilter('alert_only')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    villageRiskFilter === 'alert_only'
                      ? 'bg-[#BD5015] text-white border-[#BD5015] shadow-xs'
                      : 'bg-[#FDF0E8] text-[#732C05] border-[#F2BCA0] hover:bg-[#FBE4D8]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Alert Zones Only ({activeRiskCount})</span>
                </button>

                <button
                  onClick={() => setVillageRiskFilter('critical')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    villageRiskFilter === 'critical'
                      ? 'bg-[#8A2418] text-white border-[#8A2418] shadow-xs'
                      : 'bg-[#FCEEEB] text-[#5C170F] border-[#EABEB7] hover:bg-[#FADFD9]'
                  }`}
                >
                  Critical ({villagesBreakdown.Critical})
                </button>

                <button
                  onClick={() => setVillageRiskFilter('high')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    villageRiskFilter === 'high'
                      ? 'bg-[#BD5015] text-white border-[#BD5015] shadow-xs'
                      : 'bg-[#FDF0E8] text-[#732C05] border-[#F2BCA0] hover:bg-[#FBE4D8]'
                  }`}
                >
                  High Risk ({villagesBreakdown.High})
                </button>

                <button
                  onClick={() => setVillageRiskFilter('moderate')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    villageRiskFilter === 'moderate'
                      ? 'bg-[#B87217] text-white border-[#B87217] shadow-xs'
                      : 'bg-[#FDF4E6] text-[#694008] border-[#F0CE91] hover:bg-[#FBEBD2]'
                  }`}
                >
                  Moderate ({villagesBreakdown.Moderate})
                </button>

                <button
                  onClick={() => setVillageRiskFilter('low')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    villageRiskFilter === 'low'
                      ? 'bg-[#1E4A26] text-white border-[#1E4A26] shadow-xs'
                      : 'bg-[#EAF4EC] text-[#1E4A26] border-[#A8D9B2] hover:bg-[#DEEFE1]'
                  }`}
                >
                  Low Risk ({villagesBreakdown.Low})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B7263] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search village or settlement by name..."
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-sans text-[#141712] placeholder-[#6B7263] focus:outline-none focus:border-[#1E4B33] transition-colors"
                />
                {villageSearch && (
                  <button
                    onClick={() => setVillageSearch('')}
                    className="p-1 text-[#6B7263] hover:text-[#141712] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Table or Empty State */}
              {loadingVillages ? (
                <div className="p-12 text-center rounded-2xl bg-[#EDE7DC]/30 border-2 border-[#BCB29E] space-y-3">
                  <div className="w-8 h-8 border-3 border-[#1E4B33] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-[#474C3F]">
                    Loading district settlements and evaluating terrain risk...
                  </p>
                </div>
              ) : villages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#EDE7DC]/40 border-2 border-dashed border-[#BCB29E] space-y-3">
                  <AlertTriangle className="w-8 h-8 text-[#B87217] mx-auto opacity-60" />
                  <h3 className="text-sm font-serif font-bold text-[#141712] uppercase tracking-wider">
                    No settlements match filter
                  </h3>
                  <p className="text-xs text-[#474C3F] font-mono max-w-md mx-auto">
                    No villages in {districtInfo?.district_name || 'this district'} matched your current search and risk filters.
                  </p>
                  <button
                    onClick={() => {
                      setVillageRiskFilter('all');
                      setVillageSearch('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1E4B33] text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border-2 border-[#BCB29E] shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EDE7DC] border-b-2 border-[#BCB29E] text-[10px] font-mono uppercase text-[#474C3F] tracking-wider">
                        <th className="py-3 px-4 font-bold">Settlement Name</th>
                        <th className="py-3 px-4 font-bold">Coordinates</th>
                        <th className="py-3 px-4 font-bold">Risk Score</th>
                        <th className="py-3 px-4 font-bold">Risk Level</th>
                        <th className="py-3 px-4 font-bold">Daily Alert Status</th>
                        <th className="py-3 px-4 font-bold">Nearest Hotspot</th>
                        <th className="py-3 px-4 font-bold">Population</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFD8CA] text-xs font-sans bg-white">
                      {villages.map((v) => {
                        const isCritical = v.risk_level === 'Critical';
                        const isHigh = v.risk_level === 'High';
                        const isMod = v.risk_level === 'Moderate';

                        const badgeColor = isCritical
                          ? 'bg-[#FCEEEB] text-[#5C170F] border-[#EABEB7]'
                          : isHigh
                          ? 'bg-[#FDF0E8] text-[#732C05] border-[#F2BCA0]'
                          : isMod
                          ? 'bg-[#FDF4E6] text-[#694008] border-[#F0CE91]'
                          : 'bg-[#EAF4EC] text-[#1E4A26] border-[#A8D9B2]';

                        const barColor = isCritical
                          ? 'bg-[#8A2418]'
                          : isHigh
                          ? 'bg-[#BD5015]'
                          : isMod
                          ? 'bg-[#B87217]'
                          : 'bg-[#3E7B49]';

                        return (
                          <tr key={v.osm_id || `${v.latitude}-${v.longitude}`} className="hover:bg-[#FDFBF7] transition-colors">
                            {/* Settlement Name */}
                            <td className="py-3.5 px-4 font-medium text-[#141712]">
                              <div className="flex items-center gap-2">
                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCritical || isHigh ? 'text-[#BD5015]' : 'text-[#6B7263]'}`} />
                                <div>
                                  <span className="font-bold font-serif text-sm block">
                                    {v.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#6B7263] uppercase">
                                    {v.place_type || 'Village'} &bull; OSM {v.osm_id || 'Ref'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Coordinates */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#474C3F] whitespace-nowrap">
                              {v.latitude.toFixed(4)}&deg;N, {v.longitude.toFixed(4)}&deg;E
                            </td>

                            {/* Risk Score */}
                            <td className="py-3.5 px-4">
                              <div className="w-28 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                  <span>{(v.risk_score * 100).toFixed(1)}%</span>
                                  <span className="text-[#6B7263] font-normal">{v.risk_score.toFixed(3)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#EDE7DC] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${barColor} rounded-full transition-all`}
                                    style={{ width: `${Math.max(4, v.risk_score * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Risk Level Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border inline-flex items-center gap-1 ${badgeColor}`}>
                                {(isCritical || isHigh) && <AlertTriangle className="w-3 h-3" />}
                                {v.risk_level}
                              </span>
                            </td>

                            {/* Daily Alert Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {v.is_in_todays_alerts ? (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-[#FDF0E8] text-[#BD5015] border border-[#F2BCA0] inline-flex items-center gap-1.5 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#BD5015]" />
                                  Active Alert Zone
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#474C3F] bg-[#EDE7DC]/70 border border-[#BCB29E]">
                                  Low/Moderate (not in today's alert list)
                                </span>
                              )}
                            </td>

                            {/* Nearest Hotspot Distance */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#474C3F] whitespace-nowrap">
                              {v.nearest_alert_distance_km !== null ? (
                                <span>{v.nearest_alert_distance_km.toFixed(1)} km</span>
                              ) : (
                                <span className="text-[#6B7263]">&mdash;</span>
                              )}
                            </td>

                            {/* Population */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#474C3F] whitespace-nowrap">
                              {v.population ? v.population.toLocaleString('en-IN') : <span className="text-[#6B7263]">&mdash;</span>}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setMapCenterOverride([v.longitude, v.latitude]);
                                  setActiveTab('map');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#EBF4EE] hover:bg-[#D7EAE0] text-[#1E4B33] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer border border-[#9EC4AF] inline-flex items-center gap-1"
                                title={`Inspect ${v.name} on GIS Map`}
                              >
                                <MapIcon className="w-3 h-3" />
                                <span>Map</span>
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

        {/* -------------------------------------------------- */}
        {/* TAB 5: SHELTERS SECTION                            */}
        {/* -------------------------------------------------- */}
        {activeTab === 'shelters' && (
          <ShelterManagement />
        )}

      </main>

      {/* ==================================================== */}
      {/* 4. PHOTO INSPECTION MODAL                            */}
      {/* ==================================================== */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-[#BCB29E] overflow-hidden shadow-2xl space-y-4 text-left flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b-2 border-[#BCB29E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E4B33] font-bold block">
                  HAZARD INCIDENT INSPECTION
                </span>
                <h3 className="text-lg font-serif font-bold text-[#141712] uppercase">
                  {inspectReport.hazard_type || 'Citizen Report'}
                </h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="p-1.5 rounded-xl hover:bg-[#F0ECE1] text-[#6B7263] hover:text-[#141712] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Photo Frame */}
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

              {/* Observation Metadata */}
              <div className="space-y-2 text-xs font-mono bg-[#ECE7DC] p-3.5 rounded-xl border border-[#C9C0AD]">
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

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t-2 border-[#BCB29E] flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectReport(null)}
                className="px-4 py-2 rounded-xl bg-white border-2 border-[#BCB29E] text-xs font-mono font-bold uppercase text-[#141712] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
              >
                Close
              </button>

              {inspectReport.status.toLowerCase() === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(inspectReport.id, 'dismissed')}
                    disabled={updatingId === inspectReport.id}
                    className="px-4 py-2 rounded-xl bg-[#FCEEEB] hover:bg-[#F9D4CD] text-[#8A2418] border-2 border-[#EABEB7] font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(inspectReport.id, 'verified')}
                    disabled={updatingId === inspectReport.id}
                    className="px-4 py-2 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Incident</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictAdminDashboard;
