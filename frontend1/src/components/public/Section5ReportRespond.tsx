import React from 'react';
import { Camera, ShieldAlert, HeartHandshake, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface Section5ReportRespondProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Section5ReportRespond: React.FC<Section5ReportRespondProps> = ({
  onOpenAuth,
}) => {
  const workflowSteps = [
    {
      title: 'Citizen Hazard Report',
      detail: 'Residents submit geotagged photos of ground tension cracks, rockfalls, or road subsidence.',
      icon: Camera,
      accent: 'text-[#B5551F]',
      step: '01',
    },
    {
      title: 'Officer Field Verification',
      detail: 'Assigned field officers inspect the reported site, validate displacement, and confirm threat ratings.',
      icon: UserCheck,
      accent: 'text-[#2E4A3D]',
      step: '02',
    },
    {
      title: 'District Action Coordination',
      detail: 'District Disaster Authorities review verified reports alongside live risk maps to mobilize response teams.',
      icon: ShieldAlert,
      accent: 'text-[#B5551F]',
      step: '03',
    },
    {
      title: 'Targeted Advisory & Evacuation',
      detail: 'Clear alerts and shelter routes guide vulnerable households to safety before slope failure occurs.',
      icon: HeartHandshake,
      accent: 'text-[#2E4A3D]',
      step: '04',
    },
  ];

  return (
    <section
      id="section-5"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col justify-center"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Shield className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 04 &bull; Community Reporting &amp; Field Response
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            Report, Respond &amp; Protect
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            Satellite data alone cannot capture every localized slope displacement. Citizen ground observations are geotagged, routed directly to the appropriate district administration, and verified on-site by field response officers.
          </p>
        </div>

        {/* 4-Step Operational Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-[#DDD6C4] bg-[#FFFDF8] flex flex-col justify-between space-y-4 shadow-xs hover:border-[#2E4A3D]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F6F3EC] border border-[#DDD6C4] flex items-center justify-center shadow-2xs">
                    <Icon className={`w-5 h-5 ${item.accent}`} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#55594C] bg-[#EDE8DE] px-2.5 py-0.5 rounded-md">
                    Step {item.step}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-serif font-bold text-[#23261F]">
                    {item.title}
                  </div>
                  <p className="text-xs text-[#55594C] mt-1.5 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DDD6C4] flex items-center gap-1.5 text-xs font-sans font-medium text-[#7B8071]">
                  <span>Operational Step</span>
                  <span className="text-[#2E4A3D] font-bold">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Linear Progression Sequence: ALERT -> VERIFICATION -> RESPONSE */}
        <div className="rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-[#FDF1EB] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#7B8071]">
                End-to-End Civil Protection Loop
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-sans font-bold mt-1 flex-wrap">
                <span className="text-[#8A2418]">1. Risk Detection</span>
                <span className="text-[#DDD6C4]">&rarr;</span>
                <span className="text-[#C98A2C]">2. Citizen Report &amp; Verification</span>
                <span className="text-[#DDD6C4]">&rarr;</span>
                <span className="text-[#2E4A3D]">3. Coordinated District Response</span>
              </div>
            </div>
          </div>

          {/* Access Platform Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
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
