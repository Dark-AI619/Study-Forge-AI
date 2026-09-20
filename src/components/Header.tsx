import React, { useState } from 'react';
import { ActiveScreen } from '../types';
import { LOGO_URL } from '../data/content';

interface HeaderProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  onOpenSignIn: () => void;
  onOpenAISetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  setActiveScreen,
  onOpenSignIn,
  onOpenAISetup
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (screen: ActiveScreen, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveScreen(screen);
    setMobileMenuOpen(false);

    // If switching to all, scroll to top
    if (screen === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // scroll to that section if in 'all' mode, or show dedicated view
      const target = document.getElementById(screen);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#181c24]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_16px_rgba(0,0,0,0.4)] transition-all">
      <div className="h-20 w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            onClick={(e) => handleNavClick('all', e)}
            className="flex items-center gap-3 group cursor-pointer"
            id="brand-logo-link"
          >
            <div className="relative flex items-center justify-center">
              <img
                src={LOGO_URL}
                alt="StudyForge AI Logo"
                className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#4cd7f6]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-sans text-lg font-bold tracking-tight text-[#dfe2ee] leading-none group-hover:text-[#4cd7f6] transition-colors">
                StudyForge<span className="text-[#4cd7f6]">.ai</span>
              </span>
              <span className="font-mono text-[10px] text-[#bcc9cd] tracking-wider uppercase mt-1">
                Cognitive Core
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={(e) => handleNavClick('all', e)}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeScreen === 'all'
                ? 'text-[#4cd7f6] font-semibold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={(e) => handleNavClick('pipeline', e)}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeScreen === 'pipeline'
                ? 'text-[#4cd7f6] font-semibold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={(e) => handleNavClick('ai-workspace', e)}
            className={`text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeScreen === 'ai-workspace'
                ? 'text-[#4cd7f6] font-semibold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            <span>AI Workspace</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30">
              Study
            </span>
          </button>
          <button
            onClick={(e) => handleNavClick('pdf-transformer', e)}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeScreen === 'pdf-transformer'
                ? 'text-[#4cd7f6] font-semibold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            PDF Transformer
          </button>
          <button
            onClick={(e) => handleNavClick('mastery-dashboard', e)}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeScreen === 'mastery-dashboard'
                ? 'text-[#4cd7f6] font-semibold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            Mastery Dashboard
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onOpenAISetup();
            }}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeScreen === 'pricing'
                ? 'text-[#4cd7f6] font-semibold'
                : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
            }`}
          >
            AI Setup
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSignIn}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33] transition-colors cursor-pointer"
            id="sign-in-btn"
          >
            Sign In
          </button>

          <button
            onClick={() => setActiveScreen('ai-workspace')}
            className="relative group inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-semibold text-xs tracking-wide shadow-[0_0_18px_rgba(6,182,212,0.3)] hover:shadow-[0_0_28px_rgba(6,182,212,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden cursor-pointer"
            id="launch-workspace-header-btn"
          >
            <span className="relative z-10 font-sans">Launch Workspace</span>
            <span className="material-symbols-outlined ml-1 text-[16px] relative z-10 text-[#acedff] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* User Avatar */}
          <div
            onClick={onOpenSignIn}
            className="w-8 h-8 rounded-full bg-[#4cd7f6] flex items-center justify-center text-[#003640] hover:ring-2 hover:ring-[#4cd7f6]/50 transition-all cursor-pointer shadow-sm"
            title="Account & Profile"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#bcc9cd] hover:text-[#dfe2ee] rounded-lg bg-[#262a33]/60 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#181c24] border-b border-white/[0.08] px-5 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={(e) => handleNavClick('all', e)}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            Overview
          </button>
          <button
            onClick={(e) => handleNavClick('pipeline', e)}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            Pipeline
          </button>
          <button
            onClick={(e) => handleNavClick('ai-workspace', e)}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#4cd7f6] hover:bg-[#262a33] flex items-center justify-between"
          >
            <span>Study AI</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#06b6d4]/20 text-[#4cd7f6]">
              Study
            </span>
          </button>
          <button
            onClick={(e) => handleNavClick('pdf-transformer', e)}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            PDF Transformer
          </button>
          <button
            onClick={(e) => handleNavClick('mastery-dashboard', e)}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            Mastery Dashboard
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAISetup();
            }}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            AI Setup
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSignIn();
            }}
            className="text-left py-2 px-3 rounded-lg text-sm text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33]"
          >
            Sign In / Profile
          </button>
        </div>
      )}
    </header>
  );
};
