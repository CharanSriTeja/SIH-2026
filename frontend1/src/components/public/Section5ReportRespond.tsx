import React from 'react';
import { Eye, ShieldAlert, HeartHandshake, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface Section5ReportRespondProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Section5ReportRespond: React.FC<Section5ReportRespondProps> = ({
  onOpenAuth,
}) => {
  const workflowSteps = [
    {
      title: 'Citizen Ground Report',
      detail: 'Residents submit geo-tagged observations: visible slope cracks, tension fractures, or road damage with camera evidence.',
      icon: Eye,
      accent: 'text-[#B5551F]',
      badge: 'Step 01',
    },
    {
      title: 'Officer Field Verification',
      detail: 'Designated field officers inspect reported sites, validate ground displacement, and confirm threat ratings.',
      icon: UserCheck,
      accent: 'text-[#2E4A3D]',
      badge: 'Step 02',
    },
    {
      title: 'District Response Prioritization',
      detail: 'District administrators correlate verified incidents with live GIS risk polygons to mobilize Quick Response Teams.',
      icon: ShieldAlert,
      accent: 'text-[#B5551F]',
      badge: 'Step 03',
    },
    {
      title: 'Safe Evacuation & Protection',
      detail: 'Pre-emptive advisories and designated shelter routes guide vulnerable households to safety before slope failure occurs.',
      icon: HeartHandshake,
      accent: 'text-[#2E4A3D]',
      badge: 'Step 04',
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Shield className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 04 &bull; Field Verification &amp; Civil Protection
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Report, Respond &amp; Protect
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            Ground-truth reporting bridges artificial intelligence and actual community safety. Every citizen hazard upload is geo-referenced, jurisdictionally routed to the appropriate district magistrate, and validated by field response teams.
          </p>
        </div>

        {/* 4-Stage Visual Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="p-5 rounded-xl border border-[#DDD6C4] bg-[#FFFDF8] flex flex-col justify-between space-y-4 shadow-xs hover:border-[#2E4A3D]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#F6F3EC] border border-[#DDD6C4] flex items-center justify-center shadow-2xs">
                    <Icon className={`w-5 h-5 ${step.accent}`} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#55594C] bg-[#EDE8DE] px-2.5 py-0.5 rounded">
                    {step.badge}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-serif font-bold text-[#23261F]">
                    {step.title}
                  </div>
                  <p className="text-xs text-[#55594C] mt-1.5 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DDD6C4] flex items-center gap-1.5 text-xs font-sans font-medium text-[#7B8071]">
                  <span>Operational Pipeline</span>
                  <span className="text-[#2E4A3D] font-bold">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Linear Progression Sequence: ALERT -> RESPONSE -> EVACUATION / SAFETY */}
        <div className="rounded-xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-lg bg-[#FDF1EB] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#7B8071]">
                Disaster Response Progression
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-sans font-bold mt-0.5 flex-wrap">
                <span className="text-[#8A2418]">1. Threat Warning</span>
                <span className="text-[#DDD6C4]">&rarr;</span>
                <span className="text-[#C98A2C]">2. Officer Verification</span>
                <span className="text-[#DDD6C4]">&rarr;</span>
                <span className="text-[#2E4A3D]">3. Coordinated Evacuation</span>
              </div>
            </div>
          </div>

          {/* Access Platform Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={() => onOpenAuth('signin')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenAuth('register')}
            >
              Register Citizen Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
