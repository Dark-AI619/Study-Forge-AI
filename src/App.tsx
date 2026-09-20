import {lazy,Suspense} from 'react';
import {BrowserRouter,Routes,Route,useNavigate} from 'react-router-dom';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {PipelineSection} from './components/PipelineSection';
import {WorkspaceSection} from './components/WorkspaceSection';
import {PdfTransformerSection} from './components/PdfTransformerSection';
import {MasteryDashboardSection} from './components/MasteryDashboardSection';
import {CtaSection} from './components/CtaSection';
import {Footer} from './components/Footer';
const Workspace=lazy(()=>import('./app/Workspace'));
function Landing(){const navigate=useNavigate();return <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee]"><Header activeScreen="all" setActiveScreen={s=>{if(s==='all')window.scrollTo({top:0,behavior:'smooth'});else if(s==='ai-workspace')navigate('/app/study-ai');else document.getElementById(s)?.scrollIntoView({behavior:'smooth'});}} onOpenSignIn={()=>navigate('/app')} onOpenAISetup={()=>navigate('/app/settings')}/><main className="pt-20"><HeroSection onStartFree={()=>navigate('/app/new')} onWatchDemo={()=>document.getElementById('pipeline')?.scrollIntoView({behavior:'smooth'})}/><PipelineSection/><WorkspaceSection/><PdfTransformerSection/><MasteryDashboardSection/><CtaSection/></main><Footer/></div>;}
export default function App(){return <BrowserRouter><Suspense fallback={<div className="p-12 text-center">Loading StudyForge…</div>}><Routes><Route path="/app/*" element={<Workspace/>}/><Route path="*" element={<Landing/>}/></Routes></Suspense></BrowserRouter>;}
