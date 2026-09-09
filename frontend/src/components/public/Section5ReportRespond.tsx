import React from 'react';
import { Eye, CheckCircle2, ShieldAlert, HeartHandshake, ArrowRight, ArrowDown, Shield, UserCheck, AlertTriangle } from 'lucide-react';

interface Section5ReportRespondProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Section5ReportRespond: React.FC<Section5ReportRespondProps> = ({
  onOpenAuth,
}) => {
  const workflowSteps = [
    {
      title: 'GROUND REPORT',
      detail: 'Citizens and field staff submit geo-tagged observations: visible slope cracks, erosion, water seepage, or road subsidence with photos.',
      icon: Eye,
      accent: 'text-amber-400',
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'OFFICER VERIFICATION',
      detail: 'Authorized field officers inspect reported sites, validate ground evidence, and update structural severity ratings.',
      icon: UserCheck,
      accent: 'text-blue-400',
      border: 'border-blue-500/25',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'RESPONSE PRIORITIZATION',
      detail: 'Command authorities correlate verified incidents with AI risk polygons to dispatch emergency teams and clear transit lifelines.',
      icon: ShieldAlert,
      accent: 'text-orange-400',
      border: 'border-orange-500/25',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'SAFETY / EVACUATION',
      detail: 'Pre-emptive evacuation notices and designated safe shelter routes protect vulnerable community members before failure occurs.',
      icon: HeartHandshake,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/25',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section
      id="section-5"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-7">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em]">
              05 // GROUND OBSERVATIONS &amp; RESPONSE
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading uppercase tracking-tight">
            REPORT, RESPOND &amp; PROTECT
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Citizens and field personnel can provide geo-tagged ground observations such as visible cracks, erosion, water seepage or road damage.
            These reports provide supporting ground evidence and are reviewed by authorized field officers to coordinate rapid response and evacuation.
          </p>
        </div>

        {/* 4-Stage Visual Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`p-4 rounded-2xl border ${step.border} ${step.bg} backdrop-blur-xl flex flex-col justify-between space-y-3 shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${step.accent}`} />
                  </div>
                  <span className="text-[10px] font-mono-code text-white/40 font-bold">
                    STAGE 0{idx + 1}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-mono-code font-bold text-white uppercase tracking-wider">
                    {step.title}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[9px] font-mono-code text-white/40 uppercase">
                  <span>DISASTER PIPELINE</span>
                  {idx < workflowSteps.length - 1 ? (
                    <span className="text-amber-400">&rarr;</span>
                  ) : (
                    <span className="text-emerald-400">&bull; SAFE</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Linear Progression Sequence: ALERT -> RESPONSE -> EVACUATION / SAFETY */}
        <div className="rounded-xl border border-white/15 bg-[#0C121E]/80 backdrop-blur-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-white/50">
                LIFECYCLE SEQUENCE
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono-code font-bold mt-0.5 flex-wrap">
                <span className="text-red-400">ALERT</span>
                <span className="text-white/30">&rarr;</span>
                <span className="text-amber-400">RESPONSE</span>
                <span className="text-white/30">&rarr;</span>
                <span className="text-emerald-400">EVACUATION / SAFETY</span>
              </div>
            </div>
          </div>

          {/* Access Platform Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-4 py-2 text-xs font-mono-code font-semibold tracking-wider text-white/80 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer uppercase border border-white/15"
            >
              SIGN IN
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-xs font-mono-code font-bold tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer uppercase shadow-lg shadow-emerald-500/20"
            >
              REGISTER
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
