import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Section1WhatIs } from './components/public/Section1WhatIs';
import { Section2DataFusion } from './components/public/Section2DataFusion';
import { Section3AiPrediction } from './components/public/Section3AiPrediction';
import { Section4MapAndWarn } from './components/public/Section4MapAndWarn';
import { Section5ReportRespond } from './components/public/Section5ReportRespond';
import { AuthModal } from './components/AuthModal';
import { CitizenDashboard } from './components/CitizenDashboard';
import { FieldOfficerDashboard } from './components/FieldOfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DistrictAdminDashboard } from './components/district-admin/DistrictAdminDashboard';
import { LandscapeCanvas } from './components/LandscapeCanvas';
import { UserRole, OfficerOperationalProfile } from './types';
import { Shield, ChevronUp } from 'lucide-react';

import { useAuth } from './components/auth/AuthContext';
import { LocationPromptModal } from './components/auth/LocationPromptModal';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    role: UserRole;
    name: string;
    operationalProfile?: OfficerOperationalProfile;
  } | null>(null);

  const { user: authUser, logout, updateUserLocation } = useAuth();
  const [sessionLocationGranted, setSessionLocationGranted] = useState(false);
  const [telemetryPhase, setTelemetryPhase] = useState('01 // PEACEFUL TERRAIN');

  const handleOpenAuth = (mode: 'signin' | 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    let name = 'User';
    if (newRole === 'admin') {
      name = 'Dr. R. Lalrinzuala (SDMA Chief Admin)';
    } else if (newRole === 'district_admin') {
      name = 'Officer T. Jamir (District Disaster Administrator)';
    } else if (newRole === 'officer') {
      name = 'Officer T. Sangma (Field Operations)';
    } else {
      name = 'M. Zothansanga (Resident - Sector A)';
    }
    setAuthenticatedUser({ role: newRole, name });
  };

  const handleSignOut = () => {
    setAuthenticatedUser(null);
    setSessionLocationGranted(false);
    logout();
  };

  // Active user resolution
  const activeUser = authenticatedUser || (authUser ? {
    role: authUser.role,
    name: authUser.name || 'Registered Resident'
  } : null);

  // Strict location requirement: immediately after sign-in, prompt user for location
  const isLocationFresh = (): boolean => {
    return sessionLocationGranted;
  };

  // ==========================================================
  // ROLE-BASED APPLICATION INTERFACE ROUTING (AFTER LOGIN)
  // ==========================================================
  if (activeUser) {
    // 1. Mandatory Location Gate check (for citizens whose local risk score depends on device GPS)
    const locationIsFresh = isLocationFresh();
    if (activeUser.role === 'citizen' && !locationIsFresh) {
      return (
        <LocationPromptModal
          isOpen={true}
          userName={activeUser.name}
          onLocationGranted={(coords) => {
            updateUserLocation(coords.latitude, coords.longitude, coords.address_label);
            setSessionLocationGranted(true);
          }}
        />
      );
    }

    // 2. Dashboards once location is verified
    if (activeUser.role === 'citizen') {
      return (
        <CitizenDashboard
          user={activeUser}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    if (activeUser.role === 'officer') {
      return (
        <FieldOfficerDashboard
          user={activeUser}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    if (activeUser.role === 'admin') {
      return (
        <AdminDashboard
          user={activeUser}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    if (activeUser.role === 'district_admin') {
      return (
        <DistrictAdminDashboard
          user={{
            id: authUser?.id,
            role: 'district_admin',
            name: activeUser.name,
            phone_number: authUser?.phone_number,
            district_id: authUser?.district_id
          }}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }
  }

  // ==========================================================
  // PUBLIC PRE-LOGIN INTERFACE (EXACTLY 5 CONTENT SECTIONS)
  // ==========================================================
  return (
    <div className="min-h-screen bg-transparent text-[#23261F] selection:bg-[#B5551F]/20 selection:text-[#23261F] font-sans relative">
      {/* 240-Frame Scroll-Controlled Landslide Animation Background Engine */}
      <LandscapeCanvas onPhaseChange={setTelemetryPhase} />

      {/* Clean Public Navigation Bar: Brand, SIGN IN, REGISTER & Sub-Navbar Telemetry */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigateSection={handleNavigateSection}
        authenticatedUser={authenticatedUser}
        onSignOut={handleSignOut}
        telemetryPhase={telemetryPhase}
      />

      {/* Main Container: Exactly 5 Content Sections Overlaid on Scroll Animation */}
      <main className="relative z-10">
        {/* Section 1: WHAT IS BHURAKSHA 2.0? */}
        <Section1WhatIs
          onOpenAuth={handleOpenAuth}
          onExplore={() => handleNavigateSection('section-2')}
        />

        {/* Section 2: DATA FUSION */}
        <Section2DataFusion />

        {/* Section 3: AI RISK PREDICTION */}
        <Section3AiPrediction />

        {/* Section 4: MAP, IDENTIFY & WARN */}
        <Section4MapAndWarn />

        {/* Section 5: REPORT, RESPOND & PROTECT */}
        <Section5ReportRespond
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* Clean Public Footer */}
      <footer className="relative z-10 border-t border-[#DDD6C4] bg-[#FFFDF8]/95 backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8 text-[#23261F]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl border border-[#CAD7CE] bg-[#E8EFEA] flex items-center justify-center text-[#2E4A3D]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#23261F] font-serif block">
                BHURAKSHA 2.0
              </span>
              <span className="text-[10px] font-mono text-[#55594C] tracking-wider uppercase block mt-0.5">
                Landslide Early Warning &amp; Targeted Risk Intelligence &bull; Northeast India
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#55594C] uppercase tracking-wider">
            <span>SENSE</span>
            <span className="text-[#DDD6C4]">&bull;</span>
            <span>FUSE</span>
            <span className="text-[#DDD6C4]">&bull;</span>
            <span>PREDICT</span>
            <span className="text-[#DDD6C4]">&bull;</span>
            <span>MAP</span>
            <span className="text-[#DDD6C4]">&bull;</span>
            <span>PROTECT</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#55594C] hover:text-[#23261F] transition-colors cursor-pointer px-3.5 py-2 rounded-xl border border-[#DDD6C4] bg-[#FFFDF8] hover:bg-[#EDE8DE] shadow-xs focus-visible:ring-2 focus-visible:ring-[#2E4A3D]/30"
          >
            <span>BACK TO TOP</span>
            <ChevronUp className="w-3.5 h-3.5 text-[#55594C]" />
          </button>
        </div>
      </footer>

      {/* Role-Based Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthenticated={(role, name, operationalProfile) => {
          setAuthenticatedUser({ role, name, operationalProfile });
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}
