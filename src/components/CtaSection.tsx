import React, { useState } from 'react';

interface CtaSectionProps {
  onSuccess: (email: string) => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitted(true);
    onSuccess(email);
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-20 pb-28">
      <div className="relative w-full rounded-3xl p-10 md:p-16 lg:p-20 overflow-hidden bg-gradient-to-br from-[#1c2028] to-[#262a33] border border-white/[0.08] shadow-2xl flex flex-col items-center text-center">
        {/* Glow background within the card */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#06b6d4]/30 to-[#571bc1]/30 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Icon & Overline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0e16]/80 text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-6 border border-white/[0.06] font-semibold">
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span>The Future of Intellectual Work</span>
        </div>

        {/* Headline */}
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dfe2ee] max-w-3xl tracking-tight mb-6 leading-tight">
          Forge Your Intellectual Edge Today
        </h2>

        <p className="font-sans text-base text-[#bcc9cd] max-w-2xl mb-10 leading-relaxed">
          Join over 120,000 scholars, engineers, and autodidacts turning dense academic materials into permanent cognitive capability.
        </p>

        {/* Instant Input CTA */}
        {isSubmitted ? (
          <div className="w-full max-w-md p-4 rounded-xl bg-[#0a0e16] border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-xs mb-8 flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-95">
            <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
            <span>Welcome to StudyForge Core! Activation link dispatched to {email}.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl bg-[#0a0e16] border border-white/[0.1] shadow-2xl mb-8"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your academic or work email"
              className="w-full sm:flex-1 bg-transparent px-4 py-3 font-sans text-sm text-[#dfe2ee] placeholder:text-[#869397] focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-sans text-sm font-semibold whitespace-nowrap shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Get Started Free
            </button>
          </form>
        )}

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[#bcc9cd] font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">verified_user</span>
            <span>GDPR &amp; SOC2 Type II Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d0bcff] text-[18px]">lock</span>
            <span>Zero Training on User Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">sync</span>
            <span>Native Notion &amp; Anki Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
};
