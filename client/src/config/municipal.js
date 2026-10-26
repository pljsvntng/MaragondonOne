// Barangays and departments come from the server (server/config/municipal.json) via loadConfig().
export const BARANGAYS=[],SERVICES=[];
export async function loadConfig(){const {api}=await import('../api');const c=await api.config();
  BARANGAYS.splice(0,BARANGAYS.length,...c.barangays);SERVICES.splice(0,SERVICES.length,...c.departments);}
export const ALGO_INFO={FCFS:['Barangay Document & Permit Requests','Non-preemptive'],SJF:['Streetlight, Pothole & Routine Road Repair','Non-preemptive'],
 NPP:['Rural Health Unit Medical Supply Dispatch','Non-preemptive'],SRTF:['Waterworks & Pipe Leak Response','Preemptive'],
 PP:['MDRRMO Flood & Landslide Emergency Response','Preemptive'],RR:['Equitable Barangay Patrol & Relief Rotation','Preemptive'],
 MLQ:['Interdepartmental Emergency & Infrastructure Dispatch','Multi-level'],MLFQ:['Adaptive Escalation & Anti-Starvation Management','Multi-level']};
export const PRIORITY={1:['Priority 1 · Emergency','#BE123C'],2:['Priority 2 · Alert','#D97706'],3:['Priority 3 · Routine','#0F766E']};
