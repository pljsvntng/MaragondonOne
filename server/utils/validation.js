'use strict';
const CATEGORIES=require('../config/municipal.json').departments.map(d=>d.id);
const STATUSES=['Incoming','Queued','In service','Completed','Cancelled'];
function validateTicket(t={},ids=[]){
  const e=[],n=Number;
  if(!t.id||typeof t.id!=='string'||!t.id.trim())e.push('id is required');
  else if(ids.includes(t.id.trim()))e.push(`id ${t.id} already exists`);
  if(!t.barangay)e.push('barangay is required');
  if(!t.title)e.push('title is required');
  if(t.arrivalTime===''||t.arrivalTime==null||!Number.isInteger(n(t.arrivalTime))||n(t.arrivalTime)<0)e.push('arrivalTime must be an integer >= 0');
  if(!Number.isInteger(n(t.burstTime))||n(t.burstTime)<1)e.push('burstTime must be an integer >= 1');
  if(![1,2,3].includes(n(t.priority)))e.push('priority must be 1, 2 or 3');
  if(![1,2].includes(n(t.queueLevel)))e.push('queueLevel must be 1 or 2');
  if(t.category&&!CATEGORIES.includes(t.category))e.push('category must be one of '+CATEGORIES.join(', '));
  if(t.status&&!STATUSES.includes(t.status))e.push('status must be one of '+STATUSES.join(', '));
  return {errors:e,ticket:{id:String(t.id||'').trim(),barangay:t.barangay,title:t.title,arrivalTime:n(t.arrivalTime),
    burstTime:n(t.burstTime),priority:n(t.priority),queueLevel:n(t.queueLevel),status:t.status||'Incoming',category:t.category||'docs',description:t.description||''}};
}
function validateDataset(list){
  if(!Array.isArray(list)||!list.length)return {errors:['tickets must be a non-empty array'],tickets:[]};
  const errors=[],tickets=[],ids=[];
  list.forEach((t,i)=>{const r=validateTicket(t,ids);r.errors.forEach(m=>errors.push(`ticket[${i}]: ${m}`));ids.push(r.ticket.id);tickets.push(r.ticket)});
  return {errors,tickets};
}
module.exports={STATUSES,validateTicket,validateDataset};
