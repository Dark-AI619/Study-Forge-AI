import {useState,useEffect,lazy,Suspense} from 'react';
import {Routes,Route,NavLink,Link,useNavigate} from 'react-router-dom';
import {api,ApiError,Course,Settings} from '../api/client';
import {WorkspaceContext,Loading,ErrorBox,useAction} from './shared';
import './workspace.css';
const Dashboard=lazy(()=>import('./pages/Dashboard'));
const NewTopic=lazy(()=>import('./pages/NewTopic'));
const Curriculum=lazy(()=>import('./pages/Curriculum'));
const Today=lazy(()=>import('./pages/Today'));
const Timetable=lazy(()=>import('./pages/Timetable'));
const Tasks=lazy(()=>import('./pages/Tasks'));
const Knowledge=lazy(()=>import('./pages/Knowledge'));
const Quizzes=lazy(()=>import('./pages/Quizzes'));
const Revision=lazy(()=>import('./pages/Revision'));
const Progress=lazy(()=>import('./pages/Progress'));
const Files=lazy(()=>import('./pages/Files'));
const SettingsPage=lazy(()=>import('./pages/Settings'));
const StudyAI=lazy(()=>import('./pages/StudyAI'));
const nav=[['','space_dashboard','Dashboard'],['today','play_lesson','Today'],['study-ai','auto_awesome','Study AI'],['curriculum','account_tree','Curriculum'],['timetable','calendar_month','Timetable'],['knowledge','local_library','Knowledge'],['quizzes','quiz','Quizzes'],['revision','history','Revision'],['tasks','checklist','Tasks'],['progress','insights','Progress'],['files','folder_open','Generated Files'],['settings','settings','Settings']];

