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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-earth-900">
      {/* ========================================================================= */}
      {/* 1. HEADER & SEARCH BAR                                                    */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-earth-900 tracking-tight font-serif">
              Field Reports
            </h1>
            <p className="text-xs sm:text-sm text-earth-600 mt-0.5">
              Verified ground hazards and ongoing field investigations
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-earth-600 font-medium">Filter:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#FFFDF8] border border-earth-300 text-earth-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-700 font-mono shadow-xs"
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
            className="w-full bg-[#FFFDF8] border border-earth-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-earth-900 placeholder-earth-400 focus:outline-none focus:border-brand-700 shadow-xs"
          />
          <Search className="w-4 h-4 text-earth-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPORT DETAIL VIEW (IF SELECTED)                                       */}
      {/* ========================================================================= */}
      {selectedReport ? (
        <div className="bg-[#FFFDF8] border border-earth-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 text-earth-900">
          {/* Back Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-earth-200">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-earth-600 hover:text-earth-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Field Reports</span>
            </button>
            <span className="text-xs font-mono text-earth-600">
              FIELD REPORT {selectedReport.reportNumber}
            </span>
          </div>

          {/* Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Photos */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-earth-700">Site Photos</span>
              <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-earth-300 bg-earth-100 flex items-center justify-center">
                {selectedReport.photos && selectedReport.photos.length > 0 ? (
                  <img
                    src={selectedReport.photos[0]}
                    alt={selectedReport.hazardType}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-earth-500 text-xs flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-earth-400" />
                    <span>No photo uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Hazard Type
                </span>
                <span className="text-lg font-bold text-earth-900 block mt-0.5 font-serif">
                  {selectedReport.hazardType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                    Risk Level
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 font-mono ${
                      selectedReport.riskLevel === 'HIGH RISK'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : selectedReport.riskLevel === 'MODERATE RISK'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {selectedReport.riskLevel}
                  </span>
                </div>

                <div>
                  <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                    Verification Status
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium mt-0.5 font-mono ${
                      selectedReport.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : selectedReport.status === 'Under Investigation'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-earth-200 text-earth-800'
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Location &amp; Sector
                </span>
                <span className="text-earth-800 font-medium leading-snug">
                  {selectedReport.location} &bull; {selectedReport.sector}
                </span>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Date &amp; Time
                </span>
                <span className="text-earth-800 font-mono">{selectedReport.dateTime}</span>
              </div>

              {/* Verified By Details */}
              <div className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-earth-200 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-earth-800">
                    <UserCheck className="w-3.5 h-3.5 text-brand-700" />
                    <span>Verified By</span>
                  </div>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider font-mono">
                    {selectedReport.status || 'VERIFIED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-earth-500 block">Officer Name:</span>
                    <span className="text-earth-900 font-medium">
                      {selectedReport.verifiedBy?.name || 'Rahul Sharma'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-500 block">Designation:</span>
                    <span className="text-earth-700">
                      {selectedReport.verifiedBy?.designation || 'Field Officer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-500 block">Officer ID:</span>
                    <span className="text-earth-700 font-mono">
                      {selectedReport.verifiedBy?.officerId || 'FO-1024'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-earth-500 block">Department:</span>
                    <span className="text-earth-700 truncate">
                      {selectedReport.verifiedBy?.department || 'Disaster Management Department'}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-earth-200 text-[11px] text-earth-500 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3 h-3 text-earth-400" />
                  <span>Verified On:</span>
                  <span className="text-earth-800 font-medium">
                    {selectedReport.verifiedOn || selectedReport.dateTime || '08 September 2026, 10:42 AM'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Officer Observation
                </span>
                <p className="text-earth-800 leading-relaxed p-3 rounded-lg bg-earth-50 border border-earth-200 mt-1">
                  {selectedReport.officerObservation}
                </p>
              </div>

              {selectedReport.actionRequired && (
                <div>
                  <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                    Action Required
                  </span>
                  <span className="text-earth-900 font-medium">
                    {selectedReport.actionRequired}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-earth-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="px-4 py-2 rounded-lg bg-earth-100 hover:bg-earth-200 border border-earth-300 text-earth-800 text-xs font-medium cursor-pointer shadow-xs transition-colors"
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
                className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
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
            <div className="text-center py-12 bg-[#FFFDF8] border border-earth-300 rounded-2xl p-6 text-earth-600 text-xs shadow-xs">
              <FileCheck2 className="w-8 h-8 text-earth-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-earth-900">No Field Reports Found</p>
              <p className="mt-1 text-earth-600">
                Reports verified from the Verification queue will appear here.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className="bg-[#FFFDF8] hover:bg-earth-50/80 border border-earth-300 hover:border-earth-400 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer shadow-xs flex items-center justify-between gap-4 group"
              >
                {/* Left side matching prompt exact sample structure */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-earth-900">
                      FIELD REPORT {report.reportNumber}
                    </span>
                    <span className="text-earth-400 text-xs">&bull;</span>
                    <span className="text-xs text-earth-700 font-medium">{report.sector}</span>
                  </div>

                  <div className="text-sm font-semibold text-earth-900">
                    {report.hazardType}
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`font-semibold font-mono ${
                        report.riskLevel === 'HIGH RISK'
                          ? 'text-rose-700'
                          : report.riskLevel === 'MODERATE RISK'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {report.riskLevel}
                    </span>
                    <span className="text-earth-400">&bull;</span>
                    <span className="text-earth-500 text-[11px] font-mono">{report.dateTime}</span>
                  </div>
                </div>

                {/* Right side status badge and arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
                      report.status === 'Verified'
                        ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                        : report.status === 'Under Investigation'
                        ? 'bg-amber-100 border border-amber-300 text-amber-900'
                        : 'bg-earth-100 border border-earth-300 text-earth-800'
                    }`}
                  >
                    {report.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-earth-400 group-hover:text-earth-900 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
