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
import { LandscapeCanvas } from './components/LandscapeCanvas';
import { UserRole, OfficerOperationalProfile } from './types';
import { Shield, ChevronUp } from 'lucide-react';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'register'>('signin');
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    role: UserRole;
    name: string;
    operationalProfile?: OfficerOperationalProfile;
  } | null>(null);

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
    } else if (newRole === 'officer') {
      name = 'Officer T. Sangma (Field Operations)';
    } else {
      name = 'M. Zothansanga (Resident - Sector A)';
    }
    setAuthenticatedUser({ role: newRole, name });
  };

  const handleSignOut = () => {
    setAuthenticatedUser(null);
  };

  // ==========================================================
  // ROLE-BASED APPLICATION INTERFACE ROUTING (AFTER LOGIN)
  // ==========================================================
  if (authenticatedUser) {
    if (authenticatedUser.role === 'citizen') {
      return (
        <CitizenDashboard
          user={authenticatedUser}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    if (authenticatedUser.role === 'officer') {
      return (
        <FieldOfficerDashboard
          user={authenticatedUser}
          onLogout={handleSignOut}
          onSwitchRole={handleSwitchRole}
        />
      );
    }

    if (authenticatedUser.role === 'admin') {
      return (
        <AdminDashboard
          user={authenticatedUser}
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
    <div className="min-h-screen bg-transparent text-white selection:bg-amber-500/30 selection:text-white font-sans relative">
      {/* 240-Frame Scroll-Controlled Landslide Animation Background Engine */}
      <LandscapeCanvas />

      {/* Clean Public Navigation Bar: Brand, OVERVIEW, SIGN IN, REGISTER */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigateSection={handleNavigateSection}
        authenticatedUser={authenticatedUser}
        onSignOut={handleSignOut}
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
      <footer className="relative z-10 border-t border-white/10 bg-[#080C14]/85 backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white font-heading block">
                BHURAKSHA 2.0
              </span>
              <span className="text-[9px] font-mono-code text-white/50 tracking-widest uppercase">
                AI-POWERED LANDSLIDE RISK MONITORING &amp; EARLY WARNING // NORTH EAST INDIA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono-code text-white/40 uppercase">
            <span>SENSE</span>
            <span>&bull;</span>
            <span>FUSE</span>
            <span>&bull;</span>
            <span>PREDICT</span>
            <span>&bull;</span>
            <span>MAP</span>
            <span>&bull;</span>
            <span>PROTECT</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/10"
          >
            <span>BACK TO TOP</span>
            <ChevronUp className="w-3.5 h-3.5" />
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
