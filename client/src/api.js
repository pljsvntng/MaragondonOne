const j=async(u,o={})=>{let r;try{r=await fetch('/api'+u,{headers:{'content-type':'application/json','x-staff-pin':sessionStorage.getItem('staffPin')||''},...o})}catch{throw new Error('Cannot reach the MaragondonOne server. Is it running on port 4000?')}
 const b=await r.json().catch(()=>({}));if(!b.success)throw Object.assign(new Error(b.error?.message||'Request failed'),{details:b.error?.details});return b.data};
const body=x=>JSON.stringify(x);
export const api={config:()=>j('/config'),datasets:()=>j('/datasets'),load:id=>j(`/datasets/${id}/load`),tickets:()=>j('/tickets'),
 add:t=>j('/tickets',{method:'POST',body:body(t)}),upd:t=>j(`/tickets/${t.id}`,{method:'PUT',body:body(t)}),del:id=>j(`/tickets/${id}`,{method:'DELETE'}),
 evaluate:config=>j('/dispatch/evaluate-all',{method:'POST',body:body({config})})};
