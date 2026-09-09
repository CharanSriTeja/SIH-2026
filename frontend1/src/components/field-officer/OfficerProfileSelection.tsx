import React from 'react';
import { Radio, SearchCheck, ArrowRight, Shield, ChevronLeft } from 'lucide-react';
import { OfficerOperationalProfile } from '../../types';

interface OfficerProfileSelectionProps {
  mode: 'signin' | 'register';
  onSelectProfile: (profile: OfficerOperationalProfile) => void;
  onBack?: () => void;
}

export const OfficerProfileSelection: React.FC<OfficerProfileSelectionProps> = ({
  mode,
  onSelectProfile,
  onBack,
}) => {
  return (
    <div className="space-y-4 animate-fade-in text-left">
      {/* Header bar with Back option */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer mr-1"
              title="Back to role selection"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono-code uppercase tracking-wider text-blue-400 font-bold block">
              AUTHORIZED PERSONNEL CLEARANCE
            </span>
            <h2 className="text-base font-bold text-white uppercase font-heading tracking-wide">
              SELECT FIELD OFFICER PROFILE
            </h2>
          </div>
        </div>

        <span className="text-[9px] font-mono-code px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold">
          {mode === 'signin' ? 'AUTHENTICATION' : 'REGISTRATION'}
        </span>
      </div>

      <p className="text-xs text-white/70 leading-relaxed">
        Choose your authorized operational responsibility below to enter the corresponding command desk or submit verification credentials.
      </p>

      {/* Two Large Professional Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Card A: Monitoring & Coordination Officer */}
        <div
          onClick={() => onSelectProfile('Monitoring & Coordination Officer')}
          className="p-4 sm:p-5 rounded-2xl bg-[#080C14] border border-blue-500/30 hover:border-blue-400/80 hover:bg-blue-500/[0.06] transition-all cursor-pointer group relative overflow-hidden shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 group-hover:scale-105 group-hover:bg-blue-500/30 transition-all shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono-code uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    PROFILE 1
                  </span>
                  <span className="text-[10px] font-mono-code text-white/40 uppercase">
                    EOC / Operations
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white uppercase group-hover:text-blue-300 transition-colors font-heading">
                  MONITORING &amp; COORDINATION OFFICER
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  Monitor risk, review citizen reports, assign field investigations and coordinate emergency response.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProfile('Monitoring & Coordination Officer');
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-mono-code font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 group-hover:shadow-md group-hover:shadow-blue-500/30"
            >
              <span>{mode === 'signin' ? 'Select & Sign In' : 'Select & Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B: Field Investigation Officer */}
        <div
          onClick={() => onSelectProfile('Field Investigation Officer')}
          className="p-4 sm:p-5 rounded-2xl bg-[#080C14] border border-amber-500/30 hover:border-amber-400/80 hover:bg-amber-500/[0.06] transition-all cursor-pointer group relative overflow-hidden shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-105 group-hover:bg-amber-500/30 transition-all shrink-0">
                <SearchCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono-code uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    PROFILE 2
                  </span>
                  <span className="text-[10px] font-mono-code text-white/40 uppercase">
                    Rapid Ground Inspection
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors font-heading">
                  FIELD INVESTIGATION OFFICER
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  Receive investigation assignments, conduct field inspections and submit verified field evidence.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProfile('Field Investigation Officer');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono-code font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 group-hover:shadow-md group-hover:shadow-amber-500/30"
            >
              <span>{mode === 'signin' ? 'Select & Sign In' : 'Select & Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-2 text-[11px] font-mono-code text-white/50">
        <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Both profiles belong to the authorized Field Officer role with specialized operational interfaces.</span>
      </div>
    </div>
  );
};
