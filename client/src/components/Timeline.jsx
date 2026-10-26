import {PRIORITY} from '../config/municipal';
export default function Timeline({title,segments,total,tickets,selected,onSelect}){
  const pri=Object.fromEntries(tickets.map(t=>[t.id,t.P]));
  return(<div className="mb-4"><div className="text-xs font-medium text-slate-600 mb-1">{title}</div>
   <div className="overflow-x-auto"><div className="min-w-[640px]">
    <div className="flex h-10 border border-line rounded overflow-hidden bg-white">
     {segments.map((s,i)=>{const w=(s.end-s.start)/total*100;
      return s.idle?<div key={i} style={{width:w+'%',background:'#94A3B8'}} className="flex items-center justify-center text-[11px] text-white border-r border-white/60" title={`Idle ${s.start}–${s.end}`}>Idle</div>
      :<button key={i} onClick={()=>onSelect?.(s.id)} style={{width:w+'%',background:PRIORITY[pri[s.id]]?.[1]}} title={`${s.id} ${s.start}–${s.end}${s.preempted?' · preempted':''}${s.resumed?' · resumed':''}`}
        className={`text-white text-[11px] leading-tight border-r border-white/70 ${selected===s.id?'ring-2 ring-inset ring-ink':''}`}>
        {s.id}{s.resumed?' ↩':''}<br/><span className="opacity-90">Pri {pri[s.id]}{s.preempted?' ⏸':''}</span></button>})}
    </div>
    <div className="relative h-4 font-mono text-[10px] text-slate-600">{[...new Set(segments.flatMap(s=>[s.start,s.end]))].map(t=>
      <span key={t} style={{left:t/total*100+'%'}} className="absolute -translate-x-1/2">{t}</span>)}</div>
   </div></div></div>);
}
