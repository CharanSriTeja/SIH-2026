import React, { useState } from 'react';
import { ArrowRight, Wifi, WifiOff, Globe, Shield, RefreshCw, Layers, Check } from 'lucide-react';

interface CompletePlatformSectionProps {
  onEnterCommandCenter: () => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
}

export const CompletePlatformSection: React.FC<CompletePlatformSectionProps> = ({
  onEnterCommandCenter,
  isOfflineMode = false,
  onToggleOfflineMode,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'HI' | 'AS' | 'BN' | 'MNI'>('EN');

  const steps = [
    {
      num: '01',
      title: 'SENSE',
      details: ['Rainfall', 'Satellite', 'Sensors', 'Terrain'],
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      num: '02',
      title: 'ANALYZE',
      details: ['Environmental', 'Historical', 'Geospatial Data'],
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    },
    {
      num: '03',
      title: 'PREDICT',
      details: ['AI / ML', 'Risk Engine'],
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
    {
      num: '04',
      title: 'MAP',
      details: ['GIS', 'Risk Heatmap'],
      color: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    },
    {
      num: '05',
      title: 'IDENTIFY',
      details: ['Communities', 'Infrastructure', 'Roads'],
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
    {
      num: '06',
      title: 'ALERT',
      details: ['SMS', 'APP', 'WEB'],
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    },
    {
      num: '07',
      title: 'RESPOND',
      details: ['Evacuation', 'Shelters', 'Emergency Action'],
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
  ];

  const capabilities = [
    'REAL-TIME GIS',
    'AI / ML',
    'FIELD REPORTING',
    'EARLY WARNING',
    'ROAD MONITORING',
    'EVACUATION',
    'MULTILINGUAL',
    'OFFLINE SYNC',
    'CLOUD PLATFORM',
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'HI', name: 'हिन्दी' },
    { code: 'AS', name: 'অসমীয়া' },
    { code: 'BN', name: 'বাংলা' },
    { code: 'MNI', name: 'মৈতৈলোন্' },
  ];

  return (
    <section
      id="section-platform"
      className="relative min-h-screen lg:min-h-0 lg:h-screen py-3.5 lg:py-4 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10 flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full space-y-2 sm:space-y-2.5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 text-left border-b border-white/10 pb-1.5">
          <div className="space-y-0.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                07 / THE BHURAKSHA 2.0 PLATFORM
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              FROM SIGNAL <span className="text-amber-400">TO LIFE-SAVING ACTION.</span>
            </h2>

            <p className="text-[11px] text-slate-300 leading-normal font-normal">
              Unified disaster intelligence: sensor feeds, AI hazard inference, GIS mapping, field reports, and multi-tier early warnings for the North Eastern Region.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {capabilities.slice(0, 5).map((cap) => (
              <span key={cap} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/10 text-[9px] font-mono-code text-white/70 uppercase">
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* 7-Step End-to-End System Visualization Flow */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] p-2.5 sm:p-3 space-y-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="text-[10.5px] font-mono-code font-bold uppercase tracking-wider text-white">
              END-TO-END DISASTER INTELLIGENCE LIFECYCLE
            </span>
            <span className="text-[9px] font-mono-code text-white/40 uppercase">
              SIH EXPECTED ARCHITECTURE
            </span>
          </div>

          {/* Steps Grid (7 columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-left">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="p-2 rounded-lg border border-white/10 bg-[#080C14] flex flex-col justify-between hover:border-white/25 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono-code font-bold text-white/40">
                      {s.num}
                    </span>
                    <span className={`text-[8px] font-mono-code px-1 py-0.2 rounded border uppercase font-bold ${s.color}`}>
                      PHASE
                    </span>
                  </div>

                  <div className="text-xs font-bold font-heading uppercase text-white mb-1">
                    {s.title}
                  </div>

                  <ul className="space-y-0.5 text-[9.5px] text-slate-300 font-sans">
                    {s.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-1 truncate">
                        <span className="w-1 h-1 rounded-full bg-amber-400/80 shrink-0" />
                        <span className="truncate">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex justify-end pt-1 text-white/20">
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Remote Region + Offline Synchronization & Multilingual Interface */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] p-2.5 sm:p-3 text-left space-y-2 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  OFFLINE RESILIENCE &amp; REGIONAL LOCALIZATION
                </span>
                <span className="hidden sm:inline-block ml-2 text-[9px] font-mono-code text-white/50 uppercase">
                  LOW-BANDWIDTH READY FOR MOUNTAINOUS TERRAIN
                </span>
              </div>
            </div>

            {onToggleOfflineMode && (
              <button
                onClick={onToggleOfflineMode}
                className="px-2 py-0.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-white text-[9.5px] font-mono-code uppercase font-bold cursor-pointer transition-colors"
              >
                TOGGLE OFFLINE SIMULATION
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* 1. Network Status */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-0.5">
              <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                NETWORK STATUS
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono-code font-bold text-emerald-400 uppercase">
                {isOfflineMode ? (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400">OFFLINE CACHE</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CONNECTED</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. Last Sync */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-0.5">
              <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                LAST SATELLITE SYNC
              </span>
              <div className="text-[11px] font-mono-code font-bold text-white uppercase">
                02 MIN AGO
              </div>
            </div>

            {/* 3. Offline Mode */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-0.5">
              <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                LOCAL DB CACHE
              </span>
              <div className="text-[11px] font-mono-code font-bold text-emerald-400 uppercase">
                INDEXEDDB READY
              </div>
            </div>

            {/* 4. Pending Reports */}
            <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-0.5">
              <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                QUEUE PENDING
              </span>
              <div className="text-[11px] font-mono-code font-bold text-amber-400 uppercase">
                03 REPORTS
              </div>
            </div>

            {/* 5. Sync rule */}
            <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-0.5">
              <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                RECOVERY POLICY
              </span>
              <div className="text-[10px] font-mono-code text-slate-300 font-bold uppercase truncate">
                AUTO-SYNC ON SIGNAL
              </div>
            </div>
          </div>

          {/* Multilingual Support Selector */}
          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-white/60">
              <Globe className="w-3 h-3 text-amber-400" />
              <span className="uppercase">MULTILINGUAL CAP REGIONAL SUPPORT:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase transition-all cursor-pointer border ${
                    selectedLanguage === lang.code
                      ? 'bg-amber-400 text-black border-amber-400 shadow'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <span>{lang.code}</span>
                  <span className="text-[9px] opacity-70 ml-1">({lang.name})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Final Statement & Command Center CTA */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3 sm:p-4 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono-code font-bold uppercase text-amber-400 tracking-wider">
                BHURAKSHA 2.0 MISSION OBJECTIVE
              </div>
              <div className="text-sm sm:text-base font-extrabold font-heading uppercase text-white">
                SEE THE RISK. UNDERSTAND THE IMPACT. <span className="text-amber-400">ACT BEFORE DISASTER.</span>
              </div>
            </div>
          </div>

          <button
            onClick={onEnterCommandCenter}
            className="group shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
