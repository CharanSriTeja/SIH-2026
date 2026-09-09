import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  XCircle,
  HelpCircle,
  UploadCloud,
  FileText,
  User,
  Building,
  Check
} from 'lucide-react';
import { OfficerAccessRequest, OfficerOperationalProfile } from '../../types';
import { AuthService } from '../../services/authService';

interface OfficerMultiStepRegistrationProps {
  initialProfile?: OfficerOperationalProfile;
  onBackToLogin: () => void;
  onRegisteredPending?: (request: OfficerAccessRequest) => void;
  onApprovedLogin?: (account: any) => void;
}

export const OfficerMultiStepRegistration: React.FC<OfficerMultiStepRegistrationProps> = ({
  initialProfile,
  onBackToLogin,
  onRegisteredPending,
  onApprovedLogin,
}) => {
  // Current Step: 1, 2, 3, or 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Operational Profile
  const [operationalProfile, setOperationalProfile] = useState<OfficerOperationalProfile>(
    initialProfile || 'Monitoring & Coordination Officer'
  );

  // STEP 1: Personal Details
  const [fullName, setFullName] = useState(
    initialProfile === 'Field Investigation Officer' ? 'Officer Priya Das' : 'Officer Rahul Sharma'
  );
  const [officialPhone, setOfficialPhone] = useState('+91 94361 88210');
  const [officialEmail, setOfficialEmail] = useState(
    initialProfile === 'Field Investigation Officer' ? 'priya.das@sdma.gov.in' : 'r.sharma@sdma.gov.in'
  );
  const [profilePhoto, setProfilePhoto] = useState('officer_photo.jpg');

  // STEP 2: Official Details
  const [designation, setDesignation] = useState(
    initialProfile === 'Field Investigation Officer'
      ? 'Senior Field Investigation Officer'
      : 'Disaster Monitoring & Coordination Officer'
  );
  const [department, setDepartment] = useState('State Disaster Management Authority (SDMA)');
  const [employeeId, setEmployeeId] = useState(
    initialProfile === 'Field Investigation Officer' ? 'OFF-9042' : 'OFF-8821'
  );
  const [district, setDistrict] = useState('Aizawl & East Khasi Hills');
  const [assignedArea, setAssignedArea] = useState('Sector A & B (Cherrapunji & Durtlang Ridge)');

  // STEP 3: Document Verification
  const [officialIdDoc, setOfficialIdDoc] = useState('Govt_Officer_ID_Card.pdf');
  const [appointmentCertDoc, setAppointmentCertDoc] = useState('SDMA_Appointment_Order_2022.pdf');
  const [deptAuthCertDoc, setDeptAuthCertDoc] = useState('Dept_Field_Officer_Authorization.pdf');
  const [otherOfficialDoc, setOtherOfficialDoc] = useState('Slope_Inspection_Safety_Credential.pdf');

  // Post-submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentSimulatedStatus, setCurrentSimulatedStatus] = useState<
    'Pending' | 'Approved' | 'Rejected' | 'Additional Information Required'
  >('Pending');
  const [rejectionReason] = useState(
    'Uploaded departmental authorization certificate is missing the official seal of the State Disaster Management Authority.'
  );

  // Submit Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();

    const result = AuthService.submitOfficerFullRegistration({
      fullName,
      dob: '1988-06-14',
      officialPhone,
      officialEmail,
      profilePhoto,
      state: 'Mizoram',
      district,
      postingLocation: district,
      designation,
      department,
      officialId: employeeId,
      yearsOfService: '6 Years',
      assignedDistrict: district,
      assignedSector: assignedArea,
      operationalProfile,
      documents: {
        idCardName: officialIdDoc,
        appointmentCertName: appointmentCertDoc,
        deptAuthCertName: deptAuthCertDoc,
        serviceCertName: otherOfficialDoc,
      },
      primaryDistrict: district,
      assignedSectorsZones: assignedArea,
      operationalResponsibilities:
        operationalProfile === 'Monitoring & Coordination Officer'
          ? 'Risk monitoring, hazard triage and response coordination'
          : 'Rapid ground investigation and slope evidence verification',
      emergencyContact: officialPhone,
    });

    if (result.request) {
      onRegisteredPending?.(result.request);
    }
    setIsSubmitted(true);
  };

  // =========================================================================
  // POST-SUBMISSION STATUS SCREEN
  // =========================================================================
  if (isSubmitted) {
    return (
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 text-left space-y-5 shadow-xl font-sans">
        <div className="border-b border-slate-800 pb-4">
          <div className="text-xs font-bold text-blue-400 tracking-wider uppercase mb-1">
            FIELD OFFICER ACCESS REGISTRATION
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            {currentSimulatedStatus === 'Pending' && 'REGISTRATION SUBMITTED'}
            {currentSimulatedStatus === 'Approved' && 'Application Approved'}
            {currentSimulatedStatus === 'Rejected' && 'Application Rejected'}
            {currentSimulatedStatus === 'Additional Information Required' && 'Additional Information Required'}
          </h2>
        </div>

        {/* Status: Pending */}
        {currentSimulatedStatus === 'Pending' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono-code uppercase text-[10px]">Status:</span>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px] font-mono-code">
                  PENDING ADMIN APPROVAL
                </span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed pt-1">
                Your Field Officer account is pending administrative approval.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The officer cannot access the platform until an authorized SDMA Administrator verifies official credentials, departmental identity, and uploaded documentation.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono-code">
              <div>Applicant: <strong className="text-white">{fullName}</strong></div>
              <div>Operational Profile: <strong className="text-blue-300">{operationalProfile}</strong></div>
              <div>Employee ID: <strong className="text-white">{employeeId}</strong></div>
              <div>Department: <strong className="text-white">{department}</strong></div>
            </div>
          </div>
        )}

        {/* Status: Approved */}
        {currentSimulatedStatus === 'Approved' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  APPROVED
                </span>
              </div>
              <p className="text-emerald-200 leading-relaxed pt-1">
                Your credentials have been verified by SDMA Administration. Operational privileges are active.
              </p>
            </div>

            {onApprovedLogin && (
              <button
                type="button"
                onClick={() =>
                  onApprovedLogin({
                    id: employeeId,
                    role: 'officer',
                    name: fullName,
                    officialId: employeeId,
                    locationOrDistrict: district,
                    assignedSector: assignedArea,
                  })
                }
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-md"
              >
                Open Field Officer Interface &rarr;
              </button>
            )}
          </div>
        )}

        {/* Status: Rejected */}
        {currentSimulatedStatus === 'Rejected' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  REJECTED
                </span>
              </div>
              <div className="pt-1">
                <span className="text-red-300 font-semibold block mb-1">Reason for Rejection:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-red-500/20">
                  "{rejectionReason}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setStep(3); // return to documents step
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Re-upload Corrected Documents &rarr;
            </button>
          </div>
        )}

        {/* Status: Additional Information Required */}
        {currentSimulatedStatus === 'Additional Information Required' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  ADDITIONAL INFORMATION REQUIRED
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed pt-1">
                Please attach an updated district outpost deployment order countersigned by the Executive Magistrate.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setStep(3);
              }}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer"
            >
              Attach Requested Documentation &rarr;
            </button>
          </div>
        )}

        {/* Quick Simulator Buttons for Verification States */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Simulate Admin Review State:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(['Pending', 'Approved', 'Rejected', 'Additional Information Required'] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrentSimulatedStatus(st)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer text-center truncate ${
                    currentSimulatedStatus === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'Additional Information Required' ? 'Info Required' : st}
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-2 text-slate-400 hover:text-white text-xs text-center cursor-pointer"
        >
          &larr; Return to Sign In
        </button>
      </div>
    );
  }

  // =========================================================================
  // MULTI-STEP REGISTRATION FORM (STEPS 1 TO 4)
  // =========================================================================
  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-5 sm:p-6 text-left shadow-xl font-sans space-y-5">
      {/* Header & Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            FIELD OFFICER REGISTRATION
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {step === 1 && 'STEP 1: Personal Details'}
            {step === 2 && 'STEP 2: Official Details'}
            {step === 3 && 'STEP 3: Document Verification'}
            {step === 4 && 'STEP 4: Review Application'}
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400">Step {step} of 4</div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PERSONAL DETAILS                                                  */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Officer T. Sangma"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Official Phone</label>
            <input
              type="tel"
              required
              value={officialPhone}
              onChange={(e) => setOfficialPhone(e.target.value)}
              placeholder="+91 94361 88210"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Official Email</label>
            <input
              type="email"
              required
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              placeholder="officer@sdma.gov.in"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Profile Photo</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
              />
              <span className="px-3 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs shrink-0">
                Attached
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              &larr; Back to Login
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
            >
              Next: Official Details &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: OFFICIAL DETAILS                                                  */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Designation</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Geotechnical Field Inspector"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Department / Organization
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. State Disaster Management Authority (SDMA)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Employee ID</label>
            <input
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. OFF-8821"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Aizawl District"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Area</label>
              <input
                type="text"
                required
                value={assignedArea}
                onChange={(e) => setAssignedArea(e.target.value)}
                placeholder="e.g. Sector A & B"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Operational Profile Assignment</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOperationalProfile('Monitoring & Coordination Officer');
                  setDesignation('Disaster Monitoring & Coordination Officer');
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  operationalProfile === 'Monitoring & Coordination Officer'
                    ? 'bg-blue-500/20 border-blue-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-[11px] text-blue-300 uppercase">Monitoring &amp; Coordination</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Risk monitoring &amp; emergency coordination</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOperationalProfile('Field Investigation Officer');
                  setDesignation('Senior Field Investigation Officer');
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  operationalProfile === 'Field Investigation Officer'
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-[11px] text-amber-300 uppercase">Field Investigation</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">On-ground inspection &amp; evidence verification</div>
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
            >
              Next: Document Verification &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DOCUMENT VERIFICATION                                             */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-3.5 text-xs">
          <p className="text-slate-400">
            Upload institutional credentials for administrator background verification:
          </p>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              1. Official ID Card
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={officialIdDoc}
                onChange={(e) => setOfficialIdDoc(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs shrink-0">
                Uploaded
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              2. Appointment / Employment Certificate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={appointmentCertDoc}
                onChange={(e) => setAppointmentCertDoc(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs shrink-0">
                Uploaded
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              3. Field Officer / Department Authorization Certificate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deptAuthCertDoc}
                onChange={(e) => setDeptAuthCertDoc(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs shrink-0">
                Uploaded
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              4. Other Required Official Document
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={otherOfficialDoc}
                onChange={(e) => setOtherOfficialDoc(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs shrink-0">
                Uploaded
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
            >
              Next: Review Application &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW APPLICATION                                                */}
      {/* ========================================================================= */}
      {step === 4 && (
        <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-slate-400 font-semibold pb-2 border-b border-slate-800">
              Application Summary
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">Full Name:</span>
                <span className="text-white font-medium">{fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Official Email:</span>
                <span className="text-white font-medium">{officialEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Official Phone:</span>
                <span className="text-white font-medium">{officialPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Employee ID:</span>
                <span className="text-white font-medium font-mono">{employeeId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Designation:</span>
                <span className="text-white font-medium">{designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Department:</span>
                <span className="text-white font-medium">{department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">District:</span>
                <span className="text-white font-medium">{district}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Area:</span>
                <span className="text-white font-medium">{assignedArea}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="text-slate-300 font-medium block">Verified Documents Attached:</span>
              <div>&bull; Official ID: {officialIdDoc}</div>
              <div>&bull; Appointment Order: {appointmentCertDoc}</div>
              <div>&bull; Department Authorization: {deptAuthCertDoc}</div>
              <div>&bull; Other Document: {otherOfficialDoc}</div>
            </div>
          </div>

          <div className="pt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              &larr; Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              [ SUBMIT FOR VERIFICATION ]
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
