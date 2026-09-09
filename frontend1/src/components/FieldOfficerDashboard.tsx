import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';
import { OfficerRiskMap } from './field-officer/OfficerRiskMap';
import { OfficerFieldReports, OperationalFieldReport } from './field-officer/OfficerFieldReports';
import { OfficerRiskStatus } from './field-officer/OfficerRiskStatus';
import { OfficerFieldReportModal } from './field-officer/OfficerFieldReportModal';
import {
  OfficerVerificationQueue,
  CitizenVerificationReport,
  VerificationDetails
} from './field-officer/OfficerVerificationQueue';
import {
  OfficerResponseCoordination,
  ResponseHazardItem,
  ResponseAssistanceStatus
} from './field-officer/OfficerResponseCoordination';
import { OfficerProfileModal } from './field-officer/OfficerProfileModal';
import { AuthService } from '../services/authService';

interface FieldOfficerDashboardProps {
  user: { role: UserRole; name: string };
  onLogout: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

export type OfficerNavSection = 'RISK STATUS' | 'RISK MAP' | 'FIELD REPORTS' | 'VERIFICATION' | 'RESPONSE';

export const FieldOfficerDashboard: React.FC<FieldOfficerDashboardProps> = ({
  user,
  onLogout,
}) => {
  // Navigation State: strictly 4 sections with RISK STATUS as default
  const [activeTab, setActiveTab] = useState<OfficerNavSection>('RISK STATUS');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mapSelectedSector, setMapSelectedSector] = useState<string | null>(null);
  const [viewingReportModal, setViewingReportModal] = useState<OperationalFieldReport | null>(null);

  // Officer Account Info
  const accounts = AuthService.getAccounts();
  const currentOfficerAccount =
    accounts.find(
      (a) =>
        a.role === 'officer' &&
        (a.name.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(a.name.toLowerCase()))
    ) ||
    accounts.find((a) => a.id === 'OFF-8821') ||
    null;

  const officerName = currentOfficerAccount?.name || user.name || 'Officer T. Sangma';
  const assignedDistrict = currentOfficerAccount?.locationOrDistrict || 'Aizawl District';

  // =========================================================================
  // SHARED OPERATIONAL STATE ACROSS SECTIONS
  // =========================================================================

  // 1. Citizen reports awaiting verification
  const [verificationReports, setVerificationReports] = useState<CitizenVerificationReport[]>([
    {
      id: 'CIT-1052',
      reportNumber: '#1052',
      hazardType: 'Ground Crack',
      sector: 'Sector A',
      location: 'Durtlang Ridge Road Km 14.2, Aizawl',
      citizenDescription: 'Wide crack extending across the road and shoulder after heavy rain. Noticeable dip in the asphalt.',
      citizenPhoto: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      dateTime: '15 minutes ago',
      areaRiskLevel: 'HIGH',
      status: 'Pending Verification',
      hasPhoto: true,
    },
    {
      id: 'CIT-1051',
      reportNumber: '#1051',
      hazardType: 'Road Damage',
      sector: 'Sector B',
      location: 'Tuirial Bypass Km 4.1',
      citizenDescription: 'Pavement buckling with mud slipping across outer lane near bridge approach.',
      citizenPhoto: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
      dateTime: '45 minutes ago',
      areaRiskLevel: 'MODERATE',
      status: 'Pending Verification',
      hasPhoto: true,
    },
    {
      id: 'CIT-1048',
      reportNumber: '#1048',
      hazardType: 'Rockfall on Slope',
      sector: 'Sector C',
      location: 'Edenthar Escarpment Footpath',
      citizenDescription: 'Loose boulders rolled down onto the path after brief downpour.',
      citizenPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      dateTime: '2 hours ago',
      areaRiskLevel: 'HIGH',
      status: 'Pending Verification',
      hasPhoto: true,
    },
  ]);

