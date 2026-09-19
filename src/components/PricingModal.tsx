import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/content';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#181c24] border border-white/[0.1] p-6 md:p-10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-2 font-semibold">
            <span className="material-symbols-outlined text-[16px]">price_change</span>
            <span>Transparent Investment in Mastery</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-[#dfe2ee] tracking-tight">
            Predictable Cognitive Upgrades
          </h2>
          <p className="font-sans text-sm text-[#bcc9cd] mt-2">
            Choose the compute depth suitable for your academic cadence or research lab.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-[#0a0e16] border border-white/[0.08] mt-6">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                !isAnnual
                  ? 'bg-[#262a33] text-[#dfe2ee] font-bold shadow-sm'
                  : 'text-[#869397] hover:text-[#bcc9cd]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all ${
                isAnnual
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-bold shadow-md'
                  : 'text-[#869397] hover:text-[#bcc9cd]'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const priceDisplay =
              plan.id === 'pro'
                ? isAnnual
                  ? '$15'
                  : '$19'
                : plan.price;

            const billingSub =
              plan.id === 'pro'
                ? isAnnual
                  ? 'billed annually ($180/yr)'
                  : 'billed monthly'
                : plan.billing;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-6 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[#1c2028] border-2 border-[#4cd7f6] shadow-[0_0_30px_rgba(76,215,246,0.2)] md:-translate-y-2'
                    : 'bg-[#181c24] border border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-md">
                    Most Popular
                  </span>
                )}

                <h3 className="font-sans text-xl font-bold text-[#dfe2ee] mb-1">
                  {plan.name}
                </h3>
                <p className="font-sans text-xs text-[#bcc9cd] mb-6 min-h-[36px]">
                  {plan.description}
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.06]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-4xl font-extrabold text-[#dfe2ee]">
                      {priceDisplay}
                    </span>
                    {plan.id !== 'institutional' && (
                      <span className="font-mono text-xs text-[#869397]">/ month</span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[#869397] block mt-1">
                    {billingSub}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[#bcc9cd]">
                      <span className="material-symbols-outlined text-[#4cd7f6] text-[16px] shrink-0 mt-0.5">
                        check
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan(plan.name)}
                  className={`w-full py-3 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02]'
                      : 'bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
