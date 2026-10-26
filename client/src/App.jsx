import {useEffect,useState,useCallback} from 'react';import {Landmark,Siren} from 'lucide-react';import {api} from './api';
import {SERVICES,BARANGAYS,loadConfig} from './config/municipal';import Portal from './pages/Portal';import Dispatch from './pages/Dispatch';import Benchmark from './pages/Benchmark';
const NAV=[['portal','Citizen Service Portal'],['dispatch','Department Dispatch Center'],['benchmark','Algorithm Efficiency Benchmark']];
export default function App(){
  const [page,setPage]=useState('home'),[tickets,setTickets]=useState([]),[evaluation,setEval]=useState(null),[datasets,setDatasets]=useState([]);
  const [config,setConfig]=useState({rrQuantum:3,mlqPreset:1,mlfqPreset:1}),[algo,setAlgo]=useState('FCFS'),[query,setQuery]=useState('');
  const [ready,setReady]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const refresh=useCallback(async()=>{try{setError('');const [t,e]=await Promise.all([api.tickets(),api.evaluate(config)]);setTickets(t);setEval(e)}
    catch(x){setError(x.message)}finally{setLoading(false)}},[config]);
  useEffect(()=>{loadConfig().then(()=>setReady(true)).catch(x=>setError(x.message))},[]);
  useEffect(()=>{api.datasets().then(setDatasets).catch(x=>setError(x.message))},[]);
  useEffect(()=>{refresh()},[refresh]);
  const go=p=>{setPage(p);window.scrollTo(0,0)};
  return(<div className="min-h-screen">
   <header className="bg-white border-b border-line"><div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
    <button onClick={()=>go('home')} className="flex items-center gap-2 font-semibold"><Landmark size={20} className="text-teal"/>MaragondonOne<span className="text-xs font-normal text-slate-600 hidden sm:inline">Municipality of Maragondon, Cavite</span></button>
    <nav className="flex flex-wrap gap-4 text-sm text-slate-600">{NAV.map(([k,l])=><button key={k} onClick={()=>go(k)} className={page===k?'text-teal font-medium':'hover:text-ink'}>{l}</button>)}</nav>
    <button className="btn-p ml-auto flex items-center gap-1" onClick={()=>go('portal')}><Siren size={14}/>Submit Barangay Report</button></div></header>
   <main className="max-w-6xl mx-auto px-4 py-8">
    {error&&<div className="card border-crimson p-3 mb-5 text-sm text-crimson" role="alert">{error} <button className="underline ml-2" onClick={refresh}>Retry</button></div>}
    {loading&&!error&&<p className="text-sm text-slate-600 mb-4">Loading dispatch data…</p>}
    {ready&&page==='home'&&<>
     <section className="py-10 max-w-3xl"><h1 className="text-3xl md:text-4xl font-semibold leading-tight">Digital Governance & Rapid Barangay Response for Maragondon</h1>
      <p className="mt-4 text-slate-600">Report barangay concerns, track service tickets, and let municipal staff coordinate departments with transparent, comparable dispatch protocols.</p>
      <form className="mt-6 flex gap-2" onSubmit={e=>{e.preventDefault();go('portal')}}><input className="inp" placeholder="Search ticket ID, barangay or incident title" value={query} onChange={e=>setQuery(e.target.value)}/><button className="btn-p">Search</button></form>
      <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">{[['Barangay coverage',`${BARANGAYS.length} configured`],['Active dispatch engines',evaluation?Object.keys(evaluation.results).length:'—'],['Recommended protocol',evaluation?.recommended.algorithm||'—']].map(([l,v])=>
       <div key={l} className="border-l-2 border-teal pl-3"><dt className="text-xs text-slate-600">{l}</dt><dd className="font-semibold text-lg">{v}</dd></div>)}</dl></section>
     <section className="mt-6"><h2 className="font-semibold mb-4">Municipal Service Directory</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SERVICES.map(s=><div key={s.id} className="card p-4 flex flex-col"><div className="font-medium">{s.name}</div><div className="text-xs text-teal">{s.dept}</div><p className="text-sm text-slate-600 my-2 flex-1">{s.text}</p>
       <div className="flex gap-4 text-sm"><button className="text-teal" onClick={()=>go('portal')}>Submit report</button><button className="text-slate-600" onClick={()=>go('dispatch')}>Staff command center</button></div></div>)}</div></section></>}
    {ready&&page==='portal'&&<Portal evaluation={evaluation} tickets={tickets} refresh={refresh} query={query} setQuery={setQuery}/>}
    {ready&&page==='dispatch'&&<Dispatch tickets={tickets} evaluation={evaluation} algo={algo} setAlgo={setAlgo} refresh={refresh} datasets={datasets}/>}
    {page==='benchmark'&&<Benchmark evaluation={evaluation} config={config} setConfig={setConfig} inspect={a=>{setAlgo(a);go('dispatch')}}/>}
   </main></div>);
}
