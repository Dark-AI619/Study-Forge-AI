import React, { useState, useRef } from 'react';
import { PRESET_DOCUMENTS } from '../data/content';
import { PresetDoc } from '../types';

interface PdfTransformerSectionProps {
  onOpenStudio: () => void;
  onOpenFlashcard: (flashcard: any) => void;
}

export const PdfTransformerSection: React.FC<PdfTransformerSectionProps> = ({
  onOpenStudio,
  onOpenFlashcard
}) => {
  const [selectedDoc, setSelectedDoc] = useState<PresetDoc>(PRESET_DOCUMENTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSelectPreset = (doc: PresetDoc) => {
    setSelectedDoc(doc);
    setIsProcessing(true);
    setProgress(15);

    // Simulate extraction animation
    let curr = 15;
    const interval = setInterval(() => {
      curr += 25;
      if (curr >= 100) {
        setProgress(100);
        setIsProcessing(false);
        clearInterval(interval);
      } else {
        setProgress(curr);
      }
    }, 150);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const customDoc: PresetDoc = {
        id: 'uploaded-' + Date.now(),
        filename: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: Math.max(12, Math.floor(file.size / 45000)),
        mode: 'Custom AST Multi-Pass Parse',
        modulesCount: Math.max(8, Math.floor(file.size / 200000)),
        cardsCount: Math.max(45, Math.floor(file.size / 35000)),
        estimatedHours: Math.max(4, Math.floor(file.size / 500000)),
        blocksCount: 12,
        sampleQuestion: `Synthesized key theorem extracted from ${file.name}`,
        sampleFormula: '\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{A}'
      };
      handleSelectPreset(customDoc);
      showToast(`Uploaded and parsing "${file.name}"...`);
    }
  };

  const handleExportAnki = () => {
    // Generate downloadable Anki study format text
    const deckContent = `# StudyForge AI - Exported Flashcards for ${selectedDoc.filename}
# Generated: ${new Date().toISOString()}
${selectedDoc.sampleQuestion}\t${selectedDoc.sampleFormula}\tHigh-Difficulty
"What is the von Neumann entropy formula?"\t"S(ρ) = -Tr(ρ ln ρ)"\tMastered
"Define pure state vs mixed ensemble"\t"Pure state has Tr(ρ^2) = 1; mixed has Tr(ρ^2) < 1"\tCore
`;
    const blob = new Blob([deckContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDoc.filename.replace('.pdf', '')}_anki_deck.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${selectedDoc.cardsCount} flashcards for Anki (.txt/.apkg format)!`);
  };

  const handleSyncNotion = () => {
    showToast(`✓ Synchronized ${selectedDoc.modulesCount} modules & knowledge database with Notion!`);
  };

  return (
    <section id="pdf-transformer" className="w-full bg-[#0a0e16] py-24 relative border-t border-white/[0.04]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#262a33] text-[#4cd7f6] border border-[#4cd7f6]/40 shadow-2xl flex items-center gap-2 font-mono text-xs animate-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#4cd7f6] font-mono text-xs uppercase tracking-wider mb-3 font-semibold">
              <span className="material-symbols-outlined text-[16px]">transform</span>
              <span>Document Ingestion Engine</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dfe2ee] tracking-tight">
              PDF-to-Curriculum Transformer
            </h2>
            <p className="font-sans text-base text-[#bcc9cd] mt-3 max-w-2xl leading-relaxed">
              Drop raw 800-page textbooks or research papers. Watch our neural pipeline automatically distill key equations, generate Anki-compatible decks, and plot prerequisite graphs.
            </p>
          </div>

          {/* Selectable Sample Documents */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-[#869397] uppercase tracking-wider mr-2">
              Quick Presets:
            </span>
            {PRESET_DOCUMENTS.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectPreset(doc)}
                  className={`px-3.5 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#262a33] text-[#4cd7f6] border-[#4cd7f6]/40 font-semibold shadow-sm'
                      : 'bg-[#181c24] text-[#bcc9cd] border-white/[0.04] hover:text-[#dfe2ee] hover:bg-[#262a33]'
                  }`}
                >
                  {doc.filename}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Dropzone and Transformation Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Dropzone Area (5 cols) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const customDoc: PresetDoc = {
                  id: 'dropped-' + Date.now(),
                  filename: file.name,
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  pages: Math.max(15, Math.floor(file.size / 40000)),
                  mode: 'Custom Multi-Pass AST',
                  modulesCount: 24,
                  cardsCount: 160,
                  estimatedHours: 8,
                  blocksCount: 10,
                  sampleQuestion: `Core synthesis inquiry for ${file.name}`,
                  sampleFormula: 'H |\\psi\\rangle = E |\\psi\\rangle'
                };
                handleSelectPreset(customDoc);
                showToast(`Parsed dropped file: ${file.name}`);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`lg:col-span-5 p-8 rounded-2xl bg-[#181c24] border-2 border-dashed ${
              isDragging ? 'border-[#4cd7f6] bg-[#262a33]' : 'border-white/[0.12]'
            } flex flex-col justify-center items-center text-center cursor-pointer group hover:bg-[#1c2028] hover:border-[#4cd7f6]/40 transition-all shadow-md`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.epub,.mobi,.pptx"
            />

            <div className="w-20 h-20 rounded-2xl bg-[#06b6d4]/15 flex items-center justify-center text-[#4cd7f6] mb-6 group-hover:scale-110 transition-transform shadow-[0_0_24px_rgba(6,182,212,0.2)]">
              <span className="material-symbols-outlined text-[36px]">cloud_upload</span>
            </div>

            <h3 className="font-sans text-xl text-[#dfe2ee] font-bold mb-2">
              Drag &amp; Drop Any Dense Document
            </h3>

            <p className="font-sans text-sm text-[#bcc9cd] max-w-sm mb-6 leading-relaxed">
              Accepts PDF, EPUB, MOBI, PPTX, MP4, and ArXiv URLs up to 500MB each.
            </p>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-[#262a33] hover:bg-[#06b6d4] hover:text-[#003640] text-[#dfe2ee] font-semibold text-sm transition-all shadow-md cursor-pointer border border-white/[0.08]"
            >
              Browse Local System
            </button>

            <div className="mt-8 flex items-center gap-4 text-[#869397] font-mono text-[11px]">
              <span>✓ Encrypted on-device</span>
              <span>✓ OCR Formula Preserving</span>
            </div>
          </div>

          {/* Conversion Live Preview Output (7 cols) */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-[#181c24] border border-white/[0.08] flex flex-col justify-between shadow-xl">
            {/* Transformation Progress Header */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 flex items-center justify-center text-[#4cd7f6]">
                    <span className="material-symbols-outlined text-[24px]">description</span>
                  </div>
                  <div>
                    <h4 className="font-sans text-lg text-[#dfe2ee] font-bold">
                      {selectedDoc.filename}
                    </h4>
                    <span className="font-mono text-xs text-[#bcc9cd]">
                      {selectedDoc.size} • {selectedDoc.pages} Pages • {selectedDoc.mode}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-sm text-[#4cd7f6] font-bold">
                  {isProcessing ? `Extracting... ${progress}%` : '100% Extracted'}
                </span>
              </div>

              {/* Gradient Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#0a0e16] overflow-hidden mb-8">
                <div
                  className="h-full bg-gradient-to-r from-[#4cd7f6] via-[#7bd0ff] to-[#d0bcff] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Extracted Artifacts 3-Column Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Artifact 1 */}
                <div className="p-4 rounded-xl bg-[#262a33]/60 border border-white/[0.04] flex flex-col">
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[20px] mb-2">device_hub</span>
                  <span className="font-mono text-[10px] uppercase text-[#869397]">Decomposed</span>
                  <span className="font-sans text-2xl text-[#dfe2ee] font-extrabold mt-1">
                    {selectedDoc.modulesCount} Modules
                  </span>
                  <span className="font-sans text-xs text-[#bcc9cd] mt-1">
                    Full dependency hierarchy mapped
                  </span>
                </div>

                {/* Artifact 2 */}
                <div className="p-4 rounded-xl bg-[#262a33]/60 border border-white/[0.04] flex flex-col">
                  <span className="material-symbols-outlined text-[#d0bcff] text-[20px] mb-2">style</span>
                  <span className="font-mono text-[10px] uppercase text-[#869397]">Flashcards</span>
                  <span className="font-sans text-2xl text-[#dfe2ee] font-extrabold mt-1">
                    {selectedDoc.cardsCount} Cards
                  </span>
                  <span className="font-sans text-xs text-[#bcc9cd] mt-1">
                    Cloze &amp; formula retrieval
                  </span>
                </div>

                {/* Artifact 3 */}
                <div className="p-4 rounded-xl bg-[#262a33]/60 border border-white/[0.04] flex flex-col">
                  <span className="material-symbols-outlined text-[#7bd0ff] text-[20px] mb-2">psychology</span>
                  <span className="font-mono text-[10px] uppercase text-[#869397]">Estimated Time</span>
                  <span className="font-sans text-2xl text-[#dfe2ee] font-extrabold mt-1">
                    {selectedDoc.estimatedHours} Hours
                  </span>
                  <span className="font-sans text-xs text-[#bcc9cd] mt-1">
                    Spread across {selectedDoc.blocksCount} study blocks
                  </span>
                </div>
              </div>

              {/* Flashcard Deck Micro Preview */}
              <div
                onClick={() =>
                  onOpenFlashcard({
                    id: 'doc-fc-01',
                    title: 'SYNTHESIZED FLASHCARD #042',
                    subtitle: `Generated from ${selectedDoc.filename}`,
                    difficulty: 'Rating: High Difficulty',
                    front: selectedDoc.sampleQuestion,
                    back: 'The Euler-Lagrange equations of motion must preserve symmetry under local gauge transformations ψ → exp(iα(x))ψ with covariant derivative D_μ = ∂_μ + i e A_μ.',
                    formula: selectedDoc.sampleFormula
                  })
                }
                className="p-5 rounded-xl bg-[#1c2028] border border-white/[0.06] hover:border-[#4cd7f6]/40 shadow-inner cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-[#4cd7f6] font-bold">
                    SYNTHESIZED FLASHCARD #042
                  </span>
                  <span className="font-mono text-[10px] text-[#869397]">
                    Rating: High Difficulty • Click to Test
                  </span>
                </div>
                <p className="font-sans text-sm text-[#dfe2ee] mb-3 font-medium">
                  "{selectedDoc.sampleQuestion}"
                </p>
                <div className="p-2.5 rounded-lg bg-[#0a0e16] font-mono text-xs text-[#acedff] overflow-x-auto">
                  <code>{selectedDoc.sampleFormula}</code>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-white/[0.06] gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleExportAnki}
                  className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/[0.04]"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export to Anki (.apkg)</span>
                </button>
                <button
                  onClick={handleSyncNotion}
                  className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/[0.04]"
                >
                  <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  <span>Sync to Notion</span>
                </button>
              </div>

              <button
                onClick={onOpenStudio}
                className="inline-flex items-center gap-1 text-[#4cd7f6] hover:text-[#acedff] font-mono text-xs font-semibold hover:underline cursor-pointer"
              >
                <span>Open in Studio</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
