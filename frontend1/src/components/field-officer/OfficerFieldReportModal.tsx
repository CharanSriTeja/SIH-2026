import React from 'react';
import { X, MapPin, AlertTriangle, UserCheck, Calendar, FileText, Camera, Truck, CheckCircle2 } from 'lucide-react';
import { OperationalFieldReport } from './OfficerFieldReports';

interface OfficerFieldReportModalProps {
  report: OperationalFieldReport | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestAssistance?: (report: OperationalFieldReport) => void;
  onNavigateToResponse?: () => void;
}

export const OfficerFieldReportModal: React.FC<OfficerFieldReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onRequestAssistance,
  onNavigateToResponse,
}) => {
  if (!isOpen || !report) return null;

  // Clean risk level display
  const cleanRisk = report.riskLevel.replace(' RISK', '');
  const isCritical = cleanRisk === 'CRITICAL';
  const isHigh = cleanRisk === 'HIGH';
  const isModerate = cleanRisk === 'MODERATE';

  const officer = report.verifiedBy || {
    name: 'Rahul Sharma',
    designation: 'Field Officer',
    officerId: 'FO-1024',
    department: 'Disaster Management Department',
  };

  const verifiedDate = report.verifiedOn || report.dateTime || '08 September 2026, 10:42 AM';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider block">
              OFFICIAL FIELD RECORD
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              FIELD REPORT {report.reportNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hazard & Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Hazard
            </span>
            <span className="text-base font-bold text-white block mt-0.5">
              {report.hazardType}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Risk Level
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 ${
                isCritical
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                  : isHigh
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : isModerate
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {cleanRisk} RISK
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Location
            </span>
            <span className="text-sm text-slate-200 font-medium block mt-0.5">
              {report.location}
              {report.sector && ` (${report.sector})`}
              {report.district && `, ${report.district}`}
            </span>
          </div>
        </div>

        {/* Compact "Verified By" Area - Exactly per prompt requirements */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Verified By</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              {report.status || 'VERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Officer Name:</span>
              <span className="text-white font-medium">{officer.name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Designation:</span>
              <span className="text-slate-200">{officer.designation}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Officer ID:</span>
              <span className="text-slate-200 font-mono">{officer.officerId}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Department:</span>
              <span className="text-slate-200">{officer.department}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50 text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Verified On:</span>
            <span className="text-slate-200 font-medium">{verifiedDate}</span>
          </div>
        </div>

        {/* Officer Observation */}
        <div className="space-y-1 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Officer Observation
          </span>
          <p className="text-slate-200 leading-relaxed p-3 rounded-xl bg-slate-900 border border-slate-800">
            {report.officerObservation}
          </p>
        </div>

        {/* Officer Evidence: [Photo] */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span>Officer Evidence</span>
          </span>
          <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
            {report.photos && report.photos.length > 0 ? (
              <img
                src={report.photos[0]}
                alt={`Evidence for ${report.hazardType}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                <Camera className="w-6 h-6 text-slate-600" />
                <span>No photo evidence attached</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Required & Footer Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {report.actionRequired ? (
            <div className="text-xs">
              <span className="text-slate-400 text-[11px] block">Action Required:</span>
              <span className="text-white font-semibold">{report.actionRequired}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Close
            </button>

            {onRequestAssistance && (
              <button
                type="button"
                onClick={() => {
                  onRequestAssistance(report);
                  if (onNavigateToResponse) onNavigateToResponse();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Request Assistance</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
