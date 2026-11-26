/* Orientační výpočet zatížení, bez závislosti na DOM. */
const LoadEngine=(()=>{
const modes=Object.freeze(Object.assign(Object.create(null),{'1N':1,'2N':2,'2L':2,'3N':3,'3L':3}));
const phases=['L1','L2','L3'];
const templates=[
['fridge','Kuchyň','Lednice',150,'1N','socket'],['hob','Kuchyň','Indukční deska',7200,'2N','fixed'],['oven','Kuchyň','Trouba',3000,'1N','fixed'],['dishwasher','Kuchyň','Myčka',2000,'1N','socket'],['microwave','Kuchyň','Mikrovlnná trouba',1500,'1N','socket'],['hood','Kuchyň','Digestoř',150,'1N','socket'],['kettle','Kuchyň','Rychlovarná konvice',2200,'1N','socket'],['coffee','Kuchyň','Kávovar',1500,'1N','socket'],['washer','Koupelna / WC','Pračka',2200,'1N','socket'],['dryer','Koupelna / WC','Sušička',2500,'1N','socket'],['fan','Koupelna / WC','Ventilátor',20,'1N','fixed'],['boiler','Koupelna / WC','Bojler',2000,'1N','fixed'],['floor','Koupelna / WC','Podlahové vytápění',null,'1N','fixed'],['towel','Koupelna / WC','Topný žebřík',500,'1N','fixed'],['heater','Koupelna / WC','Přímotop',2000,'1N','fixed'],["tv","Obývací pokoj","Televizor",120,"1N","socket"],
["projector","Obývací pokoj","Projektor",250,"1N","socket"],
["console","Obývací pokoj","Herní konzole",200,"1N","socket"],
["soundbar","Obývací pokoj","Soundbar / audio",60,"1N","socket"],
["settop","Obývací pokoj","Set-top box",20,"1N","socket"],
["desktop","Pracovna / dětský pokoj","Stolní počítač",400,"1N","socket"],
["laptop","Pracovna / dětský pokoj","Notebook",90,"1N","socket"],
["monitor","Pracovna / dětský pokoj","Monitor",40,"1N","socket"],
["printer","Pracovna / dětský pokoj","Tiskárna",300,"1N","socket"],
["desklamp","Pracovna / dětský pokoj","Stolní lampa (do zásuvky)",10,"1N","socket"],
["charger","Ložnice / dětský pokoj","Nabíječka telefonu / tabletu",20,"1N","socket"],
["alarmclock","Ložnice / dětský pokoj","Budík",5,"1N","socket"],
["babymonitor","Ložnice / dětský pokoj","Dětská chůvička",10,"1N","socket"],
["purifier","Ložnice / dětský pokoj","Čistička vzduchu",50,"1N","socket"],
["humidifier","Ložnice / dětský pokoj","Zvlhčovač vzduchu (studený)",30,"1N","socket"],
["router","Ostatní","Wi-Fi router",15,"1N","socket"],
["robotvacuum","Ostatní","Nabíjecí stanice robotického vysavače",100,"1N","socket"],
['gas','Ostatní','Kotel',150,'1N','fixed'],['ac','Ostatní','Klimatizace',1000,'1N','fixed'],['ev','Ostatní','Nabíjení elektromobilu',11000,'3N','fixed'],['custom','Ostatní','Vlastní spotřebič',null,'1N','socket']];
const defaults=()=>({phaseCount:3,ln:230,ll:400,mainA:25,earthing:'unknown',confirmed:false,freeSocketW:1500,demandFactor:1,scenario:'all',assignments:{}});
const num=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const optional=(v,min,max)=>v==null||num(v,min,max);
const choices=(n,count)=>{const out=[];function go(a,start){if(a.length===n){out.push(a);return}for(let i=start;i<count;i++)go([...a,i],i+1)}go([],0);return out};
const validPhases=(p,n=3)=>Array.isArray(p)&&p.length<=n&&p.every(x=>Number.isInteger(x)&&x>=0&&x<n)&&new Set(p).size===p.length;
function validSettings(s){return !!s&&[1,3].includes(s.phaseCount)&&num(s.ln,100,300)&&num(s.ll,100,500)&&num(s.mainA,1,1000)&&['unknown','TN-C','TN-S','TN-C-S','TT','IT'].includes(s.earthing)&&typeof s.confirmed==='boolean'&&num(s.freeSocketW,0,100000)&&(s.demandFactor===undefined||num(s.demandFactor,0,1))&&['all','cooking','laundry','heating'].includes(s.scenario)&&s.assignments&&typeof s.assignments==='object'&&!Array.isArray(s.assignments)&&Object.entries(s.assignments).every(([k,v])=>/^[rap]:\d+$/.test(k)&&validPhases(v,3)&&v.length>0)}
function validAppliance(a){const n=modes[a.mode];return !!n&&templates.some(t=>t[0]===a.template)&&typeof a.name==='string'&&a.name.trim().length>0&&a.name.length<=80&&['socket','fixed'].includes(a.connectionType)&&['template','estimate','nameplate'].includes(a.source)&&['auto','requested','confirmed'].includes(a.dedicated)&&optional(a.powerW,0.01,1000000)&&optional(a.pf,.01,1)&&optional(a.limitW,.01,1000000)&&optional(a.startA,.01,10000)&&optional(a.area,.01,100000)&&optional(a.density,.01,100000)&&optional(a.connectionPointId,1,Number.MAX_SAFE_INTEGER)&&(a.connectionPointId==null||Number.isSafeInteger(a.connectionPointId))&&(a.branchW==null||(Array.isArray(a.branchW)&&a.branchW.length===n&&a.branchW.every(v=>num(v,0,1000000))&&['1N','2N','3N'].includes(a.mode)))&&(a.nameplateA==null||(Array.isArray(a.nameplateA)&&a.nameplateA.length===n&&a.nameplateA.every(v=>num(v,0,10000))))&&validPhases(a.phases)&&(!a.phases.length||a.phases.length===n)&&a.factors&&['cooking','laundry','heating'].every(k=>num(a.factors[k],0,1))}
function makeAppliance(key){const t=templates.find(x=>x[0]===key)||templates.at(-1);return {template:t[0],name:t[2],powerW:t[3],mode:t[4],connectionType:t[5],source:'template',pf:null,limitW:null,startA:null,branchW:null,nameplateA:null,phases:[],connectionPointId:null,dedicated:'auto',area:null,density:t[0]==='floor'?150:null,factors:{cooking:1,laundry:1,heating:1}}}
function calculate(a,s){
 const diagnostics=[],warn=(level,msg)=>diagnostics.push({level,msg});const n=modes[a.mode];
 if(!n||!validSettings(s)||!validAppliance(a)){warn('error','Neplatné vstupy výpočtu.');return {installedW:null,designW:null,currents:null,diagnostics}}
 let power=a.powerW??(num(a.area,.01,100000)&&num(a.density,.01,100000)?a.area*a.density:null);
 if(power!==null&&!num(power,.01,1000000)){warn('error','Neplatný příkon.');power=null}
 const pf=a.pf??1;if(!num(pf,.01,1)){warn('error','Neplatný účiník.');return {installedW:power,designW:null,currents:null,diagnostics}}
 if(a.pf==null)warn('warning','Účiník 1 je pouze předpoklad.');
 if(a.source!=='nameplate')warn('warning','Příkon není potvrzen štítkem.');
 if(n>s.phaseCount)warn('error','Nedostatek fází pro způsob připojení.');
 if(a.startA!=null)warn('warning','Rozběhový proud je uložen; posouzení jištění není součástí bilance.');
 let nominal=power===null?null:a.mode==='2L'?Array(2).fill(power/(s.ll*pf)):a.mode==='3L'||a.mode==='3N'?Array(3).fill(power/(Math.sqrt(3)*s.ll*pf)):Array(n).fill(power/(n*s.ln*pf));
 if(a.branchW){const sum=a.branchW.reduce((x,y)=>x+y,0);if(power!=null&&Math.abs(sum-power)>Math.max(1,power*.05))warn('warning','Součet výkonů větví neodpovídá příkonu.');if(power===null)power=sum;nominal=a.branchW.map(v=>v/(s.ln*pf))}
 let currents=a.nameplateA??nominal;
 if(a.nameplateA&&nominal&&a.nameplateA.some((v,i)=>Math.abs(v-nominal[i])>Math.max(.2,nominal[i]*.1)))warn('warning','Štítkový proud neodpovídá odhadu z příkonu; použit štítkový proud.');
 if(power===null)warn('missing','Neznámý příkon.');
 if(!currents)warn('missing','Neznámý proud.');
 const factor=(s.scenario==='all'?1:(a.factors?.[s.scenario]??1))*(s.demandFactor??1);
 // Štítkové proudy jsou nadřazené; limit příkonu se zohlední pouze u potvrzeného údaje.
 let limit=1;if(a.limitW!=null){if(a.source!=='nameplate')warn('warning','Limit příkonu není potvrzen, nepoužit.');else if(power>0)limit=Math.min(1,a.limitW/power);else warn('missing','Limit nelze použít bez příkonu.')}
 if(a.nameplateA&&limit<1){warn('warning','Štítkový proud zachován i při omezení příkonu.');}
 const fullCurrents=currents?.map(v=>v*(a.nameplateA?1:limit))??null;
 return {installedW:power,designW:power===null?null:power*factor*limit,currents:fullCurrents?.map(v=>v*factor)??null,fullCurrents,diagnostics};
}
const socketTypes=['socket','socket2','socket3','socket400','outlet'];
const slots=a=>a.type==='socket2'?2:a.type==='socket3'?3:1;
function aggregate(items,s,lightPower=a=>a.watts??null,length=()=>null,circuits=null){
 const map=new Map(items.map(a=>[a.id,a])),groups=[],byPoint=new Map(),byAppliance=new Map(),diag=[],used=new Map();
 const add=(g,level,msg,id=null)=>{const d={level,msg,id,group:g?.id??null};diag.push(d);if(g)g.diagnostics.push(d)};
 const newGroup=(id,route=null)=>{const g={id,routeId:route?.id??null,panelId:route?.points[0]?.componentId??null,name:route?'Okruh '+route.id:'Nezařazená zátěž '+id,kind:route?.kind??'unassigned',pointIds:[],applianceIds:[],loads:[],diagnostics:[],cable:route?.cable??null,lengthM:route?length(route):null};groups.push(g);return g};
 if(circuits!==null){
  for(const c of circuits){const rs=items.filter(r=>r.type==='route'&&r.circuit&&(r.circuitId??r.id)===c.id),g=newGroup('r:'+c.id,rs[0]||null);
   g.circuitId=c.id;g.name=c.name;g.kind=c.kind;g.panelId=c.panelId;g.cable=c.cable;g.routeIds=rs.map(r=>r.id);g.lengthM=rs.length?rs.reduce((n,r)=>n+(length(r)??0),0):null;g.pointIds=c.pointIds.slice();
   for(const id of g.pointIds)byPoint.set(id,g);for(const id of c.applianceIds)byAppliance.set(id,g);
   const done=new Set(rs.flatMap(r=>r.points.map(p=>p.componentId)));g.remainingPointIds=g.pointIds.filter(id=>!done.has(id));
   if(g.remainingPointIds.length)add(g,'missing','Okruh ještě nemá úplnou trasu.');
   if(c.panelId==null)add(g,'missing','Chybí rozvaděč okruhu.');
  }
 }else for(const r of items.filter(a=>a.type==='route'&&a.circuit)){const g=newGroup('r:'+r.id,r);g.pointIds=[...new Set(r.points.map(p=>p.componentId).filter(x=>x!=null))].filter(id=>map.get(id)?.type!=='panel');for(const id of g.pointIds)byPoint.set(id,g)}
 function groupForPoint(p){if(byPoint.has(p.id))return byPoint.get(p.id);const g=newGroup('p:'+p.id);g.pointIds=[p.id];byPoint.set(p.id,g);add(g,'missing','Bod není přiřazen k okruhu.',p.id);return g}
 for(const a of items.filter(a=>a.type==='appliance')){
  const p=map.get(a.connectionPointId),compatible=p&&socketTypes.includes(p.type)&&(a.connectionType==='fixed'?p.type==='outlet':p.type!=='outlet');
  const planned=byAppliance.get(a.id),g=compatible?groupForPoint(p):planned||newGroup('a:'+a.id);g.applianceIds.push(a.id);
  if(planned&&planned!==g)add(g,'warning','Spotřebič je připojen do jiného okruhu než byl navržen.',a.id);
  if(!compatible)add(g,p?'error':'missing',p?'Připojovací bod neodpovídá typu připojení.':'Chybí platný připojovací bod.',a.id);
  if(compatible){used.set(p.id,(used.get(p.id)||0)+1);if((p.type==='socket400'&&a.mode==='1N')||(!['socket400','outlet'].includes(p.type)&&a.mode!=='1N'))add(g,'error','Způsob připojení neodpovídá bodu.',a.id)}
  const c=calculate(a,s);g.loads.push({id:a.id,name:a.name,n:modes[a.mode],mode:a.mode,locked:a.phases||[],...c,dedicated:a.dedicated,connectionPointId:a.connectionPointId,source:a.source,pf:a.pf,startA:a.startA});
  for(const d of c.diagnostics)add(g,d.level,d.msg,a.id);
  if((a.dedicated!=='auto'||a.mode!=='1N'||(c.installedW??0)>=2000)&&((!g.routeId&&!g.circuitId)||g.pointIds.length>1))add(g,'warning','Prověřte samostatný okruh pro spotřebič.',a.id);
 }
 for(const a of items.filter(a=>a.type==='light')){
  const g=groupForPoint(a),power=lightPower(a),c=calculate({...makeAppliance('custom'),powerW:power,source:'estimate'},s);
  g.loads.push({id:a.id,name:'Svítidlo '+a.id,n:1,mode:'1N',locked:[],...c});for(const d of c.diagnostics)add(g,d.level,d.msg,a.id);
 }
 // Odhad jednou na okruh: při volných zdířkách pouze doplnění do zadaného výkonového minima.
 for(const a of items.filter(a=>socketTypes.includes(a.type)&&a.type!=='outlet')){
  const g=groupForPoint(a);if((used.get(a.id)||0)>slots(a))add(g,'error','Více spotřebičů než zdířek.',a.id);
  if((used.get(a.id)||0)<slots(a)){if(a.type==='socket400')add(g,'missing','Volná zásuvka 400 V: neznámá zátěž.',a.id);else if(circuits===null||g.circuitId!=null&&g.kind==='socket')g.free=true;else g.unplannedFree=true}
 }
 for(const g of groups){
  if(g.unplannedFree)add(g,'missing','Volná zásuvka bez navrženého okruhu: rezerva zatím nezapočtena.');
  if(g.free){const known=g.loads.reduce((n,a)=>n+(a.designW??0),0),residual=Math.max(0,s.freeSocketW-known);g.loads.push({id:null,reserve:true,name:'Rezerva volných zásuvek',n:1,mode:'1N',locked:[],installedW:0,designW:residual,currents:[residual/s.ln]});add(g,'warning','Volné zásuvky: doplnění do odhadu '+s.freeSocketW+' W na okruh.')}
  g.installedW=g.loads.reduce((n,a)=>n+(a.installedW??0),0);g.designW=g.loads.reduce((n,a)=>n+(a.designW??0),0);
  g.unknown=g.loads.some(a=>a.installedW==null||a.currents==null)||g.diagnostics.some(d=>d.level==='missing');
  g.n=Math.max(1,...g.loads.map(a=>a.n));const ns=new Set(g.loads.map(a=>a.n));if(ns.size>1)add(g,'error','Smíšený počet fází v okruhu; vyžaduje ověření zapojení.');
  const locks=[s.assignments[g.id],...g.loads.map(a=>a.locked)].filter(a=>a?.length);
  const locked=locks[0],conflict=locks.some(a=>a.join(',')!==locked.join(','));if(conflict)add(g,'error','Konflikt pevných fází.');
  g.candidates=conflict||ns.size>1?[]:locked?[locked]:choices(g.n,s.phaseCount);
  g.candidates=g.candidates.filter(p=>p.length===g.n&&validPhases(p,s.phaseCount));
  if(!g.candidates.length)add(g,'error','Není přípustná kombinace fází.');
  g.candidates=g.candidates.map(p=>({phases:p,amps:phases.map((_,i)=>g.loads.reduce((n,a)=>{const k=p.indexOf(i);return n+(k>=0?(a.currents?.[k]??0):0)},0))}));
 }
 const ordered=[...groups].sort((a,b)=>a.candidates.length-b.candidates.length||b.n-a.n||Math.max(0,...b.candidates.flatMap(c=>c.amps))-Math.max(0,...a.candidates.flatMap(c=>c.amps))||a.id.localeCompare(b.id));
 let total=[0,0,0];const score=v=>[Math.max(0,...v.slice(0,s.phaseCount).map(a=>a-s.mainA)),Math.max(...v.slice(0,s.phaseCount)),Math.max(...v.slice(0,s.phaseCount))-Math.min(...v.slice(0,s.phaseCount))];
 const cmp=(a,b)=>{for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>1e-9)return a[i]-b[i];return 0};
 const plus=(a,b)=>a.map((v,i)=>v+b[i]);
 for(const g of ordered){if(!g.candidates.length){g.phases=[];g.amps=null;continue}const c=[...g.candidates].sort((a,b)=>cmp(score(plus(total,a.amps)),score(plus(total,b.amps))))[0];g.phases=c.phases;g.amps=c.amps;total=plus(total,c.amps)}
 // Lokální zlepšení, deterministické; není důkaz globálního optima.
 for(let pass=0;pass<5;pass++){let change=false;for(const g of ordered){if(!g.amps)continue;const base=total.map((v,i)=>v-g.amps[i]);for(const c of g.candidates){const next=plus(base,c.amps);if(cmp(score(next),score(total))<0){g.phases=c.phases;g.amps=c.amps;total=next;change=true}}}if(!change)break}
 if(new Set(groups.map(g=>g.panelId).filter(x=>x!=null)).size>1)add(null,'warning','Více rozvaděčů: bilance předpokládá jeden společný přívod.');
 if(!s.confirmed)add(null,'missing','Parametry přívodu jsou pouze výchozí odhad.');
 // Pro malé projekty vyzkoušet všechny kombinace; větší řešit heuristikou.
 let combinations=1;for(const g of ordered)combinations*=Math.max(1,g.candidates.length);
 const exact=combinations<=50000&&ordered.length<=100;
 if(exact){let best=total.slice(),bestChoices=ordered.map(g=>g.candidates.find(c=>c.phases===g.phases));const chosen=[];function search(i,sum){if(i===ordered.length){if(cmp(score(sum),score(best))<0){best=sum;bestChoices=chosen.slice()}return}const g=ordered[i];if(!g.candidates.length){chosen[i]=null;search(i+1,sum);return}for(const c of g.candidates){chosen[i]=c;search(i+1,plus(sum,c.amps))}}search(0,[0,0,0]);total=best;for(let i=0;i<ordered.length;i++)if(bestChoices[i]){ordered[i].phases=bestChoices[i].phases;ordered[i].amps=bestChoices[i].amps}}
 if(total.slice(0,s.phaseCount).some(x=>x>s.mainA+1e-8))add(null,'error','Překročen limit přívodu. Změňte scénář nebo rozdělení okruhů; výsledek velkých projektů není důkaz nemožnosti jiné kombinace.');
 const breakdown={knownA:[0,0,0],fullA:[0,0,0],reserveA:[0,0,0],knownW:0,reserveW:0,unassignedFree:groups.filter(g=>g.unplannedFree).length,unallocated:0};
 for(const g of groups){
  g.knownW=g.loads.filter(a=>!a.reserve).reduce((n,a)=>n+(a.designW??0),0);
  g.socketReserveW=g.loads.filter(a=>a.reserve).reduce((n,a)=>n+(a.designW??0),0);
  breakdown.knownW+=g.knownW;breakdown.reserveW+=g.socketReserveW;
  if(!g.phases.length&&g.loads.length)breakdown.unallocated++;
  for(const a of g.loads)for(const [k,i] of g.phases.entries()){
   if(a.reserve)breakdown.reserveA[i]+=a.currents?.[k]??0;
   else{breakdown.knownA[i]+=a.currents?.[k]??0;breakdown.fullA[i]+=a.fullCurrents?.[k]??0}
  }
 }
 return {version:1,breakdown,optimization:exact?'exhaustive':'heuristic',method:'Součet velikostí proudů, konzervativní odhad; bez výpočtu N.',settings:s,phaseA:total,reserveA:total.map(v=>s.mainA-v),imbalanceA:Math.max(...total.slice(0,s.phaseCount))-Math.min(...total.slice(0,s.phaseCount)),installedW:groups.reduce((n,g)=>n+g.installedW,0),designW:groups.reduce((n,g)=>n+g.designW,0),groups:groups.map(({candidates,...g})=>g),diagnostics:diag,incomplete:diag.some(d=>d.level!=='warning')||groups.some(g=>g.unknown)};
}

// Kapacita připojovacích míst; nehodnotí jištění, umístění ani současnost.
function connectionCapacity(items,roomOf=()=>null){
 const keys=['socket230','socket400','fixed'];
 const pointKind=a=>a?.type==='outlet'?'fixed':a?.type==='socket400'?'socket400':['socket','socket2','socket3'].includes(a?.type)?'socket230':null;
 const needKind=a=>a.connectionType==='fixed'?'fixed':a.mode==='1N'?'socket230':'socket400';
 const groups=new Map(),points=new Map(),issues=[];
 const group=id=>{const key=id??null;if(!groups.has(key))groups.set(key,{roomId:key,kinds:Object.fromEntries(keys.map(k=>[k,{available:0,required:0,linked:0,unlinked:0,pointIds:[],applianceIds:[]}]))});return groups.get(key)};
 for(const p of items){const k=pointKind(p);if(!k)continue;const roomId=roomOf(p)??null,g=group(roomId).kinds[k],capacity=slots(p);g.available+=capacity;g.pointIds.push(p.id);points.set(p.id,{p,k,roomId,capacity,used:0})}
 for(const a of items.filter(x=>x.type==='appliance')){
   const k=needKind(a),roomId=roomOf(a)??null,point=points.get(a.connectionPointId),valid=point?.k===k;
   const g=group(valid?point.roomId:roomId).kinds[k];g.required++;g.applianceIds.push(a.id);
   if(valid){g.linked++;point.used++;if(roomId!==null&&point.roomId!==null&&roomId!==point.roomId)issues.push({type:'crossRoom',id:a.id,pointId:point.p.id})}
   else{g.unlinked++;if(a.connectionPointId!=null)issues.push({type:'invalidLink',id:a.id,pointId:a.connectionPointId})}
 }
 for(const p of points.values())if(p.used>p.capacity)issues.push({type:'overbooked',id:p.p.id,used:p.used,capacity:p.capacity});
 const total=Object.fromEntries(keys.map(k=>[k,{available:0,required:0,linked:0,unlinked:0,missing:0,free:0}]));
 for(const g of groups.values())for(const k of keys){const c=g.kinds[k];c.missing=Math.max(0,c.required-c.available);c.free=Math.max(0,c.available-c.required);for(const prop of Object.keys(total[k]))total[k][prop]+=c[prop]}
 return {rooms:[...groups.values()],total,issues};
}
return {templates,modes,defaults,validSettings,validAppliance,makeAppliance,calculate,aggregate,connectionCapacity};
})();