export default function Workspace(){
 const [user,setUser]=useState<{id:string;name:string}|null>(null),[checking,setChecking]=useState(true),[connectionError,setConnectionError]=useState('');
 const [courses,setCourses]=useState<Course[]>([]),[active,setActive]=useState(localStorage.getItem('studyforge-course')||''),[menu,setMenu]=useState(false),[toast,setToast]=useState(''),[theme,setTheme]=useState('dark');
 const refresh=async()=>{const result=await api<Course[]>('/courses');setCourses(result);if(!result.some(c=>c.id===active))setActive(result[0]?.id||'');};
 const check=async()=>{setChecking(true);setConnectionError('');try{setUser(await api('/auth/me'));}catch(e){if(!(e instanceof ApiError&&e.status===401))setConnectionError((e as Error).message);}finally{setChecking(false);}};
 useEffect(()=>{void check();},[]);
 useEffect(()=>{if(user){void refresh().catch(e=>setConnectionError(e.message));void api<Settings>('/settings').then(s=>setTheme(s.theme)).catch(e=>setConnectionError(e.message));}},[user]);
 useEffect(()=>{localStorage.setItem('studyforge-course',active);},[active]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),5500);return()=>clearTimeout(t);}},[toast]);
 if(checking)return <div className="sf-app"><Loading/></div>;
 if(connectionError)return <div className="sf-app sf-auth"><h1>StudyForge</h1><ErrorBox message={connectionError}/><button className="sf-button primary" onClick={()=>void check()}>Retry connection</button><Link to="/">Back to landing page</Link></div>;
 if(!user)return <Auth onSignedIn={setUser}/>;
 const course=courses.find(c=>c.id===active)||courses[0]||null;
 return <WorkspaceContext.Provider value={{course,courses,refresh,notify:setToast}}><div className={'sf-app '+(theme==='light'?'sf-light':'')}>
 <a className="sf-skip" href="#workspace-content">Skip to content</a>
 {menu&&<button className="sf-scrim" aria-label="Close navigation" onClick={()=>setMenu(false)}/>}
 <aside className={'sf-sidebar '+(menu?'open':'')}><Link className="sf-brand" to="/"><img src="/assets/studyforge-logo.png" alt=""/><div>StudyForge<span>.ai</span><small>PERSONAL LEARNING SPACE</small></div></Link><Link className="sf-button primary sf-new" to="/app/new" onClick={()=>setMenu(false)}>+ New topic</Link>
 <nav aria-label="Workspace">{nav.map(([path,icon,label])=><NavLink end key={path} to={'/app'+(path?'/'+path:'')} onClick={()=>setMenu(false)}><span className="material-symbols-outlined">{icon}</span>{label}{path==='study-ai'&&<span className="sf-mini-badge">AI</span>}</NavLink>)}</nav>
 <div className="sf-sidebar-bottom"><div className="sf-avatar">{user.name.charAt(0).toUpperCase()}</div><div><strong>{user.name}</strong><small>Your learning, connected</small></div><button aria-label="Sign out" onClick={async()=>{try{await api('/auth/logout','POST');setUser(null);}catch(e){setToast((e as Error).message);}}}><span className="material-symbols-outlined">logout</span></button></div></aside>
 <div className="sf-main"><div className="sf-topbar"><button className="sf-menu" aria-label="Open navigation" onClick={()=>setMenu(true)}><span className="material-symbols-outlined">menu</span></button><div className="sf-breadcrumb">Workspace <span>/</span> <strong>{course?.title||'Get started'}</strong></div><label className="sf-course-picker"><span className="sr-only">Active course</span><select value={course?.id||''} onChange={e=>setActive(e.target.value)}><option value="" disabled>Select a course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
 <main id="workspace-content" className="sf-content"><Suspense fallback={<Loading/>}><Routes><Route index element={<Dashboard/>}/><Route path="new" element={<NewTopic onCreated={setActive}/>}/><Route path="today" element={<Today/>}/><Route path="curriculum" element={<Curriculum/>}/><Route path="timetable" element={<Timetable/>}/><Route path="tasks" element={<Tasks/>}/><Route path="knowledge" element={<Knowledge/>}/><Route path="quizzes" element={<Quizzes/>}/><Route path="revision" element={<Revision/>}/><Route path="progress" element={<Progress/>}/><Route path="files" element={<Files/>}/><Route path="settings" element={<SettingsPage onTheme={setTheme}/>}/><Route path="study-ai" element={<StudyAI/>}/><Route path="*" element={<div><h1>Page not found</h1><Link to="/app">Go to dashboard</Link></div>}/></Routes></Suspense></main></div>{toast&&<div className="sf-toast" role="status">{toast}</div>}
 </div></WorkspaceContext.Provider>;
}
function Auth({onSignedIn}:{onSignedIn:(u:{id:string;name:string})=>void}){const [register,setRegister]=useState(false);const {busy,error,run}=useAction();return <div className="sf-app sf-auth"><Link className="sf-brand" to="/"><img src="/assets/studyforge-logo.png" alt=""/>StudyForge<span>.ai</span></Link><div className="sf-panel"><span className="sf-eyebrow">YOUR KNOWLEDGE, YOUR SPACE</span><h1>{register?'Start your learning journey':'Welcome back'}</h1><p className="sf-muted">Your courses, conversations, and progress stay together.</p><form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);void run(async()=>onSignedIn(await api('/auth/'+(register?'register':'login'),'POST',Object.fromEntries(d))));}}>{register&&<label>Your name<input name="name" required maxLength={80}/></label>}<label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" required minLength={12} autoComplete={register?'new-password':'current-password'}/><small>At least 12 characters</small></label>{register&&<label>Invitation code <small>Only if your host requires one</small><input name="invite_code" autoComplete="off"/></label>}<ErrorBox message={error}/><button disabled={busy} className="sf-button primary">{busy?'Please wait…':register?'Create account':'Sign in'}</button></form><button className="sf-button subtle" onClick={()=>setRegister(!register)}>{register?'Already have an account? Sign in':'New here? Create an account'}</button></div><p className="sf-muted">Add your own AI provider key in Settings. No key is needed to organize your learning.</p></div>;}
