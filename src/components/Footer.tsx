import React, { useState } from 'react';
import { LOGO_URL } from '../data/content';
import { ActiveScreen } from '../types';

interface FooterProps {
  onNavigate: (screen: ActiveScreen) => void;
  onOpenPricing: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPricing }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="w-full bg-[#0a0e16] border-t border-white/[0.06] pt-16 pb-12 text-[#bcc9cd] font-sans">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 mb-4 cursor-pointer group"
            >
              <img
                src={LOGO_URL}
                alt="StudyForge AI"
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-sans text-xl font-bold text-[#dfe2ee] tracking-tight group-hover:text-[#4cd7f6] transition-colors">
                StudyForge<span className="text-[#4cd7f6]">.ai</span>
              </span>
            </a>

            <p className="font-sans text-xs text-[#bcc9cd] leading-relaxed max-w-sm mb-6">
              The AI-native learning operating system turning dense textbooks, papers, and lectures into structured active-recall pipelines, generative flashcards, and adaptive retention loops.
            </p>

            {/* Operational Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181c24] border border-white/[0.06] font-mono text-[11px] text-[#4cd7f6]">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
              <span>All Systems Operational (42ms Latency)</span>
            </div>
          </div>

          {/* Platform Links (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3 text-xs">
            <span className="font-mono text-[11px] text-[#dfe2ee] uppercase tracking-wider font-bold mb-1">
              Platform
            </span>
            <button
              onClick={() => onNavigate('pipeline')}
              className="text-left text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer"
            >
              6-Phase Pipeline
            </button>
            <button
              onClick={() => onNavigate('ai-workspace')}
              className="text-left text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer"
            >
              AI Workspace Cockpit
            </button>
            <button
              onClick={() => onNavigate('pdf-transformer')}
              className="text-left text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer"
            >
              PDF Transformer
            </button>
            <button
              onClick={() => onNavigate('mastery-dashboard')}
              className="text-left text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer"
            >
              Mastery Dashboard
            </button>
            <button
              onClick={onOpenPricing}
              className="text-left text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer"
            >
              Pricing &amp; Plans
            </button>
          </div>

          {/* Resources & Integrations (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3 text-xs">
            <span className="font-mono text-[11px] text-[#dfe2ee] uppercase tracking-wider font-bold mb-1">
              Integrations
            </span>
            <a href="#pdf-transformer" className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors">
              Anki (.apkg) Exporter
            </a>
            <a href="#pdf-transformer" className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors">
              Notion Synapse Sync
            </a>
            <a href="#pipeline" className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors">
              ArXiv Vision OCR
            </a>
            <a href="#mastery-dashboard" className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors">
              FSRS-5 Algorithmic Spec
            </a>
            <a href="#ai-workspace" className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors">
              LaTeX Formula Engine
            </a>
          </div>

          {/* Newsletter Dispatch (3 cols) */}
          <div className="lg:col-span-3 flex flex-col text-xs">
            <span className="font-mono text-[11px] text-[#dfe2ee] uppercase tracking-wider font-bold mb-2">
              Neural Dispatch
            </span>
            <p className="text-[#bcc9cd] text-xs mb-3 leading-relaxed">
              Bi-weekly engineering essays on spaced retrieval, cognitive science, and AST parsing.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-lg bg-[#06b6d4]/15 text-[#4cd7f6] font-mono text-xs border border-[#06b6d4]/30">
                ✓ Subscribed to Neural Dispatch!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="bg-[#181c24] border border-white/[0.08] px-3 py-2 rounded-lg text-xs text-[#dfe2ee] placeholder:text-[#869397] focus:outline-none focus:border-[#4cd7f6] flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-[#262a33] hover:bg-[#06b6d4] hover:text-[#003640] text-[#dfe2ee] font-mono font-semibold transition-all cursor-pointer text-xs"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#869397] gap-4 font-mono">
          <div>
            © {new Date().getFullYear()} StudyForge AI Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#dfe2ee] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#dfe2ee] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#dfe2ee] transition-colors">Security Architecture</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
