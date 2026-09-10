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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-earth-900">
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <div className="mb-6 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-earth-900 tracking-tight font-serif">
          Response &amp; Assistance Coordination
        </h1>
        <p className="text-xs sm:text-sm text-earth-600">
          Verified ground hazards requiring inter-agency assistance or engineering response
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. HAZARDS REQUIRING ASSISTANCE LIST                                      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {hazardItems.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFDF8] border border-earth-300 rounded-2xl p-6 text-earth-600 text-xs shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-earth-900">No Active Assistance Requests</p>
            <p className="mt-1 text-earth-600">
              Verified hazards requiring assistance will appear here for coordination.
            </p>
          </div>
        ) : (
          hazardItems.map((item) => {
            const isRequested = item.status !== 'NOT_REQUESTED';

            return (
              <div
                key={item.id}
                className="bg-[#FFFDF8] border border-earth-300 hover:border-earth-400 rounded-xl p-5 shadow-xs space-y-3.5 transition-colors"
              >
                {/* Top Section: Matching prompt structure */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-earth-600 tracking-wider">
                        VERIFIED HAZARD &bull; {item.reportNumber}
                      </span>
                    </div>

                    <div className="text-base font-bold text-earth-900 flex items-center gap-2 font-serif">
                      <span>{item.hazardType}</span>
                      <span className="text-earth-400 font-normal font-sans">&bull;</span>
                      <span className="text-earth-700 font-medium text-sm font-sans">{item.sector}</span>
                    </div>

                    {item.location && (
                      <p className="text-xs text-earth-600">{item.location}</p>
                    )}
                  </div>

                  {/* Risk Badge */}
                  <div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-bold font-mono ${
                        item.riskLevel === 'CRITICAL' || item.riskLevel === 'CRITICAL RISK'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : item.riskLevel === 'HIGH' || item.riskLevel === 'HIGH RISK'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.riskLevel === 'MODERATE' || item.riskLevel === 'MODERATE RISK'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Compact "Verified By" Area - Exactly per prompt requirements */}
                <div className="p-2.5 rounded-lg bg-earth-50 border border-earth-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-brand-700 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-earth-500 block font-semibold font-mono">
                        Verified By
                      </span>
                      <div className="text-earth-800">
                        <strong className="text-earth-900 font-medium">
                          {item.verifiedBy?.name || 'Rahul Sharma'}
                        </strong>{' '}
                        &bull; ID: <span className="font-mono text-earth-700">{item.verifiedBy?.officerId || 'FO-1024'}</span>
                      </div>
                    </div>
                  </div>

                  {onViewReport && (
                    <button
                      type="button"
                      onClick={() => onViewReport(item.reportNumber)}
                      className="text-xs text-brand-700 hover:text-brand-900 underline font-medium cursor-pointer"
                    >
                      View Report &rarr;
                    </button>
                  )}
                </div>

                {/* Action Required */}
                <div className="p-3 rounded-lg bg-earth-50 border border-earth-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-earth-600 block text-[11px] font-mono">Action Required:</span>
                    <span className="text-earth-900 font-semibold text-sm">
                      {item.actionRequired}
                    </span>
                  </div>

                  {/* Status or Request Button */}
                  <div>
                    {!isRequested ? (
                      <button
                        type="button"
                        onClick={() => onRequestAssistance(item.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        <span>[ REQUEST ASSISTANCE ]</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide font-mono ${
                            item.status === 'ASSISTANCE REQUESTED'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : item.status === 'TEAM ASSIGNED'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : item.status === 'RESPONDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
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
                  <div className="pt-2 border-t border-earth-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      {item.assignedTeam && (
                        <div className="text-earth-800">
                          <span className="text-earth-500">Assigned Team:</span>{' '}
                          <strong className="text-earth-900 font-medium">{item.assignedTeam}</strong>
                        </div>
                      )}
                      {item.updatedAt && (
                        <div className="text-[11px] text-earth-500 font-mono">Updated: {item.updatedAt}</div>
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
                          className="px-3 py-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 text-xs font-medium cursor-pointer shadow-xs transition-colors"
                        >
                          Assign Team &rarr;
                        </button>
                      )}

                      {item.status === 'TEAM ASSIGNED' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'RESPONDING')}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-medium cursor-pointer shadow-xs transition-colors"
                        >
                          Mark Responding &rarr;
                        </button>
                      )}

                      {item.status === 'RESPONDING' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium cursor-pointer shadow-xs transition-colors"
                        >
                          Mark Resolved &#10003;
                        </button>
                      )}

                      {item.status === 'RESOLVED' && (
                        <span className="text-emerald-700 text-xs flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 bg-earth-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-earth-300 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl text-earth-900">
            <div className="flex items-center justify-between border-b border-earth-200 pb-3">
              <h3 className="text-sm font-bold text-earth-900 font-serif">Assign Response Team</h3>
              <button
                type="button"
                onClick={() => setActiveItemForTeam(null)}
                className="text-earth-500 hover:text-earth-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-earth-700">
                Select the responding engineering or emergency team for{' '}
                <strong className="text-earth-900">{activeItemForTeam.hazardType}</strong> (
                {activeItemForTeam.sector}):
              </p>

              <div>
                <label className="block text-earth-700 mb-1 font-medium">Assigned Department / Team</label>
                <select
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-earth-300 rounded-lg p-2.5 text-xs text-earth-900 focus:outline-none focus:border-brand-700 shadow-xs font-mono"
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

            <div className="flex justify-end gap-2 pt-2 border-t border-earth-200">
              <button
                type="button"
                onClick={() => setActiveItemForTeam(null)}
                className="px-3 py-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs border border-earth-300 cursor-pointer shadow-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignTeam}
                className="px-4 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
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
