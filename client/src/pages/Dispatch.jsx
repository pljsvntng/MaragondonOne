import {useState} from 'react';import Timeline from '../components/Timeline';import TicketForm from '../components/TicketForm';
import Overview from '../components/Overview';import {api} from '../api';import {ALGO_INFO} from '../config/municipal';
const Stat=({l,v})=><div className="card px-3 py-2"><div className="text-xs text-slate-600">{l}</div><div className="font-mono text-sm">{v}</div></div>;
export default function Dispatch({tickets,evaluation,algo,setAlgo,refresh,datasets}){
  const [sel,setSel]=useState(null);const [form,setForm]=useState(null);const [err,setErr]=useState('');
  const r=evaluation?.results[algo];const nextId='P'+(tickets.reduce((m,t)=>Math.max(m,+t.id.replace(/\D/g,'')||0),0)+1);
  const act=async f=>{setErr('');try{await f();await refresh()}catch(e){setErr(e.message)}};
  const t=r?.tickets.find(x=>x.id===sel);const s=r?.summary;
  return(<div className="space-y-5">
   <div className="flex flex-wrap gap-2 items-center"><span className="text-sm text-slate-600">Dataset:</span>
    {datasets.map(d=><button key={d.id} className="btn" onClick={()=>act(()=>api.load(d.id))}>{d.name}</button>)}</div>
   <label className="text-sm text-slate-600 block">Staff PIN (if required) <input type="password" className="inp w-40 inline-block ml-2" defaultValue={sessionStorage.getItem('staffPin')||''} onChange={e=>sessionStorage.setItem('staffPin',e.target.value)}/></label>
   <Overview tickets={tickets} result={r}/>
   {err&&<p className="text-sm text-crimson" role="alert">{err}</p>}
   <div className="flex flex-wrap gap-1 border-b border-line">{Object.keys(ALGO_INFO).map(a=><button key={a} onClick={()=>setAlgo(a)}
     className={`px-3 py-2 text-sm border-b-2 ${a===algo?'border-teal text-teal font-medium':'border-transparent text-slate-600'}`}>{a}</button>)}</div>
   {r&&<>
    <div className="text-sm"><b>{ALGO_INFO[algo][0]}</b> <span className="text-slate-600">· {ALGO_INFO[algo][1]}</span>{Object.keys(r.config).length>0&&<span className="font-mono text-xs text-slate-600"> · {JSON.stringify(r.config)}</span>}</div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
     <Stat l="Avg WT" v={s.avgWT}/><Stat l="Avg TT" v={s.avgTT}/><Stat l="Active time" v={s.activeTime}/><Stat l="Final completion" v={s.finalTime}/>
     <Stat l="Utilization" v={s.utilization==null?'n/a':`${s.utilizationFraction} = ${s.utilization}%`}/><Stat l="Idle time" v={s.idleTime}/><Stat l="Preemptions" v={s.preemptions}/></div>
    <div className="card p-4">
     {algo==='MLFQ'?<>{[1,2,3].map(l=><Timeline key={l} title={l===3?'Level 3 · SJF':`Level ${l} · Quantum ${l===1?r.config.q1:r.config.q2}`} segments={r.levelTimelines[l]} total={s.finalTime} tickets={r.tickets} selected={sel} onSelect={setSel}/>)}
       <Timeline title="Combined Master Timeline" segments={r.levelTimelines.master} total={s.finalTime} tickets={r.tickets} selected={sel} onSelect={setSel}/></>
      :<Timeline title="Execution timeline" segments={r.timeline} total={s.finalTime} tickets={r.tickets} selected={sel} onSelect={setSel}/>}
     <p className="text-xs text-slate-600">Colour is paired with “Pri n” labels. ↩ resumed · ⏸ preempted · grey = Idle.</p></div>
    {t&&<div className="card p-4 text-sm" role="status"><b>{t.id}</b> · {t.barangay} — {t.title}<div className="font-mono text-xs mt-1">Priority {t.P} · AT {t.AT} · BT {t.BT} · ET {t.ET} · TT {t.TT} · WT {t.WT}</div></div>}
    <div className="card overflow-x-auto"><table className="w-full"><thead><tr>{['ID','Barangay','Incident','AT','BT','P','QL','ET','TT','WT',''].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
     <tbody>{r.tickets.map(x=><tr key={x.id} className={sel===x.id?'bg-alabaster':''}><td className="td font-mono"><button onClick={()=>setSel(x.id)}>{x.id}</button></td><td className="td">{x.barangay}</td><td className="td">{x.title}</td>
      {['AT','BT','P','QL','ET','TT','WT'].map(k=><td key={k} className="td font-mono">{x[k]}</td>)}
      <td className="td whitespace-nowrap"><button className="text-teal text-sm mr-3" onClick={()=>setForm(tickets.find(y=>y.id===x.id))}>Edit</button>
       <button className="text-crimson text-sm" onClick={()=>window.confirm(`Delete ${x.id}?`)&&act(()=>api.del(x.id))}>Delete</button></td></tr>)}</tbody></table></div></>}
   <div className="card p-5 max-w-2xl"><h3 className="font-semibold mb-3">{form?`Edit ${form.id}`:'Add ticket'}</h3>
    <TicketForm key={form?.id||nextId} editing={form} nextId={nextId} onCancel={form&&(()=>setForm(null))} onSaved={()=>{setForm(null);refresh()}}/></div>
  </div>);
}
