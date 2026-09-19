import React, { useState } from 'react';
import { SYLLABUS_MODULES, INITIAL_CHAT } from '../data/content';
import { ChatMessage, SyllabusItem } from '../types';

interface WorkspaceSectionProps {
  onOpenFlashcard: (flashcard: any) => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ onOpenFlashcard }) => {
  const [modules, setModules] = useState<SyllabusItem[]>(SYLLABUS_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<string>('sec-2');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [inputText, setInputText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [gpuContext, setGpuContext] = useState<'32k' | '64k' | '128k' | '1M'>('128k');

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[1];

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id);
    setModules((prev) =>
      prev.map((item) => ({
        ...item,
        status: item.id === id ? 'in-focus' : item.status === 'in-focus' ? 'mastered' : item.status
      }))
    );
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSynthesizing) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSynthesizing(true);

    // Simulate Socratic AI synthesis response with rich conceptual anchors and LaTeX
    setTimeout(() => {
      let aiText = 'In quantum statistical mechanics, this emerges directly from the density operator algebra:';
      let aiFormula = 'ρ = Σ p_i |ψ_i⟩⟨ψ_i|, \\quad \\text{Tr}(ρ) = 1, \\quad \\text{Tr}(ρ^2) \\le 1';
      let secondary = 'When bipartite entanglement is severed via partial tracing, the off-diagonal coherence terms vanish in the preferred pointer basis chosen by the environmental Hamiltonian interaction H_int.';

      if (text.toLowerCase().includes('kraus') || text.toLowerCase().includes('damping')) {
        aiText = 'The Kraus representation operator decomposition for Markovian amplitude damping takes the operational form:';
        aiFormula = 'K_0 = \\begin{pmatrix} 1 & 0 \\\\ 0 & \\sqrt{1-\\gamma} \\end{pmatrix}, \\quad K_1 = \\begin{pmatrix} 0 & \\sqrt{\\gamma} \\\\ 0 & 0 \\end{pmatrix}';
        secondary = 'Notice that K_0^† K_0 + K_1^† K_1 = I, strictly obeying the trace-preserving completeness relation for physical CPTP quantum maps.';
      } else if (text.toLowerCase().includes('feynman') || text.toLowerCase().includes('defense')) {
        aiText = 'Feynman Challenge: Explain why classical entropy is always non-negative (Shannon), whereas the conditional von Neumann entropy S(A|B) can become negative in entangled systems.';
        aiFormula = 'S(A|B) = S(ρ_{AB}) - S(ρ_B) < 0 \\iff \\text{Subsystem B holds quantum EPR steering capability}';
        secondary = 'In classical probability, conditioning on extra knowledge never increases ignorance. But quantum entanglement implies you can know everything about the global state |Ψ_AB⟩ (pure, S=0) while knowing nothing about part B (mixed, S>0).';
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiText,
        formula: aiFormula,
        secondaryText: secondary,
        flashcardGenerated: {
          id: 'fc-' + Date.now(),
          title: 'Flashcard Auto-Generated',
          subtitle: `Added "${text.slice(0, 32)}..." to Deck.`,
          difficulty: 'Rating: Advanced',
          front: text,
          back: secondary,
          formula: aiFormula
        }
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsSynthesizing(false);
    }, 700);
  };

  return (
    <section id="ai-workspace" className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-24 flex flex-col">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 text-[#d0bcff] font-mono text-xs uppercase tracking-wider mb-3 font-semibold">
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>Cognitive Environment</span>
        </div>
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#dfe2ee] tracking-tight">
          The Dual-Pane Synthesis Cockpit
        </h2>
        <p className="font-sans text-base text-[#bcc9cd] mt-3 leading-relaxed">
          Zero tabs. Zero context switches. An integrated canvas synchronizing deep analytical reading with real-time Socratic dialogue.
        </p>
      </div>

      {/* Workspace Glass Frame Container */}
      <div className="w-full rounded-2xl bg-[#181c24] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
        {/* Window Title Bar */}
        <div className="w-full px-6 py-3.5 bg-[#0a0e16] border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffb4ab]/60 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#4cd7f6]/40 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#7bd0ff]/40 inline-block"></span>
            <span className="ml-4 font-mono text-xs text-[#bcc9cd]">
              Module 04: Quantum Decoherence &amp; Density Matrices
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Context Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#262a33] text-[#4cd7f6] font-mono text-xs border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
              <span>GPU Context: {gpuContext} Loaded</span>
            </div>

            <button
              onClick={() => {
                const next = gpuContext === '32k' ? '64k' : gpuContext === '64k' ? '128k' : gpuContext === '128k' ? '1M' : '32k';
                setGpuContext(next);
              }}
              title="Cycle GPU Context window limit"
              className="p-1 rounded text-[#bcc9cd] hover:text-[#dfe2ee] hover:bg-[#262a33] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>

        {/* Split View Workspace Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left Pane: Structured Syllabus & Ingested Document (5 cols) */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-[#181c24]/90 border-r border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-[#dfe2ee]">
                  <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">menu_book</span>
                  <span className="font-sans text-base font-bold">Active Syllabus</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#262a33] text-[#bcc9cd] border border-white/[0.04]">
                  Page 142 of 380
                </span>
              </div>

              {/* Syllabus List */}
              <div className="space-y-4">
                {modules.map((item) => {
                  const isActive = item.id === activeModuleId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectModule(item.id)}
                      className={`p-4 rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#262a33] border-[#d0bcff]/40 shadow-lg'
                          : 'bg-[#262a33]/40 hover:bg-[#262a33]/70 border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-xs font-bold ${isActive ? 'text-[#d0bcff]' : 'text-[#4cd7f6]'}`}>
                          {item.section} {item.title}
                        </span>
                        {item.status === 'mastered' && (
                          <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">check_circle</span>
                        )}
                        {item.status === 'in-focus' && (
                          <span className="font-mono text-[10px] text-[#d0bcff] px-2 py-0.5 rounded-full bg-[#571bc1]/25 animate-pulse font-semibold">
                            In Focus
                          </span>
                        )}
                        {item.status === 'locked' && (
                          <span className="material-symbols-outlined text-[#869397] text-[16px]">lock</span>
                        )}
                      </div>

                      <p className="font-sans text-xs text-[#bcc9cd] leading-relaxed">
                        {item.description}
                      </p>

                      {item.formula && (
                        <div className="mt-2 p-1.5 rounded bg-[#0a0e16] font-mono text-[11px] text-[#7bd0ff] overflow-x-auto">
                          <code>{item.formula}</code>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        {item.status === 'in-focus' && item.progressPercent ? (
                          <div className="w-full flex items-center justify-between gap-3">
                            <div className="w-full bg-[#0a0e16] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#571bc1] to-[#4cd7f6] h-full rounded-full transition-all duration-500"
                                style={{ width: `${item.progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#bcc9cd] shrink-0">
                              {item.progressPercent}%
                            </span>
                          </div>
                        ) : item.recallRate ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#4cd7f6]/10 text-[#4cd7f6]">
                              Mastered
                            </span>
                            <span className="text-[10px] font-mono text-[#bcc9cd]">
                              Recall rate: {item.recallRate}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ingestion Source Pill */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#869397]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">verified</span>
                <span>Source: Sakurai Modern QM (3rd Ed)</span>
              </div>
              <span className="font-mono text-[10px] text-[#4cd7f6]">Indexed AST</span>
            </div>
          </div>

          {/* Right Pane: Socratic AI Workspace & Clarifications (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 bg-[#1c2028] flex flex-col justify-between">
            {/* Chat Thread */}
            <div className="flex flex-col gap-5 overflow-y-auto max-h-[460px] pr-2 scroll-smooth">
              {messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} className="flex items-start gap-3 max-w-[85%] self-end">
                      <div className="flex flex-col items-end">
                        <div className="p-4 rounded-2xl rounded-tr-xs bg-[#06b6d4] text-[#003640] font-sans text-sm font-medium shadow-md">
                          {msg.text}
                        </div>
                        <span className="font-mono text-[10px] text-[#869397] mt-1 mr-1">{msg.time}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#06b6d4]/20 flex items-center justify-center text-[#4cd7f6] text-xs font-bold shrink-0">
                        ME
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex items-start gap-3 max-w-[95%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#571bc1] flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </div>

                    <div className="flex flex-col items-start w-full">
                      <div className="p-5 rounded-2xl rounded-tl-xs bg-[#262a33] text-[#dfe2ee] font-sans text-sm shadow-md w-full border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-2 text-[#4cd7f6] font-mono text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span>Socratic Conceptual Anchor</span>
                        </div>

                        <p className="mb-3 leading-relaxed text-[#dfe2ee]">
                          {msg.text}
                        </p>

                        {msg.formula && (
                          <div className="p-3 rounded-lg bg-[#0a0e16] font-mono text-[#7bd0ff] text-xs overflow-x-auto mb-3 border border-white/[0.04]">
                            <code>{msg.formula}</code>
                          </div>
                        )}

                        {msg.secondaryText && (
                          <p className="leading-relaxed text-[#bcc9cd] text-xs sm:text-sm">
                            {msg.secondaryText}
                          </p>
                        )}

                        {/* Clarification Flashcard Card */}
                        {msg.flashcardGenerated && (
                          <div className="mt-4 p-3 rounded-xl bg-[#181c24] border border-[#d0bcff]/30 shadow-sm flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[#d0bcff] text-[24px]">auto_stories</span>
                              <div>
                                <div className="font-mono text-xs font-bold text-[#dfe2ee]">
                                  {msg.flashcardGenerated.title}
                                </div>
                                <div className="font-sans text-xs text-[#bcc9cd]">
                                  {msg.flashcardGenerated.subtitle}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => onOpenFlashcard(msg.flashcardGenerated)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#d0bcff]/15 text-[#d0bcff] hover:bg-[#d0bcff]/25 font-mono text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Review Now
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#869397] mt-1 ml-1">
                        StudyForge Reasoning • 0.38s latency
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSynthesizing && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#262a33]/60 text-xs text-[#4cd7f6] font-mono animate-pulse">
                  <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                  <span>Synthesizing multi-modal derivation across Hilbert space...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="mt-4 pt-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="font-mono text-[10px] text-[#869397] uppercase shrink-0">Ask AI:</span>
              <button
                onClick={() => handleSendMessage('Derive Kraus representation for amplitude damping')}
                className="px-2.5 py-1 rounded-md bg-[#262a33] text-[#bcc9cd] hover:text-[#4cd7f6] hover:bg-[#31353e] transition-colors shrink-0 font-sans cursor-pointer"
              >
                Kraus operators
              </button>
              <button
                onClick={() => handleSendMessage('Test me with a Feynman defense question on entropy')}
                className="px-2.5 py-1 rounded-md bg-[#262a33] text-[#bcc9cd] hover:text-[#d0bcff] hover:bg-[#31353e] transition-colors shrink-0 font-sans cursor-pointer"
              >
                Feynman challenge
              </button>
              <button
                onClick={() => handleSendMessage('Explain how thermal bath Markovian coupling induces decoherence')}
                className="px-2.5 py-1 rounded-md bg-[#262a33] text-[#bcc9cd] hover:text-[#7bd0ff] hover:bg-[#31353e] transition-colors shrink-0 font-sans cursor-pointer"
              >
                Thermal Bath Markovian
              </button>
            </div>

            {/* Interactive Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="mt-3 flex items-center gap-2 bg-[#0a0e16]/80 p-2 rounded-xl border border-white/[0.08] shadow-inner"
            >
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Challenge the AI, test an edge case, or request a LaTeX proof..."
                className="flex-1 bg-transparent px-3 py-2 font-sans text-sm text-[#dfe2ee] placeholder:text-[#869397] focus:outline-none min-w-0"
                type="text"
              />
              <button
                type="submit"
                disabled={isSynthesizing}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#571bc1] text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Synthesize</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
