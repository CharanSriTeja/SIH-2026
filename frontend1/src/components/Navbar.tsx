import React, { useState } from 'react';
import { Menu, X, Shield, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onNavigateSection: (sectionId: string) => void;
  authenticatedUser?: { role: string; name: string } | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onNavigateSection,
  authenticatedUser,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pointer-events-none">
      <div className="max-w-7xl mx-auto bg-[#FFFDF8] border border-[#DDD6C4] rounded-2xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between pointer-events-auto shadow-[0_2px_8px_rgba(35,38,31,0.06)]">
        {/* Left: Brand */}
        <div
          onClick={() => handleNavClick('section-1')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl border border-[#CAD7CE] bg-[#E8EFEA] group-hover:bg-[#2E4A3D] flex items-center justify-center transition-all duration-200">
            <Shield className="w-5 h-5 text-[#2E4A3D] group-hover:text-[#FFFDF8] transition-colors" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-serif font-bold tracking-wider text-[#23261F] uppercase leading-none">
              BHURAKSHA 2.0
            </span>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium text-[#55594C] mt-1 leading-none">
              Landslide Early Warning &amp; Risk Platform
            </span>
          </div>
        </div>

        {/* Center: Overview nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleNavClick('section-1')}
            className="px-4 py-2 text-xs font-sans font-semibold text-[#55594C] hover:text-[#23261F] hover:bg-[#EDE8DE]/70 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('section-4')}
            className="px-4 py-2 text-xs font-sans font-semibold text-[#55594C] hover:text-[#23261F] hover:bg-[#EDE8DE]/70 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Live Risk Map
          </button>
        </nav>

        {/* Right: User State / Auth Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {authenticatedUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#E8EFEA] border border-[#CAD7CE] px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#4F8F5B]" />
                <span className="text-xs font-sans font-semibold text-[#2E4A3D]">
                  {authenticatedUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono-code text-[#55594C] uppercase">
                  ({authenticatedUser.role})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-xs uppercase text-[#55594C] hover:text-[#8A2418]"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenAuth('signin')}
                className="text-xs uppercase font-medium"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('register')}
                className="text-xs uppercase font-semibold"
              >
                Register Citizen
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl border-2 border-[#BCB29E] bg-[#EDE7DC] flex items-center justify-center text-[#141712] hover:bg-[#DED7C8] transition-colors cursor-pointer shadow-2xs"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 bg-white border-2 border-[#BCB29E] rounded-2xl p-4 space-y-3 pointer-events-auto shadow-lg animate-fadeIn">
          <button
            onClick={() => handleNavClick('section-1')}
            className="w-full flex items-center justify-between text-left px-3 py-2.5 text-sm font-medium text-[#141712] hover:bg-[#EDE7DC] rounded-lg transition-colors cursor-pointer"
          >
            <span>Overview &amp; Architecture</span>
            <ChevronRight className="w-4 h-4 text-[#6B7263]" />
          </button>
          <button
            onClick={() => handleNavClick('section-4')}
            className="w-full flex items-center justify-between text-left px-3 py-2.5 text-sm font-medium text-[#141712] hover:bg-[#EDE7DC] rounded-lg transition-colors cursor-pointer"
          >
            <span>Live Regional Risk Map</span>
            <ChevronRight className="w-4 h-4 text-[#6B7263]" />
          </button>

          <div className="pt-2 border-t-2 border-[#D5CCA8] flex flex-col gap-2">
            {authenticatedUser ? (
              <div className="flex items-center justify-between bg-[#E8EFEA] border border-[#CAD7CE] p-3 rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-[#2E4A3D]">{authenticatedUser.name}</div>
                  <div className="text-[11px] text-[#55594C] uppercase">{authenticatedUser.role}</div>
                </div>
                <button
                  onClick={() => {
                    onSignOut?.();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-medium text-[#8A2418] hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
