import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  FileCheck,
  ShieldCheck,
  Eye,
  Sliders,
  Check,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface FieldReportingSectionProps {
  onOpenReportModal?: () => void;
}

export const FieldReportingSection: React.FC<FieldReportingSectionProps> = ({
  onOpenReportModal,
}) => {
  // Officer review interactive status state
  const [officerStatus, setOfficerStatus] = useState<
    'PENDING' | 'VERIFIED' | 'INVESTIGATING' | 'REJECTED'
  >('PENDING');

  // Interactive submit state for Left card
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleSubmitReport = () => {
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 4000);
  };

  return (
    <section
      id="section-field-reports"
      className="relative min-h-screen lg:min-h-0 lg:h-screen py-3.5 lg:py-4 px-4 sm:px-6 lg:px-8 bg-[#080C14] border-t border-white/10 flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full space-y-2.5 sm:space-y-3">
        {/* Section Header: Eyebrow, Headline, Short Description */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2.5 border-b border-white/10 pb-2">
          <div className="space-y-0.5 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-white/70">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-[0.2em]">
                04 / GROUND INTELLIGENCE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading uppercase leading-tight">
              THE GROUND <span className="text-amber-400">CAN REPORT BACK.</span>
            </h2>

            <p className="text-[11px] text-slate-300 leading-normal font-normal">
              Citizens and field teams submit geo-tagged observations of fissures, seepage, erosion, or rockfall to provide ground verification supporting the predictive model.
            </p>
          </div>

          {/* Compact Workflow Pill Strip */}
          <div className="shrink-0 flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/10 text-[9px] font-mono-code text-white/70 overflow-x-auto no-scrollbar">
            <span className="px-1 py-0.5 rounded bg-white/5 text-white">OBSERVE</span>
            <span className="text-amber-400">&rarr;</span>
            <span className="px-1 py-0.5 rounded bg-white/5 text-white">GEO-TAG</span>
            <span className="text-amber-400">&rarr;</span>
            <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              AI SCAN
            </span>
            <span className="text-amber-400">&rarr;</span>
            <span className="px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              VERIFY
            </span>
            <span className="text-amber-400">&rarr;</span>
            <span className="px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              UPDATE RISK
            </span>
          </div>
        </div>

        {/* Balanced Two-Column Composition (Left: Submission | Right: Analysis & Officer Verification) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3.5 items-stretch">
          {/* ================================================== */}
          {/* LEFT COLUMN: FIELD REPORT SUBMISSION (5 cols)      */}
          {/* ================================================== */}
          <div className="lg:col-span-5 rounded-xl border border-white/15 bg-[#0C121E] p-3 sm:p-3.5 flex flex-col justify-between text-left shadow-xl space-y-2">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-white">
                      NEW FIELD REPORT
                    </h3>
                    <span className="block text-[8.5px] font-mono-code text-white/50 uppercase">
                      CITIZEN &amp; PATROL UPLINK
                    </span>
                  </div>
                </div>
                <span className="text-[8.5px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 font-bold">
                  GPS LOCKED
                </span>
              </div>

              {/* Data Points Grid (2x2) */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono-code">
                {/* Report Type */}
                <div className="p-1.5 rounded-lg bg-[#080C14] border border-white/10">
                  <span className="text-[8.5px] uppercase tracking-wider text-white/40 block">
                    REPORT TYPE
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 uppercase">
                    Ground Crack
                  </span>
                </div>

                {/* Severity */}
                <div className="p-1.5 rounded-lg bg-[#080C14] border border-white/10">
                  <span className="text-[8.5px] uppercase tracking-wider text-white/40 block">
                    SEVERITY
                  </span>
                  <span className="text-[11px] font-bold text-red-400 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    HIGH
                  </span>
                </div>

                {/* Location */}
                <div className="p-1.5 rounded-lg bg-[#080C14] border border-white/10">
                  <span className="text-[8.5px] uppercase tracking-wider text-white/40 block">
                    COORDINATES
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    23°43&apos;42&quot;N 92°43&apos;18&quot;E
                  </span>
                </div>

                {/* Time */}
                <div className="p-1.5 rounded-lg bg-[#080C14] border border-white/10">
                  <span className="text-[8.5px] uppercase tracking-wider text-white/40 block">
                    TIMESTAMP
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-white/60" />
                    14:32 IST (LIVE)
                  </span>
                </div>
              </div>

              {/* Uploaded Field Photograph Preview Area */}
              <div className="p-2 rounded-lg bg-[#080C14] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[8.5px] font-mono-code uppercase text-white/50">
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <FileCheck className="w-2.5 h-2.5" />
                    EVIDENCE: IMG_2048.JPG
                  </span>
                  <span className="italic text-slate-300 truncate max-w-[160px]">&ldquo;Cracking near road edge&rdquo;</span>
                </div>

                {/* SVG Visual Representation of Field Photo */}
                <div className="relative h-20 sm:h-24 w-full rounded bg-[#050810] border border-white/15 overflow-hidden flex items-center justify-center">
                  <svg
                    viewBox="0 0 300 110"
                    className="w-full h-full object-cover"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Simulated Mountain Slope Texture */}
                    <rect width="300" height="110" fill="#141B26" />
                    <path
                      d="M 0 40 Q 80 30 150 50 T 300 35 L 300 110 L 0 110 Z"
                      fill="#1E293B"
                    />
                    {/* Road Edge Strip */}
                    <path
                      d="M 0 70 Q 120 65 300 80 L 300 110 L 0 110 Z"
                      fill="#0F172A"
                    />
                    {/* Tension Ground Crack Line */}
                    <path
                      d="M 70 55 L 105 67 L 140 61 L 180 79 L 225 75 L 250 95"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Secondary Splinters */}
                    <path
                      d="M 140 61 L 155 49 M 180 79 L 175 95 M 105 67 L 95 80"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Camera Bounding Box from AI Vision */}
                    <rect
                      x="60"
                      y="45"
                      width="200"
                      height="50"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <text
                      x="66"
                      y="40"
                      fill="#10B981"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      AI: TENSION FISSURE
                    </text>
                  </svg>

                  {/* Stamp Overlay */}
                  <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-mono-code text-white/70 bg-black/60 px-1.5 py-0.5 rounded">
                    <span>GPS: 23.728°N, 92.721°E</span>
                    <span>14:32:08 IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-1 pt-1 border-t border-white/10">
              {reportSubmitted ? (
                <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono-code font-bold uppercase flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>REPORT SUBMITTED // DISPATCHED</span>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleSubmitReport}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow"
                  >
                    <span>SUBMIT FIELD REPORT &rarr;</span>
                  </button>
                  {onOpenReportModal && (
                    <button
                      onClick={onOpenReportModal}
                      className="px-2 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono-code text-[10px] uppercase transition-colors"
                    >
                      FULL FORM
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================================================== */}
          {/* RIGHT COLUMN: AI-ASSISTED ANALYSIS + OFFICER (7 cols) */}
          {/* ================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-2">
            {/* Upper Card: Report Header + AI-Assisted Visual Analysis */}
            <div className="rounded-xl border border-white/15 bg-[#0C121E] p-2.5 sm:p-3 text-left space-y-2 shadow-xl">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold font-mono-code text-white">
                    FIELD REPORT #BR-2048
                  </span>
                  <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                    SECTOR A
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono-code font-bold uppercase px-2 py-0.5 rounded border ${
                    officerStatus === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : officerStatus === 'INVESTIGATING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : officerStatus === 'REJECTED'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-white/5 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}
                >
                  {officerStatus === 'PENDING' ? 'PENDING VERIFICATION' : officerStatus}
                </span>
              </div>

              {/* Visual Evidence Analysis */}
              <div className="space-y-1.5">
                {/* Primary AI Indicator & Confidence */}
                <div className="grid grid-cols-2 gap-1.5 text-left">
                  <div className="p-1.5 rounded-lg bg-[#080C14] border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                        INDICATOR
                      </span>
                      <span className="text-[11px] font-bold font-mono-code text-amber-300 uppercase">
                        GROUND CRACK
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-code text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                      DETECTED
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#080C14] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-mono-code uppercase text-white/40 block">
                        AI CONFIDENCE
                      </span>
                      <span className="text-[11px] font-bold font-mono-code text-emerald-400 uppercase">
                        86%
                      </span>
                    </div>
                    <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>
                </div>

                {/* Observations Strip */}
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono-code">
                  <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                    <span className="text-white/40 block text-[8px] uppercase">WATER SEEPAGE</span>
                    <span className="font-semibold text-slate-300">NONE</span>
                  </div>

                  <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                    <span className="text-white/40 block text-[8px] uppercase">ROCKFALL</span>
                    <span className="font-semibold text-slate-300">NONE</span>
                  </div>

                  <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                    <span className="text-white/40 block text-[8px] uppercase">ROAD DAMAGE</span>
                    <span className="font-bold text-amber-400">POSSIBLE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Card: Officer Verification Panel */}
            <div className="rounded-xl border border-blue-500/30 bg-[#0C121E] p-2.5 text-left space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-white">
                    OFFICER REVIEW
                  </span>
                </div>
                <div className="text-[9px] font-mono-code text-blue-300 font-bold uppercase">
                  AI ASSISTS &bull; OFFICER VALIDATES
                </div>
              </div>

              {/* Review Summary Row */}
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono-code">
                <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                  <span className="text-[8px] text-white/40 uppercase block">AI DETECT</span>
                  <span className="font-bold text-amber-300 truncate block">Ground crack</span>
                </div>
                <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                  <span className="text-[8px] text-white/40 uppercase block">ZONE</span>
                  <span className="font-bold text-white block">Sector A</span>
                </div>
                <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                  <span className="text-[8px] text-white/40 uppercase block">ENV. RISK</span>
                  <span className="font-bold text-red-400 block">68% HIGH</span>
                </div>
                <div className="p-1.5 rounded bg-[#080C14] border border-white/10">
                  <span className="text-[8px] text-white/40 uppercase block">REPORTS</span>
                  <span className="font-bold text-blue-300 block">03 ACTIVE</span>
                </div>
              </div>

              {/* Three Interactive Officer Actions */}
              <div className="flex gap-1.5 pt-0.5">
                <button
                  onClick={() => setOfficerStatus('VERIFIED')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono-code font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                    officerStatus === 'VERIFIED'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>VERIFY</span>
                </button>

                <button
                  onClick={() => setOfficerStatus('INVESTIGATING')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono-code font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                    officerStatus === 'INVESTIGATING'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>INVESTIGATE</span>
                </button>

                <button
                  onClick={() => setOfficerStatus('REJECTED')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono-code font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                    officerStatus === 'REJECTED'
                      ? 'bg-red-500 text-white border-red-400 shadow-md'
                      : 'bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-300 border-white/10'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  <span>REJECT</span>
                </button>
              </div>
            </div>

            {/* Lower Row: Integrity & Recent Reports */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-left">
              {/* Report Integrity (5 cols) */}
              <div className="md:col-span-5 p-2 rounded-lg bg-[#0C121E] border border-white/10 space-y-1">
                <span className="text-[8.5px] font-mono-code uppercase tracking-wider text-white/50 block">
                  INTEGRITY CHECKS
                </span>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono-code">
                  <div className="flex items-center justify-between text-white/70">
                    <span>IMG:</span>
                    <span className="text-emerald-400">PASSED</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>GPS:</span>
                    <span className="text-emerald-400">RECORDED</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>TIME:</span>
                    <span className="text-emerald-400">SYNCED</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>DUP:</span>
                    <span className="text-emerald-400">CLEAR</span>
                  </div>
                </div>
              </div>

              {/* Timeline (7 cols) */}
              <div className="md:col-span-7 p-2 rounded-lg bg-[#0C121E] border border-white/10 space-y-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-0.5">
                  <span className="text-[8.5px] font-mono-code uppercase tracking-wider text-white/50">
                    SECTOR A REPORTS
                  </span>
                  <span className="text-[8.5px] font-mono-code text-amber-300 font-bold">
                    03 IN CLUSTER
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono-code text-slate-300">
                  <span>10:15 Ground crack</span>
                  <span className="text-white/30">&bull;</span>
                  <span>12:40 Water seepage</span>
                  <span className="text-white/30">&bull;</span>
                  <span className="text-amber-400 font-bold">14:32 Road crack</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Summary Message Bar */}
        <div className="p-2 rounded-lg border border-white/10 bg-[#0C121E]/60 flex items-center justify-between text-[9.5px] font-mono-code">
          <div className="text-white/70">
            <span className="text-amber-400 font-bold">CORE PROTOCOL:</span> AI PREDICTS &bull; GROUND PROVIDES EVIDENCE &bull; OFFICERS VERIFY &bull; RISK UPDATES
          </div>
          <div className="text-white/40 uppercase tracking-widest hidden sm:block">
            RESPONSIBLE AI
          </div>
        </div>
      </div>
    </section>
  );
};
