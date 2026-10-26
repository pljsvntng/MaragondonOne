'use strict';
const T=(id,barangay,title,arrivalTime,burstTime,priority,queueLevel,category)=>({id,barangay,title,arrivalTime,burstTime,priority,queueLevel,category,status:'Queued'});
module.exports={
 typhoon:{id:'typhoon',name:'Maragondon Typhoon and Flood Emergency',tickets:[
  T('P1','Caingin','Flood Rescue',3,4,2,1,'drrm'),T('P2','Bucal','Landslide Clearing',5,9,1,1,'drrm'),
  T('P3','Pantihan','Road Repair',8,4,2,2,'infra'),T('P4','Poblacion','Power Restoration',0,7,1,2,'water'),
  T('P5','Garita','Medical Dispatch',12,6,1,1,'health')]},
 infrastructure:{id:'infrastructure',name:'Maragondon Municipal Infrastructure Drive',tickets:[
  T('P1','Tulay','Bridge Inspection',10,5,2,1,'infra'),T('P2','Mabato','Waterline Fix',8,4,2,2,'water'),
  T('P3','Sta. Mercedes','Coastal Alert',12,4,1,2,'drrm'),T('P4','Pinagsanhan','Drainage Clearing',3,3,2,2,'infra'),
  T('P5','Layong Mabilog','Relief Goods',15,5,1,1,'patrol')]}};
