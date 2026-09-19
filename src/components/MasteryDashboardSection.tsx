import React, { useState } from 'react';
import { DOMAIN_METRICS } from '../data/content';

export const MasteryDashboardSection: React.FC = () => {
  const [activePin, setActivePin] = useState<number | null>(null);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [streakCount, setStreakCount] = useState(42);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const pins = [
    { day: 3, stability: '94.2%', x: 95, y: 45, label: 'Spaced Recall 1: Fundamental axioms verified' },
    { day: 7, stability: '92.8%', x: 185, y: 42, label: 'Spaced Recall 2: Bipartite density matrix synthesis' },
    { day: 14, stability: '91.8%', x: 315, y: 40, label: 'Spaced Recall 3: Feynman dialogue validation passed' }
  ];

  const handleDailyCheckin = () => {
    if (!hasCheckedInToday) {
      setStreakCount((prev) => prev + 1);
      setHasCheckedInToday(true);
    }
  };

  return (
    <section id="mastery-dashboard" className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-24 flex flex-col">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-[#7bd0ff] font-mono text-xs uppercase tracking-wider mb-3 font-semibold">
          <span className="material-symbols-outlined text-[16px]">insights</span>
          <span>Empirical Telemetry</span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dfe2ee] tracking-tight">
          Mastery Dashboard &amp; Retention Curves
        </h2>
        <p className="font-sans text-base text-[#bcc9cd] mt-3 leading-relaxed">
          StudyForge AI models your individual forgetting rate against the Ebbinghaus baseline, predicting synaptic retention with mathematical precision.
        </p>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Retention Decay Curve Card (7 cols) */}
        <div className="lg:col-span-7 p-8 rounded-2xl bg-[#181c24] border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="font-sans text-xl text-[#dfe2ee] font-bold">
                  Cognitive Retention Curve
                </h3>
                <p className="font-sans text-xs text-[#bcc9cd] mt-0.5">
                  Protected StudyForge Repetition Loop vs. Standard Decay
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#4cd7f6]">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6] shadow-[0_0_6px_#4cd7f6]"></span>
                  StudyForge
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#869397]">
                  <span className="w-2 h-2 rounded-full bg-[#869397]"></span>
                  Standard Forgetting
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="w-full h-64 mt-4 relative bg-[#0a0e16]/60 rounded-xl p-4 border border-white/[0.04]">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="primaryGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line stroke="#31353e" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="40" y2="40" />
                <line stroke="#31353e" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="90" y2="90" />
                <line stroke="#31353e" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="140" y2="140" />

                {/* Standard Ebbinghaus Decay Curve (gray dashed) */}
                <path
                  d="M 0,50 Q 80,160 250,180 T 500,190"
                  fill="none"
                  stroke="#869397"
                  strokeDasharray="6 6"
                  strokeWidth="2.5"
                />

                {/* StudyForge Protected Active Re-trigger Curve (cyan filled) */}
                <path
                  d="M 0,50 L 90,80 L 95,45 L 180,75 L 185,42 L 310,65 L 315,40 L 500,55 L 500,200 L 0,200 Z"
                  fill="url(#primaryGlow)"
                />
                <path
                  d="M 0,50 L 90,80 L 95,45 L 180,75 L 185,42 L 310,65 L 315,40 L 500,55"
                  fill="none"
                  stroke="#4cd7f6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />

                {/* Spaced recall trigger point pins */}
                {pins.map((pin, i) => (
                  <g key={i} className="cursor-pointer" onClick={() => setActivePin(i)}>
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={activePin === i ? 7 : 5}
                      fill="#d0bcff"
                      stroke="#0f131c"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={10}
                      fill="#d0bcff"
                      opacity={activePin === i ? '0.4' : '0.15'}
                      className="animate-ping"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip on active pin */}
              {activePin !== null && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#262a33] text-[#dfe2ee] px-3.5 py-2 rounded-lg border border-[#d0bcff]/40 shadow-xl text-xs font-mono z-10 flex items-center gap-2">
                  <span className="text-[#4cd7f6] font-bold">Day {pins[activePin].day}:</span>
                  <span>{pins[activePin].label}</span>
                  <span className="text-[#d0bcff] font-bold">({pins[activePin].stability})</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin(null);
                    }}
                    className="ml-2 text-[#869397] hover:text-white"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between font-mono text-xs">
            <span className="text-[#869397]">Day 0 (Initial Lecture)</span>
            <span className="text-[#4cd7f6] font-semibold">Day 30 (91.2% Memory Stability)</span>
          </div>
        </div>

        {/* Streak & Velocity Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Daily Streak Counter Card */}
          <div className="p-6 rounded-2xl bg-[#181c24] border border-white/[0.08] shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                onClick={handleDailyCheckin}
                className="w-14 h-14 rounded-2xl bg-[#06b6d4]/20 flex items-center justify-center text-primary text-[28px] shadow-[0_0_16px_rgba(6,182,212,0.3)] cursor-pointer hover:scale-110 active:scale-95 transition-all"
                title="Click to check in today!"
              >
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-4xl font-extrabold text-[#dfe2ee] tracking-tight">
                    {streakCount}
                  </span>
                  <span className="font-sans text-lg text-[#4cd7f6] font-bold uppercase">
                    Days
                  </span>
                </div>
                <p className="font-sans text-xs text-[#bcc9cd]">
                  {hasCheckedInToday ? 'Checked in today! Synapse loop fortified.' : 'Daily uninterrupted cognitive synthesis streak'}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-semibold border border-[#4cd7f6]/30">
              Top 1% Global
            </span>
          </div>

          {/* Topic Mastery Radar / Category Index Card */}
          <div className="p-6 rounded-2xl bg-[#181c24] border border-white/[0.08] shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-sans text-base text-[#dfe2ee] font-bold">
                Domain Mastery Matrix
              </h4>
              <span className="font-mono text-xs text-[#869397]">Updated 12m ago</span>
            </div>

            <div className="space-y-4">
              {DOMAIN_METRICS.map((metric) => (
                <div key={metric.name}>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-[#dfe2ee] truncate mr-2">{metric.name}</span>
                    <span className={`${metric.colorClass} font-bold`}>{metric.percent}%</span>
                  </div>
                  <div className="w-full bg-[#0a0e16] h-2 rounded-full overflow-hidden">
                    <div
                      className={`${metric.barColor} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${metric.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[#bcc9cd] font-mono text-xs">
              <span>
                Overall Index: <strong className="text-[#dfe2ee]">89.3 GPA Equivalent</strong>
              </span>
              <button
                onClick={() => setShowTreeModal(true)}
                className="text-[#4cd7f6] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
              >
                <span>View Complete Tree</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Knowledge Tree Modal */}
      {showTreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#181c24] border border-[#4cd7f6]/40 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[24px]">account_tree</span>
                <h3 className="font-sans text-xl font-bold text-[#dfe2ee]">
                  Complete Topological Knowledge Tree
                </h3>
              </div>
              <button
                onClick={() => setShowTreeModal(false)}
                className="w-8 h-8 rounded-lg bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-sans text-xs text-[#bcc9cd] mb-6">
              Hierarchical prerequisite dependencies calculated from multi-pass textbook extraction. High-density topics automatically gate dependent advanced corollaries.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#4cd7f6] font-semibold">1. Linear Algebra &amp; Inner Product Spaces</span>
                  <div className="font-sans text-xs text-[#869397] mt-0.5">Dual spaces, bra-ket notation, self-adjoint operators</div>
                </div>
                <span className="font-mono text-xs text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded-full font-bold">100% Mastered</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#4cd7f6] font-semibold">2. Density Operators &amp; Mixed Ensembles</span>
                  <div className="font-sans text-xs text-[#869397] mt-0.5">Von Neumann entropy, partial trace, Kraus operators</div>
                </div>
                <span className="font-mono text-xs text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded-full font-bold">96% Mastered</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#d0bcff] font-semibold">3. Open Quantum Systems &amp; Decoherence</span>
                  <div className="font-sans text-xs text-[#869397] mt-0.5">Lindblad master equation, Born-Markov approximation</div>
                </div>
                <span className="font-mono text-xs text-[#d0bcff] bg-[#d0bcff]/15 px-2.5 py-1 rounded-full font-bold">88% Progress</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#869397] font-semibold">4. Quantum Information Theory &amp; Error Correction</span>
                  <div className="font-sans text-xs text-[#869397] mt-0.5">Shor codes, surface codes, fault-tolerant thresholds</div>
                </div>
                <span className="font-mono text-xs text-[#869397] bg-[#262a33] px-2.5 py-1 rounded-full">Locked</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTreeModal(false)}
                className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-xs text-[#dfe2ee] font-mono cursor-pointer"
              >
                Close Tree
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
