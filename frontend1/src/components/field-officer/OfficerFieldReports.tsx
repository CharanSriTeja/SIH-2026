import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  HelpCircle,
  Truck,
  UserCheck,
  Calendar
} from 'lucide-react';

export interface OperationalFieldReport {
  id: string;
  reportNumber: string;
  sector: string;
  district?: string;
  location: string;
  hazardType: string;
  riskLevel: 'CRITICAL RISK' | 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  status: 'Verified' | 'Under Investigation' | 'Resolved';
  dateTime: string;
  verifiedOn?: string;
  verifiedBy?: {
    name: string;
    designation: string;
    officerId: string;
    department: string;
  };
  officerObservation: string;
  photos: string[];
  actionRequired?: string;
}

interface OfficerFieldReportsProps {
  reports: OperationalFieldReport[];
  onNavigateToResponse?: (report?: OperationalFieldReport) => void;
  onRequestAssistance?: (report: OperationalFieldReport) => void;
}

export const OfficerFieldReports: React.FC<OfficerFieldReportsProps> = ({
  reports,
  onNavigateToResponse,
  onRequestAssistance,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hazardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector = sectorFilter === 'ALL' || r.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-slate-100">
      {/* ========================================================================= */}
      {/* 1. HEADER & SEARCH BAR                                                    */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Field Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified ground hazards and ongoing field investigations
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="Sector A">Sector A</option>
              <option value="Sector B">Sector B</option>
              <option value="Sector C">Sector C</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report number, hazard type, or location..."
            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPORT DETAIL VIEW (IF SELECTED)                                       */}
      {/* ========================================================================= */}
      {selectedReport ? (
        <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-lg space-y-6">
          {/* Back Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Field Reports</span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              FIELD REPORT {selectedReport.reportNumber}
            </span>
          </div>

          {/* Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Photos */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Site Photos</span>
              <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                {selectedReport.photos && selectedReport.photos.length > 0 ? (
                  <img
                    src={selectedReport.photos[0]}
                    alt={selectedReport.hazardType}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-slate-600" />
                    <span>No photo uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Hazard Type
                </span>
                <span className="text-lg font-bold text-white block mt-0.5">
                  {selectedReport.hazardType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                    Risk Level
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${
                      selectedReport.riskLevel === 'HIGH RISK'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : selectedReport.riskLevel === 'MODERATE RISK'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedReport.riskLevel}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                    Verification Status
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium mt-0.5 ${
                      selectedReport.status === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : selectedReport.status === 'Under Investigation'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Location &amp; Sector
                </span>
                <span className="text-slate-200 font-medium leading-snug">
                  {selectedReport.location} &bull; {selectedReport.sector}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Date &amp; Time
                </span>
                <span className="text-slate-300">{selectedReport.dateTime}</span>
              </div>

              {/* Verified By Details */}
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verified By</span>
                  </div>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    {selectedReport.status || 'VERIFIED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Officer Name:</span>
                    <span className="text-white font-medium">
                      {selectedReport.verifiedBy?.name || 'Rahul Sharma'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Designation:</span>
                    <span className="text-slate-200">
                      {selectedReport.verifiedBy?.designation || 'Field Officer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Officer ID:</span>
                    <span className="text-slate-200 font-mono">
                      {selectedReport.verifiedBy?.officerId || 'FO-1024'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Department:</span>
                    <span className="text-slate-200 truncate">
                      {selectedReport.verifiedBy?.department || 'Disaster Management Department'}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Verified On:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedReport.verifiedOn || selectedReport.dateTime || '08 September 2026, 10:42 AM'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Officer Observation
                </span>
                <p className="text-slate-200 leading-relaxed p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 mt-1">
                  {selectedReport.officerObservation}
                </p>
              </div>

              {selectedReport.actionRequired && (
                <div>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                    Action Required
                  </span>
                  <span className="text-slate-100 font-medium">
                    {selectedReport.actionRequired}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Close Details
            </button>

            {onRequestAssistance && (
              <button
                type="button"
                onClick={() => {
                  onRequestAssistance(selectedReport);
                  if (onNavigateToResponse) onNavigateToResponse(selectedReport);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Request Assistance for this Hazard</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. SIMPLE LIST OF FIELD REPORTS (EXACTLY AS PROMPTED)                     */
        /* ========================================================================= */
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs">
              <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No Field Reports Found</p>
              <p className="mt-1 text-slate-400">
                Reports verified from the Verification queue will appear here.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer shadow-sm flex items-center justify-between gap-4 group"
              >
                {/* Left side matching prompt exact sample structure */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      FIELD REPORT {report.reportNumber}
                    </span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="text-xs text-slate-300">{report.sector}</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100">
                    {report.hazardType}
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`font-semibold ${
                        report.riskLevel === 'HIGH RISK'
                          ? 'text-red-400'
                          : report.riskLevel === 'MODERATE RISK'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {report.riskLevel}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400 text-[11px]">{report.dateTime}</span>
                  </div>
                </div>

                {/* Right side status badge and arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'Verified'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : report.status === 'Under Investigation'
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {report.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