  // 2. Verified Field Reports
  const [fieldReports, setFieldReports] = useState<OperationalFieldReport[]>([
    {
      id: 'FR-1042',
      reportNumber: '#1042',
      sector: 'Sector A',
      district: 'Aizawl District',
      location: 'Durtlang Ridge, Km 14.2',
      hazardType: 'Ground Crack',
      riskLevel: 'HIGH RISK',
      status: 'Verified',
      dateTime: '08 Sep 2026, 08:30 AM',
      verifiedOn: '08 September 2026, 10:42 AM',
      verifiedBy: {
        name: 'Rahul Sharma',
        designation: 'Field Officer',
        officerId: 'FO-1024',
        department: 'Disaster Management Department',
      },
      officerObservation:
        'Ground cracking and water seepage observed during field inspection. Asphalt displacement measured at 12 cm. Immediate heavy traffic diversion recommended.',
      photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'],
      actionRequired: 'Road inspection',
    },
    {
      id: 'FR-1041',
      reportNumber: '#1041',
      sector: 'Sector B',
      district: 'Aizawl District',
      location: 'Tuirial Link Road, Km 8.4',
      hazardType: 'Road Damage',
      riskLevel: 'MODERATE RISK',
      status: 'Verified',
      dateTime: '08 Sep 2026, 07:15 AM',
      verifiedOn: '08 September 2026, 07:15 AM',
      verifiedBy: {
        name: 'Rahul Sharma',
        designation: 'Field Officer',
        officerId: 'FO-1024',
        department: 'Disaster Management Department',
      },
      officerObservation:
        'Subsidence and cracking along outer shoulder of roadway. Base gravel slipping towards drainage ravine.',
      photos: ['https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80'],
      actionRequired: 'Road clearance',
    },
    {
      id: 'FR-1039',
      reportNumber: '#1039',
      sector: 'Sector C',
      district: 'Aizawl District',
      location: 'Aizawl-Lunglei Highway Section 3',
      hazardType: 'Water Seepage',
      riskLevel: 'HIGH RISK',
      status: 'Under Investigation',
      dateTime: '07 Sep 2026, 04:50 PM',
      verifiedOn: '07 September 2026, 04:50 PM',
      verifiedBy: {
        name: 'Rahul Sharma',
        designation: 'Field Officer',
        officerId: 'FO-1024',
        department: 'Disaster Management Department',
      },
      officerObservation:
        'Severe subsurface water discharge cutting into toe of cut slope. Geotechnical core sampling requested.',
      photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80'],
      actionRequired: 'Drainage clearance',
    },
  ]);

  // 3. Response Assistance Items
  const [responseHazards, setResponseHazards] = useState<ResponseHazardItem[]>([
    {
      id: 'RESP-1042',
      reportNumber: '#1042',
      sector: 'Sector A',
      hazardType: 'Ground Crack',
      riskLevel: 'HIGH RISK',
      actionRequired: 'Road inspection',
      location: 'Durtlang Ridge, Km 14.2',
      status: 'NOT_REQUESTED',
      verifiedBy: {
        name: 'Rahul Sharma',
        officerId: 'FO-1024',
      },
    },
    {
      id: 'RESP-1041',
      reportNumber: '#1041',
      sector: 'Sector B',
      hazardType: 'Road Damage',
      riskLevel: 'MODERATE RISK',
      actionRequired: 'Road clearance',
      location: 'Tuirial Link Road, Km 8.4',
      status: 'TEAM ASSIGNED',
      assignedTeam: 'PWD Highway Clearance Unit',
      updatedAt: '08 Sep, 08:00 AM',
      verifiedBy: {
        name: 'Rahul Sharma',
        officerId: 'FO-1024',
      },
    },
    {
      id: 'RESP-1039',
      reportNumber: '#1039',
      sector: 'Sector C',
      hazardType: 'Water Seepage',
      riskLevel: 'HIGH RISK',
      actionRequired: 'Drainage clearance',
      location: 'Aizawl-Lunglei Highway Section 3',
      status: 'NOT_REQUESTED',
      verifiedBy: {
        name: 'Rahul Sharma',
        officerId: 'FO-1024',
      },
    },
  ]);

  // =========================================================================
  // WORKFLOW TRANSITIONS
  // =========================================================================

  // Open verified field report modal
  const handleOpenFieldReport = (reportNumber: string) => {
    const found = fieldReports.find((r) => r.reportNumber === reportNumber);
    if (found) {
      setViewingReportModal(found);
    } else {
      setViewingReportModal({
        id: `FR-${reportNumber.replace('#', '')}`,
        reportNumber,
        sector: 'Sector A',
        district: assignedDistrict,
        location: 'Durtlang Ridge Sector, Km 14.2',
        hazardType: 'Ground Crack',
        riskLevel: 'HIGH RISK',
        status: 'Verified',
        dateTime: '08 September 2026, 10:42 AM',
        verifiedOn: '08 September 2026, 10:42 AM',
        verifiedBy: {
          name: officerName,
          designation: 'Field Officer',
          officerId: currentOfficerAccount?.id || 'FO-1024',
          department: 'Disaster Management Department',
        },
        officerObservation:
          'Ground cracking and water seepage observed during field inspection. Asphalt displacement measured at 12 cm. Immediate heavy traffic diversion recommended.',
        photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'],
        actionRequired: 'Road inspection',
      });
    }
  };

