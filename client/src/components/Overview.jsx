import {SERVICES,PRIORITY} from '../config/municipal';
// Command-center overview + department queues, derived from tickets and the selected algorithm's backend trace.
export default function Overview({tickets,result}){
  const n=f=>tickets.filter(f).length,live=t=>!['Completed','Cancelled'].includes(t.status);
  const cards=[['Incoming',n(t=>t.status==='Incoming')],['Queued',n(t=>t.status==='Queued')],['Active',n(t=>t.status==='In service')],['Completed',n(t=>t.status==='Completed')],['Urgent (Priority 1)',n(t=>t.priority===1&&live(t))]];
  const start=id=>result?.timeline.find(s=>s.id===id)?.start;const row=id=>result?.tickets.find(x=>x.id===id);
  return(<div className="space-y-4"><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{cards.map(([l,v])=><div key={l} className="card px-3 py-2"><div className="text-xs text-slate-600">{l}</div><div className="text-xl font-semibold font-mono">{v}</div></div>)}</div>
   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{SERVICES.map(d=>{const q=tickets.filter(t=>(t.category||'docs')===d.id&&live(t)).sort((a,b)=>(start(a.id)??1e9)-(start(b.id)??1e9));
    return(<div key={d.id} className="card p-3"><div className="text-sm font-medium">{d.dept}</div><div className="text-xs text-slate-600 mb-2">{d.name} · {q.length} open</div>
     {q.length===0?<p className="text-xs text-slate-600">No open tickets.</p>:<ul className="space-y-1">{q.map(t=><li key={t.id} className="text-xs flex justify-between gap-2"><span><b className="font-mono">{t.id}</b> {t.barangay} — {t.title} <span style={{color:PRIORITY[t.priority][1]}}>[{PRIORITY[t.priority][0].split(' · ')[0]}]</span></span>
      <span className="font-mono text-slate-600 whitespace-nowrap">{row(t.id)?`t=${start(t.id)}→${row(t.id).ET}`:''}</span></li>)}</ul>}</div>)})}</div></div>);}
