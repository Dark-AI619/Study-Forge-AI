import { useState } from 'react';
import { ActiveScreen } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PipelineSection } from './components/PipelineSection';
import { WorkspaceSection } from './components/WorkspaceSection';
import { PdfTransformerSection } from './components/PdfTransformerSection';
import { MasteryDashboardSection } from './components/MasteryDashboardSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { DemoVideoModal } from './components/DemoVideoModal';
import { FlashcardModal } from './components/FlashcardModal';
import { PricingModal } from './components/PricingModal';
import { SignInModal } from './components/SignInModal';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('all');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [activeFlashcard, setActiveFlashcard] = useState<any | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 4000);
  };

  const handleStartFree = () => {
    setActiveScreen('ai-workspace');
    showToast('Launched AI Workspace in interactive study mode.');
  };

  const handleSelectPlan = (planName: string) => {
    setIsPricingOpen(false);
    showToast(`Selected ${planName}! Initializing onboarding...`);
  };

  const handleSignedIn = (email: string) => {
    showToast(`Signed in as ${email}. Syncing neural weights...`);
  };

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] flex flex-col selection:bg-[#06b6d4]/30 selection:text-[#4cd7f6] relative">
      {/* Global Toast Notification */}
      {globalToast && (
        <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-xl bg-[#262a33] text-[#4cd7f6] border border-[#4cd7f6]/40 shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{globalToast}</span>
        </div>
      )}

      {/* Main Global Navigation */}
      <Header
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Floating Screen View Switcher Toolbar (lets users toggle focused screens or see all together) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-[#181c24]/90 backdrop-blur-2xl border border-white/[0.12] shadow-2xl">
        <span className="px-2.5 font-mono text-[10px] text-[#869397] uppercase tracking-wider">
          Screen:
        </span>
        <button
          onClick={() => {
            setActiveScreen('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
            activeScreen === 'all'
              ? 'bg-[#262a33] text-[#4cd7f6] font-bold shadow-sm border border-white/[0.08]'
              : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
          }`}
        >
          All Screens (Full Webpage)
        </button>
        <button
          onClick={() => setActiveScreen('pipeline')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
            activeScreen === 'pipeline'
              ? 'bg-[#262a33] text-[#4cd7f6] font-bold shadow-sm border border-white/[0.08]'
              : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveScreen('ai-workspace')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer flex items-center gap-1 ${
            activeScreen === 'ai-workspace'
              ? 'bg-[#06b6d4] text-[#003640] font-bold shadow-md'
              : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
          }`}
        >
          <span>AI Workspace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveScreen('pdf-transformer')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
            activeScreen === 'pdf-transformer'
              ? 'bg-[#262a33] text-[#4cd7f6] font-bold shadow-sm border border-white/[0.08]'
              : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
          }`}
        >
          PDF Transformer
        </button>
        <button
          onClick={() => setActiveScreen('mastery-dashboard')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
            activeScreen === 'mastery-dashboard'
              ? 'bg-[#262a33] text-[#4cd7f6] font-bold shadow-sm border border-white/[0.08]'
              : 'text-[#bcc9cd] hover:text-[#dfe2ee]'
          }`}
        >
          Mastery Dashboard
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {/* If Active Screen is 'all', show the full complete landing page with all screens */}
        {activeScreen === 'all' && (
          <>
            <HeroSection
              onStartFree={handleStartFree}
              onWatchDemo={() => setIsDemoOpen(true)}
            />

            <PipelineSection />

            <WorkspaceSection onOpenFlashcard={(fc) => setActiveFlashcard(fc)} />

            <PdfTransformerSection
              onOpenStudio={() => {
                setActiveScreen('ai-workspace');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenFlashcard={(fc) => setActiveFlashcard(fc)}
            />

            <MasteryDashboardSection />

            <CtaSection
              onSuccess={(email) =>
                showToast(`Success! Onboarding link dispatched to ${email}`)
              }
            />
          </>
        )}

        {/* Focused view for 'pipeline' */}
        {activeScreen === 'pipeline' && (
          <div className="pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-8 mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveScreen('all')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Overview</span>
              </button>
              <span className="font-mono text-xs text-[#869397]">
                Screen: Synapse Cognitive Pipeline
              </span>
            </div>
            <PipelineSection />
          </div>
        )}

        {/* Focused view for 'ai-workspace' */}
        {activeScreen === 'ai-workspace' && (
          <div className="pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-8 mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveScreen('all')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Overview</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
                <span className="font-mono text-xs text-[#4cd7f6]">
                  Dual-Pane Synthesis Cockpit (Live Session)
                </span>
              </div>
            </div>
            <WorkspaceSection onOpenFlashcard={(fc) => setActiveFlashcard(fc)} />
          </div>
        )}

        {/* Focused view for 'pdf-transformer' */}
        {activeScreen === 'pdf-transformer' && (
          <div className="pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-8 mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveScreen('all')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Overview</span>
              </button>
              <span className="font-mono text-xs text-[#869397]">
                Screen: Document Ingestion &amp; AST Transformation
              </span>
            </div>
            <PdfTransformerSection
              onOpenStudio={() => setActiveScreen('ai-workspace')}
              onOpenFlashcard={(fc) => setActiveFlashcard(fc)}
            />
          </div>
        )}

        {/* Focused view for 'mastery-dashboard' */}
        {activeScreen === 'mastery-dashboard' && (
          <div className="pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-8 mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveScreen('all')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Overview</span>
              </button>
              <span className="font-mono text-xs text-[#869397]">
                Screen: Empirical Telemetry &amp; Retention Analytics
              </span>
            </div>
            <MasteryDashboardSection />
          </div>
        )}

        {/* Focused view for 'pricing' */}
        {activeScreen === 'pricing' && (
          <div className="pt-6">
            <div className="max-w-[1440px] mx-auto px-5 md:px-8 mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveScreen('all')}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Overview</span>
              </button>
              <span className="font-mono text-xs text-[#869397]">
                Screen: Subscription Tiers &amp; Compute Plans
              </span>
            </div>
            <div className="max-w-5xl mx-auto px-5 py-12">
              <PricingModal
                isOpen={true}
                onClose={() => setActiveScreen('all')}
                onSelectPlan={handleSelectPlan}
              />
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={(screen) => {
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Interactive Modals */}
      <DemoVideoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onLaunchWorkspace={() => {
          setIsDemoOpen(false);
          setActiveScreen('ai-workspace');
        }}
      />

      <FlashcardModal
        card={activeFlashcard}
        onClose={() => setActiveFlashcard(null)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={handleSelectPlan}
      />

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignedIn={handleSignedIn}
      />
    </div>
  );
}
