import React, { useState } from 'react';
import {
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import { OfficerAccessRequest } from '../../types';
import { AuthService } from '../../services/authService';

interface OfficerStatusResolutionProps {
  status: 'PENDING_VERIFICATION' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  requestData: OfficerAccessRequest | null;
  officerIdentifier: string;
  onBackToLogin: () => void;
  onReapply?: () => void;
}

export const OfficerStatusResolution: React.FC<OfficerStatusResolutionProps> = ({
  status,
  requestData,
  officerIdentifier,
  onBackToLogin,
  onReapply,
}) => {
  // Resubmission state for ADDITIONAL_INFO_REQUIRED
  const [resubmissionNotes, setResubmissionNotes] = useState(
    'Attached updated departmental counter-signature order and confirmed Durtlang outpost GPS coordinate posting.'
  );
  const [resubmittedFile, setResubmittedFile] = useState('CounterSigned_SDMA_Authorization_2024.pdf');
  const [isResubmittedSuccess, setIsResubmittedSuccess] = useState(false);

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AuthService.resubmitOfficerInfo({
      officialId: requestData?.officialId || officerIdentifier,
      additionalNotes: resubmissionNotes,
      newDocumentName: resubmittedFile || undefined,
    });
    setIsResubmittedSuccess(true);
  };

  return (
    <div className="p-5 rounded-3xl bg-[#FFFDF8] border border-earth-300 text-left space-y-4 font-sans text-earth-900 shadow-sm animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. PENDING VERIFICATION STATE                                             */}
      {/* ========================================================================= */}
      {status === 'PENDING_VERIFICATION' && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-earth-200">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                ACCOUNT UNDER REVIEW
              </span>
              <h3 className="text-base font-bold font-serif text-earth-900 mt-0.5">
                Verification Pending Administrator Clearance
              </h3>
            </div>
          </div>

          <p className="text-xs text-earth-700 leading-relaxed font-sans">
            Your Field Officer credentials and service documents have been logged and are currently awaiting administrative review by the State Disaster Management Authority (SDMA).
          </p>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1.5 font-mono text-[11px] text-earth-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-earth-500 uppercase">OFFICER IDENTIFIER:</span>
              <span className="text-earth-900 font-bold">{requestData?.officialId || officerIdentifier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-earth-500 uppercase">NAME:</span>
              <span className="text-earth-900">{requestData?.fullName || 'Field Officer Applicant'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-earth-500 uppercase">DEPARTMENT:</span>
              <span className="text-earth-900">{requestData?.department || 'SDMA Geohazards'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-earth-500 uppercase">EXPECTED RESOLUTION:</span>
              <span className="text-brand-800 font-bold">Within 24 Business Hours</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[10.5px] font-mono text-blue-900">
            An email notification with login confirmation will be dispatched upon administrative endorsement.
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            &larr; Return to Sign In
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REJECTED STATE                                                         */}
      {/* ========================================================================= */}
      {status === 'REJECTED' && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-earth-200">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                ACCESS REJECTED
              </span>
              <h3 className="text-base font-bold font-serif text-earth-900 mt-0.5">
                Officer Application Not Approved
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono text-rose-900 uppercase font-bold block">
              OFFICIAL REASON PROVIDED BY ADMINISTRATOR:
            </span>
            <p className="text-rose-950 font-sans leading-relaxed">
              {requestData?.rejectionReason ||
                'Department service certificate could not be matched against current District Disaster Management Authority (DDMA) active field rosters.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1 text-xs text-earth-700 font-mono">
            <div>
              &bull; Official Contact: <strong className="text-earth-900">helpdesk@sdma.gov.in</strong>
            </div>
            <div>
              &bull; Control Room: <strong className="text-earth-900">+91 389-2342555</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <button
              type="button"
              onClick={onBackToLogin}
              className="py-2.5 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 font-bold uppercase cursor-pointer shadow-xs"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onReapply}
              className="py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Reapply &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADDITIONAL INFORMATION REQUIRED STATE                                  */}
      {/* ========================================================================= */}
      {status === 'ADDITIONAL_INFO_REQUIRED' && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-earth-200">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                ACTION REQUIRED
              </span>
              <h3 className="text-base font-bold font-serif text-earth-900 mt-0.5">
                Additional Information Requested by Admin
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono text-amber-900 uppercase font-bold block">
              REQUEST FROM STATE ADMINISTRATOR:
            </span>
            <p className="text-amber-950 font-sans leading-relaxed">
              {requestData?.additionalInfoNotes ||
                'Please submit counter-signed departmental authorization letter and confirm current posting GPS coordinates.'}
            </p>
          </div>

          {!isResubmittedSuccess ? (
            <form onSubmit={handleResubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-earth-600 block mb-1">
                  OFFICER RESPONSE / CLARIFICATION
                </label>
                <textarea
                  rows={2}
                  required
                  value={resubmissionNotes}
                  onChange={(e) => setResubmissionNotes(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-earth-300 rounded-xl p-3 text-xs text-earth-900 focus:outline-none focus:border-brand-700 font-sans shadow-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-earth-600 block mb-1">
                  UPDATED ATTACHMENT
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-earth-50 border border-earth-200">
                  <UploadCloud className="w-4 h-4 text-brand-700 shrink-0" />
                  <span className="text-xs text-earth-800 truncate flex-1">{resubmittedFile}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                    ATTACHED
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="px-4 py-2 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 font-bold cursor-pointer shadow-xs"
                >
                  &larr; Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Resubmit Updated Information &rarr;</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-3 text-emerald-900 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>UPDATED INFORMATION RESUBMITTED SUCCESSFULLY</span>
              </div>
              <p className="font-sans text-earth-800">
                Your response and updated documentation have been transmitted to the reviewing administrator. Status is now PENDING REVIEW.
              </p>
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-mono font-bold uppercase text-xs cursor-pointer shadow-xs"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