  // Handle Verify from Queue -> Moves into Field Reports & creates Response Hazard
  const handleVerifyReport = (report: CitizenVerificationReport, details: VerificationDetails) => {
    // 1. Update verification queue
    setVerificationReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'Verified' } : r))
    );

    // 2. Add to Field Reports with full officer details
    const newFieldReport: OperationalFieldReport = {
      id: `FR-${report.reportNumber.replace('#', '')}`,
      reportNumber: report.reportNumber,
      sector: report.sector,
      district: assignedDistrict,
      location: report.location,
      hazardType: report.hazardType,
      riskLevel: details.severity,
      status: 'Verified',
      dateTime: 'Just now',
      verifiedOn: '08 September 2026, 10:42 AM',
      verifiedBy: {
        name: officerName,
        designation: 'Field Officer',
        officerId: currentOfficerAccount?.id || 'FO-1024',
        department: 'Disaster Management Department',
      },
      officerObservation: details.officerObservation,
      photos: details.officerPhoto ? [details.officerPhoto] : [report.citizenPhoto],
      actionRequired: details.recommendedAction || 'Field inspection',
    };

    setFieldReports((prev) => [newFieldReport, ...prev]);

    // 3. Add to Response list so assistance can be coordinated
    const newResponseItem: ResponseHazardItem = {
      id: `RESP-${report.reportNumber.replace('#', '')}`,
      reportNumber: report.reportNumber,
      sector: report.sector,
      hazardType: report.hazardType,
      riskLevel: details.severity,
      actionRequired: details.recommendedAction || 'Field inspection',
      location: report.location,
      status: 'NOT_REQUESTED',
      verifiedBy: {
        name: officerName,
        officerId: currentOfficerAccount?.id || 'FO-1024',
      },
    };

    setResponseHazards((prev) => [newResponseItem, ...prev]);
  };

  // Handle Needs Investigation
  const handleNeedsInvestigation = (report: CitizenVerificationReport, notes: string) => {
    setVerificationReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'Needs Investigation' } : r))
    );

    // Add to Field Reports with status "Under Investigation"
    const newFieldReport: OperationalFieldReport = {
      id: `FR-${report.reportNumber.replace('#', '')}`,
      reportNumber: report.reportNumber,
      sector: report.sector,
      location: report.location,
      hazardType: report.hazardType,
      riskLevel:
        report.areaRiskLevel === 'HIGH'
          ? 'HIGH RISK'
          : report.areaRiskLevel === 'MODERATE'
          ? 'MODERATE RISK'
          : 'LOW RISK',
      status: 'Under Investigation',
      dateTime: 'Just now',
      officerObservation: notes,
      photos: [report.citizenPhoto],
      actionRequired: 'Technical investigation',
    };

    setFieldReports((prev) => [newFieldReport, ...prev]);
  };

  // Handle Reject
  const handleRejectReport = (report: CitizenVerificationReport) => {
    setVerificationReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'Rejected' } : r))
    );
  };

  // Handle Request Assistance on a hazard
  const handleRequestAssistance = (hazardId: string) => {
    setResponseHazards((prev) =>
      prev.map((item) =>
        item.id === hazardId
          ? {
              ...item,
              status: 'ASSISTANCE REQUESTED',
              updatedAt: 'Just now',
            }
          : item
      )
    );
  };

  // Handle Update Response Status
  const handleUpdateResponseStatus = (
    hazardId: string,
    newStatus: ResponseAssistanceStatus,
    team?: string
  ) => {
    setResponseHazards((prev) =>
      prev.map((item) =>
        item.id === hazardId
          ? {
              ...item,
              status: newStatus,
              assignedTeam: team || item.assignedTeam,
              updatedAt: 'Just now',
            }
          : item
      )
    );
  };

  // Pending count for navbar badge
  const pendingVerificationsCount = verificationReports.filter(
    (r) => r.status === 'Pending Verification'
  ).length;

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. SIMPLE, UNCLUTTERED NAVBAR                                             */}
      {/* ========================================================================= */}
      <header className="bg-[#0B101C] border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                BHURAKSHA 2.0
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Field Officer Terminal
              </span>
            </div>
          </div>

          {/* MAIN SECTIONS */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {(
              [
                { id: 'RISK STATUS', label: 'Risk Status' },
                { id: 'RISK MAP', label: 'Risk Map' },
                { id: 'FIELD REPORTS', label: 'Field Reports' },
                { id: 'VERIFICATION', label: 'Verification' },
                { id: 'RESPONSE', label: 'Response' },
              ] as const
            ).map((section) => {
              const isActive = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveTab(section.id as OfficerNavSection)}
                  className={`px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{section.label}</span>
                  {section.id === 'VERIFICATION' && pendingVerificationsCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {pendingVerificationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: SMALL PROFILE / ACCOUNT OPTION */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-left cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-[11px]">
                {officerName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-medium block leading-tight truncate max-w-[120px]">
                  {officerName}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  {assignedDistrict}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-300 border border-slate-700 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
          {(
            [
              { id: 'RISK STATUS', label: 'Risk Status' },
              { id: 'RISK MAP', label: 'Risk Map' },
              { id: 'FIELD REPORTS', label: 'Field Reports' },
              { id: 'VERIFICATION', label: 'Verification' },
              { id: 'RESPONSE', label: 'Response' },
            ] as const
          ).map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveTab(section.id as OfficerNavSection)}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap text-xs ${
                activeTab === section.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {section.label}
              {section.id === 'VERIFICATION' && pendingVerificationsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[9px]">
                  {pendingVerificationsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (ONE CLEAR PURPOSE PER TAB)                             */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full bg-[#060910]">
        {/* 1. RISK STATUS: First page after Field Officer logs in */}
        {activeTab === 'RISK STATUS' && (
          <OfficerRiskStatus
            onNavigateToMap={(sector) => {
              setMapSelectedSector(sector || null);
              setActiveTab('RISK MAP');
            }}
            onViewReport={(reportNum) => handleOpenFieldReport(reportNum)}
            onNavigateToFieldReports={() => setActiveTab('FIELD REPORTS')}
            fieldReports={fieldReports}
          />
        )}

        {/* 2. RISK MAP: See where the risk is */}
        {activeTab === 'RISK MAP' && (
          <OfficerRiskMap
            onNavigateToVerification={() => setActiveTab('VERIFICATION')}
            onViewReport={(reportNum) => handleOpenFieldReport(reportNum)}
            selectedSectorFromParent={mapSelectedSector}
          />
        )}

        {/* 3. FIELD REPORTS: Inspect verified ground hazard records */}
        {activeTab === 'FIELD REPORTS' && (
          <OfficerFieldReports
            reports={fieldReports}
            onNavigateToResponse={() => setActiveTab('RESPONSE')}
            onRequestAssistance={(report) => {
              const existing = responseHazards.find(
                (h) => h.reportNumber === report.reportNumber
              );
              if (existing) {
                handleRequestAssistance(existing.id);
              } else {
                const newResp: ResponseHazardItem = {
                  id: `RESP-${report.reportNumber.replace('#', '')}`,
                  reportNumber: report.reportNumber,
                  sector: report.sector,
                  hazardType: report.hazardType,
                  riskLevel: report.riskLevel,
                  actionRequired: report.actionRequired || 'Inspection',
                  location: report.location,
                  status: 'ASSISTANCE REQUESTED',
                  verifiedBy: report.verifiedBy
                    ? {
                        name: report.verifiedBy.name,
                        officerId: report.verifiedBy.officerId,
                      }
                    : undefined,
                };
                setResponseHazards((prev) => [newResp, ...prev]);
              }
            }}
          />
        )}

        {/* 4. VERIFICATION: Check citizen reports */}
        {activeTab === 'VERIFICATION' && (
          <OfficerVerificationQueue
            reports={verificationReports}
            onVerifyReport={handleVerifyReport}
            onNeedsInvestigation={handleNeedsInvestigation}
            onRejectReport={handleRejectReport}
            onNavigateToReports={() => setActiveTab('FIELD REPORTS')}
          />
        )}

        {/* 5. RESPONSE: Coordinate assistance for verified hazards */}
        {activeTab === 'RESPONSE' && (
          <OfficerResponseCoordination
            hazardItems={responseHazards}
            onRequestAssistance={handleRequestAssistance}
            onUpdateStatus={handleUpdateResponseStatus}
            onViewReport={(reportNum) => handleOpenFieldReport(reportNum)}
          />
        )}
      </main>

      {/* Field Report Modal */}
      <OfficerFieldReportModal
        report={viewingReportModal}
        isOpen={!!viewingReportModal}
        onClose={() => setViewingReportModal(null)}
        onRequestAssistance={(rep) => {
          const existing = responseHazards.find(
            (h) => h.reportNumber === rep.reportNumber
          );
          if (existing) {
            handleRequestAssistance(existing.id);
          } else {
            const newResp: ResponseHazardItem = {
              id: `RESP-${rep.reportNumber.replace('#', '')}`,
              reportNumber: rep.reportNumber,
              sector: rep.sector,
              hazardType: rep.hazardType,
              riskLevel: rep.riskLevel,
              actionRequired: rep.actionRequired || 'Inspection',
              location: rep.location,
              status: 'ASSISTANCE REQUESTED',
              verifiedBy: rep.verifiedBy
                ? {
                    name: rep.verifiedBy.name,
                    officerId: rep.verifiedBy.officerId,
                  }
                : undefined,
            };
            setResponseHazards((prev) => [newResp, ...prev]);
          }
        }}
        onNavigateToResponse={() => setActiveTab('RESPONSE')}
      />

      {/* Profile Modal */}
      <OfficerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        officerAccount={currentOfficerAccount}
        onSignOut={onLogout}
      />
    </div>
  );
};
