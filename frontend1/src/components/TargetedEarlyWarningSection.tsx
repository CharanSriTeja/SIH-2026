import React, { useState } from 'react';
import { Send, CheckCircle2, BellRing, Smartphone, ShieldCheck } from 'lucide-react';

export const TargetedEarlyWarningSection: React.FC = () => {
  const [dispatchStatus, setDispatchStatus] = useState<'ready' | 'dispatching' | 'dispatched'>('ready');
  const [sentCount, setSentCount] = useState(0);

  const handleSimulateDispatch = () => {
    if (dispatchStatus === 'dispatching') return;
    setDispatchStatus('dispatching');
    setSentCount(0);

    const interval = setInterval(() => {
      setSentCount((prev) => {
        if (prev >= 247) {
          clearInterval(interval);
          setDispatchStatus('dispatched');
          return 247;
        }
        return prev + Math.floor(Math.random() * 35) + 20;
      });
    }, 100);
  };

  return (
    <section
      id="section-alerts"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Focused Narrative & Simulation Trigger (approx 45% width) */}
        <div className="lg:col-span-5 text-left max-w-[540px]">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
            <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
            <span>05 / TARGETED WARNING</span>
          </div>

          {/* Headline */}
          <h2 className="text-[clamp(2.3rem,4vw,3.8rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-5">
            THE RIGHT WARNING.
            <br />
            TO THE RIGHT PEOPLE.
          </h2>

          {/* Short 2-3 line explanation */}
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-6">
            Rather than generic alarms that create complacency, LandSentry dispatches location-specific
            guidance directly to registered recipients inside the identified hazard sector.
          </p>

          {/* Dispatch Simulation CTA Button */}
          <button
            onClick={handleSimulateDispatch}
            disabled={dispatchStatus === 'dispatching'}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white bg-white text-black hover:bg-emerald-400 hover:border-emerald-400 font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg disabled:opacity-75"
          >
            {dispatchStatus === 'ready' && (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>SIMULATE BROADCAST (247 RECIPIENTS)</span>
              </>
            )}
            {dispatchStatus === 'dispatching' && (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>DISPATCHING ({Math.min(sentCount, 247)}/247)...</span>
              </>
            )}
            {dispatchStatus === 'dispatched' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                <span>ALL 247 RECIPIENTS REACHED</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Large but Compact Notification Card with SMS Preview (approx 45% width) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md glass-panel rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl text-left">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: High Landslide Risk & Sector A */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping-slow" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono-code block">
                    HIGH LANDSLIDE RISK
                  </span>
                  <span className="text-[10px] font-mono-code text-white/50 uppercase">
                    SECTOR A // CELL BROADCAST
                  </span>
                </div>
              </div>
              <span className="text-[9.5px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/70">
                CAP V1.2
              </span>
            </div>

            {/* Compact Metric Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[9.5px] font-mono-code uppercase text-white/40 block mb-0.5">
                  PEOPLE IDENTIFIED
                </span>
                <span className="text-base font-extrabold font-heading text-white">
                  312 Residents
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[9.5px] font-mono-code uppercase text-white/40 block mb-0.5">
                  REGISTERED RECIPIENTS
                </span>
                <span className="text-base font-extrabold font-heading text-emerald-400">
                  247 Devices
                </span>
              </div>
            </div>

            {/* SMS Preview Card */}
            <div className="rounded-2xl border-l-4 border-l-red-500 border border-white/15 bg-white/[0.03] p-4 text-left shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-red-400">
                  <BellRing className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider">
                    LANDSLIDE WARNING
                  </span>
                </div>
                <span className="text-[9px] font-mono-code text-white/40">JUST NOW</span>
              </div>

              <p className="text-xs text-white/90 leading-relaxed font-sans mb-1.5">
                High landslide risk has been detected in your area.
              </p>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-3">
                Please follow the recommended safety guidance and move toward the designated safe location.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code">
                <span className="text-emerald-400 font-bold uppercase">
                  SHELTER: ZEMABAUK (2.4 KM)
                </span>
                <span className="text-white/40">DISASTER MGMT</span>
              </div>
            </div>

            {/* Footer Geotag Confirmation */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[9.5px] font-mono-code text-white/40">
              <span>GEOFENCE STATUS</span>
              <span className="text-emerald-400/90 font-semibold">CELL-ID GEOFENCE ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
