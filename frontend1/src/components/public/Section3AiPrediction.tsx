import React from 'react';
import { Cpu, ArrowDown, AlertCircle, Activity } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';

export const Section3AiPrediction: React.FC = () => {
  const steps = [
    { title: 'Harmonized Input Tensor', detail: 'Real-time rainfall, DEM slope, soil moisture, and historical slide records' },
    { title: 'Random Forest Model A', detail: 'Static susceptibility mapping calibrated against GSI landslide inventory' },
    { title: 'Dynamic Pipeline Model B', detail: 'Dynamic rainfall thresholds & antecedent precipitation saturation' },
    { title: 'Automated Tier Classification', detail: 'Deterministic assignment: Low, Moderate, High, or Critical' },
  ];

  const exampleInputs = [
    { label: '24H Rainfall', value: '184 mm', detail: 'Monsoon threshold exceeded' },
    { label: 'Soil Moisture', value: '88% Saturation', detail: 'Pore pressure limit near shear failure' },
    { label: 'Slope Incline', value: '38° Angle', detail: 'Steep escarpment terrain' },
    { label: 'Historical Slip', value: 'Present', detail: 'Prior 2022 debris slide polygon' },
  ];

  return (
    <section
      id="section-3"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Section Header */}
        <div className="text-left space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Cpu className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Stage 02 &bull; Machine Learning Inference
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#23261F] tracking-tight">
            AI Landslide Risk Prediction
          </h2>

          <p className="text-base text-[#55594C] leading-relaxed">
            The machine learning engine evaluates multi-parameter dynamic indicators against static geological susceptibility to forecast slope failure probability hours in advance of catastrophic movement.
          </p>
        </div>

        {/* Two-Column Explanatory Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Conceptual Inference Pipeline */}
          <div className="lg:col-span-5 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-[0_4px_16px_rgba(35,38,31,0.06)] flex flex-col justify-between space-y-4">
            <div>
              <div className="text-sm font-serif font-bold text-[#23261F]">
                Predictive Architecture Workflow
              </div>
              <p className="text-xs text-[#55594C] mt-1">
                How environmental telemetry transforms into operational civil protection guidance.
              </p>
            </div>

            {/* Vertical Flow */}
            <div className="space-y-2 py-1">
              {steps.map((step, idx) => (
                <div key={step.title} className="space-y-1">
                  <div className="p-3 rounded-lg border border-[#DDD6C4] bg-[#F6F3EC] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-sans font-bold text-[#23261F]">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-[#55594C] mt-0.5">
                        {step.detail}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#2E4A3D] bg-[#E8EFEA] px-2 py-0.5 rounded">
                      0{idx + 1}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-[#7B8071]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Classification Tiers */}
            <div className="pt-3 border-t border-[#DDD6C4] flex flex-wrap items-center justify-between gap-1.5">
              <RiskBadge level="low" size="sm" />
              <RiskBadge level="moderate" size="sm" />
              <RiskBadge level="high" size="sm" />
              <RiskBadge level="critical" size="sm" />
            </div>
          </div>

          {/* Right Column: Example Risk Prediction Visualization */}
          <div className="lg:col-span-7 rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] p-5 sm:p-6 shadow-[0_4px_16px_rgba(35,38,31,0.06)] space-y-4 flex flex-col justify-between">
            {/* Header & Demo Badge */}
            <div className="flex items-center justify-between border-b border-[#DDD6C4] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#B5551F]" />
                <span className="text-sm font-serif font-bold text-[#23261F]">
                  Live Prediction Evaluation Scenario
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#FDF1EB] border border-[#F6C8B3] text-[11px] font-sans font-semibold text-[#823B10]">
                DEMO SCENARIO &bull; SECTOR 4
              </span>
            </div>

            {/* Example Input Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {exampleInputs.map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-lg border border-[#DDD6C4] bg-[#F6F3EC] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-medium text-[#55594C]">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#B5551F]">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7B8071] mt-1 font-sans">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Inference Arrow */}
            <div className="flex items-center justify-center py-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#55594C] uppercase">
                <span>Inference Evaluation Completed</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#B5551F]" />
              </div>
            </div>

            {/* Resulting Predicted Risk */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#F6C8B3] bg-[#FDF0EB] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#F6C8B3] flex items-center justify-center text-[#B5551F] shrink-0 shadow-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-sans font-semibold text-[#823B10] uppercase tracking-wider">
                    Computed Hazard Rating
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#823B10]">
                    High Landslide Risk
                  </div>
                  <div className="text-xs text-[#55594C] mt-0.5">
                    Trigger threshold exceeded: Steep slope + intense rainfall saturation.
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-[#55594C] uppercase">
                  Confidence Score
                </div>
                <div className="text-xl font-mono font-bold text-[#23261F]">
                  87.4%
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#FFFDF8] border border-[#F6C8B3] text-[#823B10] text-xs font-sans font-semibold mt-1 shadow-xs">
                  Pre-Alert Sent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
