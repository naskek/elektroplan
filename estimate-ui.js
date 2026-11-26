/* Tři kroky zakázky; pokročilé editory používají původní model projektu. */
function estimateResolver(){const segs=segments(items);return connectionRoomResolver(manual?roomAreas(segs):null,segs,items);}
function estimateModel(list=items,cs=circuits){
 const resolver=estimateResolver(),balance=LoadEngine.aggregate(list,loadSettings,a=>lightValues(a,lightingSettings.eff).w,routeLength,cs),cables=EstimateEngine.cables(list,cs,meters,number('reserve'),estimateSettings),panels=EstimateEngine.panels(list,cs,balance,estimateSettings),capacity=LoadEngine.connectionCapacity(list,resolver.roomOf);
 return {balance,cables,panels,bill:EstimateEngine.bill(list,cs,balance,cables,panels,capacity,estimateSettings)};
}
function eText(host,tag,text,cls=''){const e=document.createElement(tag);e.textContent=text;e.className=cls;host.append(e);return e;}
function eTable(host,heads){const wrap=eText(host,'div','','estimateTableWrap'),t=eText(wrap,'table','','estimateTable'),h=eText(t,'thead',''),tr=eText(h,'tr','');for(const x of heads)eText(tr,'th',x);return eText(t,'tbody','');}
function eDetails(host,title){const d=eText(host,'details','');eText(d,'summary',title);return d;}
function eNumber(host,label,value,apply,max=1000000){const l=eText(host,'label',host.tagName==='TD'?'':label),i=document.createElement('input');i.type='number';i.min='0';i.max=String(max);i.step='any';i.placeholder='Neznámé';i.value=value??'';i.setAttribute('aria-label',label);l.append(i);i.onchange=()=>{const n=i.value.trim()===''?null:Number(i.value);if(n!==null&&(!Number.isFinite(n)||n<0||n>max)){i.setCustomValidity('Zadejte nezáporné číslo.');i.reportValidity();return}i.setCustomValidity('');apply(n);};return i;}
function estimateAssumptions(host,editable){
 const d=eDetails(host,'Předpoklady a chybějící údaje');
 eText(d,'p','Spotřebiče jsou potřebou místností. Výpočet je nepřipojí k náhodné zásuvce. Stávající ruční vazby, okruhy, fixace fází a trasy zůstávají. Běžné zásuvky se seskupují po místnostech, vybrané silné spotřebiče samostatně.');
 eText(d,'p','Bez zakreslené trasy: součet hrubých pravoúhlých vzdáleností značek od rozvaděče, nikoli skutečný průchod stavbou. Společnou drážku z těchto vzdáleností nelze určit. U světel se spínači chybí ověřené zapojení a počet žil; odhad přívodu nezahrnuje ovládací kabely.');
 eText(d,'p','Příkony šablon jsou orientační; při chybějícím účiníku se uvažuje 1. Zapojení 2N/3N bez rozpisu větví se uvažuje souměrné. Příkon světla z toku je odhad při '+fmt(lightingSettings.eff)+' lm/W; podrobný výpočet osvětlení je v bočním panelu.');
 eText(d,'p','Kabely bez trasy: přídavek '+fmt(estimateSettings.ends)+' m na okruh. Montážní rezerva '+fmt(number('reserve'))+' % se použije jednou. Zakreslené kabely používají vlastní svislé úseky a původní pravidlo rezervy, bez dalšího přídavku. Prázdné svislé vedení znamená neznámé, nikoli nulu.');
 eText(d,'p','Blokuje konečný výběr ochrany a průřezů: síť a přívod, způsob uložení, seskupení a teplota, impedance smyčky / zkratové poměry, úbytek napětí, požadavky spotřebičů a ochrany. Běžné typy kabelů jsou rozpočtový předpoklad. RCBO 2/4 DIN na okruh a hlavní vypínač 2/4 DIN jsou prostorový odhad; SPD, příslušenství, rámečky a spotřební materiál vyžadují doplnění.');
 if(editable){const fields=eText(d,'div','','estimateSettings');
  eNumber(fields,'Svislé vedení na okruh (m)',estimateSettings.vertical,n=>{recordChange();estimateSettings.vertical=n;render();},10000);
  eNumber(fields,'Přídavky na konce / okruh (m)',estimateSettings.ends,n=>{if(n===null)return;recordChange();estimateSettings.ends=n;render();},100);
  eNumber(fields,'Rezerva místa v rozvaděči (%)',estimateSettings.panelReserve,n=>{if(n===null)return;recordChange();estimateSettings.panelReserve=n;render();},100);
  eNumber(fields,'Montážní rezerva kabelu (%)',number('reserve'),n=>{if(n===null)return;recordChange();$('reserve').value=n;render();},100);
 }
}
function estimateCircuits(host,cs,b,editable){
 eText(host,'h3','Okruhy a fáze');if(!cs.length){eText(host,'p','Zatím žádné okruhy. Přidejte vybavení do plánu a spusťte orientační výpočet.');return;}
 const body=eTable(host,['Okruh','Fáze / maximum','Předběžný kabel']);
 for(const c of cs){const g=b.groups.find(g=>g.circuitId===c.id),r=eText(body,'tr',''),name=eText(r,'td',CircuitEngine.mark(c)+' · '+c.name),phase=eText(r,'td',(g?.phases.map(x=>'L'+(x+1)).join('+')||'Neurčeno')),cable=eText(r,'td',c.cable);
  const loads=g?.loads.filter(a=>!a.reserve)||[],unknown=loads.some(a=>a.fullCurrents===null),max=unknown?null:Math.max(0,...loads.reduce((v,a)=>{(a.fullCurrents||[]).forEach((x,i)=>v[i]=(v[i]||0)+x);return v},[]));eText(phase,'small',max==null?'Neznámý proud':fmt(max)+' A při plném provozu');
  eText(name,'small',c.pointIds.length+' bodů · '+(g?.applianceIds.length||0)+' spotřebičů'+(CircuitEngine.coverage(c,items).routes.length?' · ruční trasa zachována':''));
  if(editable){const d=eDetails(name,'Upravit okruh'),n=document.createElement('input');n.value=c.name;n.setAttribute('aria-label','Název '+CircuitEngine.mark(c));n.style.width='100%';d.append(n);
   const cab=document.createElement('input');cab.value=c.cable;cab.setAttribute('aria-label','Kabel '+CircuitEngine.mark(c));cab.style.width='100%';d.append(cab);
   const ph=document.createElement('input');ph.value=(loadSettings.assignments['r:'+c.id]||[]).map(x=>x+1).join(';');ph.placeholder='Auto';ph.setAttribute('aria-label','Pevné fáze '+CircuitEngine.mark(c));d.append(ph);
   const status=eText(d,'p','','loadMuted');editorButton(d,'Uložit úpravu',()=>{const phases=ph.value.trim()?ph.value.split(/[;, +]+/).map(x=>Number(x)-1):[];if(!n.value.trim()||n.value.trim().length>160||!cab.value.trim()||!LoadEngine.validSettings({...loadSettings,assignments:phases.length?{...loadSettings.assignments,['r:'+c.id]:phases}:loadSettings.assignments})||phases.length&&phases.length!==g.n){status.textContent='Zkontrolujte název, kabel a počet platných fází.';return;}if(CircuitEngine.coverage(c,items).routes.length&&cab.value!==c.cable){status.textContent='Kabel změňte ve vlastnostech existující trasy.';return;}recordChange();c.name=n.value.trim();c.cable=cab.value.trim();if(phases.length)loadSettings.assignments['r:'+c.id]=phases;else delete loadSettings.assignments['r:'+c.id];render();});
  }
 }
}
function estimateCables(host,model,editable){
 eText(host,'h3','Kabely a společné úseky');
 eText(host,'p',model.cables.unrouted?'Odhad metráže bez kreslení fyzických cest. Společné úseky nezakreslených okruhů: neznámé.':'Délky ze zakreslených kabelů. Svislé společné úseky nejsou určeny.','loadMuted');
 const body=eTable(host,['Kabel / okruh','Vodorovně','Svisle','S rezervou']);
 for(const c of model.cables.rows){const row=eText(body,'tr',''),name=eText(row,'td',c.name);eText(name,'small',c.cable+' · '+c.source);const h=eText(row,'td',c.horizontal==null?'? m':fmt(c.horizontal)+' m'),v=eText(row,'td',c.vertical==null?'? m':fmt(c.vertical)+' m');eText(row,'td',c.total==null?'Neznámé':fmt(c.total)+' m'+(c.complete?'':' + neznámé části'));
  if(editable&&c.key.startsWith('circuit:')){const id=c.key.split(':')[1];for(const [cell,key,value] of [[h,'horizontal',c.horizontal],[v,'vertical',c.vertical]])eNumber(cell,(key==='horizontal'?'Vodorovně ':'Svisle ')+c.name,value,n=>{recordChange();estimateSettings.overrides[id]={...estimateSettings.overrides[id],[key]:n};render();});}
 }
 const routes=model.cables.shared.parts.filter(p=>p.ids.length>1),d=eDetails(host,'Společné úseky zakreslených kabelů ('+routes.length+')');
 eText(d,'p','Unikátní půdorysná trasa: '+(model.cables.unique==null?'neznámá':fmt(model.cables.unique)+' m')+' · z toho společná: '+(model.cables.common==null?'neznámá':fmt(model.cables.common)+' m'));
 for(const part of routes)eText(d,'p',fmt(part.length*meters)+' m × '+part.ids.length+' kabelů · '+part.ids.map(id=>'K-'+id).join(', ')+' = '+fmt(part.length*meters*part.ids.length)+' m kabelu');
 eText(d,'p','Pouze přesné vodorovné a svislé souběhy v rovině. Křížení se nezapočte jako společná délka. Neurčuje způsob uložení ani šířku drážky.','loadMuted');
 if(items.some(a=>a.type==='route'&&a.circuit&&circuits.some(c=>c.id===(a.circuitId??a.id)&&CircuitEngine.coverage(c,items).remaining.length)))eText(host,'p','Některé ruční trasy jsou neúplné. Chybějící úseky nejsou přičteny.','warn');
}
function estimatePanel(host,model){
 eText(host,'h3','Předběžný rozvaděč');if(!model.panels.length)eText(host,'p','Pro návrh skříně umístěte jeden rozvaděč a přiřaďte okruhy.');
 for(const p of model.panels){eText(host,'p','R-'+p.id+' · '+p.modules+' DIN přístroje → skříň '+p.enclosure+' DIN · volno '+p.reserve+' modulů (požadovaný rezervní prostor '+estimateSettings.panelReserve+' %).','estimateStatus');const d=eDetails(host,'Složení R-'+p.id);eText(d,'p','Hlavní vypínač: '+p.main+' DIN (předpoklad).');for(const x of p.devices)eText(d,'p',x.name+' · RCBO '+x.poles+' · '+x.modules+' DIN · jmenovitý proud a typ ochrany: neurčeno');}
 const missing=model.balance.groups.filter(g=>g.circuitId&&g.panelId==null).length;if(missing)eText(host,'p',missing+' okruhů nemá rozvaděč. Jejich přístroje ve skříni chybějí.','warn');
 eText(host,'p','Prostorová varianta s jedním RCBO na okruh. Není schválena k nákupu: chybí podmínky pro výběr ochrany, SPD a příslušenství.','loadMuted');
}
function showEstimateProposal(){
 const host=$('calcProposal');host.replaceChildren();host.hidden=false;
 const resolver=estimateResolver(),p=CircuitEngine.propose(items,circuits,seq,resolver.roomOf,resolver.name,{...loadSettings,demandOnly:true}),err=CircuitEngine.validate(p.circuits,items);
 if(err){eText(host,'p',err,'warn');return;}
 const signature=JSON.stringify(projectData()),model=estimateModel(items,p.circuits);
 $('estimateInstallation').hidden=true;$('calcOverview').hidden=true;
 eText(host,'h3','Náhled elektroinstalace');eText(host,'p',p.added.length+' nových okruhů · '+p.circuits.length+' celkem. Ruční trasy a fyzická připojení se nemění.');
 const b=model.balance;eText(host,'p','Známý instalovaný příkon '+fmt(b.installedW/1000)+' kW · odhad současnosti s rezervou '+fmt(b.designW/1000)+' kW.');
 for(let i=0;i<loadSettings.phaseCount;i++)eText(host,'p','L'+(i+1)+': odhad '+fmt(b.phaseA[i])+' A · nominální maximum známých zátěží '+fmt(b.breakdown.fullA[i])+' A / přívod '+loadSettings.mainA+' A'+(loadSettings.confirmed?'':' (nepotvrzeno)'),Math.max(b.phaseA[i],b.breakdown.fullA[i])>loadSettings.mainA?'loadAlert':'');
 const actions=eText(host,'div','','proposalActions');editorButton(actions,'Použít návrh',()=>{if(JSON.stringify(projectData())!==signature){eText(host,'p','Projekt se změnil. Spusťte nový výpočet.','warn');return;}recordChange();circuits=p.circuits;seq=Math.max(seq,p.lastId);host.hidden=true;$('estimateInstallation').hidden=false;$('calcOverview').hidden=false;render();$('calcFeedback').textContent='Návrh uložen společně. Níže můžete upravit okruhy a délky nebo přejít na Zakázku.';});editorButton(actions,'Zrušit náhled',()=>{host.hidden=true;$('estimateInstallation').hidden=false;$('calcOverview').hidden=false;});
 estimateCircuits(host,p.circuits,b,false);estimateCables(host,model,false);estimatePanel(host,model);estimateAssumptions(host,false);
}
function updateEstimateViews(){
 if(!['calc','report'].includes(workflowStep))return;const model=estimateModel();
 if(workflowStep==='calc'){const host=$('estimateInstallation');host.replaceChildren();estimateCircuits(host,circuits,model.balance,true);estimateCables(host,model,true);estimatePanel(host,model);estimateAssumptions(host,true);}
 if(workflowStep==='report'){
  const host=$('estimateBill');host.replaceChildren();
  if(!circuits.length)eText(host,'p','Nejprve spusťte orientační výpočet v kroku Elektroinstalace. V nynějším výkazu chybí navržené kabely a přístroje.','warn');
  eText(host,'p','Oceněná část: '+fmt(model.bill.priced)+' Kč','tableTotal');
  eText(host,'p',model.bill.missingPrices+' pozic bez ceny · '+model.bill.unknownQty+' pozic s neznámým množstvím. Jde o mezisoučet; úplná cena zakázky není určena.','estimateStatus');
  if(model.cables.rows.some(c=>!c.complete)||model.cables.unrouted)eText(host,'p','Neúplný rozsah: metráže obsahují odhady; doplňte svislé délky, světelné zapojení a stavební trasy. Ochrana, příslušenství rozvaděče, rámečky a spotřební materiál vyžadují ověření.','warn');
  for(const category of ['Materiál','Práce']){eText(host,'h3',category);const body=eTable(host,['Položka','Množství','Kč / jednotku','Částka']);for(const r of model.bill.rows.filter(r=>r.category===category)){const tr=eText(body,'tr',''),name=eText(tr,'td',r.name);eText(name,'small',r.note);eText(tr,'td',(r.qty===null?'Neznámé':fmt(r.qty)+(r.complete?'':' + ?'))+' '+r.unit);const price=eText(tr,'td','');eNumber(price,'Cena '+r.name,r.price,n=>{recordChange();if(n===null)delete estimateSettings.prices[r.key];else estimateSettings.prices[r.key]=n;render();},1e9);eText(tr,'td',r.qty===null||r.price===null?'—':fmt(r.qty*r.price)+' Kč'+(r.complete?'':' + ?'));}}
  estimateAssumptions(host,true);
 }
}
function initEstimateUI(){
 $('exportEstimate').onclick=()=>{const model=estimateModel(),q=x=>'"'+String(x??'Neznámé').replaceAll('"','""')+'"',rows=[['ElektroPlan 0.3.0 – orientační výkaz; neúplný rozsah není konečná cena'],['Rezerva kabelu (%)',number('reserve')],['Kategorie','Položka','Jednotka','Množství','Kč/jednotku','Částka Kč','Úplnost množství','Zdroj / omezení'],...model.bill.rows.map(r=>[r.category,r.name,r.unit,r.qty,r.price,r.qty===null||r.price===null?null:r.qty*r.price,r.complete?'Úplné množství z modelu':'Neúplný rozsah',r.note]),['Oceněná část (mezisoučet)',model.bill.priced],['Neznámé ceny',model.bill.missingPrices],['Neznámá množství',model.bill.unknownQty],['Omezení','Hrubé délky nejsou fyzická trasa. Neznámé svislé části, ovládání světel, ochrana, SPD, rámečky a příslušenství vyžadují doplnění.']];const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='elektroplan-zakazka.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);};
}
