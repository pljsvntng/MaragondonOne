const test=require('node:test'),assert=require('node:assert');
const {runAlgorithm,evaluateAll}=require('../algorithms/allEightEngines');
const ds=require('../data/datasets');
const ET=r=>r.tickets.map(t=>t.ET);
const t=(id,at,bt,p=1,ql=1)=>({id,arrivalTime:at,burstTime:bt,priority:p,queueLevel:ql,barangay:'x',title:'x'});
// Expected end times P1..P5 from Lecture-5.
const L1={FCFS:[11,20,24,7,30],SJF:[11,30,15,7,21],NPP:[26,16,30,7,22],SRTF:[11,30,15,7,21],PP:[26,16,30,7,22],RR:[13,30,24,17,27],MLFQ:[13,30,20,26,24],MLQ:[7,16,30,26,22]};
const L2={FCFS:[17,12,21,6,26],SJF:[21,12,16,6,26],NPP:[26,12,16,6,21],SRTF:[21,12,16,6,26],PP:[26,12,16,6,21],RR:[23,14,22,6,26]};
for(const [a,e] of Object.entries(L1))test(`${a} matches lecture example 1`,()=>assert.deepEqual(ET(runAlgorithm(a,ds.typhoon.tickets)),e));
for(const [a,e] of Object.entries(L2))test(`${a} matches lecture example 2`,()=>assert.deepEqual(ET(runAlgorithm(a,ds.infrastructure.tickets,{rrQuantum:2})),e));
test('MLFQ preset 2 matches lecture example 2',()=>assert.deepEqual(ET(runAlgorithm('MLFQ',ds.infrastructure.tickets,{mlfqPreset:2})),[24,21,22,6,26]));
test('utilization with and without idle',()=>{
  assert.equal(runAlgorithm('FCFS',ds.typhoon.tickets).summary.utilization,100);
  const s=runAlgorithm('SJF',ds.infrastructure.tickets).summary;
  assert.equal(s.utilizationFraction,'21/26');assert.equal(s.utilization,80.77);assert.equal(s.idleTime,5)});
test('no overlap, WT=TT-BT, active time = sum of bursts',()=>{
  for(const d of Object.values(ds))for(const r of Object.values(evaluateAll(d.tickets,{rrQuantum:2}).results)){
    r.timeline.forEach((s,i)=>i&&assert.equal(s.start,r.timeline[i-1].end));
    r.tickets.forEach(x=>assert.equal(x.WT,x.TT-x.BT));
    assert.equal(r.summary.activeTime,d.tickets.reduce((s,x)=>s+x.burstTime,0))}});
test('PP preempts on higher priority only',()=>{
  const r=runAlgorithm('PP',[t('A',0,5,2),t('B',1,2,1),t('C',2,2,2)]);
  assert.deepEqual(r.timeline.map(s=>[s.id,s.start,s.end]),[['A',0,1],['B',1,3],['A',3,7],['C',7,9]]);
  assert.equal(r.summary.preemptions,1)});
test('RR: simultaneous arrivals, idle start, finish at boundary',()=>{
  const r=runAlgorithm('RR',[t('A',2,3),t('B',2,4)],{rrQuantum:3});
  assert.deepEqual(r.timeline.map(s=>[s.id,s.start,s.end]),[[null,0,2],['A',2,5],['B',5,9]])});
test('MLQ: Level 1 arrival preempts running Level 2',()=>{
  const r=runAlgorithm('MLQ',ds.typhoon.tickets);
  assert.deepEqual(r.timeline.slice(0,2).map(s=>[s.id,s.start,s.end]),[['P4',0,3],['P1',3,7]])});
test('MLFQ aging promotes a starved L3 ticket back to L2',()=>{
  const L=[t('Long',0,10),t('S1',4,2),t('S2',6,2),t('S3',8,2)];
  const promoted=r=>r.timeline.some(s=>s.id==='Long'&&s.level===2&&s.start>=5);
  assert.ok(promoted(runAlgorithm('MLFQ',L,{mlfqAging:4})));
  assert.ok(!promoted(runAlgorithm('MLFQ',L,{mlfqAging:1e9})))});
