import React, { useState } from 'react';
import { PIPELINE_PHASES } from '../data/content';
import { PipelinePhase } from '../types';

export const PipelineSection: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<PipelinePhase | null>(null);

  return (
    <section id="pipeline" className="w-full bg-[#0a0e16] py-24 relative overflow-hidden border-t border-b border-white/[0.04]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#571bc1]/15 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 flex flex-col relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="flex flex-col max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-3 font-semibold">
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Architectural Flow</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dfe2ee] tracking-tight">
              The 6-Phase Synapse Pipeline
            </h2>
            <p className="font-sans text-base text-[#bcc9cd] mt-3 leading-relaxed">
              From raw, chaotic academic source matter into permanent, interconnected neural mastery. Fully automated, adaptive, and verifiable.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-[#262a33] text-[#bcc9cd] border border-white/[0.06]">
              Continuous Cycle
            </span>
            <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-semibold border border-[#4cd7f6]/30">
              Zero Hallucinations
            </span>
          </div>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PIPELINE_PHASES.map((phase) => (
            <div
              key={phase.number}
              onClick={() => setSelectedPhase(phase)}
              className="group relative flex flex-col p-8 rounded-2xl bg-[#181c24] hover:bg-[#1c2028] border border-white/[0.06] hover:border-[#4cd7f6]/30 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`font-mono text-[11px] px-3 py-1 rounded-full font-bold ${phase.badgeClass}`}>
                  {phase.number}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${phase.iconBgClass}`}>
                  <span className="material-symbols-outlined text-[20px]">{phase.icon}</span>
                </div>
              </div>

              <h3 className="font-sans text-xl text-[#dfe2ee] mb-2.5 font-bold group-hover:text-[#4cd7f6] transition-colors">
                {phase.title}
              </h3>

              <p className="font-sans text-sm text-[#bcc9cd] leading-relaxed mb-6 flex-1">
                {phase.description}
              </p>

              <div className="flex items-center justify-between pt-4 bg-[#0a0e16]/60 -mx-8 -mb-8 px-8 py-4 rounded-b-2xl border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${phase.dotColor}`}></span>
                  <span className="font-mono text-[11px] text-[#bcc9cd]">{phase.highlight}</span>
                </div>
                <span className="material-symbols-outlined text-xs text-[#869397] group-hover:text-[#4cd7f6] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Deep-Dive Modal */}
      {selectedPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#181c24] border border-[#4cd7f6]/30 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-xs px-3 py-1 rounded-full font-bold ${selectedPhase.badgeClass}`}>
                  {selectedPhase.number}
                </span>
                <h3 className="font-sans text-2xl font-bold text-[#dfe2ee]">
                  {selectedPhase.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhase(null)}
                className="w-8 h-8 rounded-lg bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-sans text-sm text-[#bcc9cd] leading-relaxed mb-6">
              {selectedPhase.description}
            </p>

            {selectedPhase.detailedSpecs && (
              <div className="p-4 rounded-xl bg-[#0a0e16] border border-white/[0.06] space-y-3 mb-6">
                <div>
                  <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider block">
                    Algorithmic Foundation
                  </span>
                  <span className="font-sans text-sm font-semibold text-[#4cd7f6]">
                    {selectedPhase.detailedSpecs.algorithmicBase}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider block">
                    Benchmark Throughput
                  </span>
                  <span className="font-mono text-xs text-[#dfe2ee]">
                    {selectedPhase.detailedSpecs.throughput}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider block">
                    Target Memory Artifact
                  </span>
                  <span className="font-sans text-sm text-[#d0bcff]">
                    {selectedPhase.detailedSpecs.targetArtifact}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedPhase(null)}
                className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-sm text-[#dfe2ee] cursor-pointer"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
