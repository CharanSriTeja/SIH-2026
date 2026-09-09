import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  ChevronRight,
  Map,
  FileText,
  X,
  Droplets,
  Mountain,
  Layers,
  ChevronDown
} from 'lucide-react';
import { OperationalFieldReport } from './OfficerFieldReports';

export interface SectorRiskItem {
  id: string;
  sector: string;
  name: string;
  district: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  mainReason: string;
  nearbyAffectedArea: string;
  roadStatus?: string;
  lastUpdated: string;
  linkedReportNumbers?: string[];
  environmentalSummary?: {
    rainfall24h: string;
    soilMoisture: string;
    slopeAngle: string;
  };
}

interface OfficerRiskStatusProps {
  onNavigateToMap: (sectorId?: string) => void;
  onViewReport: (reportNumber: string) => void;
  onNavigateToFieldReports?: () => void;
  fieldReports: OperationalFieldReport[];
}

export const OfficerRiskStatus: React.FC<OfficerRiskStatusProps> = ({
  onNavigateToMap,
  onViewReport,
  onNavigateToFieldReports,
  fieldReports,
}) => {
  // Currently affected areas
  const [sectors] = useState<SectorRiskItem[]>([
    {
      id: 'Sector A',
      sector: 'Sector A',
      name: 'Durtlang Ridge Sector',
      district: 'Aizawl District',
      riskLevel: 'HIGH',
      mainReason: 'Ground movement reported',
      nearbyAffectedArea: '2 nearby villages (Durtlang Village, Durtlang Upper)',
      roadStatus: 'Road partially affected (NH-54)',
      lastUpdated: '10 minutes ago',
      linkedReportNumbers: ['#1042'],
      environmentalSummary: {
        rainfall24h: '142 mm',
        soilMoisture: '88% (High saturation)',
        slopeAngle: '42° steep cut-slope',
      },
    },
    {
      id: 'Sector B',
      sector: 'Sector B',
      name: 'Tuirial Valley Bypass Corridor',
      district: 'Aizawl District',
      riskLevel: 'CRITICAL',
      mainReason: 'Heavy rainfall + high soil moisture',
      nearbyAffectedArea: '1 nearby village (Tuirial Settlement)',
      roadStatus: 'Road closure recommended (Tuirial Link Road)',
      lastUpdated: '25 minutes ago',
      linkedReportNumbers: ['#1041'],
      environmentalSummary: {
        rainfall24h: '168 mm',
        soilMoisture: '94% (Near saturation)',
        slopeAngle: '38° unstable hillside',
      },
    },
    {
      id: 'Sector C',
      sector: 'Sector C',
      name: 'Ramhlun Hill Area',
      district: 'Aizawl District',
      riskLevel: 'MODERATE',
      mainReason: 'Elevated landslide probability',
      nearbyAffectedArea: 'Ramhlun North & residential clusters',
      roadStatus: 'No verified hazard reports (1 citizen report pending)',
      lastUpdated: '1 hour ago',
      linkedReportNumbers: ['#1039'],
      environmentalSummary: {
        rainfall24h: '98 mm',
        soilMoisture: '72% (Elevated)',
        slopeAngle: '35° residential scarp',
      },
    },
    {
      id: 'Sector E',
      sector: 'Sector E',
      name: 'Zemabawk Escarpment',
      district: 'Aizawl District',
      riskLevel: 'HIGH',
      mainReason: 'Debris accumulation in roadside gutters & cut-slope tension',
      nearbyAffectedArea: 'Zemabawk Village (0.8 km)',
      roadStatus: 'NH-54 East Corridor lane restricted',
      lastUpdated: '35 minutes ago',
      linkedReportNumbers: [],
      environmentalSummary: {
        rainfall24h: '150 mm',
        soilMoisture: '91% (High)',
        slopeAngle: '44° slope',
      },
    },
    {
      id: 'Sector D',
      sector: 'Sector D',
      name: 'Bawngkawn Basin',
      district: 'Aizawl District',
      riskLevel: 'LOW',
      mainReason: 'Adequate drainage runoff; stable surface slope',
      nearbyAffectedArea: 'Bawngkawn Outskirts (0.2 km)',
      roadStatus: 'Normal traffic flow; no road disruption',
      lastUpdated: '2 hours ago',
      linkedReportNumbers: [],
      environmentalSummary: {
        rainfall24h: '65 mm',
        soilMoisture: '54% (Normal)',
        slopeAngle: '18° gentle gradient',
      },
    },
  ]);

  // Selected sector for detailed breakdown
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const selectedSector = sectors.find((s) => s.id === selectedSectorId) || null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-slate-100">
      {/* 1. HEADER: CLEAN & SIMPLE */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            Current Risk Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time risk assessment answering: &ldquo;Which places are at risk right now?&rdquo;
          </p>
        </div>

        {onNavigateToFieldReports && (
          <button
            type="button"
            onClick={onNavigateToFieldReports}
            className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>View All Field Reports ({fieldReports.length})</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SIMPLE LIST OF AFFECTED / HIGH-RISK AREAS                              */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {sectors.map((item) => {
          const isSelected = selectedSectorId === item.id;
          const isCritical = item.riskLevel === 'CRITICAL';
          const isHigh = item.riskLevel === 'HIGH';
          const isModerate = item.riskLevel === 'MODERATE';

          return (
            <div
              key={item.id}
              className={`bg-[#0F172A] border rounded-xl transition-all shadow-sm overflow-hidden ${
                isSelected
                  ? 'border-blue-500/80 ring-1 ring-blue-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Primary Card View: Clickable to see details */}
              <div
                onClick={() => setSelectedSectorId(isSelected ? null : item.id)}
                className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  {/* Top line: Sector, District, & Risk Label */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-white tracking-tight">
                      {item.sector}
                    </span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.district}
                    </span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="text-xs text-slate-300">
                      {item.name}
                    </span>
                  </div>

                  {/* Main reason for risk */}
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-slate-400 font-normal text-xs">Reason:</span>
                    <span>{item.mainReason}</span>
                  </div>

                  {/* Nearby affected area & road status */}
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div>
                      <span className="text-slate-500">Nearby:</span> {item.nearbyAffectedArea}
                    </div>
                    {item.roadStatus && (
                      <div>
                        <span className="text-slate-500">Road:</span>{' '}
                        <span className={isCritical || isHigh ? 'text-amber-300' : 'text-slate-300'}>
                          {item.roadStatus}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Last updated timestamp */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>Last updated: {item.lastUpdated}</span>
                  </div>
                </div>

                {/* Right: Risk Badge & Expand Icon */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                        : isHigh
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : isModerate
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.riskLevel} RISK
                  </span>

                  <div className="flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                    <span>{isSelected ? 'Hide Details' : 'View Details'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSelected ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* EXPANDED LOCATION DETAILS (WHEN CLICKED)                                  */}
              {/* ========================================================================= */}
              {isSelected && (
                <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 space-y-4 text-xs">
                  {/* Environmental Metrics (if available) */}
                  {item.environmentalSummary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        <span className="text-[11px] text-slate-400 block">24h Rainfall:</span>
                        <span className="text-white font-semibold text-sm">
                          {item.environmentalSummary.rainfall24h}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        <span className="text-[11px] text-slate-400 block">Soil Moisture:</span>
                        <span className="text-white font-semibold text-sm">
                          {item.environmentalSummary.soilMoisture}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        <span className="text-[11px] text-slate-400 block">Slope Angle:</span>
                        <span className="text-white font-semibold text-sm">
                          {item.environmentalSummary.slopeAngle}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Linked Verified Field Reports */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                      Linked Verified Field Reports
                    </span>
                    {item.linkedReportNumbers && item.linkedReportNumbers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.linkedReportNumbers.map((repNum) => {
                          const linked = fieldReports.find((r) => r.reportNumber === repNum);
                          return (
                            <button
                              key={repNum}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewReport(repNum);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                              <span>
                                View Field Report {repNum}
                                {linked ? ` (${linked.hazardType})` : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">
                        No verified ground hazard reports filed for this sector.
                      </p>
                    )}
                  </div>

                  {/* Action Bar: Direct Jump to GIS Map */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">
                      Need spatial verification for {item.sector}?
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToMap(item.sector);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>View on Risk Map &rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
