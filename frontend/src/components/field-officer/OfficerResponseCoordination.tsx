import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  X,
  Send,
  UserCheck
} from 'lucide-react';

export type ResponseAssistanceStatus =
  | 'NOT_REQUESTED'
  | 'ASSISTANCE REQUESTED'
  | 'TEAM ASSIGNED'
  | 'RESPONDING'
  | 'RESOLVED';

export interface ResponseHazardItem {
  id: string;
  reportNumber: string;
  sector: string;
  hazardType: string;
  riskLevel: 'CRITICAL RISK' | 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  actionRequired: string;
  location?: string;
  status: ResponseAssistanceStatus;
  assignedTeam?: string;
  updatedAt?: string;
  verifiedBy?: {
    name: string;
    officerId: string;
  };
}

interface OfficerResponseCoordinationProps {
  hazardItems: ResponseHazardItem[];
  onRequestAssistance: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ResponseAssistanceStatus, team?: string) => void;
  onViewReport?: (reportNumber: string) => void;
}

export const OfficerResponseCoordination: React.FC<OfficerResponseCoordinationProps> = ({
  hazardItems,
  onRequestAssistance,
  onUpdateStatus,
  onViewReport,
}) => {
  // Modal to assign team / update status
  const [activeItemForTeam, setActiveItemForTeam] = useState<ResponseHazardItem | null>(null);
  const [teamName, setTeamName] = useState('PWD Highway Clearance Unit');

  const handleAssignTeam = () => {
    if (!activeItemForTeam) return;
    onUpdateStatus(activeItemForTeam.id, 'TEAM ASSIGNED', teamName);
    setActiveItemForTeam(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-slate-100">
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Response &amp; Assistance Coordination
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Verified ground hazards requiring inter-agency assistance or engineering response
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. HAZARDS REQUIRING ASSISTANCE LIST                                      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {hazardItems.length === 0 ? (
          <div className="text-center py-12 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-white">No Active Assistance Requests</p>
            <p className="mt-1 text-slate-400">
              Verified hazards requiring assistance will appear here for coordination.
            </p>
          </div>
        ) : (
          hazardItems.map((item) => {
            const isRequested = item.status !== 'NOT_REQUESTED';

            return (
              <div
                key={item.id}
                className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-3.5 transition-colors"
              >
                {/* Top Section: Matching prompt structure */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                        VERIFIED HAZARD &bull; {item.reportNumber}
                      </span>
                    </div>

                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{item.hazardType}</span>
                      <span className="text-slate-500 font-normal">&bull;</span>
                      <span className="text-slate-300 font-medium text-sm">{item.sector}</span>
                    </div>

                    {item.location && (
                      <p className="text-xs text-slate-400">{item.location}</p>
                    )}
                  </div>

                  {/* Risk Badge */}
                  <div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                        item.riskLevel === 'CRITICAL' || item.riskLevel === 'CRITICAL RISK'
                          ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                          : item.riskLevel === 'HIGH' || item.riskLevel === 'HIGH RISK'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.riskLevel === 'MODERATE' || item.riskLevel === 'MODERATE RISK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Compact "Verified By" Area - Exactly per prompt requirements */}
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Verified By
                      </span>
                      <div className="text-slate-200">
                        <strong className="text-white font-medium">
                          {item.verifiedBy?.name || 'Rahul Sharma'}
                        </strong>{' '}
                        &bull; ID: <span className="font-mono text-slate-300">{item.verifiedBy?.officerId || 'FO-1024'}</span>
                      </div>
                    </div>
                  </div>

                  {onViewReport && (
                    <button
                      type="button"
                      onClick={() => onViewReport(item.reportNumber)}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                    >
                      View Report &rarr;
                    </button>
                  )}
                </div>

                {/* Action Required */}
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Action Required:</span>
                    <span className="text-white font-semibold text-sm">
                      {item.actionRequired}
                    </span>
                  </div>

                  {/* Status or Request Button */}
                  <div>
                    {!isRequested ? (
                      <button
                        type="button"
                        onClick={() => onRequestAssistance(item.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        <span>[ REQUEST ASSISTANCE ]</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                            item.status === 'ASSISTANCE REQUESTED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : item.status === 'TEAM ASSIGNED'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : item.status === 'RESPONDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Progress Details (if requested) */}
                {isRequested && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      {item.assignedTeam && (
                        <div className="text-slate-300">
                          <span className="text-slate-500">Assigned Team:</span>{' '}
                          <strong className="text-white font-medium">{item.assignedTeam}</strong>
                        </div>
                      )}
                      {item.updatedAt && (
                        <div className="text-[11px] text-slate-500">Updated: {item.updatedAt}</div>
                      )}
                    </div>

                    {/* Simple Step-forward Actions */}
                    <div className="flex items-center gap-2">
                      {item.status === 'ASSISTANCE REQUESTED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemForTeam(item);
                            setTeamName('PWD Quick Response Road Unit');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                        >
                          Assign Team &rarr;
                        </button>
                      )}

                      {item.status === 'TEAM ASSIGNED' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'RESPONDING')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-medium cursor-pointer"
                        >
                          Mark Responding &rarr;
                        </button>
                      )}

                      {item.status === 'RESPONDING' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                        >
                          Mark Resolved &#10003;
                        </button>
                      )}

                      {item.status === 'RESOLVED' && (
                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Incident Cleared &amp; Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Team Assignment Modal */}
      {activeItemForTeam && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Assign Response Team</h3>
              <button
                type="button"
                onClick={() => setActiveItemForTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Select the responding engineering or emergency team for{' '}
                <strong className="text-white">{activeItemForTeam.hazardType}</strong> (
                {activeItemForTeam.sector}):
              </p>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Department / Team</label>
                <select
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PWD Highway Clearance Unit">PWD Highway Clearance Unit</option>
                  <option value="SDMA Disaster Quick Response Team (QRT 2)">
                    SDMA Disaster Quick Response Team (QRT 2)
                  </option>
                  <option value="State Geological Survey Inspection Team">
                    State Geological Survey Inspection Team
                  </option>
                  <option value="District Heavy Earthmover Division">
                    District Heavy Earthmover Division
                  </option>
                  <option value="Public Health Drainage Engineering">
                    Public Health Drainage Engineering
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveItemForTeam(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignTeam}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
