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
    <div className="p-5 rounded-3xl bg-[#090E1B] border border-white/10 text-left space-y-4 font-sans animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. PENDING VERIFICATION STATE                                             */}
      {/* ========================================================================= */}
      {status === 'PENDING_VERIFICATION' && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono-code font-bold uppercase tracking-wider">
                ACCOUNT UNDER REVIEW
              </span>
              <h3 className="text-base font-bold font-heading text-white mt-0.5">
                Verification Pending Administrator Clearance
              </h3>
            </div>
          </div>

          <p className="text-xs text-white/80 leading-relaxed font-sans">
            Your Field Officer credentials and service documents have been logged and are currently awaiting administrative review by the State Disaster Management Authority (SDMA).
          </p>

          <div className="p-3.5 rounded-2xl bg-[#060912] border border-white/5 space-y-1.5 font-mono-code text-[11px] text-white/70">
            <div className="flex items-center justify-between">
              <span className="text-white/40 uppercase">OFFICER IDENTIFIER:</span>
              <span className="text-white font-bold">{requestData?.officialId || officerIdentifier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 uppercase">NAME:</span>
              <span className="text-white">{requestData?.fullName || 'Field Officer Applicant'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 uppercase">DEPARTMENT:</span>
              <span className="text-white">{requestData?.department || 'SDMA Geohazards'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 uppercase">EXPECTED RESOLUTION:</span>
              <span className="text-blue-300 font-bold">Within 24 Business Hours</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10.5px] font-mono-code text-blue-200">
            An email notification with login confirmation will be dispatched upon administrative endorsement.
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-300">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 text-[10px] font-mono-code font-bold uppercase tracking-wider">
                ACCESS REJECTED
              </span>
              <h3 className="text-base font-bold font-heading text-white mt-0.5">
                Officer Application Not Approved
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono-code text-red-300 uppercase font-bold block">
              OFFICIAL REASON PROVIDED BY ADMINISTRATOR:
            </span>
            <p className="text-white/80 font-sans leading-relaxed">
              {requestData?.rejectionReason ||
                'Department service certificate could not be matched against current District Disaster Management Authority (DDMA) active field rosters.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#060912] border border-white/5 space-y-1 text-xs text-white/70 font-mono-code">
            <div>
              &bull; Official Contact: <strong className="text-white">helpdesk@sdma.gov.in</strong>
            </div>
            <div>
              &bull; Control Room: <strong className="text-white">+91 389-2342555</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono-code text-xs">
            <button
              type="button"
              onClick={onBackToLogin}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold uppercase cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onReapply}
              className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5"
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
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono-code font-bold uppercase tracking-wider">
                ACTION REQUIRED
              </span>
              <h3 className="text-base font-bold font-heading text-white mt-0.5">
                Additional Information Requested by Admin
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono-code text-amber-300 uppercase font-bold block">
              REQUEST FROM STATE ADMINISTRATOR:
            </span>
            <p className="text-white/80 font-sans leading-relaxed">
              {requestData?.additionalInfoNotes ||
                'Please submit counter-signed departmental authorization letter and confirm current posting GPS coordinates.'}
            </p>
          </div>

          {!isResubmittedSuccess ? (
            <form onSubmit={handleResubmit} className="space-y-3 font-mono-code text-xs">
              <div>
                <label className="text-[10px] uppercase text-white/60 block mb-1">
                  OFFICER RESPONSE / CLARIFICATION
                </label>
                <textarea
                  rows={2}
                  required
                  value={resubmissionNotes}
                  onChange={(e) => setResubmissionNotes(e.target.value)}
                  className="w-full bg-[#080C14] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-white/60 block mb-1">
                  UPDATED ATTACHMENT
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-white/80 truncate flex-1">{resubmittedFile}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    ATTACHED
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
                >
                  &larr; Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Resubmit Updated Information &rarr;</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-3 text-emerald-200">
              <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono-code">
                <CheckCircle2 className="w-4 h-4" />
                <span>UPDATED INFORMATION RESUBMITTED SUCCESSFULLY</span>
              </div>
              <p className="font-sans">
                Your response and updated documentation have been transmitted to the reviewing administrator. Status is now PENDING REVIEW.
              </p>
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-mono-code font-bold uppercase text-xs cursor-pointer"
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
