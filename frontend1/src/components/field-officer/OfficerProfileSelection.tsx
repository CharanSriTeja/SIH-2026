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
    <div className="space-y-4 animate-fade-in text-left text-earth-900">
      {/* Header bar with Back option */}
      <div className="flex items-center justify-between border-b border-earth-200 pb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 rounded-lg border border-earth-300 bg-earth-100 flex items-center justify-center text-earth-700 hover:text-earth-900 hover:bg-earth-200 transition-all cursor-pointer mr-1 shadow-xs"
              title="Back to role selection"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-700 font-bold block">
              AUTHORIZED PERSONNEL CLEARANCE
            </span>
            <h2 className="text-base font-bold text-earth-900 uppercase font-serif tracking-wide">
              SELECT FIELD OFFICER PROFILE
            </h2>
          </div>
        </div>

        <span className="text-[9px] font-mono px-2 py-1 rounded bg-brand-700/10 text-brand-800 border border-brand-700/30 uppercase font-bold">
          {mode === 'signin' ? 'AUTHENTICATION' : 'REGISTRATION'}
        </span>
      </div>

      <p className="text-xs text-earth-700 leading-relaxed font-sans">
        Choose your authorized operational responsibility below to enter the corresponding command desk or submit verification credentials.
      </p>

      {/* Two Large Professional Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Card A: Monitoring & Coordination Officer */}
        <div
          onClick={() => onSelectProfile('Monitoring & Coordination Officer')}
          className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-earth-300 hover:border-brand-700/60 hover:bg-earth-50/50 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-700/10 border border-brand-700/30 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-all shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-brand-700/10 text-brand-800 font-bold border border-brand-700/20">
                    PROFILE 1
                  </span>
                  <span className="text-[10px] font-mono text-earth-500 uppercase">
                    EOC / Operations
                  </span>
                </div>
                <h3 className="text-sm font-bold text-earth-900 uppercase group-hover:text-brand-800 transition-colors font-serif">
                  MONITORING &amp; COORDINATION OFFICER
                </h3>
                <p className="text-xs text-earth-600 leading-relaxed pt-0.5 font-sans">
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
              className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>{mode === 'signin' ? 'Select & Sign In' : 'Select & Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B: Field Investigation Officer */}
        <div
          onClick={() => onSelectProfile('Field Investigation Officer')}
          className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-earth-300 hover:border-accent-600/60 hover:bg-earth-50/50 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-700 group-hover:scale-105 transition-all shrink-0">
                <SearchCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-accent-500/10 text-accent-800 font-bold border border-accent-500/20">
                    PROFILE 2
                  </span>
                  <span className="text-[10px] font-mono text-earth-500 uppercase">
                    Rapid Ground Inspection
                  </span>
                </div>
                <h3 className="text-sm font-bold text-earth-900 uppercase group-hover:text-accent-800 transition-colors font-serif">
                  FIELD INVESTIGATION OFFICER
                </h3>
                <p className="text-xs text-earth-600 leading-relaxed pt-0.5 font-sans">
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
              className="px-3.5 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>{mode === 'signin' ? 'Select & Sign In' : 'Select & Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center gap-2 text-[11px] font-mono text-earth-700 shadow-xs">
        <Shield className="w-3.5 h-3.5 text-brand-700 shrink-0" />
        <span>Both profiles belong to the authorized Field Officer role with specialized operational interfaces.</span>
      </div>
    </div>
  );
};
