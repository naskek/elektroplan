// Spuštění: node tests/circuit-engine.test.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const C=vm.runInNewContext(read('circuit-engine.js')+';CircuitEngine'),L=vm.runInNewContext(read('load-engine.js')+';LoadEngine');
const settings=L.defaults(),roomOf=a=>a.room??1,roomName=id=>'Místnost '+id;
const panel={id:1,type:'panel',p:{x:0,y:0}},point=(id,type,x,y,room=1)=>({id,type,p:{x,y},room}),app=(id,key,x,y,extra={})=>({...L.makeAppliance(key),id,type:'appliance',p:{x,y},...extra});
let n=0;function test(name,fn){fn();n++;console.log('OK '+name)}
const items=[panel,point(2,'socket',10,10),point(3,'socket2',20,10),point(4,'outlet',30,10),point(5,'light',20,20),app(6,'dishwasher',10,12),app(7,'hob',30,12),app(8,'fridge',20,12)];
const propose=(list,cs=[],id=Math.max(...list.map(a=>a.id)))=>C.propose(list,cs,id,roomOf,roomName,settings);
const p=propose(items),linked=items.map(a=>{const l=p.links.find(x=>x.applianceId===a.id);return l?{...a,connectionPointId:l.pointId}:a});
test('Návrh před trasami',()=>{assert.equal(p.circuits.length,4);assert.equal(p.links.length,3);assert.equal(C.validate(p.circuits,linked),null)});
test('Samostatná myčka a varná deska',()=>{assert.equal(p.circuits.find(c=>c.pointIds.includes(2)).name,'Myčka');assert.equal(p.circuits.find(c=>c.pointIds.includes(4)).kind,'fixed')});
test('Výkon bez tras a dvojího započtení',()=>{const b=L.aggregate(linked,settings,()=>40,()=>null,p.circuits);assert.equal(b.installedW,9390);assert.equal(b.groups.length,4);assert.ok(b.groups.every(g=>g.routeId===null))});
test('Nezařazený spotřebič má vlastní návrh',()=>{const a=app(1,'hob',10,10),r=propose([a]);assert.equal(r.circuits[0].applianceIds[0],1);assert.equal(r.circuits[0].pointIds.length,0)});
test('Doplnění vývodu zachovává ID',()=>{const a=app(1,'hob',10,10),r=propose([a]),q=propose([a,point(3,'outlet',10,12)],r.circuits,3);assert.equal(q.circuits.length,1);assert.equal(q.circuits[0].id,r.circuits[0].id);assert.equal(q.circuits[0].pointIds[0],3);assert.equal(q.updated,1)});
test('Návrh nemění explicitní vazbu',()=>{const r=propose([point(1,'socket',0,0),point(2,'socket',10,10),app(3,'fridge',0,0,{connectionPointId:2})]);assert.equal(r.links.length,0)});
test('Bez místnosti nevznikne automatická vazba',()=>{const r=C.propose([point(1,'socket',0,0),app(2,'fridge',0,0)],[],2,()=>null);assert.equal(r.links.length,0)});
test('Spotřebič v jiné místnosti nedostane zásuvku',()=>{const r=propose([point(1,'socket',0,0,2),app(2,'fridge',0,0,{room:1})]);assert.equal(r.links.length,0)});
test('Více než deset vývodů rozděleno',()=>{const r=propose(Array.from({length:11},(_,i)=>point(i+1,'socket',i,0)));assert.equal(r.circuits.length,2);assert.ok(r.circuits.every(c=>c.pointIds.length<=10))});
test('Původní trasa zachovává číslo',()=>{const route={id:20,type:'route',circuit:true,kind:'socket',cable:'CYKY',points:[{componentId:1},{componentId:2}]};const cs=C.migrate([panel,items[1],route]);assert.equal(C.mark(cs[0]),'Z20');assert.equal(C.validate(cs,[panel,items[1],route]),null)});
test('Trasa zachová nezávislé ID okruhu',()=>{const c=p.circuits.find(c=>c.pointIds.includes(2)),r={id:99,type:'route',circuit:true,circuitId:c.id,kind:c.kind,cable:c.cable,points:[{componentId:1},{componentId:2}]};assert.equal(C.validate(p.circuits,[...linked,r]),null);assert.equal(C.coverage(c,[...linked,r]).remaining.length,0);assert.equal(C.coverage(c,linked).remaining.length,1);const b=L.aggregate([...linked,r],settings,()=>40,()=>8,p.circuits);assert.equal(b.installedW,9390);assert.equal(b.groups.find(g=>g.circuitId===c.id).lengthM,8)});
test('Trasa nesmí připojit cizí bod',()=>{const c=p.circuits.find(c=>c.pointIds.includes(2)),r={id:99,type:'route',circuit:true,circuitId:c.id,kind:c.kind,cable:c.cable,points:[{componentId:1},{componentId:3}]};assert.ok(C.validate(p.circuits,[...linked,r]))});
test('Duplicitní bod je chyba',()=>{const c=p.circuits[0];assert.ok(C.validate([...p.circuits,{...c,id:999}],linked))});
const route=(id,points)=>({id,points:points.map(([x,y])=>({x,y}))});
test('Pět kabelů v jedné drážce',()=>{const r=C.sharedSegments(Array.from({length:5},(_,i)=>route(i+1,[[0,0],[8,0]])));assert.equal(r.unique,8);assert.equal(r.shared,8);assert.equal(r.parts[0].ids.length,5)});
test('Částečný souběh a opačný směr',()=>{const r=C.sharedSegments([route(1,[[0,0],[8,0]]),route(2,[[6,0],[2,0]])]);assert.equal(r.unique,8);assert.equal(r.shared,4);assert.equal(r.parts.length,3)});
test('Křížení není souběh',()=>{const r=C.sharedSegments([route(1,[[0,0],[8,0]]),route(2,[[4,-4],[4,4]])]);assert.equal(r.unique,16);assert.equal(r.shared,0)});
test('Výpočet nemění geometrii',()=>{const rs=[route(1,[[0,0],[8,0]]),route(2,[[6,0],[2,0]])],before=JSON.stringify(rs);C.sharedSegments(rs);assert.equal(JSON.stringify(rs),before)});
test('Opakovaný návrh připojí spotřebič k již navržené zásuvce',()=>{
 const a=app(2,'fridge',10,10),first=propose([panel,a]),socket=point(4,'socket',10,12);
 const old={id:5,kind:'socket',name:'Zásuvky',panelId:1,pointIds:[4],applianceIds:[],cable:'CYKY'};
 const r=propose([panel,a,socket],[...first.circuits,old],5);
 assert.equal(r.links[0].pointId,4);assert.equal(r.circuits.length,1);assert.equal(r.circuits[0].id,5);assert.equal(r.retired[0].targetId,5);
 const linked=[panel,{...a,connectionPointId:4},socket];assert.equal(C.validate(r.circuits,linked),null);
 assert.equal(propose(linked,r.circuits,r.lastId).circuits.length,1);
 assert.equal(L.aggregate(linked,settings,()=>40,()=>null,r.circuits).designW,150);
});
test('Opakovaný návrh nesloučí odlišné fixace fází',()=>{
 const a=app(2,'fridge',10,10),first=propose([panel,a]),socket=point(4,'socket',10,12);
 const old={id:5,kind:'socket',name:'Zásuvky',panelId:1,pointIds:[4],applianceIds:[],cable:'CYKY'};
 const r=C.propose([panel,a,socket],[...first.circuits,old],5,roomOf,roomName,{...settings,assignments:{['r:'+first.circuits[0].id]:[0],'r:5':[1]}});
 assert.equal(r.links.length,0);assert.equal(r.circuits.length,2);
});
console.log(n+' testů okruhů prošlo.');
