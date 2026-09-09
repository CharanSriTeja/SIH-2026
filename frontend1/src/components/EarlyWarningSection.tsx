import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, MessageSquare, Smartphone, Globe, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface EarlyWarningSectionProps {
  onViewAffectedArea?: () => void;
}

export const EarlyWarningSection: React.FC<EarlyWarningSectionProps> = ({
  onViewAffectedArea,
}) => {
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [activeTab, setActiveTab] = useState<'SMS' | 'APP' | 'WEB'>('SMS');

  const handleSendAlert = () => {
    setAlertDispatched(true);
    setTimeout(() => setAlertDispatched(false), 5000);
  };

  return (
    <section
      id="section-alerts"
      className="relative min-h-screen lg:min-h-0 lg:h-screen py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10 flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full space-y-3.5 sm:space-y-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-left border-b border-white/10 pb-2.5">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                05 / EARLY WARNING
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              THE RIGHT WARNING. <span className="text-amber-400">TO THE RIGHT PEOPLE.</span>
            </h2>

            <p className="text-xs text-slate-300 leading-normal font-normal">
              When high-risk sectors are detected, BHURAKSHA 2.0 empowers authorities to dispatch geo-targeted, multi-channel warnings across SMS gateways, mobile push, and web alerts.
            </p>
          </div>

          <div className="text-[10px] font-mono-code text-slate-400 shrink-0">
            TARGETING:{' '}
            <span className="text-amber-300 font-bold uppercase">
              REGISTERED USERS &bull; GEOFENCED POPULATION
            </span>
          </div>
        </div>

        {/* Premium Emergency Alert Interface */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] p-4 sm:p-5 space-y-3.5 shadow-2xl">
          {/* Top Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold font-heading uppercase tracking-wider text-white">
                  EMERGENCY BROADCAST CONTROLLER
                </span>
                <span className="block text-[9.5px] font-mono-code text-white/50 uppercase">
                  COMMON ALERTING PROTOCOL (CAP INDIA V1.2) READY
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-mono-code uppercase text-white/50">CHANNELS:</span>
              {(['SMS', 'APP', 'WEB'] as const).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setActiveTab(channel)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase transition-all cursor-pointer border ${
                    activeTab === channel
                      ? 'bg-amber-400 text-black border-amber-400 shadow'
                      : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Core Alert Parameters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-left">
            {/* 1. Threat Type */}
            <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/[0.08] space-y-0.5">
              <div className="text-[9px] font-mono-code uppercase text-red-300 tracking-wider">
                THREAT SEVERITY
              </div>
              <div className="text-base sm:text-lg font-bold font-heading text-red-400 uppercase">
                HIGH RISK
              </div>
              <div className="text-[9px] font-mono-code text-red-300/80">
                IMMINENT DEFORMATION
              </div>
            </div>

            {/* 2. Area */}
            <div className="p-2.5 rounded-lg border border-white/10 bg-[#080C14] space-y-0.5">
              <div className="text-[9px] font-mono-code uppercase text-white/40 tracking-wider">
                TARGET GEOFENCE
              </div>
              <div className="text-base sm:text-lg font-bold font-heading text-white uppercase">
                SECTOR A
              </div>
              <div className="text-[9px] font-mono-code text-white/50 truncate">
                DURTLANG RIDGE CORRIDOR
              </div>
            </div>

            {/* 3. Risk Score */}
            <div className="p-2.5 rounded-lg border border-white/10 bg-[#080C14] space-y-0.5">
              <div className="text-[9px] font-mono-code uppercase text-white/40 tracking-wider">
                RISK PROBABILITY
              </div>
              <div className="text-base sm:text-lg font-extrabold font-heading text-amber-400">
                82%
              </div>
              <div className="text-[9px] font-mono-code text-amber-400/70">
                ESCALATING SOIL STRAIN
              </div>
            </div>

            {/* 4. Registered Recipients & Alert Status */}
            <div className="p-2.5 rounded-lg border border-white/10 bg-[#080C14] space-y-0.5">
              <div className="text-[9px] font-mono-code uppercase text-white/40 tracking-wider">
                RECIPIENTS IN SECTOR
              </div>
              <div className="text-base sm:text-lg font-extrabold font-heading text-emerald-400">
                247 USERS
              </div>
              <div className="text-[9px] font-mono-code text-emerald-400/80 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>BROADCAST: READY</span>
              </div>
            </div>
          </div>

          {/* SMS / App Notification Live Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
            {/* Phone/Device Simulator Box */}
            <div className="lg:col-span-8 rounded-lg border border-white/15 bg-[#080C14] p-3.5 sm:p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs font-mono-code text-white/70">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>PREVIEW: {activeTab} BROADCAST DISPATCH</span>
                </div>
                <span className="text-[9px] font-mono-code uppercase text-white/40">
                  SENDER: GOV-NDMA-BHURAKSHA
                </span>
              </div>

              {/* SMS Notification Content */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>CRITICAL LANDSLIDE WARNING &bull; IMMEDIATE CAUTION</span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed font-sans">
                  High landslide risk detected in Sector A. Substantial slope displacement and rainfall thresholds exceeded.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Residents advised to evacuate perimeter slopes toward Community Relief Centre (2.4 km away).
                </p>
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code text-white/50">
                  <span>EVAC ROUTE: NORTH ACCESS VIA NH-10</span>
                  <span>HELPLINE: 1077 / 112</span>
                </div>
              </div>

              {/* Targeting note */}
              <div className="text-[9.5px] font-mono-code text-slate-400 italic">
                * Broadcast dispatched exclusively to registered residents and active mobile nodes inside Sector A polygon.
              </div>
            </div>

            {/* Action Buttons Panel */}
            <div className="lg:col-span-4 flex flex-col gap-2 justify-center">
              {alertDispatched ? (
                <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono-code uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ALERTS TRANSMITTED!</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Dispatched 247 SMS &amp; App notifications across Sector A registry.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSendAlert}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT EMERGENCY ALERT</span>
                </button>
              )}

              <button
                onClick={() => {
                  const el = document.getElementById('section-risk-map');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  onViewAffectedArea?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] text-white font-mono-code font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>INSPECT HAZARD ZONE</span>
                <ArrowRight className="w-3 h-3 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
