import React, { useState } from 'react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchWorkspace: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
  onLaunchWorkspace
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Ingestion & LaTeX OCR',
      description: 'Raw PDF text, high-order tensors, and proof trees are converted into an AST graph with zero OCR symbol loss.',
      previewTag: 'Sakurai Modern Quantum Mechanics, Ch. 4',
      badge: 'Multi-Modal Parser',
      formula: 'ρ_A = \\text{Tr}_B(|\\Psi_{AB}\\rangle\\langle\\Psi_{AB}|)'
    },
    {
      title: '2. Adversarial Socratic Dissection',
      description: 'The Socratic mentor interrogates your intuition with edge cases rather than letting you passively highlight text.',
      previewTag: 'Socratic Dialogue Session',
      badge: 'Adversarial Verifier',
      formula: 'S(ρ) = -\\sum_i \\lambda_i \\ln \\lambda_i \\le \\ln d'
    },
    {
      title: '3. FSRS-5 Spaced Schedule',
      description: 'Retention curves model individual forgetting rates, dynamically queuing review intervals before synaptic decay.',
      previewTag: 'Optimal Spaced Interval: 4.8 Days',
      badge: 'FSRS-5 Dynamic Memory',
      formula: 'R(t) = \\left(1 + \\text{factor} \\cdot \\frac{t}{S}\\right)^{-w}'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#181c24] border border-[#4cd7f6]/40 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#06b6d4]/15 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-2 font-semibold">
          <span className="material-symbols-outlined text-[16px]">play_circle</span>
          <span>Interactive 2-Minute Engine Walkthrough</span>
        </div>

        <h3 className="font-sans text-2xl md:text-3xl font-bold text-[#dfe2ee] mb-6">
          How StudyForge Automates Cognitive Mastery
        </h3>

        {/* Step Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 mb-6 overflow-x-auto">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeStep === idx
                  ? 'bg-[#262a33] text-[#4cd7f6] border border-[#4cd7f6]/40 font-bold shadow-sm'
                  : 'text-[#869397] hover:text-[#dfe2ee]'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Active Step Presentation */}
        <div className="p-6 rounded-2xl bg-[#0a0e16] border border-white/[0.06] mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full bg-[#06b6d4]/15 text-[#4cd7f6] font-mono text-xs font-semibold">
              {steps[activeStep].badge}
            </span>
            <span className="font-mono text-[11px] text-[#869397]">
              {steps[activeStep].previewTag}
            </span>
          </div>

          <p className="font-sans text-sm text-[#dfe2ee] leading-relaxed mb-4">
            {steps[activeStep].description}
          </p>

          <div className="p-4 rounded-xl bg-[#181c24] border border-white/[0.06] font-mono text-xs text-[#acedff] overflow-x-auto">
            <code>{steps[activeStep].formula}</code>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#869397] font-mono">
            <span>Step {activeStep + 1} of {steps.length}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>Sub-second Neural Execution</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
              className="px-4 py-2 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-xs font-mono text-[#dfe2ee] cursor-pointer"
            >
              Next Step →
            </button>

            <button
              onClick={() => {
                onClose();
                onLaunchWorkspace();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-sans text-xs font-semibold shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              Launch Cockpit Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
