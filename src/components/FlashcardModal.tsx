import React, { useState } from 'react';

interface FlashcardModalProps {
  card: {
    id: string;
    title: string;
    subtitle: string;
    difficulty?: string;
    front: string;
    back: string;
    formula?: string;
  } | null;
  onClose: () => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({ card, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!card) return null;

  const handleRate = (rating: string, days: string) => {
    setFeedback(`Card scheduled! Next retrieval in ${days}. Retention probability: 94%.`);
    setTimeout(() => {
      setFeedback(null);
      setIsFlipped(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#181c24] border border-[#d0bcff]/40 p-6 md:p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d0bcff] text-[22px]">auto_stories</span>
            <span className="font-mono text-xs font-bold text-[#4cd7f6] uppercase tracking-wider">
              {card.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#262a33] text-[#bcc9cd] hover:text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-sans text-xs text-[#bcc9cd] mb-6">
          {card.subtitle} • {card.difficulty || 'Rating: High Difficulty'}
        </p>

        {/* The Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full min-h-[260px] p-6 rounded-2xl bg-[#0a0e16] border border-white/[0.08] hover:border-[#d0bcff]/50 shadow-inner flex flex-col justify-between cursor-pointer transition-all duration-300 select-none group"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#869397] mb-3">
              <span>{isFlipped ? 'ANSWER / RETRIEVAL KEY' : 'QUESTION (FRONT)'}</span>
              <span className="text-[#4cd7f6] group-hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Click to {isFlipped ? 'flip front' : 'reveal answer'}</span>
              </span>
            </div>

            <p className="font-sans text-base text-[#dfe2ee] font-medium leading-relaxed">
              {isFlipped ? card.back : card.front}
            </p>

            {card.formula && (
              <div className="mt-4 p-3 rounded-xl bg-[#181c24] font-mono text-xs text-[#acedff] overflow-x-auto border border-white/[0.06]">
                <code>{card.formula}</code>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-white/[0.06] text-right font-mono text-[10px] text-[#869397]">
            FSRS-5 Algorithmic Target • Click to Flip
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/40 text-[#4cd7f6] font-mono text-xs text-center animate-in zoom-in-95">
            {feedback}
          </div>
        )}

        {/* Rating Buttons (shown when flipped) */}
        <div className="mt-6 flex flex-col gap-2">
          <span className="font-mono text-[11px] text-[#869397] text-center">
            {isFlipped ? 'Rate your active recall quality:' : 'Test yourself, then reveal answer to grade retention.'}
          </span>

          {isFlipped && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => handleRate('Again', '< 10m')}
                className="p-2 rounded-xl bg-[#ffb4ab]/15 hover:bg-[#ffb4ab]/25 text-[#ffb4ab] border border-[#ffb4ab]/30 font-mono text-xs text-center cursor-pointer transition-colors"
              >
                <div className="font-bold">Again</div>
                <div className="text-[10px] text-[#869397]">&lt; 10 min</div>
              </button>
              <button
                onClick={() => handleRate('Hard', '1.2 days')}
                className="p-2 rounded-xl bg-[#262a33] hover:bg-[#31353e] text-[#bcc9cd] font-mono text-xs text-center cursor-pointer transition-colors"
              >
                <div className="font-bold">Hard</div>
                <div className="text-[10px] text-[#869397]">1.2 days</div>
              </button>
              <button
                onClick={() => handleRate('Good', '3.5 days')}
                className="p-2 rounded-xl bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#4cd7f6] border border-[#06b6d4]/30 font-mono text-xs text-center cursor-pointer transition-colors"
              >
                <div className="font-bold">Good</div>
                <div className="text-[10px] text-[#869397]">3.5 days</div>
              </button>
              <button
                onClick={() => handleRate('Easy', '7.0 days')}
                className="p-2 rounded-xl bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 text-[#d0bcff] border border-[#d0bcff]/30 font-mono text-xs text-center cursor-pointer transition-colors"
              >
                <div className="font-bold">Easy</div>
                <div className="text-[10px] text-[#869397]">7.0 days</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
