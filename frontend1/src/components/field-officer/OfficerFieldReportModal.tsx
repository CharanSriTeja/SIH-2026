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
      className="fixed inset-0 z-50 bg-earth-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDF8] border border-earth-300 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-earth-900 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-earth-200 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-earth-600 tracking-wider block">
              OFFICIAL FIELD RECORD
            </span>
            <h2 className="text-xl font-bold text-earth-900 tracking-tight font-serif">
              FIELD REPORT {report.reportNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-600 hover:text-earth-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hazard & Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-earth-50 border border-earth-200 rounded-xl p-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-earth-600 font-semibold block font-mono">
              Hazard
            </span>
            <span className="text-base font-bold text-earth-900 block mt-0.5 font-serif">
              {report.hazardType}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-earth-600 font-semibold block font-mono">
              Risk Level
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 font-mono ${
                isCritical
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : isHigh
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isModerate
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {cleanRisk} RISK
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wider text-earth-600 font-semibold block font-mono">
              Location
            </span>
            <span className="text-sm text-earth-800 font-medium block mt-0.5">
              {report.location}
              {report.sector && ` (${report.sector})`}
              {report.district && `, ${report.district}`}
            </span>
          </div>
        </div>

        {/* Compact "Verified By" Area - Exactly per prompt requirements */}
        <div className="p-4 rounded-xl bg-earth-50/70 border border-earth-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-earth-200 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-earth-900">
              <UserCheck className="w-4 h-4 text-brand-700" />
              <span>Verified By</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider font-mono">
              {report.status || 'VERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="text-[11px] text-earth-500 block">Officer Name:</span>
              <span className="text-earth-900 font-medium">{officer.name}</span>
            </div>
            <div>
              <span className="text-[11px] text-earth-500 block">Designation:</span>
              <span className="text-earth-700">{officer.designation}</span>
            </div>
            <div>
              <span className="text-[11px] text-earth-500 block">Officer ID:</span>
              <span className="text-earth-700 font-mono">{officer.officerId}</span>
            </div>
            <div>
              <span className="text-[11px] text-earth-500 block">Department:</span>
              <span className="text-earth-700">{officer.department}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-earth-200 text-xs text-earth-600 flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-earth-500" />
            <span>Verified On:</span>
            <span className="text-earth-800 font-medium">{verifiedDate}</span>
          </div>
        </div>

        {/* Officer Observation */}
        <div className="space-y-1 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-earth-600 font-semibold block font-mono">
            Officer Observation
          </span>
          <p className="text-earth-800 leading-relaxed p-3 rounded-xl bg-earth-50 border border-earth-200">
            {report.officerObservation}
          </p>
        </div>

        {/* Officer Evidence: [Photo] */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-earth-600 font-semibold flex items-center gap-1.5 font-mono">
            <Camera className="w-3.5 h-3.5 text-brand-700" />
            <span>Officer Evidence</span>
          </span>
          <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-earth-300 bg-earth-100 flex items-center justify-center">
            {report.photos && report.photos.length > 0 ? (
              <img
                src={report.photos[0]}
                alt={`Evidence for ${report.hazardType}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center text-earth-500 text-xs flex flex-col items-center gap-1">
                <Camera className="w-6 h-6 text-earth-400" />
                <span>No photo evidence attached</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Required & Footer Buttons */}
        <div className="pt-3 border-t border-earth-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {report.actionRequired ? (
            <div className="text-xs">
              <span className="text-earth-500 text-[11px] block font-mono">Action Required:</span>
              <span className="text-earth-900 font-semibold">{report.actionRequired}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-medium cursor-pointer transition-colors border border-earth-300 shadow-xs"
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
                className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
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
