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
import { OfficerMultiStepRegistration } from './field-officer/OfficerMultiStepRegistration';
import { OfficerStatusResolution } from './field-officer/OfficerStatusResolution';
import { OfficerProfileSelection } from './field-officer/OfficerProfileSelection';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-[560px] my-auto bg-[#0C121E] border border-white/20 rounded-3xl p-5 sm:p-7 shadow-[0_0_90px_rgba(0,0,0,0.85)] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow according to selected role */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            selectedRole === 'admin'
              ? 'bg-amber-500/10'
              : selectedRole === 'officer'
              ? 'bg-blue-500/10'
              : 'bg-emerald-500/10'
          }`}
        />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-white/50 block">
                BHURAKSHA 2.0
              </span>
              <span className="text-xs font-mono-code text-white font-bold uppercase tracking-wider">
                Disaster Intelligence Platform
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Mode Selector: [ SIGN IN ] [ CITIZEN REGISTER ] */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/10 rounded-xl mb-4.5 h-11">
          <button
            type="button"
            onClick={handleSelectSignIn}
            className={`text-xs uppercase tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono-code ${
              mode === 'signin'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={handleSelectCitizenRegister}
            className={`text-xs uppercase tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono-code ${
              mode === 'register'
                ? 'bg-emerald-400 text-black shadow-md font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CITIZEN REGISTER</span>
          </button>
        </div>

        {/* Section Header: "Who are you?" */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-mono-code uppercase tracking-wider text-white/60 font-semibold">
            Who are you?
          </span>
          <span className="text-[10px] font-mono-code text-white/40 uppercase tracking-widest">
            {selectedRole === 'admin'
              ? 'RESTRICTED / SDMA ONLY'
              : selectedRole === 'officer'
              ? 'AUTHORIZED OFFICIAL ONLY'
              : 'OPEN PUBLIC ACCESS'}
          </span>
        </div>

        {/* 3-Role Architecture Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {/* Card 1: CITIZEN */}
          <button
            type="button"
            onClick={() => handleSelectRole('citizen')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'citizen'
                ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40'
                : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/25 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  selectedRole === 'citizen'
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PUBLIC
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono-code uppercase block text-white">
                CITIZEN
              </span>
              <span className="text-[10px] text-white/60 block leading-tight mt-0.5">
                Public safety &amp; alerts
              </span>
            </div>
          </button>

          {/* Card 2: FIELD OFFICER */}
          <button
            type="button"
            onClick={() => handleSelectRole('officer')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'officer'
                ? 'bg-blue-500/15 border-blue-400 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/40'
                : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/25 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  selectedRole === 'officer'
                    ? 'bg-blue-400/20 text-blue-300'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AUTHORIZED
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono-code uppercase block text-white">
                FIELD OFFICER
              </span>
              <span className="text-[10px] text-white/60 block leading-tight mt-0.5">
                Authorized personnel only
              </span>
              <span className="text-[9px] font-mono-code text-blue-400 font-bold block mt-1">
                &rarr; Request Officer Access
              </span>
            </div>
          </button>

          {/* Card 3: ADMIN / SDMA */}
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'admin'
                ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/25 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  selectedRole === 'admin'
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                RESTRICTED
              </span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono-code uppercase block text-white">
                ADMIN / SDMA
              </span>
              <span className="text-[10px] text-white/60 block leading-tight mt-0.5">
                Authorized administrators only
              </span>
              <span className="text-[9px] font-mono-code text-amber-400 font-bold block mt-1">
                &rarr; Admin Login
              </span>
            </div>
          </button>
        </div>

        {/* Security / Error Message Banner */}
        {errorMessage && (
          <div
            className={`mb-4 p-3.5 rounded-2xl border flex items-start gap-3 text-left animate-shake ${
              errorCode === 'ADMIN_RESTRICTED' || errorCode === 'RESTRICTED_ACCESS'
                ? 'bg-red-500/10 border-red-500/40 text-red-300'
                : errorCode === 'OFFICER_PENDING'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="p-1 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-mono-code font-bold uppercase block tracking-wider">
                {errorTitle || 'Access Restricted'}
              </span>
              <p className="text-white/80 leading-relaxed font-sans">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN MODE (CITIZEN, FIELD OFFICER, ADMIN LOGIN)               */}
        {/* ========================================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            {/* 1A: CITIZEN SIGN IN */}
            {selectedRole === 'citizen' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-code text-white/60">
                  <span>CITIZEN SIGN IN</span>
                  <span className="text-emerald-400">PUBLIC ACCESS PORTAL</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    MOBILE NUMBER OR EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="+91 98620 44102 or resident@gmail.com"
                      className="w-full h-11 bg-[#080C14] border border-white/15 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                    />
                    <Smartphone className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('citizen')}
                      className="text-[10px] font-mono-code text-emerald-400 hover:underline cursor-pointer"
                    >
                      Fill Demo Resident &rarr;
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 bg-[#080C14] border border-white/15 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                    />
                    <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            )}

            {/* 1B: FIELD OFFICER SIGN IN */}
            {selectedRole === 'officer' && officerStatusState && (
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
            )}

            {selectedRole === 'officer' && !officerStatusState && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-code">
                  <span className="text-white/60">OFFICER OPERATIONAL LOGIN</span>
                  <span className="text-blue-400 font-bold">AUTHORIZED PERSONNEL ONLY</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    OFFICIAL OFFICER ID / INSTITUTIONAL EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="OFF-8821 or t.sangma@sdma.gov.in"
                      className="w-full h-11 bg-[#080C14] border border-blue-500/30 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-mono-code"
                    />
                    <FileBadge2 className="w-4 h-4 text-blue-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60">
                      OFFICER SECURITY KEY / PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('officer_approved')}
                      className="text-[10px] font-mono-code text-blue-400 hover:underline cursor-pointer"
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
                      className="w-full h-11 bg-[#080C14] border border-blue-500/30 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-mono-code"
                    />
                    <Lock className="w-4 h-4 text-blue-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Notice & Option to Request Officer Access */}
                <div className="p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/25 flex items-center justify-between text-xs font-mono-code">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px]">No open instant access for officers.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setOfficerSubMode('request_access');
                    }}
                    className="text-[10.5px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Field Officer Registration</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 1C: ADMIN / SDMA SIGN IN */}
            {selectedRole === 'admin' && (
              <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[9px] font-mono-code uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
                  </span>
                  <span className="text-[9px] font-mono-code text-amber-400/80 bg-amber-500/20 px-2 py-0.5 rounded uppercase font-bold">
                    LEVEL-3 RESTRICTED
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    ADMINISTRATOR ID / SDMA COMMAND EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="ADM-4091 or r.lalrinzuala@sdma.gov.in"
                      className="w-full h-11 bg-[#080C14] border border-amber-500/30 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono-code"
                    />
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60">
                      SECURE PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('admin')}
                      className="text-[10px] font-mono-code text-amber-400 hover:underline cursor-pointer"
                    >
                      Fill Demo Admin &rarr;
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 bg-[#080C14] border border-amber-500/30 rounded-xl pl-9 pr-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono-code"
                    />
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="text-[9px] font-mono-code text-white/50 leading-relaxed bg-[#080C14] p-2.5 rounded-xl border border-white/10">
                  <span className="text-amber-400 font-bold block mb-0.5">SECURITY NOTICE:</span>
                  Administrative access is restricted to authorized disaster-management personnel. All login attempts are cryptographically audited.
                </div>
              </div>
            )}

            {/* Submit Button for Sign In */}
            <button
              type="submit"
              disabled={isSuccess}
              className={`w-full h-12 rounded-xl font-mono-code font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-75 ${
                selectedRole === 'admin'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20'
                  : selectedRole === 'officer'
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMessage || 'AUTHENTICATING CLEARANCE...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'admin'
                      ? 'AUTHENTICATE & ENTER COMMAND CENTER →'
                      : selectedRole === 'officer'
                      ? 'SIGN IN AS FIELD OFFICER →'
                      : 'SIGN IN AS CITIZEN →'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTRATION / ACCESS REQUEST MODE                               */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div>
            {/* 2A: CITIZEN REGISTRATION (PUBLICLY ALLOWED) */}
            {selectedRole === 'citizen' && (
              <form onSubmit={handleCitizenRegisterSubmit} className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono-code border-b border-white/10 pb-2">
                  <span className="text-emerald-400 font-bold uppercase">PUBLIC CITIZEN REGISTRATION</span>
                  <span className="text-white/50">FREE COMMUNITY ACCESS</span>
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. M. Zothansanga"
                    className="w-full h-10 bg-[#080C14] border border-white/15 rounded-xl px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    MOBILE NUMBER OR EMAIL
                  </label>
                  <input
                    type="text"
                    required
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder="e.g. +91 98620 44102 or name@gmail.com"
                    className="w-full h-10 bg-[#080C14] border border-white/15 rounded-xl px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    REGISTERED LOCATION / DISTRICT
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="e.g. Sector A (Durtlang Ridge, Aizawl)"
                      className="w-full h-10 bg-[#080C14] border border-white/15 rounded-xl pl-9 pr-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                    />
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono-code uppercase tracking-wider text-white/60 block mb-1">
                    CREATE PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 bg-[#080C14] border border-white/15 rounded-xl px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono-code font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-75 mt-2"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{successMessage || 'CREATING CITIZEN ACCOUNT...'}</span>
                    </>
                  ) : (
                    <>
                      <span>COMPLETE CITIZEN REGISTRATION →</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
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
              <div className="p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 text-left space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono-code text-xs uppercase">
                  <Lock className="w-4 h-4" />
                  <span>PUBLIC ADMIN REGISTRATION NOT PERMITTED</span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed font-sans">
                  Administrative access is restricted to authorized disaster-management personnel. Admin accounts are provisioned exclusively by State Disaster Management Authority (SDMA) system administration.
                </p>

                <div className="p-3 bg-[#080C14] rounded-xl border border-white/10 text-[10px] font-mono-code text-white/50 space-y-1">
                  <div>&bull; Public users cannot register administrative accounts.</div>
                  <div>&bull; Multi-factor institutional clearance is required.</div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectSignIn}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono-code font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
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
        <div className="mt-4 pt-3.5 border-t border-white/10 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-code uppercase text-white/50 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>PROTOTYPE DEMO ACCESS (PRE-AUTHORIZED TEST ACCOUNTS)</span>
            </span>
            <span className="text-[9px] font-mono-code text-amber-400 uppercase">
              SEPARATE DEMO CREDENTIALS
            </span>
          </div>

          <p className="text-[9.5px] font-sans text-white/40 leading-tight">
            Use these pre-authorized accounts to test role-based separation. Administrator and Officer privileges cannot be acquired through public registration.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('citizen')}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>DEMO CITIZEN</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">Public Resident</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_approved')}
              className="px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (ACTIVE)</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">Full Operational</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_pending')}
              className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (PENDING)</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">Awaiting Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_rejected')}
              className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (REJECTED)</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">Ineligible / Denied</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('officer_info')}
              className="px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>OFFICER (INFO REQ)</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">Needs Resubmit</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer font-mono-code text-[9px] font-bold text-left flex flex-col transition-colors"
            >
              <span>DEMO ADMIN</span>
              <span className="text-[7.5px] opacity-70 font-sans font-normal">SDMA Command</span>
            </button>
          </div>
        </div>

        {/* Security Architecture Summary Strip */}
        <div className="mt-3.5 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between text-[8.5px] font-mono-code text-white/40 uppercase tracking-widest gap-1">
          <span className="text-emerald-400/80">PUBLIC: CITIZEN &rarr; REGISTER &rarr; CITIZEN DASHBOARD</span>
          <span className="text-blue-400/80">AUTHORIZED: OFFICER &rarr; REQUEST ACCESS &rarr; VERIFICATION</span>
          <span className="text-amber-400/80">RESTRICTED: ADMIN / SDMA &rarr; LOGIN ONLY</span>
        </div>
      </div>
    </div>
  );
};
