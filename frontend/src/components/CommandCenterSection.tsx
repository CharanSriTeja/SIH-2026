import React from 'react';
import { ArrowRight, ShieldAlert, Users, Radio, Compass } from 'lucide-react';

interface CommandCenterSectionProps {
  onEnterCommandCenter: () => void;
}

export const CommandCenterSection: React.FC<CommandCenterSectionProps> = ({
  onEnterCommandCenter,
}) => {
  const previewMetrics = [
    {
      value: '12',
      label: 'ACTIVE RISK ZONES',
      desc: 'Monitored across Barail & Patkai highlands',
      icon: ShieldAlert,
      color: 'text-red-400',
    },
    {
      value: '08',
      label: 'COMMUNITIES AT RISK',
      desc: 'Highland hill villages & transit corridors',
      icon: Compass,
      color: 'text-amber-400',
    },
    {
      value: '2,481',
      label: 'PEOPLE MONITORED',
      desc: 'Demographic cadastral census correlation',
      icon: Users,
      color: 'text-white',
    },
    {
      value: '06',
      label: 'ACTIVE ALERTS',
      desc: 'Live CAP bulletins broadcast to registered devices',
      icon: Radio,
      color: 'text-emerald-400',
    },
  ];

  return (
    <section
      id="section-command"
      className="relative min-h-screen lg:h-screen lg:max-h-[1080px] flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      <div className="glass-panel rounded-3xl border border-white/20 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-left my-auto">
        {/* Background Radar Ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Label */}
        <div className="flex items-center gap-2 mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/50">
          <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
          <span>08 / COMMAND CENTER</span>
        </div>

        {/* Main Headline: 2 lines */}
        <h2 className="text-[clamp(2.2rem,3.8vw,3.6rem)] font-extrabold uppercase tracking-tight text-white font-heading leading-[1.05] mb-4 max-w-3xl">
          SEE THE RISK.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
            BEFORE IT BECOMES A CRISIS.
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed max-w-xl mb-6">
          A unified intelligence interface for monitoring landslide risk, affected
          communities, warnings, and evacuation readiness in real-time.
        </p>

        {/* Dashboard Preview Metrics Grid: Compact cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {previewMetrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono-code uppercase tracking-wider text-white/40">
                    METRIC
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-0.5">
                  {item.value}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono-code text-white block mb-1">
                  {item.label}
                </span>
                <p className="text-[10px] text-white/50 leading-tight line-clamp-2">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive CTA to enter the Actual Application Dashboard */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2.5 text-xs font-mono-code text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
            <span>INCIDENT COMMAND TELEMETRY // SYNCHRONIZED</span>
          </div>

          <button
            onClick={onEnterCommandCenter}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white bg-white text-black hover:bg-emerald-400 hover:border-emerald-400 font-extrabold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.15)] group active:scale-95"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
