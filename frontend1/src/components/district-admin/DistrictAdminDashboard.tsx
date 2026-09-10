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
  Info
} from 'lucide-react';
import { CitizenReportItem } from '../../types';
import {
  fetchDistrictReports,
  updateDistrictReportStatus,
  fetchAuthorizedPhotoBlobUrl
} from '../../services/districtAdminService';

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
  const [reports, setReports] = useState<CitizenReportItem[]>([]);
  const [districtInfo, setDistrictInfo] = useState<{ id: string; state_name: string; district_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Photo viewer modal state
  const [inspectReport, setInspectReport] = useState<CitizenReportItem | null>(null);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [loadingModalPhoto, setLoadingModalPhoto] = useState(false);

  // Thumbnail photo blobs cache
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDistrictReports(statusFilter === 'all' ? undefined : statusFilter);
      setReports(data.reports || []);
      setDistrictInfo(data.district);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

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
        setInspectReport((prev) => prev ? { ...prev, status: newStatus } : null);
      }
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

  const filteredReports = reports.filter((rep) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rep.hazard_type.toLowerCase().includes(q) ||
      rep.description.toLowerCase().includes(q) ||
      (rep.citizen_name && rep.citizen_name.toLowerCase().includes(q)) ||
      (rep.citizen_phone && rep.citizen_phone.includes(q))
    );
  });

  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status.toLowerCase() === 'pending').length;
  const verifiedCount = reports.filter((r) => r.status.toLowerCase() === 'verified').length;
  const dismissedCount = reports.filter((r) => r.status.toLowerCase() === 'dismissed').length;

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#141712] flex flex-col font-sans">
      {/* ==================================================== */}
      {/* TOP DISTRICT COMMAND HEADER                          */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 border-b-2 border-[#D5CCA8] backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand + District Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] border-2 border-[#9EC4AF] flex items-center justify-center text-[#1E4B33] shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-[#141712]">
                  BHURAKSHA
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4EE] text-[#0D2619] border-2 border-[#1E4B33]">
                  DISTRICT DESK
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#474C3F] block font-medium">
                {districtInfo
                  ? `${districtInfo.district_name.toUpperCase()} &bull; ${districtInfo.state_name.toUpperCase()}`
                  : 'DISTRICT JURISDICTION CONTROL'}
              </span>
            </div>
          </div>

          {/* Right: Switcher / Admin Info & Logout */}
          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#EDE7DC] border-2 border-[#C9C0AD] px-2 py-1 rounded-xl">
                <span className="text-[9px] font-mono uppercase text-[#474C3F] font-bold">ROLE:</span>
                <button
                  onClick={() => onSwitchRole('citizen')}
                  className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-white text-[#141712] hover:bg-[#F0ECE1] border-2 border-[#C9C0AD] transition-all cursor-pointer shadow-2xs"
                >
                  Citizen
                </button>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-[#1E4B33] text-white hover:bg-[#143524] border-2 border-[#143524] transition-all cursor-pointer shadow-2xs"
                >
                  Super-Admin
                </button>
              </div>
            )}

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-[#141712] uppercase">
                {user.name || 'District Administrator'}
              </span>
              <span className="text-[10px] font-mono text-[#1E4B33] font-bold">
                {districtInfo ? `${districtInfo.district_name} Authority` : 'District Authority'}
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
      {/* MAIN BODY                                            */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* District Jurisdiction Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border-2 border-[#D5CCA8] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#1E4B33] font-bold">
                DISTRICT INCIDENT VERIFICATION GATEWAY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#141712] uppercase tracking-tight">
              {districtInfo ? `${districtInfo.district_name}, ${districtInfo.state_name}` : 'District Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-[#474C3F] leading-relaxed max-w-2xl font-sans">
              Only citizen hazard reports submitted within your district boundary are routed to this command console. Verify observations to deploy field response teams.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadReports}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer border-2 border-[#143524] shadow-sm active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH INCIDENTS</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-white border-2 border-[#C9C0AD] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#474C3F] font-bold">TOTAL JURISDICTION REPORTS</span>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#141712]">{totalCount}</div>
            <span className="text-[10px] font-mono text-[#6B7263] font-medium">Spatially matched to district</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FEF5E7] border-2 border-[#B87217] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#733E03] font-bold">PENDING ACTION</span>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#543004]">{pendingCount}</div>
            <span className="text-[10px] font-mono text-[#733E03] font-semibold">Awaiting official review</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#EBF4EE] border-2 border-[#1E4B33] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#0D2619] font-bold">VERIFIED HAZARDS</span>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0D2619]">{verifiedCount}</div>
            <span className="text-[10px] font-mono text-[#1E4B33] font-semibold">Forwarded to field QRT</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#C9C0AD] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#474C3F] font-bold">DISMISSED / FALSE</span>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#474C3F]">{dismissedCount}</div>
            <span className="text-[10px] font-mono text-[#6B7263] font-medium">Non-landslide / duplicate</span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#C9C0AD] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'pending', 'verified', 'dismissed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#1E4B33] text-white shadow-sm border-2 border-[#1E4B33]'
                    : 'bg-white text-[#474C3F] border-2 border-[#C9C0AD] hover:bg-[#EDE7DC] hover:text-[#141712]'
                }`}
              >
                {tab === 'all' ? 'All Incidents' : tab}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7263]" />
            <input
              type="text"
              placeholder="Search hazard, phone, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border-2 border-[#BCB29E] rounded-xl text-xs font-mono font-semibold text-[#141712] placeholder-[#6B7263] focus:outline-none focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 shadow-xs"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-risk-critical text-xs font-mono">
            {error}
          </div>
        )}

        {/* Incident Reports List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-700 animate-spin mx-auto" />
            <p className="text-xs font-mono text-earth-600">Fetching district hazard reports from server...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-earth-300 bg-[#FFFDF8] p-8 space-y-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-brand-700 mx-auto opacity-70" />
            <h3 className="text-base font-bold uppercase text-earth-900 font-serif">No Incident Reports Found</h3>
            <p className="text-xs font-mono text-earth-600 max-w-md mx-auto">
              There are currently no citizen hazard submissions matching your filter criteria in{' '}
              {districtInfo?.district_name || 'this district'}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {filteredReports.map((report) => {
              const statusLower = report.status.toLowerCase();
              const isPending = statusLower === 'pending';
              const isVerified = statusLower === 'verified';
              const isDismissed = statusLower === 'dismissed';

              return (
                <div
                  key={report.id}
                  className="rounded-2xl border-2 border-[#D5CCA8] bg-[#FFFFFF] hover:border-[#1E4B33] transition-all overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  {/* Photo Banner / Thumbnail */}
                  <div
                    className="relative h-44 bg-[#EDE7DC] border-b-2 border-[#D5CCA8] cursor-pointer group flex items-center justify-center overflow-hidden"
                    onClick={() => handleOpenInspectModal(report)}
                  >
                    {photoUrls[report.id] ? (
                      <img
                        src={photoUrls[report.id]}
                        alt={report.hazard_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (report.photo_path || report.photo_url) ? (
                      <div className="flex flex-col items-center gap-2 text-brand-800/80 group-hover:text-brand-900 transition-colors">
                        <Camera className="w-8 h-8 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase font-semibold">Click to inspect photo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-earth-400">
                        <Camera className="w-8 h-8" />
                        <span className="text-[10px] font-mono uppercase">No Photo Attached</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-earth-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#141712] text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-md border-2 border-[#BCB29E]">
                        <Eye className="w-3.5 h-3.5 text-brand-700" />
                        <span>Inspect Evidence</span>
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border-2 shadow-xs ${
                          isPending
                            ? 'bg-[#FEF5E7] text-[#733E03] border-[#B87217]'
                            : isVerified
                            ? 'bg-[#EAF4EC] text-[#1E4A26] border-[#A8D9B2]'
                            : 'bg-[#EDE7DC] text-[#474C3F] border-[#C9C0AD]'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {/* Hazard Category Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-[#141712] text-[10px] font-mono font-bold border-2 border-[#BCB29E] shadow-xs">
                        {report.hazard_type}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Submitter & Time */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-earth-600">
                        <span className="text-[#141712] font-bold">
                          {report.citizen_name || 'Citizen Report'}
                          {report.citizen_phone ? ` (${report.citizen_phone})` : ''}
                        </span>
                        <span className="font-semibold text-[#474C3F]">{new Date(report.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#2E3327] line-clamp-3 bg-[#F5F1E6] p-3 rounded-xl border border-[#D5CCA8] font-sans leading-relaxed">
                        {report.description || 'No additional details provided.'}
                      </p>

                      {/* Coordinates */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#1E4B33] font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {report.latitude.toFixed(4)}° N, {report.longitude.toFixed(4)}° E
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2.5 border-t-2 border-[#EDE7DC] flex items-center gap-2">
                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => handleStatusChange(report.id, 'verified')}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-mono font-bold text-[11px] uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isVerified
                            ? 'bg-[#EAF4EC] text-[#1E4A26] border-2 border-[#A8D9B2] cursor-default shadow-xs'
                            : 'bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] shadow-sm active:scale-[0.98] cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isVerified ? 'VERIFIED' : 'VERIFY'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-mono font-bold text-[11px] uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isDismissed
                            ? 'bg-[#EDE7DC] text-[#6B7263] border-2 border-[#D5CCA8] cursor-default opacity-80'
                            : 'bg-[#FDF2F0] hover:bg-[#FCE3DF] text-[#8A2418] hover:text-[#6D1B12] border-2 border-[#F2BCA0] shadow-xs active:scale-[0.98] cursor-pointer'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isDismissed ? 'DISMISSED' : 'DISMISS'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* HIGH-RES EVIDENCE INSPECTION MODAL                   */}
      {/* ==================================================== */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-[#141712]/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border-2 border-[#BCB29E] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-left">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b-2 border-[#D5CCA8] bg-[#F5F1E6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F7D8C4] text-[#B5551F] border border-[#E8B291]">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold uppercase font-serif text-[#141712]">
                  CITIZEN HAZARD EVIDENCE INSPECTION
                </h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="p-1.5 rounded-xl bg-[#EDE7DC] border border-[#BCB29E] hover:bg-[#DED7C8] text-[#141712] transition-colors cursor-pointer"
                aria-label="Close inspection modal"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 flex-1">
              {/* Image View */}
              <div className="rounded-2xl overflow-hidden bg-[#F0ECE1] border-2 border-[#D5CCA8] flex items-center justify-center min-h-[260px] max-h-[460px]">
                {loadingModalPhoto ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-[#434A3E] font-mono text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1E4B33]" />
                    <span>Loading authorized evidence image...</span>
                  </div>
                ) : modalPhotoUrl ? (
                  <img
                    src={modalPhotoUrl}
                    alt="Citizen hazard"
                    className="w-full h-auto max-h-[460px] object-contain"
                  />
                ) : (
                  <div className="py-12 text-center text-[#6B7263] font-mono text-xs">
                    No photo uploaded or image unavailable.
                  </div>
                )}
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-1">
                  <span className="text-[#6B7263] uppercase text-[10px]">Hazard Classification</span>
                  <div className="text-[#B5551F] font-bold text-sm">{inspectReport.hazard_type}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-1">
                  <span className="text-[#6B7263] uppercase text-[10px]">Current Verification Status</span>
                  <div className="font-bold text-sm uppercase">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        inspectReport.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : inspectReport.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-[#EDE7DC] text-[#434A3E] border border-[#BCB29E]'
                      }`}
                    >
                      {inspectReport.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-1">
                  <span className="text-[#6B7263] uppercase text-[10px]">GPS Coordinates</span>
                  <div className="text-[#141712] font-bold">
                    {inspectReport.latitude.toFixed(6)}° N, {inspectReport.longitude.toFixed(6)}° E
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-1">
                  <span className="text-[#6B7263] uppercase text-[10px]">Submission Timestamp</span>
                  <div className="text-[#141712] font-bold">
                    {new Date(inspectReport.submitted_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Citizen Note */}
              <div className="p-4 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-1.5 text-xs">
                <span className="font-mono text-[10px] uppercase text-[#434A3E] block font-bold">
                  Citizen Observations &amp; Description
                </span>
                <p className="text-[#141712] font-sans leading-relaxed">{inspectReport.description || 'No description provided.'}</p>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-3 border-t-2 border-[#D5CCA8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectReport.id, 'dismissed')}
                  className="px-4 py-2.5 rounded-xl bg-[#FDF2F0] hover:bg-[#FCE3DF] text-[#8A2418] border-2 border-[#F2BCA0] font-mono font-bold text-xs uppercase transition-all shadow-xs cursor-pointer"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectReport.id, 'verified')}
                  className="px-4 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] font-mono font-bold text-xs uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Incident</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
