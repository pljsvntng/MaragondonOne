'use strict';
/**
 * MaragondonOne scheduling engines. One resource, unit-time simulation: each tick runs at most one ticket,
 * so segments never overlap. Input: normalized tickets {id,arrivalTime,burstTime,priority,queueLevel,...}.
 * Output (each engine): {algorithm,config,timeline[],levelTimelines?,tickets[],summary}.
 * timeline segment: {id|null,level,start,end,idle,preempted,resumed}.
 * TIE-BREAKS: arrivalTime, then input order. Preemptive engines keep the running ticket on ties.
 * RR: tickets arriving at/before the slice boundary are enqueued BEFORE the interrupted ticket.
 * MLQ: L1 strictly outranks L2 and preempts it at once (queueLevel>1 is treated as L2).
 * MLFQ: tickets enter L1. L1/L2 slices (Q1/Q2) are not interrupted by arrivals (decisions at slice boundaries,
 *   as in the lecture); L3 (SJF on remaining time) yields as soon as L1/L2 has work. Exhausting a quantum
 *   demotes one level. ANTI-STARVATION AGING: a ticket waiting >= `aging` units (default 20) in L2/L3 is
 *   promoted one level and re-queued at the tail.
 */
const ALGORITHMS=['FCFS','SJF','NPP','SRTF','PP','RR','MLQ','MLFQ'];
const MLQ_PRESETS={1:{l1:'NPP',l2:'SRTF'},2:{l1:'PP',l2:'SJF'}};
const MLFQ_PRESETS={1:{q1:2,q2:3},2:{q1:1,q2:2}};
const DEFAULTS={rrQuantum:3,mlqPreset:1,mlfqPreset:1,mlfqAging:20};
const cmp=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]<b[i]?-1:1;return 0};
const best=(l,k)=>l.reduce((m,x)=>!m||cmp(k(x),k(m))<0?x:m,null);
const D={
 FCFS:(r,p)=>p||best(r,x=>[x.arrivalTime,x.order]),
 SJF:(r,p)=>p||best(r,x=>[x.burstTime,x.arrivalTime,x.order]),
 NPP:(r,p)=>p||best(r,x=>[x.priority,x.arrivalTime,x.order]),
 SRTF:(r,p)=>best(r,x=>[x.remaining,x===p?0:1,x.arrivalTime,x.order]),
 PP:(r,p)=>best(r,x=>[x.priority,x===p?0:1,x.arrivalTime,x.order])};