test('API: PIN gate, status validation',async()=>{
  process.env.STAFF_PIN='1234';const app=require('../index.js');
  const s=await new Promise(r=>{const x=app.listen(4300,()=>r(x))});
  const call=(m,u,h={},b)=>fetch('http://localhost:4300'+u,{method:m,headers:{'content-type':'application/json',...h},body:b&&JSON.stringify(b)}).then(r=>r.status);
  try{
    assert.equal(await call('DELETE','/api/tickets/P1'),401);
    assert.equal(await call('PUT','/api/tickets/P1',{'x-staff-pin':'1234'},{status:'Bogus'}),400);
    assert.equal(await call('PUT','/api/tickets/P1',{'x-staff-pin':'1234'},{status:'In service'}),200);
    assert.equal(await call('POST','/api/tickets',{},{id:'P1'}),400);
  }finally{s.close();delete process.env.STAFF_PIN}});
const {ALGORITHMS}=require('../algorithms/allEightEngines');
for(const a of ALGORITHMS){
  test(`${a}: simultaneous arrivals follow input order on full ties, with idle start`,()=>{
    const r=runAlgorithm(a,[t('A',3,2,1,1),t('B',3,2,1,1)],{rrQuantum:2});
    assert.deepEqual(r.timeline[0],{id:null,level:null,start:0,end:3,idle:true,preempted:false,resumed:false});
    assert.equal(r.timeline[1].id,'A');assert.equal(r.summary.idleTime,3);assert.equal(r.summary.utilization,57.14)});
  test(`${a}: ticket finishing exactly at a boundary is not counted as preempted`,()=>{
    const r=runAlgorithm(a,[t('A',0,2,1,1),t('B',0,2,1,1)],{rrQuantum:2,mlfqPreset:1});
    assert.equal(r.summary.preemptions,0)});
}
test('SRTF: strictly shorter preempts, equal remaining keeps running; SJF never preempts',()=>{
  const p=runAlgorithm('SRTF',[t('A',0,4,1,1),t('B',1,2,1,1)]);
  assert.deepEqual(p.timeline.map(x=>x.id),['A','B','A']);assert.equal(p.summary.preemptions,1);
  assert.equal(runAlgorithm('SRTF',[t('A',0,4,1,1),t('B',1,3,1,1)]).summary.preemptions,0); // tie at t=1 (3 vs 3)
  assert.equal(runAlgorithm('SJF',[t('A',0,6,1,1),t('B',1,2,1,1)]).summary.preemptions,0)});
test('RR quantum 2 interleaves FIFO; incomplete slice leaves ticket in queue order',()=>{
  const r=runAlgorithm('RR',[t('A',0,3),t('B',0,3)],{rrQuantum:2});
  assert.deepEqual(r.timeline.map(s=>[s.id,s.start,s.end]),[['A',0,2],['B',2,4],['A',4,5],['B',5,6]])});
test('MLFQ demotes after quantum exhaustion: BT 7, Q1=2,Q2=3 -> levels 1,2,3',()=>{
  const r=runAlgorithm('MLFQ',[t('A',0,7)],{mlfqPreset:1});
  assert.deepEqual(r.timeline.map(s=>[s.level,s.start,s.end]),[[1,0,2],[2,2,5],[3,5,7]]);
  assert.deepEqual(Object.keys(r.levelTimelines),['1','2','3','master'])});
test('invalid algorithm config is rejected',()=>{
  assert.throws(()=>runAlgorithm('RR',[t('A',0,1)],{rrQuantum:0}),/positive integer/);
  assert.throws(()=>runAlgorithm('MLFQ',[t('A',0,1)],{mlfqQ1:1.5}),/positive integer/)});
test('config endpoint data and category validation come from server config',()=>{
  const c=require('../config/municipal.json');assert.ok(c.barangays.length>0&&c.departments.length===6);
  const {validateTicket}=require('../utils/validation');
  assert.ok(validateTicket({...t('Z',0,1),barangay:'x',title:'x',category:'nope'}).errors.some(e=>/category/.test(e)))});
