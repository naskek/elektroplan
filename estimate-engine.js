/* Rozpočtový model. Hrubé vzdálenosti nejsou fyzické kabelové trasy. */
const EstimateEngine=(()=>{
 const defaults=()=>({vertical:null,ends:1,panelReserve:20,overrides:{},prices:{}});
 const num=(v,max=1000000)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
 function valid(s){return s&&num(s.ends,100)&&num(s.panelReserve,100)&&(s.vertical===null||num(s.vertical,10000))&&s.overrides&&typeof s.overrides==='object'&&!Array.isArray(s.overrides)&&Object.entries(s.overrides).every(([k,v])=>/^\d+$/.test(k)&&v&&Object.keys(v).every(k=>['horizontal','vertical'].includes(k))&&Object.values(v).every(x=>x===null||num(x)))&&s.prices&&typeof s.prices==='object'&&!Array.isArray(s.prices)&&Object.entries(s.prices).every(([k,v])=>k.length<=240&&num(v,1e9));}
 const distance=points=>points.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);
 function cables(items,circuits,meters,reserve,s){
  const map=new Map(items.map(a=>[a.id,a])),routes=items.filter(a=>a.type==='route'),rows=[];
  const add=(key,name,cable,horizontal,vertical,ends,source,complete=true)=>{const base=horizontal==null?null:horizontal+(vertical??0)+ends;rows.push({key,name,cable,horizontal,vertical,ends,reserve,total:base==null?null:base*(1+reserve/100),source,complete:complete&&horizontal!=null&&vertical!=null});};
  for(const r of routes)add('route:'+r.id,'K-'+r.id,r.cable,meters?distance(r.points)*meters:null,r.vertical,0,'Zakreslený kabel');
  for(const c of circuits){
   const cov=CircuitEngine.coverage(c,items);if(cov.routes.length)continue;
   const controls=c.pointIds.some(id=>map.get(id)?.type.startsWith('switch'));
   const panel=map.get(c.panelId),targets=[...c.pointIds,...c.applianceIds].map(id=>map.get(id)).filter(a=>a?.p&&!(a.type.startsWith('switch'))),o=s.overrides[c.id]||{};
   let horizontal=null;
   if(meters&&panel&&targets.length){let last=panel.p,remaining=[...targets];horizontal=0;while(remaining.length){remaining.sort((a,b)=>(Math.abs(a.p.x-last.x)+Math.abs(a.p.y-last.y))-(Math.abs(b.p.x-last.x)+Math.abs(b.p.y-last.y))||a.id-b.id);const a=remaining.shift();horizontal+=(Math.abs(a.p.x-last.x)+Math.abs(a.p.y-last.y))*meters;last=a.p;}}
   if(Object.hasOwn(o,'horizontal'))horizontal=o.horizontal;
   const vertical=Object.hasOwn(o,'vertical')?o.vertical:s.vertical;
   // Ovládání světel nemá automaticky známou topologii ani počet žil.
   add('circuit:'+c.id,CircuitEngine.mark(c)+' · '+c.name,controls?'Neurčený – světelné zapojení':c.cable,horizontal,vertical,s.ends,controls?'Odhad přívodu; ovládání chybí':'Hrubý odhad vzdáleností značek',!controls);
  }
  const shared=CircuitEngine.sharedSegments(routes);
  return {rows,shared,unique:meters?shared.unique*meters:null,common:meters?shared.shared*meters:null,unrouted:circuits.filter(c=>!CircuitEngine.coverage(c,items).routes.length||CircuitEngine.coverage(c,items).remaining.length).length};
 }
 function panels(items,circuits,b,s){
  const result=[];
  for(const p of items.filter(a=>a.type==='panel')){
   const cs=circuits.filter(c=>c.panelId===p.id);if(!cs.length)continue;
   const devices=cs.map(c=>{const g=b.groups.find(g=>g.circuitId===c.id),n=g?.n||1;return {id:c.id,name:CircuitEngine.mark(c)+' · '+c.name,modules:n>1?4:2,poles:n>1?'vícepólový':'1P+N',maxA:g?.loads.some(a=>!a.reserve&&!a.fullCurrents)?null:Math.max(0,...(g?.loads.filter(a=>!a.reserve).reduce((v,a)=>{(a.fullCurrents||[]).forEach((x,i)=>v[i]=(v[i]||0)+x);return v},[])||[])),rating:null};});
   const main=b.settings.phaseCount===3?4:2,modules=main+devices.reduce((n,d)=>n+d.modules,0),required=Math.ceil(modules*(1+s.panelReserve/100)),enclosure=Math.ceil(required/12)*12;
   result.push({id:p.id,devices,main,modules,enclosure,reserve:enclosure-modules});
  }
  return result;
 }
 function bill(items,circuits,b,cables,panels,capacity,s){
  const rows=new Map();
  const add=(key,category,name,unit,qty,note='',complete=true)=>{if(qty===0)return;if(!rows.has(key))rows.set(key,{key,category,name,unit,qty:qty===null?null:0,note,complete:true});const r=rows.get(key);r.complete=r.complete&&complete&&qty!==null;if(!complete&&!r.note.includes('neúpln'))r.note+=' · neúplný rozsah';if(qty!==null&&r.qty!==null)r.qty+=qty;};
  for(const c of cables.rows){add('cable:'+c.cable,'Materiál',c.cable,'m',c.total,c.source+(c.complete?'':' · neúplná délka / zapojení'),c.complete);}
  const names={socket:'Zásuvkový mechanismus 230 V',socket400:'Zásuvka 400 V',outlet:'Kabelový vývod',junction:'Odbočná krabice',light:'Svítidlo / světelný bod',switch1:'Spínač řazení 1',switch5:'Spínač řazení 5',switch6:'Přepínač řazení 6',switch7:'Přepínač řazení 7',switch66:'Přepínač řazení 6+6',data1:'RJ45 1×',data2:'RJ45 2×',tv:'TV zásuvka'};
  let boxes=0,install=0;
  for(const a of items){let type=a.type,n=1;if(type==='socket2'){type='socket';n=a.mechanisms??2;}if(type==='socket3'){type='socket';n=3;}if(!names[type])continue;
   add('point:'+type,'Materiál',names[type],'ks',n,'Počet z plánu; konkrétní výrobek neurčen');install+=n;
   if(['socket','socket400','outlet','data1','data2','tv'].includes(type)||type.startsWith('switch'))boxes+=n;
  }
  add('boxes','Materiál','Přístrojové krabice','ks',boxes,'Odhad 1 krabice na mechanismus; provedení a rámečky ověřit');
  for(const [kind,t] of Object.entries(capacity.total))if(t.missing){add('missing:'+kind,'Materiál',kind==='fixed'?'Doplnit pevný vývod':kind==='socket400'?'Doplnit zásuvku 400 V':'Doplnit zásuvku 230 V','ks',t.missing,'Odhad chybějící kapacity místností; umístění a okruh ověřit');add('missing-install:'+kind,'Práce','Instalace doplněných bodů '+kind,'ks',t.missing,'Odhad; nezahrnuto ve stávajících bodech');add('missing-box:'+kind,'Materiál','Krabice pro doplněné body '+kind,'ks',t.missing,'Odhad');}
  for(const p of panels){add('main:'+p.main,'Materiál','Hlavní vypínač – '+p.main+' DIN (předpoklad)','ks',1,'Proud, zapojení a konkrétní přístroj neurčeny');for(const d of p.devices)add('rcbo:'+d.poles,'Materiál','RCBO '+d.poles+' – '+d.modules+' DIN (předpoklad)','ks',1,'Jmenovitý proud, charakteristika, typ a IΔn neurčeny');add('case:'+p.enclosure,'Materiál','Rozvaděč '+p.enclosure+' DIN – orientační skříň','ks',1,'Zahrnuje prostorovou rezervu; SPD a příslušenství nejsou určeny');add('panel-work','Práce','Montáž a sestavení rozvaděče','ks',1,'Rozsah a cena ručně');}
  add('install','Práce','Instalace bodů z plánu','ks',install,'Mechanismy, vývody, svítidla a odbočné krabice');add('box-work','Práce','Osazení přístrojových krabic','ks',boxes,'Bez instalace mechanismů');
  const length=cables.rows.some(c=>c.total===null)?null:cables.rows.reduce((n,c)=>n+c.total,0);
  add('lay','Práce','Pokládka kabelů (včetně zadaných přídavků)','m',length,'Odhad; neúplné délky nejsou konečný rozsah',cables.rows.every(c=>c.complete));
  add('path','Práce','Příprava tras / drážky','m',cables.unrouted?null:cables.unique,'Geometrické sjednocení zakreslených tras; podklad a způsob uložení ověřit');
  add('revision','Práce','Měření, dokumentace a revize','soubor',1,'Rozsah a cenu doplní elektrikář; práce nejsou provedeny');
  const out=[...rows.values()].map(r=>({...r,price:Object.hasOwn(s.prices,r.key)?s.prices[r.key]:null}));
  return {rows:out,priced:out.filter(r=>r.price!==null&&r.qty!==null).reduce((n,r)=>n+r.price*r.qty,0),missingPrices:out.filter(r=>r.price===null).length,unknownQty:out.filter(r=>r.qty===null).length};
 }
 return {defaults,valid,cables,panels,bill};
})();
