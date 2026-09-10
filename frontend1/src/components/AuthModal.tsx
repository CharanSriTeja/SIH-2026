import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  Users,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  MapPin,
  KeyRound,
  FileBadge2,
  Sparkles,
  Smartphone,
  Mail,
  AlertCircle,
  Building,
  AlertTriangle,
  BadgeAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserRole, OfficerAccessRequest, OfficerOperationalProfile } from '../types';
import { AuthService } from '../services/authService';
import { obtainAdminToken } from '../services/districtAdminService';
import { OfficerMultiStepRegistration } from './field-officer/OfficerMultiStepRegistration';
import { OfficerStatusResolution } from './field-officer/OfficerStatusResolution';
import { OfficerProfileSelection } from './field-officer/OfficerProfileSelection';

import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';
import { OtpVerificationForm } from './auth/OtpVerificationForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
  initialRole?: UserRole;
  onAuthenticated?: (role: UserRole, name: string, operationalProfile?: OfficerOperationalProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  initialRole = 'citizen',
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  const [citizenAuthStep, setCitizenAuthStep] = useState<'signup' | 'otp'>('signup');
  const [citizenAuthPhone, setCitizenAuthPhone] = useState('');

  // Field Officer specific sub-view: login or request access
  const [officerSubMode, setOfficerSubMode] = useState<'login' | 'request_access'>('login');

  // Input states for Sign In
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Citizen Register inputs
  const [regName, setRegName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regLocation, setRegLocation] = useState('Sector A (Durtlang Ridge, Aizawl)');
  const [regPassword, setRegPassword] = useState('');

  // Officer Access Request inputs
  const [reqFullName, setReqFullName] = useState('');
  const [reqDesignation, setReqDesignation] = useState('');
  const [reqDepartment, setReqDepartment] = useState('');
  const [reqOfficialId, setReqOfficialId] = useState('');
  const [reqContact, setReqContact] = useState('');
  const [reqDistrict, setReqDistrict] = useState('Aizawl District (Sector A & B)');

  // Request Submission Result / Pending Verification Screen
  const [submittedOfficerRequest, setSubmittedOfficerRequest] = useState<OfficerAccessRequest | null>(null);
  const [selectedOfficerProfile, setSelectedOfficerProfile] = useState<OfficerOperationalProfile | null>(null);

  // Field Officer Status-Based Access State
  const [officerStatusState, setOfficerStatusState] = useState<
    'PENDING_VERIFICATION' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED' | null
  >(null);
  const [officerRequestData, setOfficerRequestData] = useState<OfficerAccessRequest | null>(null);

  // Security & Error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(initialRole);
      setErrorMessage(null);
      setErrorTitle(null);
      setErrorCode(null);
      setIsSuccess(false);
      setSuccessMessage(null);
      setSubmittedOfficerRequest(null);
      setOfficerStatusState(null);
      setOfficerRequestData(null);
      if (initialMode === 'register' && initialRole !== 'citizen') {
        setSelectedRole('citizen');
      }
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  // Handle switching to CITIZEN REGISTER
  const handleSelectCitizenRegister = () => {
    setMode('register');
    setSelectedRole('citizen');
    setErrorMessage(null);
    setSubmittedOfficerRequest(null);
    setOfficerStatusState(null);
  };

  // Handle switching to SIGN IN
  const handleSelectSignIn = () => {
    setMode('signin');
    setErrorMessage(null);
    setSubmittedOfficerRequest(null);
    setOfficerStatusState(null);
  };

  // Handle Role Selection
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSubmittedOfficerRequest(null);
    setOfficerStatusState(null);

    if (role === 'admin') {
      // Admin NEVER has registration
      setMode('signin');
      setSelectedOfficerProfile(null);
    } else if (role === 'officer') {
      if (mode === 'register') {
        // Field Officer has no public self-registration; switch to Request Access
        setOfficerSubMode('request_access');
      } else {
        setOfficerSubMode('login');
      }
    } else {
      setSelectedOfficerProfile(null);
    }
  };

  // Clear demo fill and set pre-authorized personas
  const handleQuickDemoFill = (
    type:
      | 'citizen'
      | 'officer_approved'
      | 'officer_monitoring'
      | 'officer_investigator'
      | 'officer_pending'
      | 'officer_rejected'
      | 'officer_info'
      | 'admin'
  ) => {
    setErrorMessage(null);
    setErrorTitle(null);
    setErrorCode(null);
    setSubmittedOfficerRequest(null);
    setOfficerStatusState(null);
    setOfficerRequestData(null);

    if (type === 'citizen') {
      setMode('signin');
      setSelectedRole('citizen');
      setIdentifier('+91 98620 44102');
      setPassword('citizen@123');
    } else if (type === 'officer_approved' || type === 'officer_monitoring') {
      setMode('signin');
      setSelectedRole('officer');
      setOfficerSubMode('login');
      setIdentifier('OFF-8821');
      setPassword('officer@123');
    } else if (type === 'officer_investigator') {
      setMode('signin');
      setSelectedRole('officer');
      setOfficerSubMode('login');
      setIdentifier('OFF-9042');
      setPassword('officer@123');
    } else if (type === 'officer_pending') {
      setMode('signin');
      setSelectedRole('officer');
      setOfficerSubMode('login');
      setIdentifier('OFF-PENDING');
      setPassword('officer@123');
    } else if (type === 'officer_rejected') {
      setMode('signin');
      setSelectedRole('officer');
      setOfficerSubMode('login');
      setIdentifier('OFF-REJECTED');
      setPassword('officer@123');
    } else if (type === 'officer_info') {
      setMode('signin');
      setSelectedRole('officer');
      setOfficerSubMode('login');
      setIdentifier('OFF-INFO');
      setPassword('officer@123');
    } else if (type === 'admin') {
      setMode('signin');
      setSelectedRole('admin');
      setIdentifier('ADM-4091');
      setPassword('admin@123');
    }
  };

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorTitle(null);
    setErrorCode(null);
    setOfficerStatusState(null);

    const result = AuthService.authenticate(identifier, password, selectedRole);

    if (!result.success) {
      if (result.errorCode === 'OFFICER_PENDING') {
        const reqs = AuthService.getOfficerRequests();
        const found = reqs.find((r) => r.officialId === identifier) || null;
        setOfficerRequestData(found);
        setOfficerStatusState('PENDING_VERIFICATION');
        return;
      }
      if (result.errorCode === 'OFFICER_REJECTED') {
        const reqs = AuthService.getOfficerRequests();
        const found = reqs.find((r) => r.officialId === identifier) || null;
        setOfficerRequestData(found);
        setOfficerStatusState('REJECTED');
        return;
      }
      if (result.errorCode === 'OFFICER_ADDITIONAL_INFO') {
        const reqs = AuthService.getOfficerRequests();
        const found = reqs.find((r) => r.officialId === identifier) || null;
        setOfficerRequestData(found);
        setOfficerStatusState('ADDITIONAL_INFO_REQUIRED');
        return;
      }

      setErrorTitle(result.errorTitle || 'Authentication Failed');
      setErrorMessage(result.errorMessage || 'Access denied.');
      setErrorCode(result.errorCode || null);
      return;
    }

    if (result.user && result.authorizedRole) {
      if (result.authorizedRole === 'admin') {
        obtainAdminToken().catch((e) => console.warn('Admin token background fetch:', e));
      }
      setIsSuccess(true);
      setSuccessMessage(`Authorized: Entering ${result.authorizedRole.toUpperCase()} Dashboard...`);
      setTimeout(() => {
        onAuthenticated?.(result.authorizedRole!, result.user!.name, result.user?.operationalProfile);
        setIsSuccess(false);
        onClose();
      }, 700);
    }
  };

  // Handle Citizen Registration submission
  const handleCitizenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorTitle(null);

    const result = AuthService.registerCitizen({
      name: regName,
      identifier: regIdentifier,
      location: regLocation,
      password: regPassword,
    });

    if (!result.success) {
      setErrorTitle('Registration Error');
      setErrorMessage(result.error || 'Failed to complete registration.');
      return;
    }

    if (result.account) {
      setIsSuccess(true);
      setSuccessMessage('Citizen Account Created! Directing to Citizen Portal...');
      setTimeout(() => {
        onAuthenticated?.('citizen', result.account!.name);
        setIsSuccess(false);
        onClose();
      }, 800);
    }
  };

  // Handle Officer Access Request submission
  const handleOfficerRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorTitle(null);

    const result = AuthService.submitOfficerAccessRequest({
      fullName: reqFullName,
      designation: reqDesignation,
      department: reqDepartment,
      officialId: reqOfficialId,
      officialContact: reqContact,
      assignedDistrict: reqDistrict,
    });

    if (!result.success) {
      setErrorTitle('Request Submission Incomplete');
      setErrorMessage(result.error || 'Please fill in all official departmental credentials.');
      return;
    }

    if (result.request) {
      setSubmittedOfficerRequest(result.request);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-earth-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-[580px] my-auto bg-[#FFFFFF] border-2 border-[#C9C0AD] rounded-3xl p-5 sm:p-7 shadow-2xl text-left text-[#141712]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4 border-b border-[#E2DBD0] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border border-brand-300 bg-brand-100 flex items-center justify-center text-brand-800 shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-700 block font-bold">
                BHURAKSHA 2.0 &bull; LIFE-SAFETY PLATFORM
              </span>
              <span className="text-sm font-serif text-[#141712] font-bold tracking-tight">
                Disaster Intelligence &amp; Early Warning
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl border-2 border-[#BCB29E] bg-[#F5F1E6] flex items-center justify-center text-[#474C3F] hover:text-[#141712] hover:bg-[#EDE7DC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Mode Selector: [ SIGN IN ] [ CITIZEN REGISTER ] */}
        <div className="grid grid-cols-2 p-1.5 bg-[#EDE7DC] border-2 border-[#C9C0AD] rounded-2xl mb-4 h-12">
          <button
            type="button"
            onClick={handleSelectSignIn}
            className={`text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono ${
              mode === 'signin'
                ? 'bg-[#1E4B33] text-white shadow-sm font-bold'
                : 'text-[#474C3F] hover:text-[#141712] font-semibold'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={handleSelectCitizenRegister}
            className={`text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono ${
              mode === 'register'
                ? 'bg-[#1E4B33] text-white shadow-sm font-bold'
                : 'text-[#474C3F] hover:text-[#141712] font-semibold'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CITIZEN REGISTER</span>
          </button>
        </div>

        {/* Section Header: "Who are you?" */}
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#2E3327] font-bold">
            Select Your Role
          </span>
          <span className="text-[10px] font-mono text-[#6B7263] uppercase tracking-wider font-semibold">
            {selectedRole === 'admin'
              ? 'RESTRICTED / SDMA ONLY'
              : selectedRole === 'district_admin'
              ? 'DISTRICT JURISDICTION'
              : selectedRole === 'officer'
              ? 'FIELD VERIFICATION'
              : 'OPEN PUBLIC ACCESS'}
          </span>
        </div>

        {/* 4-Role Architecture Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Card 1: CITIZEN */}
          <button
            type="button"
            onClick={() => handleSelectRole('citizen')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'citizen'
                ? 'bg-[#EBF4EE] border-[#1E4B33] text-[#0D2619] shadow-md ring-2 ring-[#1E4B33]/40'
                : 'bg-[#F5F1E6] border-[#D5CCA8] text-[#4E5446] hover:bg-[#EAE3D2] hover:border-[#BCB29E] hover:text-[#141712]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  selectedRole === 'citizen'
                    ? 'bg-[#1E4B33] text-white'
                    : 'bg-[#E0D7C5] text-[#555A4D]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors ${
                  selectedRole === 'citizen'
                    ? 'bg-[#1E4B33] text-white'
                    : 'bg-[#DAD1BD] text-[#474C3F] border border-[#C5BBA4]'
                }`}
              >
                PUBLIC
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono uppercase block text-[#141712]">
                CITIZEN
              </span>
              <span className="text-[10px] text-[#474C3F] block leading-tight mt-0.5 font-medium">
                Public safety &amp; alerts
              </span>
            </div>
          </button>

          {/* Card 2: DISTRICT ADMIN */}
          <button
            type="button"
            onClick={() => handleSelectRole('district_admin')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'district_admin'
                ? 'bg-[#FDF1EB] border-[#B5551F] text-[#5C2308] shadow-md ring-2 ring-[#B5551F]/40'
                : 'bg-[#F5F1E6] border-[#D5CCA8] text-[#4E5446] hover:bg-[#EAE3D2] hover:border-[#BCB29E] hover:text-[#141712]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  selectedRole === 'district_admin'
                    ? 'bg-[#B5551F] text-white'
                    : 'bg-[#E0D7C5] text-[#555A4D]'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors ${
                  selectedRole === 'district_admin'
                    ? 'bg-[#B5551F] text-white'
                    : 'bg-[#DAD1BD] text-[#474C3F] border border-[#C5BBA4]'
                }`}
              >
                DISTRICT
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono uppercase block text-[#141712]">
                DISTRICT ADMIN
              </span>
              <span className="text-[10px] text-[#474C3F] block leading-tight mt-0.5 font-medium">
                Assigned district desk
              </span>
            </div>
          </button>

          {/* Card 3: FIELD OFFICER */}
          <button
            type="button"
            onClick={() => handleSelectRole('officer')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'officer'
                ? 'bg-[#EDF5F0] border-[#246A44] text-[#113822] shadow-md ring-2 ring-[#246A44]/40'
                : 'bg-[#F5F1E6] border-[#D5CCA8] text-[#4E5446] hover:bg-[#EAE3D2] hover:border-[#BCB29E] hover:text-[#141712]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  selectedRole === 'officer'
                    ? 'bg-[#246A44] text-white'
                    : 'bg-[#E0D7C5] text-[#555A4D]'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors ${
                  selectedRole === 'officer'
                    ? 'bg-[#246A44] text-white'
                    : 'bg-[#DAD1BD] text-[#474C3F] border border-[#C5BBA4]'
                }`}
              >
                FIELD
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono uppercase block text-[#141712]">
                FIELD OFFICER
              </span>
              <span className="text-[10px] text-[#474C3F] block leading-tight mt-0.5 font-medium">
                Field investigations
              </span>
            </div>
          </button>

          {/* Card 4: ADMIN / SDMA */}
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'admin'
                ? 'bg-[#FEF5E7] border-[#B87217] text-[#543004] shadow-md ring-2 ring-[#B87217]/40'
                : 'bg-[#F5F1E6] border-[#D5CCA8] text-[#4E5446] hover:bg-[#EAE3D2] hover:border-[#BCB29E] hover:text-[#141712]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-[#B87217] text-white'
                    : 'bg-[#E0D7C5] text-[#555A4D]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-[#B87217] text-white'
                    : 'bg-[#DAD1BD] text-[#474C3F] border border-[#C5BBA4]'
                }`}
              >
                HQ
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono uppercase block text-[#141712]">
                ADMIN / SDMA
              </span>
              <span className="text-[10px] text-[#474C3F] block leading-tight mt-0.5 font-medium">
                State SDMA Command
              </span>
            </div>
          </button>
        </div>

        {/* Security / Error Message Banner */}
        {errorMessage && (
          <div
            className="mb-4 p-3.5 rounded-xl border border-red-300 bg-red-50 text-red-900 flex items-start gap-3 text-left"
          >
            <div className="p-1 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-mono font-bold uppercase block tracking-wider text-red-900">
                {errorTitle || 'Access Restricted'}
              </span>
              <p className="text-red-800 leading-relaxed font-sans">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN MODE (CITIZEN, DISTRICT ADMIN, SUPER ADMIN LOGIN VIA PHONE) */}
        {/* ========================================================================= */}
        {mode === 'signin' && (selectedRole === 'citizen' || selectedRole === 'district_admin' || selectedRole === 'admin') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-earth-600 mb-1">
              <span className="font-bold uppercase text-earth-900">
                {selectedRole === 'district_admin'
                  ? 'DISTRICT ADMINISTRATOR LOGIN'
                  : selectedRole === 'admin'
                  ? 'SDMA SUPER-ADMIN LOGIN'
                  : 'CITIZEN SIGN IN'}
              </span>
              <span className="text-xs font-medium text-brand-700">
                {selectedRole === 'district_admin' ? 'JURISDICTION ACCESS' : selectedRole === 'admin' ? 'COMMAND LEVEL 3' : 'PUBLIC ACCESS PORTAL'}
              </span>
            </div>

            {selectedRole === 'district_admin' && (
              <div className="p-3 rounded-xl bg-accent-50 border border-accent-200 text-[11px] text-accent-900">
                Enter your 10-digit mobile number and password assigned by the State Disaster Management Authority.
              </div>
            )}

            {selectedRole === 'admin' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <div>
                  <span className="text-earth-600 block text-[10px] uppercase font-mono font-semibold">MAIN ADMIN CREDENTIALS:</span>
                  <span>Mobile: <strong>9999999999</strong> &bull; Password: <strong>AdminPass123!</strong></span>
                </div>
              </div>
            )}

            <LoginForm 
              onSuccess={(role, name) => {
                if (role === 'admin' || selectedRole === 'admin') {
                  obtainAdminToken().catch(() => {});
                }
                onAuthenticated?.((role as UserRole) || selectedRole, name || 'Authorized User');
                onClose();
              }}
              onSwitchToSignup={selectedRole === 'citizen' ? handleSelectCitizenRegister : undefined}
            />
          </div>
        )}

        {mode === 'signin' && selectedRole === 'officer' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            {officerStatusState ? (
              <OfficerStatusResolution
                status={officerStatusState}
                requestData={officerRequestData}
                officerIdentifier={identifier}
                onBackToLogin={() => setOfficerStatusState(null)}
                onReapply={() => {
                  setMode('register');
                  setOfficerSubMode('request_access');
                  setOfficerStatusState(null);
                }}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-earth-700 font-semibold">OFFICER OPERATIONAL LOGIN</span>
                  <span className="text-brand-700 font-bold">AUTHORIZED PERSONNEL ONLY</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2E3327] block mb-1">
                    Official Officer ID / Institutional Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="OFF-8821 or t.sangma@sdma.gov.in"
                      className="w-full h-11 bg-white border-2 border-[#BCB29E] rounded-xl pl-9 pr-3.5 text-xs font-semibold text-[#141712] placeholder:text-[#6B7263] focus:outline-none focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 font-mono shadow-xs"
                    />
                    <FileBadge2 className="w-4 h-4 text-[#6B7263] absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#2E3327]">
                      Officer Security Key / Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('officer_approved')}
                      className="text-[10px] font-mono text-brand-700 hover:underline cursor-pointer font-bold"
                    >
                      Fill Demo Officer &rarr;
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 bg-white border-2 border-[#BCB29E] rounded-xl pl-9 pr-3.5 text-xs font-semibold text-[#141712] placeholder:text-[#6B7263] focus:outline-none focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 font-mono shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-[#6B7263] absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Notice & Option to Request Officer Access */}
                <div className="p-3 rounded-xl bg-earth-100 border border-earth-200 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-earth-700">
                    <Info className="w-3.5 h-3.5 shrink-0 text-brand-700" />
                    <span className="text-[10px]">Pre-clearance required for officers.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setOfficerSubMode('request_access');
                    }}
                    className="text-[10.5px] text-accent-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Field Officer Registration</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Submit Button for Officer Sign In */}
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full h-11 rounded-xl font-sans font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs bg-brand-700 hover:bg-brand-800 text-white disabled:opacity-75"
                >
                  <Lock className="w-4 h-4" />
                  <span>SIGN IN AS FIELD OFFICER &rarr;</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTRATION / ACCESS REQUEST MODE                               */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div>
            {/* 2A: CITIZEN REGISTRATION (PUBLICLY ALLOWED) */}
            {selectedRole === 'citizen' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono border-b border-earth-200 pb-2 mb-2">
                  <span className="text-brand-800 font-bold uppercase">PUBLIC CITIZEN REGISTRATION</span>
                  <span className="text-earth-600">FREE COMMUNITY ACCESS</span>
                </div>
                {citizenAuthStep === 'signup' ? (
                  <SignupForm 
                    onSuccess={(phone) => {
                      setCitizenAuthPhone(phone);
                      setCitizenAuthStep('otp');
                    }}
                    onSwitchToLogin={handleSelectSignIn}
                  />
                ) : (
                  <OtpVerificationForm 
                    phoneNumber={citizenAuthPhone}
                    onSuccess={() => {
                      onAuthenticated?.('citizen', 'Citizen User');
                      onClose();
                    }}
                    onBack={() => setCitizenAuthStep('signup')}
                  />
                )}
              </div>
            )}

            {/* 2B: FIELD OFFICER - RESTRICTED REQUEST ACCESS (4-STEP FORM) */}
            {selectedRole === 'officer' && (
              <OfficerMultiStepRegistration
                onBackToLogin={handleSelectSignIn}
                onRegisteredPending={(req) => {
                  setSubmittedOfficerRequest(req);
                }}
                onApprovedLogin={(account) => {
                  onAuthenticated?.('officer', account.name);
                  onClose();
                }}
              />
            )}

            {/* 2C: ADMIN / SDMA - PUBLIC REGISTRATION STRICTLY FORBIDDEN */}
            {selectedRole === 'admin' && (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold font-mono text-xs uppercase">
                  <Lock className="w-4 h-4" />
                  <span>PUBLIC ADMIN REGISTRATION NOT PERMITTED</span>
                </div>

                <p className="text-xs text-earth-800 leading-relaxed font-sans">
                  Administrative access is restricted to authorized disaster-management personnel. Admin accounts are provisioned exclusively by State Disaster Management Authority (SDMA) system administration.
                </p>

                <div className="p-3 bg-white rounded-xl border border-earth-200 text-[10px] font-mono text-earth-700 space-y-1">
                  <div>&bull; Public users cannot register administrative accounts.</div>
                  <div>&bull; Multi-factor institutional clearance is required.</div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectSignIn}
                  className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>RETURN TO ADMIN LOGIN &rarr;</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEPARATE PROTOTYPE DEMO ACCESS (EXPLICITLY MARKED PROTOTYPE TEST HARNESS) */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-3.5 border-t border-earth-200 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-earth-600 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-accent-700" />
              <span>PROTOTYPE DEMO ACCESS (PRE-AUTHORIZED TEST ACCOUNTS)</span>
            </span>
            <span className="text-[9px] font-mono text-accent-800 uppercase font-semibold">
              PRE-CONFIGURED PERSONAS
            </span>
          </div>

          <p className="text-[10px] font-sans text-earth-600 leading-tight">
            Use these pre-authorized accounts to test role-based separation. Administrator and Officer privileges cannot be acquired through public registration.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('citizen')}
              className="px-2 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>DEMO CITIZEN</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">Public Resident</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_approved')}
              className="px-2 py-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-900 border border-earth-300 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (ACTIVE)</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">Full Operational</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_pending')}
              className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (PENDING)</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">Awaiting Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_rejected')}
              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (REJECTED)</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">Ineligible / Denied</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_info')}
              className="px-2 py-1.5 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-900 border border-earth-300 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (INFO REQ)</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">Needs Resubmit</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer font-mono text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>DEMO ADMIN</span>
              <span className="text-[7.5px] text-earth-600 font-sans font-normal">SDMA Command</span>
            </button>
          </div>
        </div>

        {/* Security Architecture Summary Strip */}
        <div className="mt-3 pt-2.5 border-t border-earth-200 flex flex-wrap items-center justify-between text-[8.5px] font-mono text-earth-500 uppercase tracking-widest gap-1">
          <span className="text-brand-800">PUBLIC: CITIZEN &rarr; REGISTER &rarr; CITIZEN DASHBOARD</span>
          <span className="text-earth-700">AUTHORIZED: OFFICER &rarr; REQUEST ACCESS &rarr; VERIFICATION</span>
          <span className="text-amber-800">RESTRICTED: ADMIN / SDMA &rarr; LOGIN ONLY</span>
        </div>
      </div>
    </div>
  );
};
