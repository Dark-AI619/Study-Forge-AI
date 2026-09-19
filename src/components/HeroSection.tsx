import React from 'react';
import { HERO_IMAGE_URL } from '../data/content';

interface HeroSectionProps {
  onStartFree: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartFree, onWatchDemo }) => {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-10 pb-20 flex flex-col items-center text-center relative">
      {/* Eyebrow Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#262a33]/80 border border-white/[0.08] backdrop-blur-md shadow-sm mb-8 transition-all hover:scale-105 hover:border-[#4cd7f6]/40 cursor-default">
        <span className="w-2 h-2 rounded-full bg-[#4cd7f6] shadow-[0_0_10px_#4cd7f6] animate-pulse"></span>
        <span className="font-mono text-xs font-semibold text-[#4cd7f6] tracking-wide">
          ⚡ Introducing StudyForge 3.0 • Powered by Multi-Modal Reasoning
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#dfe2ee] max-w-5xl tracking-tight leading-[1.12] mb-6">
        Turn Complex Knowledge into{' '}
        <span className="bg-gradient-to-r from-[#4cd7f6] via-[#c4e7ff] to-[#d0bcff] bg-clip-text text-transparent">
          Unshakeable Mastery
        </span>
      </h1>

      {/* Subtitle */}
      <p className="font-sans text-base sm:text-lg text-[#bcc9cd] max-w-3xl mb-10 leading-relaxed font-normal">
        The AI-native learning operating system that ingests textbook PDFs, research papers, and lectures into structured active-recall pipelines, generative flashcards, and adaptive retention loops.
      </p>

      {/* Dual CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
        <button
          onClick={onStartFree}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-semibold text-base shadow-[0_0_28px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          id="hero-start-free-btn"
        >
          <span>Start Learning Free</span>
          <span className="material-symbols-outlined text-[20px]">bolt</span>
        </button>

        <button
          onClick={onWatchDemo}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#262a33]/60 hover:bg-[#262a33] text-[#dfe2ee] font-semibold text-base backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          id="hero-watch-demo-btn"
        >
          <span className="material-symbols-outlined text-[#4cd7f6] text-[22px]">play_circle</span>
          <span>Watch 2-Min Demo</span>
        </button>
      </div>

      {/* Central Showcase with floating contextual telemetry pills */}
      <div className="relative w-full max-w-5xl group">
        {/* Ambient backing frame */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#4cd7f6]/30 via-[#571bc1]/20 to-[#06b6d4]/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

        <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0e16] border border-white/[0.1] shadow-2xl">
          <img
            src={HERO_IMAGE_URL}
            alt="StudyForge AI holographic neural book synthesis visual"
            className="w-full h-auto object-cover max-h-[580px] filter brightness-[1.05] contrast-[1.05] transition-transform duration-700 group-hover:scale-[1.01]"
          />

          {/* Visual Vignette Gradient for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e16] via-transparent to-transparent opacity-80 pointer-events-none"></div>

          {/* Floating Glassmorphic Telemetry Node 1: Left Top */}
          <div className="absolute top-8 left-6 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#262a33]/85 backdrop-blur-2xl border border-white/[0.1] shadow-xl animate-[bounce_4s_infinite]">
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[10px] uppercase text-[#bcc9cd] tracking-wider">
                Synthesis Engine
              </span>
              <span className="font-mono text-xs font-semibold text-[#4cd7f6]">
                Active Neural: 98.4%
              </span>
            </div>
          </div>

          {/* Floating Glassmorphic Telemetry Node 2: Right Center */}
          <div className="absolute top-1/3 right-6 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#262a33]/85 backdrop-blur-2xl border border-white/[0.1] shadow-xl animate-[bounce_5s_infinite]">
            <div className="w-8 h-8 rounded-lg bg-[#571bc1]/30 flex items-center justify-center text-[#d0bcff]">
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[10px] uppercase text-[#bcc9cd] tracking-wider">
                Cognitive Load
              </span>
              <span className="font-mono text-xs font-semibold text-[#dfe2ee]">
                Balanced (Optimal)
              </span>
            </div>
          </div>

          {/* Floating Glassmorphic Telemetry Node 3: Bottom Left */}
          <div className="absolute bottom-8 left-8 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#262a33]/85 backdrop-blur-2xl border border-white/[0.1] shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-[#23b2ec]/20 flex items-center justify-center text-[#7bd0ff]">
              <span className="material-symbols-outlined text-[18px]">history_toggle_off</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[10px] uppercase text-[#bcc9cd] tracking-wider">
                Spaced Repetition
              </span>
              <span className="font-mono text-xs font-semibold text-[#dfe2ee]">
                Next Review: in 3h 14m
              </span>
            </div>
          </div>

          {/* Floating Glassmorphic Telemetry Node 4: Bottom Right */}
          <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0a0e16]/90 backdrop-blur-xl border border-white/[0.08] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping"></span>
            <span className="font-mono text-xs text-[#bcc9cd]">
              Realtime Multi-Modal Vector Stream
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="flex flex-col items-center p-6 rounded-2xl bg-[#181c24] border border-white/[0.06] shadow-sm hover:border-[#4cd7f6]/30 transition-all">
          <span className="font-sans text-4xl sm:text-5xl font-extrabold text-[#4cd7f6] tracking-tight">
            94%
          </span>
          <span className="font-sans text-lg text-[#dfe2ee] font-semibold mt-1">
            Retention Boost
          </span>
          <span className="font-sans text-xs text-[#bcc9cd] mt-1 text-center">
            Measured against traditional passive reading over 60 days
          </span>
        </div>

        <div className="flex flex-col items-center p-6 rounded-2xl bg-[#181c24] border border-white/[0.06] shadow-sm hover:border-[#d0bcff]/30 transition-all">
          <span className="font-sans text-4xl sm:text-5xl font-extrabold text-[#d0bcff] tracking-tight">
            4.2x
          </span>
          <span className="font-sans text-lg text-[#dfe2ee] font-semibold mt-1">
            Faster Comprehension
          </span>
          <span className="font-sans text-xs text-[#bcc9cd] mt-1 text-center">
            Via semantic chunking &amp; interactive Socratic dissection
          </span>
        </div>

        <div className="flex flex-col items-center p-6 rounded-2xl bg-[#181c24] border border-white/[0.06] shadow-sm hover:border-[#7bd0ff]/30 transition-all">
          <span className="font-sans text-4xl sm:text-5xl font-extrabold text-[#7bd0ff] tracking-tight">
            120k+
          </span>
          <span className="font-sans text-lg text-[#dfe2ee] font-semibold mt-1">
            Active Learners
          </span>
          <span className="font-sans text-xs text-[#bcc9cd] mt-1 text-center">
            Engineers, med students, PhD candidates &amp; researchers
          </span>
        </div>
      </div>
    </section>
  );
};
