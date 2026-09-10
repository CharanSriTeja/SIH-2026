import React from 'react';
import { Activity, ArrowRight, ChevronDown, MapPin, Radio } from 'lucide-react';
import slopeImage from '../../assets/images/slope_risk_monitoring_1788844784799.jpg';
import { Button } from '../ui/Button';

interface Section1WhatIsProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onExplore: () => void;
}

export const Section1WhatIs: React.FC<Section1WhatIsProps> = ({
  onOpenAuth,
  onExplore,
}) => {
  return (
    <section
      id="section-1"
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto w-full relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Platform Introduction */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Activity className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Disaster Early Warning Intelligence
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold tracking-tight text-[#23261F] leading-[1.1]">
              BHURAKSHA 2.0
            </h1>
            <p className="text-base sm:text-lg font-sans font-semibold tracking-wide text-[#B5551F]">
              AI-Powered Landslide Risk Monitoring &amp; Targeted Early Warning
            </p>
          </div>

          {/* Core Explanation */}
          <p className="text-base text-[#55594C] leading-relaxed max-w-xl">
            A life-safety geospatial platform fusing real-time rainfall, soil moisture, satellite elevation models, and machine learning to forecast localized slope failures across Northeast India before they occur.
          </p>

          {/* Minimal Supporting Labels */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-md bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              Multi-Source Data Fusion
            </span>
            <span className="px-3 py-1 rounded-md bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              Dual-Model AI Prediction
            </span>
            <span className="px-3 py-1 rounded-md bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              District Administration Sync
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onExplore}
              rightIcon={<ChevronDown className="w-4 h-4" />}
            >
              Explore Architecture
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => onOpenAuth('signin')}
              rightIcon={<ArrowRight className="w-4 h-4 text-[#55594C]" />}
            >
              Sign In to Portal
            </Button>
          </div>

          {/* Geographic Note */}
          <div className="pt-4 flex items-center gap-4 text-xs font-sans font-medium text-[#55594C] border-t border-[#DDD6C4]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B5551F]" />
              <span>Northeast India (8 States &bull; 129 Districts)</span>
            </div>
            <span className="text-[#DDD6C4]">•</span>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#4F8F5B]" />
              <span>24/7 Satellite Surveillance</span>
            </div>
          </div>
        </div>

        {/* Right Column: Ground Slope Visual Card */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] overflow-hidden shadow-[0_4px_16px_rgba(35,38,31,0.08)] group">
            {/* Image */}
            <div className="aspect-[16/10] w-full overflow-hidden relative">
              <img
                src={slopeImage}
                alt="Natural mountainous hill slope with environmental conditions and vulnerable slope area"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Visual Explanatory Caption */}
            <div className="p-4 bg-[#FFFDF8] border-t border-[#DDD6C4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B5551F] animate-pulse" />
                <span className="text-xs font-sans font-semibold text-[#23261F] uppercase tracking-wider">
                  Field Slope Observation &bull; High Vulnerability Zone
                </span>
              </div>
              <span className="text-xs font-mono text-[#55594C]">
                TERRAIN RESILIENCE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
