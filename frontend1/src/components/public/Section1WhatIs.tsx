import React from 'react';
import { Shield, ArrowRight, ChevronDown, MapPin, Activity } from 'lucide-react';
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
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 pt-28 sm:pt-36 flex flex-col justify-center"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Platform Introduction */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CAD7CE] bg-[#E8EFEA] text-[#2E4A3D]">
            <Shield className="w-3.5 h-3.5 text-[#2E4A3D]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider">
              Landslide Early Warning &amp; Civil Protection
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2.5">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-bold tracking-tight text-[#23261F] leading-[1.1]">
              BHURAKSHA 2.0
            </h1>
            <p className="text-lg sm:text-xl font-serif font-medium text-[#B5551F]">
              Regional Landslide Risk Intelligence for Northeast India
            </p>
          </div>

          {/* Core Plain-Language Explanation */}
          <p className="text-base sm:text-[17px] text-[#55594C] leading-relaxed max-w-xl">
            During heavy monsoon rainfall, steep mountain terrain and saturated soils trigger critical slope failures across Northeast India. BHURAKSHA 2.0 fuses daily satellite precipitation, soil moisture observations, and digital elevation models to compute 200-meter risk maps, deliver targeted alerts to at-risk habitations, and coordinate ground response.
          </p>

          {/* Supporting Pipeline Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              ISRO &amp; NASA Earth Observation
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              Dual-Model AI Risk Pipeline
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#DDD6C4] text-xs font-sans font-medium text-[#23261F] shadow-xs">
              129 District Administration Sync
            </span>
          </div>

          {/* Action CTAs */}
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
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-sans font-medium text-[#55594C] border-t border-[#DDD6C4]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B5551F]" />
              <span>Northeast India &bull; 8 States &bull; 129 Districts</span>
            </div>
            <span className="text-[#DDD6C4] hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#4F8F5B]" />
              <span>Daily Automated Regional Risk Computation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Ground Slope Visual Card */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-[#DDD6C4] bg-[#FFFDF8] overflow-hidden shadow-md group">
            {/* Image */}
            <div className="aspect-[16/10] w-full overflow-hidden relative bg-[#EDE8DE]">
              <img
                src={slopeImage}
                alt="Natural mountainous hill slope with environmental conditions and vulnerable slope area"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDD6C4] text-[11px] font-mono font-semibold text-[#23261F] shadow-xs">
                SLOPE MORPHOLOGY &bull; FIELD OBSERVATION
              </div>
            </div>

            {/* Visual Explanatory Caption */}
            <div className="p-4 bg-[#FFFDF8] border-t border-[#DDD6C4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B5551F] animate-pulse" />
                <span className="text-xs font-sans font-semibold text-[#23261F] uppercase tracking-wider">
                  Vulnerable Mountain Corridor Observation
                </span>
              </div>
              <span className="text-xs font-mono text-[#55594C]">
                TERRAIN &bull; 200M MASTER GRID
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
