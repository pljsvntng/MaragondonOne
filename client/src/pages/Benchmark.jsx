import {ALGO_INFO} from '../config/municipal';
export default function Benchmark({evaluation,config,setConfig,inspect}){
  const e=evaluation;const sel=(k,opts)=><select className="inp w-auto" value={config[k]} onChange={x=>setConfig({...config,[k]:+x.target.value})}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  return(<div className="space-y-5">
   <div className="card p-4 flex flex-wrap gap-4 text-sm items-center"><span>RR quantum {sel('rrQuantum',[2,3])}</span><span>MLQ preset {sel('mlqPreset',[1,2])}</span><span>MLFQ preset {sel('mlfqPreset',[1,2])}</span>{[['mlfqQ1','Q1'],['mlfqQ2','Q2'],['mlfqAging','Aging threshold']].map(([k,l])=><label key={k}>{l} <input type="number" min="1" placeholder={k==='mlfqAging'?'20':'preset'} className="inp w-24 inline-block" value={config[k]??''} onChange={x=>{const v=parseInt(x.target.value,10),c={...config};v>=1?c[k]=v:delete c[k];setConfig(c)}}/></label>)}</div>
   {e&&<><div className="card p-5 border-l-4" style={{borderLeftColor:'#0F766E'}}><div className="text-xs text-slate-600">Recommended protocol for this dataset</div>
    <div className="text-xl font-semibold">{e.recommended.algorithm} <span className="text-sm font-normal text-slate-600">— {ALGO_INFO[e.recommended.algorithm][0]}</span></div>
    <p className="text-sm mt-1">{e.recommended.reason}</p><p className="text-xs text-slate-600 mt-2">{e.recommended.disclaimer}</p></div>
   <div className="card overflow-x-auto"><table className="w-full"><thead><tr>{['Rank','Algorithm','Avg WT','Avg TT','Utilization','Idle','Preemptions',''].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
    <tbody>{e.ranking.map(r=><tr key={r.algorithm} className={r.rank===1?'bg-alabaster':''}><td className="td font-mono">{r.rank}</td><td className="td font-medium">{r.algorithm}</td>
     <td className="td font-mono">{r.avgWT}</td><td className="td font-mono">{r.avgTT}</td><td className="td font-mono">{r.utilizationFraction} = {r.utilization}%</td><td className="td font-mono">{r.idleTime}</td>
     <td className="td font-mono">{r.preemptions}</td><td className="td"><button className="text-teal text-sm" onClick={()=>inspect(r.algorithm)}>Inspect timeline</button></td></tr>)}</tbody></table></div>
   <p className="text-xs text-slate-600">Ranking: lowest average waiting time, then lowest average turnaround, then higher utilization, then fixed algorithm order (FCFS, SJF, NPP, SRTF, PP, RR, MLQ, MLFQ).</p></>}
  </div>);
}
