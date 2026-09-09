import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  XCircle,
  HelpCircle,
  Info,
  ChevronRight,
  ArrowLeft,
  UploadCloud,
  Check
} from 'lucide-react';

export interface CitizenVerificationReport {
  id: string;
  reportNumber: string;
  hazardType: string;
  sector: string;
  location: string;
  citizenDescription: string;
  citizenPhoto: string;
  dateTime: string;
  areaRiskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  status: 'Pending Verification' | 'Needs Investigation' | 'Verified' | 'Rejected';
  hasPhoto: boolean;
}

export interface VerificationDetails {
  officerObservation: string;
  severity: 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK';
  recommendedAction: string;
  officerPhoto?: string;
}

interface OfficerVerificationQueueProps {
  reports: CitizenVerificationReport[];
  onVerifyReport: (report: CitizenVerificationReport, details: VerificationDetails) => void;
  onNeedsInvestigation: (report: CitizenVerificationReport, notes: string) => void;
  onRejectReport: (report: CitizenVerificationReport, reason: string) => void;
  onNavigateToReports?: () => void;
}

export const OfficerVerificationQueue: React.FC<OfficerVerificationQueueProps> = ({
  reports,
  onVerifyReport,
  onNeedsInvestigation,
  onRejectReport,
  onNavigateToReports,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Verification form state
  const [isVerifying, setIsVerifying] = useState(false);
  const [officerObservation, setOfficerObservation] = useState('');
  const [severity, setSeverity] = useState<'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK'>('HIGH RISK');
  const [recommendedAction, setRecommendedAction] = useState('Road inspection');
  const [officerPhoto, setOfficerPhoto] = useState<string>('');

  // Rejection modal / inline state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Duplicate report of existing incident');

  // Find currently selected report
  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  // Handle opening report details
  const handleOpenReport = (report: CitizenVerificationReport) => {
    setSelectedReportId(report.id);
    setIsVerifying(false);
    setIsRejecting(false);
    setOfficerObservation('');
    setSeverity(
      report.areaRiskLevel === 'HIGH'
        ? 'HIGH RISK'
        : report.areaRiskLevel === 'MODERATE'
        ? 'MODERATE RISK'
        : 'LOW RISK'
    );
    setRecommendedAction(
      report.hazardType.toLowerCase().includes('road') || report.hazardType.toLowerCase().includes('crack')
        ? 'Road inspection'
        : report.hazardType.toLowerCase().includes('water')
        ? 'Drainage inspection'
        : 'Slope stabilization'
    );
  };

  // Submit Verification
  const handleConfirmVerification = () => {
    if (!selectedReport) return;
    onVerifyReport(selectedReport, {
      officerObservation:
        officerObservation.trim() ||
        `Inspected on-site: Confirmed ${selectedReport.hazardType.toLowerCase()} at ${selectedReport.location}.`,
      severity,
      recommendedAction,
      officerPhoto: officerPhoto || undefined,
    });
    setSelectedReportId(null);
    setIsVerifying(false);
  };

  // Submit Needs Investigation
  const handleConfirmNeedsInvestigation = () => {
    if (!selectedReport) return;
    onNeedsInvestigation(
      selectedReport,
      `Further geotechnical check requested. Site team dispatched for physical survey.`
    );
    setSelectedReportId(null);
  };

  // Submit Rejection
  const handleConfirmReject = () => {
    if (!selectedReport) return;
    onRejectReport(selectedReport, rejectionReason);
    setSelectedReportId(null);
    setIsRejecting(false);
  };

  // Filter pending reports for the queue
  const pendingReports = reports.filter((r) => r.status === 'Pending Verification');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-slate-100">
      {/* ========================================================================= */}
      {/* 1. HEADER & MANDATORY VERIFICATION NOTICE                                 */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Review and verify ground reports submitted by citizens
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            {pendingReports.length} Pending
          </span>
        </div>

        {/* Mandatory Policy Note */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Official Protocol:</strong> Citizen reports do not
            automatically change the official AI risk score. They are ground evidence that must be
            verified by the officer before moving into Field Reports.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPORT DETAIL VIEW (IF SELECTED)                                       */}
      {/* ========================================================================= */}
      {selectedReport ? (
        <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-lg space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification List</span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              ID: {selectedReport.reportNumber}
            </span>
          </div>

          {/* Report Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Citizen Photo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Citizen Photo / Evidence</span>
              <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                {selectedReport.citizenPhoto ? (
                  <img
                    src={selectedReport.citizenPhoto}
                    alt={selectedReport.hazardType}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-slate-600" />
                    <span>No image attached</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Uploaded by citizen during hazard report submission
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4 text-xs">
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
                    Sector
                  </span>
                  <span className="text-slate-200 font-medium">{selectedReport.sector}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                    Area Risk Level
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 ${
                      selectedReport.areaRiskLevel === 'HIGH'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : selectedReport.areaRiskLevel === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedReport.areaRiskLevel} RISK
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Location
                </span>
                <span className="text-slate-200 font-medium leading-snug">
                  {selectedReport.location}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Date &amp; Time
                </span>
                <span className="text-slate-300">{selectedReport.dateTime}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Citizen Description
                </span>
                <p className="text-slate-200 leading-relaxed p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 mt-1">
                  "{selectedReport.citizenDescription}"
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THREE CLEAR ACTIONS                                                       */}
          {/* ========================================================================= */}
          {!isVerifying && !isRejecting && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVerifying(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>[ VERIFY ]</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmNeedsInvestigation}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>[ NEEDS INVESTIGATION ]</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 font-medium text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>[ REJECT / DUPLICATE ]</span>
              </button>
            </div>
          )}

          {/* Verification Form Expanded */}
          {isVerifying && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Officer Verification Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Officer Observation */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Officer Observation <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={officerObservation}
                    onChange={(e) => setOfficerObservation(e.target.value)}
                    placeholder="Enter on-ground physical inspection findings (e.g. Fissure width 10 cm, active soil creep, pavement subsidence)..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Severity */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Severity Level
                    </label>
                    <select
                      value={severity}
                      onChange={(e) =>
                        setSeverity(e.target.value as 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK')
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="HIGH RISK">HIGH RISK</option>
                      <option value="MODERATE RISK">MODERATE RISK</option>
                      <option value="LOW RISK">LOW RISK</option>
                    </select>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Recommended Action
                    </label>
                    <input
                      type="text"
                      value={recommendedAction}
                      onChange={(e) => setRecommendedAction(e.target.value)}
                      placeholder="e.g. Road inspection, Road clearance..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Optional Officer Photo */}
                <div>
                  <label className="block text-slate-400 mb-1">
                    Optional Officer Photo Evidence
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={officerPhoto}
                      onChange={(e) => setOfficerPhoto(e.target.value)}
                      placeholder="Attach image URL or leave blank..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerPhoto(
                          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
                        )
                      }
                      className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 shrink-0 cursor-pointer"
                    >
                      Use Sample Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Move to Field Reports</span>
                </button>
              </div>
            </div>
          )}

          {/* Rejection Form Expanded */}
          {isRejecting && (
            <div className="p-4 rounded-xl bg-slate-900 border border-red-500/40 space-y-3 text-xs">
              <div className="flex items-center justify-between text-red-400 font-semibold">
                <span>Reject or Mark Duplicate</span>
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Reason for Rejection</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Duplicate report of existing incident">Duplicate report of existing incident</option>
                  <option value="Unrelated to landslide or slope instability">Unrelated to landslide or slope instability</option>
                  <option value="Inconclusive or invalid photographic evidence">Inconclusive or invalid photographic evidence</option>
                  <option value="Resolved / No active hazard found upon inspection">Resolved / No active hazard found upon inspection</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. SIMPLE LIST OF CITIZEN REPORTS                                         */
        /* ========================================================================= */
        <div className="space-y-3">
          {pendingReports.length === 0 ? (
            <div className="text-center py-12 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">All Reports Verified</p>
              <p className="mt-1 text-slate-400">There are no pending citizen reports awaiting verification.</p>
              {onNavigateToReports && (
                <button
                  type="button"
                  onClick={onNavigateToReports}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  View Field Reports &rarr;
                </button>
              )}
            </div>
          ) : (
            pendingReports.map((report) => (
              <div
                key={report.id}
                onClick={() => handleOpenReport(report)}
                className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer shadow-sm flex items-center justify-between gap-4 group"
              >
                {/* Left details formatted exactly as requested */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      REPORT {report.reportNumber}
                    </span>
                    <span className="text-slate-400 text-xs">&bull;</span>
                    <span className="text-xs text-slate-300 font-medium">{report.sector}</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100">
                    {report.hazardType}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span>Photo attached</span>
                    </span>
                    <span>&bull;</span>
                    <span>{report.dateTime}</span>
                  </div>
                </div>

                {/* Right Status Badge & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    Pending Verification
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
