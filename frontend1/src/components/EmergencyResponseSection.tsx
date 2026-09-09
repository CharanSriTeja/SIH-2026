import React from 'react';
import { Truck, Navigation, Shield, CheckCircle, AlertTriangle, XCircle, ArrowDown, MapPin, Users, Building, Activity } from 'lucide-react';

export const EmergencyResponseSection: React.FC = () => {
  return (
    <section
      id="section-response"
      className="relative min-h-screen lg:min-h-0 lg:h-screen py-3.5 lg:py-4 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10 flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full space-y-2 sm:space-y-2.5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 text-left border-b border-white/10 pb-2">
          <div className="space-y-0.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                06 / RESPONSE INTELLIGENCE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              FROM WARNING <span className="text-amber-400">TO ACTION.</span>
            </h2>

            <p className="text-[11px] text-slate-300 leading-normal font-normal">
              BHURAKSHA 2.0 empowers incident commanders to prioritize vulnerable settlements, track critical road corridors, and route communities to designated safe shelters.
            </p>
          </div>

          {/* Four Response Priorities Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-left shrink-0">
            <div className="px-2 py-1 rounded bg-[#0C121E] border border-white/10 text-[9px] font-mono-code">
              <span className="text-amber-400 font-bold block text-[8px]">01 POPULATION</span>
              <span className="text-white font-semibold uppercase">Rapid Alert</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#0C121E] border border-white/10 text-[9px] font-mono-code">
              <span className="text-amber-400 font-bold block text-[8px]">02 ROADWAYS</span>
              <span className="text-white font-semibold uppercase">Lifeline Guard</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#0C121E] border border-white/10 text-[9px] font-mono-code">
              <span className="text-amber-400 font-bold block text-[8px]">03 CRITICAL</span>
              <span className="text-white font-semibold uppercase">Power &amp; Aid</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#0C121E] border border-white/10 text-[9px] font-mono-code">
              <span className="text-amber-400 font-bold block text-[8px]">04 EVACUATION</span>
              <span className="text-white font-semibold uppercase">Shelter Routing</span>
            </div>
          </div>
        </div>

        {/* Large Emergency Response Dashboard */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E] p-3 sm:p-3.5 space-y-2.5 shadow-2xl">
          {/* Top EOC Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-white">
                  EMERGENCY OPERATIONS CENTER (EOC)
                </span>
                <span className="hidden sm:inline-block ml-2 text-[9px] font-mono-code text-white/50 uppercase">
                  ROAD NETWORK &amp; EVACUATION PROTOCOL
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-mono-code uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>INCIDENT COMMAND ACTIVE</span>
            </div>
          </div>

          {/* Core Grid: Left (Road Connectivity) & Right (Evacuation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
            {/* LEFT SIDE: ROAD CONNECTIVITY */}
            <div className="lg:col-span-6 rounded-lg border border-white/10 bg-[#080C14] p-2.5 sm:p-3 space-y-2 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>ROAD CONNECTIVITY MONITOR</span>
                </div>
                <span className="text-[9px] font-mono-code text-white/50 uppercase">
                  3 SECTORS TRACKED
                </span>
              </div>

              {/* Road Status Cards */}
              <div className="space-y-1.5">
                {/* 1. NH-10 AT RISK */}
                <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-white uppercase">
                      NH-10 ARTERIAL HIGHWAY
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono-code font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>AT RISK</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-normal">
                    Increased debris fall risk along Teesta corridor. PWD patrol deployed with earthmovers on standby.
                  </div>
                </div>

                {/* 2. ROAD R-204 BLOCKED */}
                <div className="p-2 rounded-lg border border-red-500/30 bg-red-500/[0.08] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-white uppercase">
                      LINK ROAD R-204
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono-code font-bold uppercase flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5" />
                      <span>BLOCKED</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-normal">
                    Active mudflow and tension scarp at KM 14. Traffic halted. Divert emergency transit to Road V-18.
                  </div>
                </div>

                {/* 3. VILLAGE ROAD V-18 OPEN */}
                <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-white uppercase">
                      VILLAGE ROAD V-18 (BYPASS)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono-code font-bold uppercase flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>OPEN</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-normal">
                    Designated primary bypass and safe evacuation corridor. Clear passage to Community Relief Centre.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: EVACUATION */}
            <div className="lg:col-span-6 rounded-lg border border-white/10 bg-[#080C14] p-2.5 sm:p-3 space-y-2 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SAFE EVACUATION ROUTING</span>
                  </div>
                  <span className="text-[9px] font-mono-code text-white/50 uppercase">
                    CORRIDOR #01
                  </span>
                </div>

                {/* Flow: RISK ZONE SECTOR A -> RECOMMENDED ROUTE -> COMMUNITY RELIEF CENTRE */}
                <div className="space-y-1.5">
                  <div className="p-2 rounded-md border border-red-500/30 bg-red-500/10 flex items-center justify-between">
                    <div className="text-[11px] font-mono-code text-red-300 uppercase font-bold">
                      RISK ZONE: SECTOR A
                    </div>
                    <span className="text-[9px] font-mono-code text-white/50 uppercase">
                      ORIGIN
                    </span>
                  </div>

                  <div className="flex justify-center items-center py-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-mono-code text-amber-400">
                      <ArrowDown className="w-3 h-3 animate-bounce" />
                      <span className="uppercase font-bold tracking-wider">
                        RECOMMENDED ROUTE (VIA ROAD V-18)
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                    <div className="text-[11px] font-mono-code text-emerald-300 uppercase font-bold">
                      COMMUNITY RELIEF CENTRE
                    </div>
                    <span className="text-[9px] font-mono-code text-emerald-400 uppercase font-bold">
                      SAFE DESTINATION
                    </span>
                  </div>
                </div>

                {/* Shelter Details Grid (4 cols) */}
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  <div className="p-1.5 rounded bg-white/[0.02] border border-white/10">
                    <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">DISTANCE</span>
                    <span className="text-sm font-bold font-heading text-white">2.4 KM</span>
                  </div>

                  <div className="p-1.5 rounded bg-white/[0.02] border border-white/10">
                    <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">CAPACITY</span>
                    <span className="text-sm font-bold font-heading text-white">500</span>
                  </div>

                  <div className="p-1.5 rounded bg-white/[0.02] border border-white/10">
                    <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">OCCUPIED</span>
                    <span className="text-sm font-bold font-heading text-amber-400">183</span>
                  </div>

                  <div className="p-1.5 rounded bg-white/[0.02] border border-white/10">
                    <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">VACANCY</span>
                    <span className="text-sm font-bold font-heading text-emerald-400">317</span>
                  </div>
                </div>
              </div>

              {/* Shelter amenities */}
              <div className="pt-1.5 border-t border-white/10 text-[9.5px] font-mono-code text-slate-400 flex items-center justify-between">
                <span>AMENITIES: WATER, BACKUP POWER, PHC FIRST AID</span>
                <span className="text-emerald-400 font-bold uppercase">READY FOR INTAKE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
