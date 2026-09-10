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
    <div className="bg-[#FFFDF8] border-b border-earth-300 text-earth-900 shadow-sm">
      {/* Top Strip: Posting area & Live situation context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 border-b border-earth-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
          <span className="flex items-center gap-1.5 text-brand-700 font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-brand-700 animate-pulse" />
            <span>ASSIGNED POST:</span>
          </span>
          <span className="text-earth-900 font-semibold bg-earth-100 px-2.5 py-0.5 rounded border border-earth-300">
            {assignedDistrict}
          </span>
          <span className="text-earth-600 text-[11px] hidden sm:inline">
            Sector: <strong className="text-earth-900">{assignedSector}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
            SITUATION: HIGH MONSOON SATURATION (89%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-earth-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-earth-500" />
            <span>STATION TELEMETRY: 10:42 AM IST</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
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
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-900 font-semibold mb-1">
              <span>CRITICAL ZONES</span>
              <ShieldAlert className="w-3 h-3 text-rose-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-rose-800">{criticalZonesCount}</span>
              <span className="text-[10px] font-mono text-rose-700 uppercase">High Alert</span>
            </div>
          </button>

          {/* 2. High-Risk Zones */}
          <button
            type="button"
            onClick={() => onNavigateTab('RISK MAP')}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-900 font-semibold mb-1">
              <span>HIGH-RISK ZONES</span>
              <AlertTriangle className="w-3 h-3 text-amber-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-amber-800">{highRiskZonesCount}</span>
              <span className="text-[10px] font-mono text-amber-700 uppercase">Monitored</span>
            </div>
          </button>

          {/* 3. Pending Verification */}
          <button
            type="button"
            onClick={() => onNavigateTab('VERIFICATION')}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-blue-900 font-semibold mb-1">
              <span className="font-bold">PENDING VERIFY</span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-blue-800">{pendingVerificationsCount}</span>
              <span className="text-[10px] font-mono text-blue-700 uppercase">Action Needed</span>
            </div>
          </button>

          {/* 4. Verified Hazards */}
          <button
            type="button"
            onClick={() => onNavigateTab('FIELD REPORTS')}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-900 font-semibold mb-1">
              <span>VERIFIED HAZARDS</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-emerald-800">{verifiedHazardsCount}</span>
              <span className="text-[10px] font-mono text-emerald-700 uppercase">Confirmed</span>
            </div>
          </button>

          {/* 5. Active Response Requests */}
          <button
            type="button"
            onClick={() => onNavigateTab('RESPONSE')}
            className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-purple-900 font-semibold mb-1">
              <span>ACTIVE RESPONSES</span>
              <Truck className="w-3 h-3 text-purple-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-purple-800">{activeResponsesCount}</span>
              <span className="text-[10px] font-mono text-purple-700 uppercase">In Progress</span>
            </div>
          </button>

          {/* 6. Affected Roads */}
          <button
            type="button"
            onClick={() => onNavigateTab('RISK MAP')}
            className="p-2.5 rounded-xl bg-earth-100/80 hover:bg-earth-200/80 border border-earth-300 text-left transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-earth-800 font-semibold mb-1">
              <span>AFFECTED ROADS</span>
              <Car className="w-3 h-3 text-earth-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-bold text-earth-900">{affectedRoadsCount}</span>
              <span className="text-[10px] font-mono text-earth-600 uppercase">Lifelines</span>
            </div>
          </button>
        </div>

        {/* Latest Alert Ticker */}
        <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-900">
            <BellRing className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="font-bold">LATEST DISASTER ADVISORY:</span>
            <span className="text-earth-800 font-sans">
              NH-54 km 18.4 &amp; Durtlang Ridge (Sector A) under continuous monitoring. 184mm rainfall in past 24h.
            </span>
          </div>
          <span className="text-[10px] text-amber-800 font-semibold shrink-0">
            DISPATCH REF: MZ-SDMA-2026-09
          </span>
        </div>
      </div>
    </div>
  );
};
