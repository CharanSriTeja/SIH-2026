import React from 'react';
import {
  AlertTriangle,
  Radio,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  Truck,
  Car,
  BellRing,
  ExternalLink
} from 'lucide-react';

interface OfficerSummaryBarProps {
  assignedDistrict: string;
  assignedSector: string;
  criticalZonesCount: number;
  highRiskZonesCount: number;
  pendingVerificationsCount: number;
  verifiedHazardsCount: number;
  activeResponsesCount: number;
  affectedRoadsCount: number;
  onNavigateTab: (tab: 'RISK MAP' | 'FIELD REPORTS' | 'VERIFICATION' | 'RESPONSE') => void;
}

export const OfficerSummaryBar: React.FC<OfficerSummaryBarProps> = ({
  assignedDistrict,
  assignedSector,
  criticalZonesCount,
  highRiskZonesCount,
  pendingVerificationsCount,
  verifiedHazardsCount,
  activeResponsesCount,
  affectedRoadsCount,
  onNavigateTab,
}) => {
  return (
    <div className="bg-[#0B111D] border-b border-white/10 text-white">
      {/* Top Strip: Posting area & Live situation context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono-code">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>ASSIGNED POST:</span>
          </span>
          <span className="text-white font-semibold bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
            {assignedDistrict}
          </span>
          <span className="text-white/60 text-[11px] hidden sm:inline">
            Sector: <strong className="text-white/90">{assignedSector}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
            SITUATION: HIGH MONSOON SATURATION (89%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-code text-white/50">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/40" />
            <span>STATION TELEMETRY: 10:42 AM IST</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold">
            FIELD LINK ONLINE
          </span>
        </div>
      </div>

      {/* Metric Counters Strip: Operational situation at a glance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Critical Zones */}
          <button
            type="button"
            onClick={() => onNavigateTab('RISK MAP')}
            className="p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-red-300/80 mb-1">
              <span>CRITICAL ZONES</span>
              <ShieldAlert className="w-3 h-3 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-red-400">{criticalZonesCount}</span>
              <span className="text-[10px] font-mono-code text-red-300/60 uppercase">High Alert</span>
            </div>
          </button>

          {/* 2. High-Risk Zones */}
          <button
            type="button"
            onClick={() => onNavigateTab('RISK MAP')}
            className="p-2.5 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-amber-300/80 mb-1">
              <span>HIGH-RISK ZONES</span>
              <AlertTriangle className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-amber-400">{highRiskZonesCount}</span>
              <span className="text-[10px] font-mono-code text-amber-300/60 uppercase">Monitored</span>
            </div>
          </button>

          {/* 3. Pending Verification */}
          <button
            type="button"
            onClick={() => onNavigateTab('VERIFICATION')}
            className="p-2.5 rounded-xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/40 text-left transition-all group cursor-pointer ring-1 ring-blue-500/20"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-blue-300/90 mb-1">
              <span className="font-bold">PENDING VERIFICATION</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-blue-300">{pendingVerificationsCount}</span>
              <span className="text-[10px] font-mono-code text-blue-300/70 uppercase">Action Needed</span>
            </div>
          </button>

          {/* 4. Verified Hazards */}
          <button
            type="button"
            onClick={() => onNavigateTab('FIELD REPORTS')}
            className="p-2.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-emerald-300/80 mb-1">
              <span>VERIFIED HAZARDS</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-emerald-400">{verifiedHazardsCount}</span>
              <span className="text-[10px] font-mono-code text-emerald-300/60 uppercase">Confirmed</span>
            </div>
          </button>

          {/* 5. Active Response Requests */}
          <button
            type="button"
            onClick={() => onNavigateTab('RESPONSE')}
            className="p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-purple-300/80 mb-1">
              <span>ACTIVE RESPONSES</span>
              <Truck className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-purple-300">{activeResponsesCount}</span>
              <span className="text-[10px] font-mono-code text-purple-300/60 uppercase">In Progress</span>
            </div>
          </button>

          {/* 6. Affected Roads */}
          <button
            type="button"
            onClick={() => onNavigateTab('RISK MAP')}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] font-mono-code text-white/60 mb-1">
              <span>AFFECTED ROADS</span>
              <Car className="w-3 h-3 text-white/50 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono-code font-bold text-white">{affectedRoadsCount}</span>
              <span className="text-[10px] font-mono-code text-white/40 uppercase">Lifelines</span>
            </div>
          </button>
        </div>

        {/* Latest Alert Ticker */}
        <div className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code">
          <div className="flex items-center gap-2 text-amber-300">
            <BellRing className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold">LATEST DISASTER ADVISORY:</span>
            <span className="text-white/80 font-sans">
              NH-54 km 18.4 &amp; Durtlang Ridge (Sector A) under continuous monitoring. 184mm rainfall in past 24h.
            </span>
          </div>
          <span className="text-[10px] text-amber-400/70 shrink-0">
            DISPATCH REF: MZ-SDMA-2026-09
          </span>
        </div>
      </div>
    </div>
  );
};
