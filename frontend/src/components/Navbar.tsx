import React, { useState } from 'react';
import { Menu, X, Shield, ChevronRight } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto bg-[#0C121E]/95 border border-white/10 rounded-2xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between pointer-events-auto shadow-2xl backdrop-blur-xl">
        {/* Left: Brand */}
        <div
          onClick={() => handleNavClick('section-1')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/10 group-hover:border-amber-400 group-hover:bg-amber-500/20 flex items-center justify-center transition-all duration-300">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-bold tracking-[0.16em] text-white font-heading uppercase leading-none">
              BHURAKSHA 2.0
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-white/50 uppercase font-mono-code mt-1 leading-none">
              AI LANDSLIDE RISK INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: ONLY OVERVIEW */}
        <nav className="hidden sm:flex items-center">
          <button
            onClick={() => handleNavClick('section-1')}
            className="px-4 py-1.5 text-xs uppercase tracking-[0.18em] font-semibold text-white/80 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer font-mono-code"
          >
            OVERVIEW
          </button>
        </nav>

        {/* Right: Sign In / Register */}
        <div className="hidden sm:flex items-center gap-3">
          {authenticatedUser ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono-code text-emerald-300 font-bold uppercase tracking-wider">
                  {authenticatedUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono-code text-white/40 uppercase">
                  ({authenticatedUser.role})
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="text-[11px] font-mono-code text-white/50 hover:text-white transition-colors cursor-pointer px-2 py-1"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-4 py-2 text-xs font-mono-code font-semibold tracking-wider text-white/80 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer uppercase border border-white/10"
              >
                SIGN IN
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-mono-code font-bold tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer uppercase shadow-lg shadow-emerald-500/20"
              >
                REGISTER
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 bg-[#0C121E]/95 border border-white/15 rounded-2xl p-4 space-y-3 pointer-events-auto backdrop-blur-2xl shadow-2xl animate-fadeIn">
          <button
            onClick={() => handleNavClick('section-1')}
            className="w-full flex items-center justify-between text-left px-3 py-2.5 text-xs uppercase tracking-[0.16em] font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl font-mono-code"
          >
            <span>OVERVIEW</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {authenticatedUser ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-emerald-400">{authenticatedUser.name}</div>
                  <div className="text-[10px] text-white/50">{authenticatedUser.role}</div>
                </div>
                <button
                  onClick={() => {
                    onSignOut?.();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-mono-code text-white/60 hover:text-white"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="py-2.5 text-center text-xs uppercase font-bold tracking-widest text-white/80 border border-white/15 rounded-xl hover:bg-white/5 font-mono-code"
                >
                  SIGN IN
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2.5 text-center text-xs uppercase font-bold tracking-widest text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl font-mono-code"
                >
                  REGISTER
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
