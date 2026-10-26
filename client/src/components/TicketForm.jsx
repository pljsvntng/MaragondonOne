import {useState} from 'react';import {BARANGAYS,SERVICES} from '../config/municipal';import {api} from '../api';
export default function TicketForm({editing,nextId,onSaved,onCancel,defaultAT=0}){
  const [f,setF]=useState(editing||{id:nextId,barangay:BARANGAYS[0],title:'',arrivalTime:defaultAT,burstTime:1,priority:3,queueLevel:2,category:'docs',description:''});
  const [errs,setErrs]=useState([]);const [busy,setBusy]=useState(false);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const submit=async e=>{e.preventDefault();setBusy(true);setErrs([]);
    try{await (editing?api.upd(f):api.add(f));onSaved?.(f)}catch(x){setErrs(x.details||[x.message])}finally{setBusy(false)}};
  const L=(t,c)=><label className="block text-xs text-slate-600">{t}{c}</label>;
  return(<form onSubmit={submit} className="grid grid-cols-2 gap-3">
   {L('Ticket ID',<input className="inp" value={f.id} disabled={!!editing} onChange={set('id')}/>)}
   {L('Barangay',<select className="inp" value={f.barangay} onChange={set('barangay')}>{[...new Set([f.barangay,...BARANGAYS])].map(b=><option key={b}>{b}</option>)}</select>)}
   <div className="col-span-2">{L('Incident / request title',<input className="inp" value={f.title} onChange={set('title')}/>)}</div>
   {L('Arrival time (units)',<input type="number" className="inp" value={f.arrivalTime} onChange={set('arrivalTime')}/>)}
   {L('Service effort / burst (units)',<input type="number" className="inp" value={f.burstTime} onChange={set('burstTime')}/>)}
   {L('Priority',<select className="inp" value={f.priority} onChange={set('priority')}><option value={1}>1 · Emergency</option><option value={2}>2 · Alert</option><option value={3}>3 · Routine</option></select>)}
   {L('Queue level',<select className="inp" value={f.queueLevel} onChange={set('queueLevel')}><option value={1}>1 · Emergency response</option><option value={2}>2 · Infrastructure & routine</option></select>)}
   <div className="col-span-2">{L('Service category / department',<select className="inp" value={f.category||'docs'} onChange={set('category')}>{SERVICES.map(x=><option key={x.id} value={x.id}>{x.name} — {x.dept}</option>)}</select>)}</div>
   <div className="col-span-2">{L('Description',<textarea className="inp" rows={2} value={f.description||''} onChange={set('description')}/>)}</div>
   {editing&&L('Status',<select className="inp" value={f.status} onChange={set('status')}>{['Incoming','Queued','In service','Completed','Cancelled'].map(x=><option key={x}>{x}</option>)}</select>)}
   {errs.length>0&&<ul className="col-span-2 text-sm text-crimson list-disc pl-5" role="alert">{errs.map((m,i)=><li key={i}>{m}</li>)}</ul>}
   <div className="col-span-2 flex gap-2"><button className="btn-p" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Submit report'}</button>{onCancel&&<button type="button" className="btn" onClick={onCancel}>Cancel</button>}</div>
  </form>);
}