function rrPicker(q,ts){
  const queue=[],seen=new Set();let cur=null,used=0;
  return (ready,prev,t)=>{
    let pending=null;
    if(cur&&cur.remaining<=0)cur=null;
    if(cur&&used>=q){pending=cur;cur=null}
    ts.filter(x=>x.arrivalTime<=t&&!seen.has(x.id)).forEach(x=>{seen.add(x.id);queue.push(x)});
    if(pending)queue.push(pending);
    if(!cur){cur=queue.shift()||null;used=0}
    if(cur)used++;return cur;};
}
function mlfqPicker(c,ts){
  const Q=[null,[],[],[]],quant={1:c.q1,2:c.q2},seen=new Set();let cur=null,used=0;
  const rm=(l,x)=>l.splice(l.indexOf(x),1);
  return (ready,prev,t)=>{
    let pending=null;
    if(cur&&cur.remaining<=0)cur=null;
    if(cur&&cur.level<3&&used>=quant[cur.level]){pending=cur;cur=null}
    ts.filter(x=>x.arrivalTime<=t&&!seen.has(x.id)).forEach(x=>{seen.add(x.id);x.level=1;x.qAt=t;Q[1].push(x)});
    if(pending){pending.level=Math.min(3,pending.level+1);pending.qAt=t;Q[pending.level].push(pending)}
    if(cur&&cur.level===3&&(Q[1].length||Q[2].length)){Q[3].push(cur);cur=null}
    for(const lv of [2,3])for(const x of Q[lv].slice())if(t-x.qAt>=c.aging){rm(Q[lv],x);x.level=lv-1;x.qAt=t;Q[lv-1].push(x)}
    if(!cur){
      cur=Q[1].shift()||Q[2].shift()||null;
      if(!cur&&Q[3].length){cur=best(Q[3],x=>[x.remaining,x.qAt,x.arrivalTime,x.order]);rm(Q[3],cur)}
      used=0;
    }
    if(cur)used++;return cur;};
}
function simulate(ts,pick){
  const trace=[];let t=0,left=ts.length,prev=null;
  while(left>0){
    const ready=ts.filter(x=>x.arrivalTime<=t&&x.remaining>0);
    const run=pick(ready,prev,t);
    if(run){run.remaining--;if(run.remaining===0){run.end=t+1;left--}}
    trace.push({t,id:run?run.id:null,level:run?(run.level??run.queueLevel):null,left:run?run.remaining:0});
    prev=run&&run.remaining>0?run:null;t++;
    if(t>1e5)throw new Error('simulation did not terminate');
  }
  return trace;
}
function finish(name,config,ts,trace){
  const segs=[],seen=new Set();let preemptions=0;
  trace.forEach((k,i)=>{
    const l=segs[segs.length-1];
    if(l&&l.id===k.id&&l.level===k.level&&l.end===k.t)l.end=k.t+1;
    else{
      if(l&&l.id&&trace[i-1].left>0&&k.id){l.preempted=true;preemptions++}
      segs.push({id:k.id,level:k.level,start:k.t,end:k.t+1,idle:k.id===null,preempted:false,resumed:!!k.id&&seen.has(k.id)});
    }
    if(k.id)seen.add(k.id);
  });
  const rows=ts.map(x=>({id:x.id,barangay:x.barangay,title:x.title,AT:x.arrivalTime,BT:x.burstTime,P:x.priority,QL:x.queueLevel,
    ET:x.end,TT:x.end-x.arrivalTime,WT:x.end-x.arrivalTime-x.burstTime}));
  const active=trace.filter(k=>k.id).length,final=Math.max(...rows.map(r=>r.ET));
  const avg=f=>+(rows.reduce((s,r)=>s+r[f],0)/rows.length).toFixed(4);
  const out={algorithm:name,config,timeline:segs,tickets:rows,summary:{avgWT:avg('WT'),avgTT:avg('TT'),activeTime:active,
    finalTime:final,idleTime:final-active,utilization:final?+(active/final*100).toFixed(2):null,
    utilizationFraction:`${active}/${final}`,preemptions}};
  if(name==='MLFQ')out.levelTimelines={1:segs.filter(s=>!s.idle&&s.level===1),2:segs.filter(s=>!s.idle&&s.level===2),3:segs.filter(s=>!s.idle&&s.level===3),master:segs};
  return out;
}
function runAlgorithm(name,tickets,cfg={}){
  if(!ALGORITHMS.includes(name))throw Object.assign(new Error(`Unknown algorithm ${name}`),{status:404});
  const c={...DEFAULTS,...cfg};
  for(const k of ['rrQuantum','mlfqQ1','mlfqQ2','mlfqAging'])if(c[k]!=null&&(!Number.isInteger(c[k])||c[k]<1))throw Object.assign(new Error(`${k} must be a positive integer`),{status:400});
  const ts=tickets.map((t,i)=>({...t,order:i,remaining:t.burstTime,end:null}));
  let pick,config={};
  if(name==='RR'){config={quantum:c.rrQuantum};pick=rrPicker(c.rrQuantum,ts)}
  else if(name==='MLQ'){
    const m=MLQ_PRESETS[c.mlqPreset]||MLQ_PRESETS[1];config={preset:c.mlqPreset,...m};
    pick=(ready,prev)=>{if(!ready.length)return null;const l1=ready.filter(x=>x.queueLevel===1);
      const pool=l1.length?l1:ready.filter(x=>x.queueLevel!==1);
      return D[l1.length?m.l1:m.l2](pool,pool.includes(prev)?prev:null)};
  }else if(name==='MLFQ'){
    const m=MLFQ_PRESETS[c.mlfqPreset]||MLFQ_PRESETS[1];
    config={preset:c.mlfqPreset,q1:c.mlfqQ1??m.q1,q2:c.mlfqQ2??m.q2,aging:c.mlfqAging};
    pick=mlfqPicker(config,ts);
  }else pick=(r,p)=>r.length?D[name](r,p):null;
  return finish(name,config,ts,simulate(ts,pick));
}
function evaluateAll(tickets,cfg={}){
  const results={};ALGORITHMS.forEach(a=>results[a]=runAlgorithm(a,tickets,cfg));
  const k=a=>[a.avgWT,a.avgTT,-a.utilization,ALGORITHMS.indexOf(a.algorithm)];
  const ranking=ALGORITHMS.map(a=>({algorithm:a,...results[a].summary})).sort((a,b)=>cmp(k(a),k(b))).map((r,i)=>({rank:i+1,...r}));
  const w=ranking[0];
  return {results,ranking,recommended:{algorithm:w.algorithm,
    reason:`Lowest average waiting time (${w.avgWT}) on this dataset; ties are broken by average turnaround (${w.avgTT}), then higher utilization (${w.utilization}%), then fixed algorithm order.`,
    criteria:['avgWT asc','avgTT asc','utilization desc','algorithm order'],
    disclaimer:'Simulated scheduling efficiency for this dataset only; a decision-support measure, not proof of real-world emergency response suitability (e.g. Priority 1 incidents may matter more than averages).'}};
}
module.exports={ALGORITHMS,MLQ_PRESETS,MLFQ_PRESETS,DEFAULTS,runAlgorithm,evaluateAll};
