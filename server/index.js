'use strict';
const express=require('express'),cors=require('cors');
const datasets=require('./data/datasets');
const {validateTicket,validateDataset}=require('./utils/validation');
const {evaluateAll,runAlgorithm,ALGORITHMS}=require('./algorithms/allEightEngines');
const app=express();app.use(cors());app.use(express.json());
const fs=require('fs'),path=require('path');
const FILE=process.env.TICKETS_FILE||path.join(__dirname,'data','tickets.json');
let store=JSON.parse(JSON.stringify(datasets.typhoon.tickets));
let persist=false; // enabled only when run as the server, so tests never touch disk
const save=()=>{if(persist)try{fs.writeFileSync(FILE,JSON.stringify(store,null,2))}catch(e){console.error('persist failed',e.message)}};
// Staff-only actions (edit/delete/load dataset) require header x-staff-pin when STAFF_PIN is set.
const staff=(q,r,n)=>!process.env.STAFF_PIN||q.get('x-staff-pin')===process.env.STAFF_PIN?n():r.status(401).json({success:false,error:{message:'Staff PIN required for this action'}});
const ok=(res,data,s=200)=>res.status(s).json({success:true,data});
const bad=(res,errors)=>res.status(400).json({success:false,error:{message:'Validation failed',details:errors}});
const wrap=f=>(q,r,n)=>{try{f(q,r,n)}catch(e){n(e)}};

const municipal=require('./config/municipal.json');
app.get('/api/config',(q,r)=>ok(r,municipal));
app.get('/api/health',(q,r)=>ok(r,{status:'ok',algorithms:ALGORITHMS}));
app.get('/api/datasets',(q,r)=>ok(r,Object.values(datasets).map(({id,name,tickets})=>({id,name,tickets}))));
app.get('/api/datasets/:id/load',staff,wrap((q,r)=>{const d=datasets[q.params.id];if(!d)return r.status(404).json({success:false,error:{message:'Dataset not found'}});
  store=JSON.parse(JSON.stringify(d.tickets));save();ok(r,store)}));
app.get('/api/tickets',(q,r)=>ok(r,store));
app.post('/api/tickets',(q,r)=>{const v=validateTicket(q.body,store.map(t=>t.id));if(v.errors.length)return bad(r,v.errors);store.push(v.ticket);save();ok(r,v.ticket,201)});
app.put('/api/tickets/:id',staff,(q,r)=>{const i=store.findIndex(t=>t.id===q.params.id);if(i<0)return r.status(404).json({success:false,error:{message:'Ticket not found'}});
  const v=validateTicket({...store[i],...q.body,id:q.params.id},[]);if(v.errors.length)return bad(r,v.errors);store[i]=v.ticket;save();ok(r,v.ticket)});
app.delete('/api/tickets/:id',staff,(q,r)=>{const n=store.length;store=store.filter(t=>t.id!==q.params.id);
  if(store.length===n)return r.status(404).json({success:false,error:{message:'Ticket not found'}});save();ok(r,{deleted:q.params.id})});
function input(q){const v=validateDataset(q.body.tickets||store);return v}
app.post('/api/dispatch/evaluate-all',(q,r)=>{const v=input(q);if(v.errors.length)return bad(r,v.errors);ok(r,evaluateAll(v.tickets,q.body.config))});
app.post('/api/dispatch/evaluate/:algorithm',wrap((q,r)=>{const v=input(q);if(v.errors.length)return bad(r,v.errors);
  ok(r,runAlgorithm(q.params.algorithm.toUpperCase(),v.tickets,q.body.config))}));
app.use((q,r)=>r.status(404).json({success:false,error:{message:'Route not found'}}));
app.use((e,q,r,n)=>r.status(e.status||500).json({success:false,error:{message:e.message}}));
if(require.main===module){persist=true;try{store=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch{}}
if(require.main===module)app.listen(process.env.PORT||4000,()=>console.log('MaragondonOne API on',process.env.PORT||4000));
module.exports=app;
