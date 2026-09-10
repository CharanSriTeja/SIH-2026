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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-earth-900">
      {/* ========================================================================= */}
      {/* 1. HEADER & MANDATORY VERIFICATION NOTICE                                 */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-earth-900 tracking-tight font-serif">
              Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-earth-600 mt-0.5">
              Review and verify ground reports submitted by citizens
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-900 text-xs font-semibold font-mono">
            {pendingReports.length} Pending
          </span>
        </div>

        {/* Mandatory Policy Note */}
        <div className="p-3.5 rounded-xl bg-earth-100/70 border border-earth-300 text-xs text-earth-800 flex items-start gap-2.5 shadow-xs">
          <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-earth-900">Official Protocol:</strong> Citizen reports do not
            automatically change the official AI risk score. They are ground evidence that must be
            verified by the officer before moving into Field Reports.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REPORT DETAIL VIEW (IF SELECTED)                                       */}
      {/* ========================================================================= */}
      {selectedReport ? (
        <div className="bg-[#FFFDF8] border border-earth-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 text-earth-900">
          {/* Back Button */}
          <div className="flex items-center justify-between pb-4 border-b border-earth-200">
            <button
              type="button"
              onClick={() => setSelectedReportId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-earth-600 hover:text-earth-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification List</span>
            </button>
            <span className="text-xs font-mono text-earth-600">
              ID: {selectedReport.reportNumber}
            </span>
          </div>

          {/* Report Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Citizen Photo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-earth-700">Citizen Photo / Evidence</span>
              <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-earth-300 bg-earth-100 flex items-center justify-center">
                {selectedReport.citizenPhoto ? (
                  <img
                    src={selectedReport.citizenPhoto}
                    alt={selectedReport.hazardType}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-earth-500 text-xs flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-earth-400" />
                    <span>No image attached</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-earth-600">
                Uploaded by citizen during hazard report submission
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4 text-xs">
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
                    Sector
                  </span>
                  <span className="text-earth-800 font-medium">{selectedReport.sector}</span>
                </div>
                <div>
                  <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                    Area Risk Level
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mt-0.5 font-mono ${
                      selectedReport.areaRiskLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : selectedReport.areaRiskLevel === 'MODERATE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {selectedReport.areaRiskLevel} RISK
                  </span>
                </div>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Location
                </span>
                <span className="text-earth-800 font-medium leading-snug">
                  {selectedReport.location}
                </span>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Date &amp; Time
                </span>
                <span className="text-earth-800 font-mono">{selectedReport.dateTime}</span>
              </div>

              <div>
                <span className="text-earth-600 text-[11px] uppercase tracking-wider block font-mono">
                  Citizen Description
                </span>
                <p className="text-earth-800 leading-relaxed p-3 rounded-lg bg-earth-50 border border-earth-200 mt-1 italic">
                  "{selectedReport.citizenDescription}"
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THREE CLEAR ACTIONS                                                       */}
          {/* ========================================================================= */}
          {!isVerifying && !isRejecting && (
            <div className="pt-4 border-t border-earth-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVerifying(true)}
                className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>[ VERIFY ]</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmNeedsInvestigation}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>[ NEEDS INVESTIGATION ]</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-5 py-2.5 rounded-xl bg-earth-100 hover:bg-rose-50 text-earth-700 hover:text-rose-800 border border-earth-300 hover:border-rose-300 font-medium text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>[ REJECT / DUPLICATE ]</span>
              </button>
            </div>
          )}

          {/* Verification Form Expanded */}
          {isVerifying && (
            <div className="p-4 sm:p-5 rounded-xl bg-earth-50 border border-brand-700/30 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-brand-700" />
                  <span>Official Officer Verification Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-earth-500 hover:text-earth-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Officer Observation */}
                <div>
                  <label className="block text-earth-800 font-medium mb-1">
                    Officer Observation <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={officerObservation}
                    onChange={(e) => setOfficerObservation(e.target.value)}
                    placeholder="Enter on-ground physical inspection findings (e.g. Fissure width 10 cm, active soil creep, pavement subsidence)..."
                    className="w-full bg-[#FFFDF8] border border-earth-300 rounded-lg p-2.5 text-xs text-earth-900 placeholder-earth-400 focus:outline-none focus:border-brand-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Severity */}
                  <div>
                    <label className="block text-earth-800 font-medium mb-1">
                      Severity Level
                    </label>
                    <select
                      value={severity}
                      onChange={(e) =>
                        setSeverity(e.target.value as 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK')
                      }
                      className="w-full bg-[#FFFDF8] border border-earth-300 rounded-lg p-2 text-xs text-earth-900 focus:outline-none focus:border-brand-700 font-mono"
                    >
                      <option value="HIGH RISK">HIGH RISK</option>
                      <option value="MODERATE RISK">MODERATE RISK</option>
                      <option value="LOW RISK">LOW RISK</option>
                    </select>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <label className="block text-earth-800 font-medium mb-1">
                      Recommended Action
                    </label>
                    <input
                      type="text"
                      value={recommendedAction}
                      onChange={(e) => setRecommendedAction(e.target.value)}
                      placeholder="e.g. Road inspection, Road clearance..."
                      className="w-full bg-[#FFFDF8] border border-earth-300 rounded-lg p-2 text-xs text-earth-900 focus:outline-none focus:border-brand-700"
                    />
                  </div>
                </div>

                {/* Optional Officer Photo */}
                <div>
                  <label className="block text-earth-700 mb-1">
                    Optional Officer Photo Evidence
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={officerPhoto}
                      onChange={(e) => setOfficerPhoto(e.target.value)}
                      placeholder="Attach image URL or leave blank..."
                      className="flex-1 bg-[#FFFDF8] border border-earth-300 rounded-lg p-2 text-xs text-earth-900 focus:outline-none focus:border-brand-700 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerPhoto(
                          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
                        )
                      }
                      className="px-2.5 py-2 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs border border-earth-300 shrink-0 cursor-pointer shadow-xs"
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
                  className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Move to Field Reports</span>
                </button>
              </div>
            </div>
          )}

          {/* Rejection Form Expanded */}
          {isRejecting && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between text-rose-900 font-semibold">
                <span>Reject or Mark Duplicate</span>
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="text-earth-600 hover:text-earth-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-earth-800 mb-1 font-medium">Reason for Rejection</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-earth-300 rounded-lg p-2 text-xs text-earth-900 focus:outline-none focus:border-rose-500"
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
                  className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs cursor-pointer shadow-xs"
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
            <div className="text-center py-12 bg-[#FFFDF8] border border-earth-300 rounded-2xl p-6 text-earth-600 text-xs shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-earth-900">All Reports Verified</p>
              <p className="mt-1 text-earth-600">There are no pending citizen reports awaiting verification.</p>
              {onNavigateToReports && (
                <button
                  type="button"
                  onClick={onNavigateToReports}
                  className="mt-4 px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-medium cursor-pointer shadow-xs"
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
                className="bg-[#FFFDF8] hover:bg-earth-50/80 border border-earth-300 hover:border-earth-400 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer shadow-xs flex items-center justify-between gap-4 group"
              >
                {/* Left details formatted exactly as requested */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-earth-900">
                      REPORT {report.reportNumber}
                    </span>
                    <span className="text-earth-400 text-xs">&bull;</span>
                    <span className="text-xs text-earth-700 font-medium">{report.sector}</span>
                  </div>

                  <div className="text-sm font-semibold text-earth-900">
                    {report.hazardType}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-earth-600">
                    <span className="flex items-center gap-1 text-brand-800">
                      <Camera className="w-3.5 h-3.5 text-brand-700" />
                      <span>Photo attached</span>
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono">{report.dateTime}</span>
                  </div>
                </div>

                {/* Right Status Badge & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium font-mono">
                    Pending Verification
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
