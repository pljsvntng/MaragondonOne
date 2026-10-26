import {useState} from 'react';import TicketForm from '../components/TicketForm';import {SERVICES,PRIORITY} from '../config/municipal';
export default function Portal({tickets,refresh,query,setQuery,evaluation}){
  const rec=evaluation?.results[evaluation.recommended.algorithm];const row=id=>rec?.tickets.find(x=>x.id===id);
  const KEY='myTickets';const mine=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const [scope,setScope]=useState('mine');const ids=mine();
  const q=query.toLowerCase();const list=tickets.filter(t=>(scope==='all'||ids.includes(t.id))&&(!q||[t.id,t.barangay,t.title].some(v=>v.toLowerCase().includes(q))));
  const [ok,setOk]=useState(false);
  const nextId='P'+(tickets.reduce((m,t)=>Math.max(m,+t.id.replace(/\D/g,'')||0),0)+1);
  return(<div className="grid lg:grid-cols-5 gap-6">
   <section className="card p-5 lg:col-span-2"><h2 className="font-semibold mb-3">Submit Barangay Report</h2>
    <TicketForm key={nextId} nextId={nextId} defaultAT={Math.max(0,...tickets.map(t=>t.arrivalTime))} onSaved={f=>{try{localStorage.setItem(KEY,JSON.stringify([...ids,f.id.trim()]))}catch{}setOk(true);refresh()}}/>
    {ok&&<p className="text-sm text-teal mt-3" role="status">Report received and queued for dispatch evaluation.</p>}</section>
   <section className="card p-5 lg:col-span-3"><div className="flex gap-3 items-center mb-3"><h2 className="font-semibold">My Reports & Ticket Status</h2>
    <select className="inp w-auto ml-auto" value={scope} onChange={e=>setScope(e.target.value)} aria-label="Report scope"><option value="mine">My reports (this device)</option><option value="all">All public tickets</option></select>
    <input className="inp max-w-xs" placeholder="Search ticket ID, barangay or title" value={query} onChange={e=>setQuery(e.target.value)}/></div>
    {list.length===0?<p className="text-sm text-slate-600">No tickets found. Submit a report, or switch to “All public tickets”.</p>:
    <div className="overflow-x-auto"><table className="w-full"><thead><tr>{['Ticket','Barangay','Title','Priority','Status','Est. completion'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
     <tbody>{list.map(t=><tr key={t.id}><td className="td font-mono">{t.id}</td><td className="td">{t.barangay}</td><td className="td">{t.title}</td>
      <td className="td"><span style={{color:PRIORITY[t.priority][1]}} className="font-medium">{PRIORITY[t.priority][0]}</span></td><td className="td">{t.status==='Queued'&&row(t.id)?'Scheduled':t.status}</td><td className="td font-mono text-xs">{row(t.id)?`t=${row(t.id).ET} (wait ${row(t.id).WT})`:'—'}</td></tr>)}</tbody></table></div>}
   </section>
   <section className="lg:col-span-5"><h2 className="font-semibold mb-3">Municipal Services</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {SERVICES.map(s=><div key={s.id} className="card p-4"><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-teal mt-0.5">{s.dept}</div><p className="text-sm text-slate-600 mt-2">{s.text}</p></div>)}</div></section>
  </div>);
}
