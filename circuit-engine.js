/* Samostatné okruhy před kreslením tras. Návrh není ověření jištění. */
const CircuitEngine=(()=>{
 const kinds=['socket','lighting','fixed'],pointKind=a=>['socket','socket2','socket3'].includes(a?.type)?'socket':['socket400','outlet'].includes(a?.type)?'fixed':a?.type==='light'||a?.type?.startsWith('switch')?'lighting':null;
 const applianceKind=a=>a.connectionType==='fixed'||a.mode!=='1N'?'fixed':'socket';
 const capacity=a=>a.type==='socket2'?2:a.type==='socket3'?3:1;
 const outlets=a=>a.type==='socket2'?(a.mechanisms??2):a.type==='socket3'?3:pointKind(a)==='socket'?1:0;
 const mark=c=>({socket:'Z',lighting:'S',fixed:'V'}[c.kind]||'O')+c.id;
 const routePlanId=r=>r.circuitId??r.id;
 const connectedIds=r=>[...new Set(r.points.map(p=>p.componentId).filter(x=>x!=null))];
 const power=a=>a.powerW??(a.area&&a.density?a.area*a.density:0);
 const isDedicated=a=>applianceKind(a)==='fixed'||a.dedicated!=='auto'||['dishwasher','washer','dryer','oven','boiler','heater','floor','ev'].includes(a.template)||(power(a)>=2000&&!['kettle','coffee','microwave'].includes(a.template));
 const compatible=(a,p)=>a.connectionType==='fixed'?p?.type==='outlet':a.mode==='1N'?pointKind(p)==='socket':p?.type==='socket400';
 function migrate(items){return items.filter(r=>r.type==='route'&&r.circuit).map(r=>({id:routePlanId(r),kind:r.kind,name:'Původní okruh '+mark({id:routePlanId(r),kind:r.kind}),panelId:r.points[0]?.componentId??null,pointIds:connectedIds(r).slice(1),applianceIds:[],cable:r.cable}));}
 function propose(items,existing,lastId,roomOf=()=>null,roomName=()=> 'Nezařazeno',settings={ln:230}){
  const map=new Map(items.map(a=>[a.id,a])),pointOwners=new Map(),applianceOwners=new Set(),used=new Map(),links=[],groups=[],panels=items.filter(a=>a.type==='panel');
  let seq=lastId,updated=0;
  const retained=existing.map(c=>({...c,pointIds:[...c.pointIds],applianceIds:[...c.applianceIds]})),reserved=new Set();
  for(const c of retained){for(const id of c.pointIds)pointOwners.set(id,c.id);for(const id of c.applianceIds)applianceOwners.add(id)}
  const appliances=items.filter(a=>a.type==='appliance').sort((a,b)=>Number(isDedicated(b))-Number(isDedicated(a))||a.id-b.id);
  for(const a of appliances)if(compatible(a,map.get(a.connectionPointId))){used.set(a.connectionPointId,(used.get(a.connectionPointId)||0)+1);if(isDedicated(a))reserved.add(a.connectionPointId)}
  const assigned=new Map();
  // Dřívější návrh bez bodu lze doplnit, aniž by vznikl další okruh.
  for(const c of retained){if(coverage(c,items).routes.length||c.pointIds.length||c.applianceIds.length!==1)continue;const a=map.get(c.applianceIds[0]);if(!a)continue;
   let p=map.get(a.connectionPointId);if(!compatible(a,p)||pointOwners.has(p.id))p=null;
   if(!p&&a.connectionPointId==null&&roomOf(a)!=null){const options=items.filter(q=>compatible(a,q)&&pointKind(q)===c.kind&&!pointOwners.has(q.id)&&!used.get(q.id)&&roomOf(q)===roomOf(a)).sort((q,z)=>Math.hypot(q.p.x-a.p.x,q.p.y-a.p.y)-Math.hypot(z.p.x-a.p.x,z.p.y-a.p.y)||q.id-z.id);p=options[0];if(p){links.push({applianceId:a.id,pointId:p.id});used.set(p.id,1)}}
   if(p&&pointKind(p)===c.kind){c.pointIds.push(p.id);c.applianceIds=[];pointOwners.set(p.id,c.id);assigned.set(a.id,p.id);if(isDedicated(a))reserved.add(p.id);updated++}
  }
  // Navrhovat pouze volné body ve stejné jednoznačně určené místnosti.
  for(const a of appliances){
   if(applianceOwners.has(a.id)||assigned.has(a.id))continue;
   if(compatible(a,map.get(a.connectionPointId))){assigned.set(a.id,a.connectionPointId);continue}
   if(a.connectionPointId!=null||roomOf(a)==null)continue;
   const candidates=items.filter(p=>{
     if(!compatible(a,p)||reserved.has(p.id)||roomOf(p)!==roomOf(a)||(used.get(p.id)||0)>=capacity(p))return false;
     const owner=retained.find(c=>c.id===pointOwners.get(p.id));
     if(owner&&owner.kind!==pointKind(p))return false;
     if(isDedicated(a)&&(used.get(p.id)||owner&&owner.pointIds.filter(id=>pointKind(map.get(id))===owner.kind).length!==1))return false;
     return true;
   });
   candidates.sort((p,q)=>Math.hypot(p.p.x-a.p.x,p.p.y-a.p.y)-Math.hypot(q.p.x-a.p.x,q.p.y-a.p.y)||p.id-q.id);
   if(candidates.length){const p=candidates[0];assigned.set(a.id,p.id);used.set(p.id,(used.get(p.id)||0)+1);links.push({applianceId:a.id,pointId:p.id});if(isDedicated(a))reserved.add(p.id)}
  }
  const byPoint=new Map();for(const a of appliances){const id=assigned.get(a.id);if(id!=null){if(!byPoint.has(id))byPoint.set(id,[]);byPoint.get(id).push(a)}}
  function create(kind,name,pointIds=[],applianceIds=[],cable=kind==='lighting'?'CYKY-J 3×1,5':kind==='socket'?'CYKY-J 3×2,5':'Neurčený'){const c={id:++seq,kind,name:name.slice(0,160),panelId:panels.length===1?panels[0].id:null,pointIds,applianceIds,cable};groups.push(c);return c}
  const buckets=new Map(),addBucket=(kind,room,p)=>{const key=kind+':'+room;if(!buckets.has(key))buckets.set(key,{kind,room,points:[]});buckets.get(key).points.push(p)};
  for(const p of items){
   const kind=pointKind(p);if(!kind||pointOwners.has(p.id))continue;
   const consumers=byPoint.get(p.id)||[],dedicated=kind==='fixed'||consumers.some(isDedicated);
   if(dedicated)create(kind,consumers.map(a=>a.name).join(' + ')||roomName(roomOf(p))+' – vývod',[p.id]);
   else addBucket(kind,roomOf(p),p);
  }
  for(const {kind,room,points} of buckets.values()){
   let batch=[],n=0,w=0;const name=roomName(room)+(kind==='socket'?' – zásuvky':' – osvětlení');
   const flush=()=>{if(batch.length){create(kind,name,batch.map(p=>p.id));batch=[];n=0;w=0}};
   for(const p of points){const count=outlets(p),watts=(byPoint.get(p.id)||[]).reduce((sum,a)=>sum+power(a),0);
    if(kind==='socket'&&batch.length&&(n+count>10||w+watts>settings.ln*16))flush();batch.push(p);n+=count;w+=watts}
   flush();
  }
  for(const a of appliances)if(!applianceOwners.has(a.id)&&!assigned.has(a.id)){create(applianceKind(a),a.name+' – chybí připojení',[],[a.id]);}
  return {circuits:[...retained,...groups],added:groups,updated,links,lastId:seq};
 }
 function coverage(c,items){const routes=items.filter(r=>r.type==='route'&&r.circuit&&routePlanId(r)===c.id),ids=new Set(routes.flatMap(connectedIds));return {routes,done:c.pointIds.filter(id=>ids.has(id)),remaining:c.pointIds.filter(id=>!ids.has(id))}}
 function validate(circuits,items){
  if(!Array.isArray(circuits))return 'Chybí seznam okruhů.';
  const map=new Map(items.map(a=>[a.id,a])),ids=new Set(),points=new Set(),apps=new Set(),routes=new Set();
  for(const c of circuits){
   if(!c||!Number.isSafeInteger(c.id)||c.id<1||ids.has(c.id)||!kinds.includes(c.kind)||typeof c.name!=='string'||!c.name.trim()||c.name.length>160||typeof c.cable!=='string'||!c.cable.trim()||!Array.isArray(c.pointIds)||!Array.isArray(c.applianceIds))return 'Neplatný okruh.';
   ids.add(c.id);if(c.panelId!=null&&map.get(c.panelId)?.type!=='panel')return 'Neplatný rozvaděč okruhu.';
   for(const id of c.pointIds){const p=map.get(id);if(!p||points.has(id)||(pointKind(p)!==c.kind&&p.type!=='junction'))return 'Neplatné nebo duplicitní přiřazení bodu.';points.add(id)}
   for(const id of c.applianceIds){if(map.get(id)?.type!=='appliance'||apps.has(id))return 'Neplatné nebo duplicitní přiřazení spotřebiče.';apps.add(id)}
   if(c.kind==='socket'&&c.pointIds.reduce((n,id)=>n+outlets(map.get(id)),0)>10)return 'Více než 10 zásuvkových vývodů v okruhu.';
   if(c.kind==='fixed'&&c.pointIds.filter(id=>pointKind(map.get(id))==='fixed').length>1)return 'Silový okruh má více vývodů.';
   for(const r of coverage(c,items).routes){if(routes.has(r.id)||r.kind!==c.kind||r.points[0]?.componentId!==c.panelId||connectedIds(r).slice(1).some(id=>!c.pointIds.includes(id)))return 'Trasa neodpovídá okruhu.';routes.add(r.id)}
  }
  if(items.some(r=>r.type==='route'&&r.circuit&&!routes.has(r.id)))return 'Trasa nemá okruh.';
  return null;
 }
 // Přesné souběhy osových úseků; rozdělení i při částečném překrytí.
 function sharedSegments(routes){
  const lines=new Map(),diagonal=[];
  for(const r of routes)for(let i=1;i<r.points.length;i++){
   const a=r.points[i-1],b=r.points[i];if(a.x===b.x&&a.y===b.y)continue;
   if(a.x!==b.x&&a.y!==b.y){diagonal.push({a,b,ids:[r.id],length:Math.hypot(b.x-a.x,b.y-a.y)});continue}
   const h=a.y===b.y,k=h?'h':'v',fixed=h?a.y:a.x,lo=Math.min(h?a.x:a.y,h?b.x:b.y),hi=Math.max(h?a.x:a.y,h?b.x:b.y),key=k+':'+fixed;
   if(!lines.has(key))lines.set(key,{axis:k,fixed,intervals:[]});lines.get(key).intervals.push({lo,hi,id:r.id});
  }
  const parts=[...diagonal];
  for(const {axis,fixed,intervals} of lines.values()){
   const ends=[...new Set(intervals.flatMap(x=>[x.lo,x.hi]))].sort((a,b)=>a-b);
   for(let i=1;i<ends.length;i++){const lo=ends[i-1],hi=ends[i],ids=[...new Set(intervals.filter(x=>x.lo<=lo&&x.hi>=hi).map(x=>x.id))].sort((a,b)=>a-b);if(!ids.length)continue;
    parts.push({axis,fixed,lo,hi,a:axis==='h'?{x:lo,y:fixed}:{x:fixed,y:lo},b:axis==='h'?{x:hi,y:fixed}:{x:fixed,y:hi},ids,length:hi-lo});
   }
  }
  return {parts,unique:parts.reduce((n,p)=>n+p.length,0),shared:parts.filter(p=>p.ids.length>1).reduce((n,p)=>n+p.length,0)};
 }
 return {kinds,pointKind,applianceKind,mark,routePlanId,connectedIds,compatible,outlets,migrate,propose,coverage,validate,sharedSegments};
})();
