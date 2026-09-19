import React, { useState } from 'react';
import { LOGO_URL } from '../data/content';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: (email: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSuccess(true);
    setTimeout(() => {
      onSignedIn(email);
      onClose();
      setSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#181c24] border border-white/[0.1] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <img src={LOGO_URL} alt="StudyForge AI" className="h-10 w-10 object-contain mb-3" />
          <h3 className="font-sans text-2xl font-bold text-[#dfe2ee]">
            Access StudyForge Core
          </h3>
          <p className="font-sans text-xs text-[#bcc9cd] mt-1">
            Sign in to restore your cognitive graph and spaced repetition queues.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#4cd7f6] font-mono text-xs text-center animate-in zoom-in-95">
            ✓ Authenticated! Synapse workspace state restored.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] text-[#bcc9cd] uppercase tracking-wider mb-1.5">
                Academic or Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@mit.edu"
                className="w-full px-4 py-3 rounded-xl bg-[#0a0e16] border border-white/[0.08] text-[#dfe2ee] placeholder:text-[#869397] font-sans text-sm focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-sans text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Continue with SSO / Magic Link
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <span className="relative px-3 bg-[#181c24] text-[#869397] font-mono text-[10px] uppercase">
                Or Connect Via
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('scholar.edu@google.com');
                  handleSubmit(new Event('submit') as any);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-xs font-mono text-[#dfe2ee] border border-white/[0.06] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Google SSO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('researcher@github.com');
                  handleSubmit(new Event('submit') as any);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-xs font-mono text-[#dfe2ee] border border-white/[0.06] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>GitHub ID</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
