import {Link} from 'react-router-dom';
import {Lesson} from '../api/client';
export default function LearningPath({lessons}:{lessons:Lesson[]}){
 if(!lessons.length)return null;
 return <section className="sf-panel sf-path"><div className="sf-section-head"><div><span className="sf-eyebrow">YOUR NEXT STEPS</span><h2>See your learning take shape</h2></div><Link to="/app/curriculum">Full learning path →</Link></div><p className="sf-muted">Explore a lesson. Each layer shows your actual progress, with mastery kept separate from completion.</p><ol className="sf-path-grid">{lessons.slice(0,6).map((l,i)=><li key={l.id}><Link to={'/app/today?lesson='+l.id} className={'sf-path-card '+(l.completed?'done':'')}><span className="sf-path-number">{String(i+1).padStart(2,'0')}</span><strong>{l.title}</strong><small>{l.completed?'Completed':'Ready to study'} · {Math.round(l.mastery||0)}% mastery</small><progress aria-label={l.title+' mastery'} max={100} value={l.mastery||0}/></Link></li>)}</ol></section>;
}
