const {test,expect}=require('@playwright/test');
const {L,appliance,point,project,circuit,start,open,saved,data,at}=require('./helpers.cjs');
const browserErrors=new WeakMap();
test.beforeEach(async({page})=>{
 const errors=[];browserErrors.set(page,errors);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await start(page);
});
test.afterEach(async({page},info)=>{
 const expectedFault=/restore error|parallel tabs/.test(info.title);
 expect((browserErrors.get(page)||[]).filter(s=>!expectedFault||!s.startsWith('ElektroPlan autosave'))).toEqual([]);
});

test('draw room, door, light and socket; calculate, route, export and F5',async({page})=>{
 await page.locator('[data-tool=room]').click();await at(page,100,100);await at(page,600,500);
 await page.locator('[data-tool=door]').click();await expect(page.locator('#openingDialog')).not.toBeVisible();await at(page,300,100);
 await page.locator('#selectionEditor').getByLabel('Šířka (mm)',{exact:true}).fill('900');await page.locator('#selectionEditor').getByRole('button',{name:'Použít',exact:true}).click();await page.locator('#closeProperties').click();
 await page.locator('[data-step=plan]').click();
 await page.locator('[data-tool=socket]').click();await at(page,200,200);await at(page,500,400);
 await page.locator('[data-tool=appliance]').click();await page.locator('[data-preset=fridge]').click();await page.getByRole('button',{name:'Umístit na plán',exact:true}).click();await at(page,200,210);
 await page.locator('[data-tool=panel]').click();await at(page,400,300);
 await page.locator('[data-tool=light]').click();await page.locator('#lightPower').fill('40');await page.locator('#lightLumens').fill('4000');await at(page,300,300);
 await page.locator('[data-step=calc]').click();await page.locator('#calculateProject').click();await page.getByRole('button',{name:'Použít návrh',exact:true}).click();
 expect((await data(page)).okruhy).toHaveLength(2);
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();const socketCircuit=(await data(page)).okruhy.find(c=>c.kind==='socket');await page.locator('#routeChoice').selectOption(String(socketCircuit.id));
 await page.locator('#routeDesign').click();await page.locator('#finish').click();await saved(page);
 const before=await data(page);expect(before.prvky.some(a=>a.type==='door')).toBeTruthy();expect(before.prvky.filter(a=>a.type==='route')).toHaveLength(1);
 await page.locator('[data-step=report]').click();await expect(page.locator('#areas')).toContainText('20 m²');
 const download=page.waitForEvent('download');await page.locator('#export').click();const file=await download;expect(JSON.parse(require('node:fs').readFileSync(await file.path(),'utf8'))).toEqual(before);
 await page.reload();await saved(page);expect(await data(page)).toEqual(before);
});

test('custom planned cable survives proposed route and reload',async({page})=>{
 await open(page,project([point(1,'panel',200,200),point(2,'socket',400,400)],[circuit(3,'socket',[2],{cable:'CUSTOM 3×2,5'})]));
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('#routeDesign').click();await page.locator('#finish').click();await saved(page);
 expect((await data(page)).prvky.find(a=>a.type==='route').cable).toBe('CUSTOM 3×2,5');
 await page.reload();await saved(page);expect((await data(page)).prvky.find(a=>a.type==='route').cable).toBe('CUSTOM 3×2,5');
});

test('negative route riser is rejected while the draft is preserved',async({page})=>{
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('[data-tool=route]').click();await page.locator('#routeKind').selectOption('other');await page.locator('#vertical').fill('-1');await at(page,200,200);await at(page,400,400);await page.locator('#finish').click();
 expect((await data(page)).prvky.filter(a=>a.type==='route')).toHaveLength(0);await expect(page.locator('#autosaveStatus')).not.toHaveAttribute('data-state','error');
});

test('route corner flips, move follows connection, undo and Cyrillic shortcuts',async({page})=>{
 const p=project([point(1,'panel',200,200),point(2,'socket',400,400)],[circuit(3,'socket',[2])]);await open(page,p);await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('#routeDesign').click();await page.locator('#finish').click();
 const before=await data(page),r=before.prvky.find(a=>a.type==='route');await page.locator('[data-tool=select]').first().click();await at(page,300,200);await page.getByRole('button',{name:'Přehodit roh',exact:true}).click();
 const after=await data(page);expect(after.prvky.find(a=>a.type==='route').points).not.toEqual(r.points);
 await page.locator('#closeProperties').click();await page.keyboard.press('Control+z');expect((await data(page)).prvky).toEqual(before.prvky);await page.keyboard.press('Control+y');expect((await data(page)).prvky).toEqual(after.prvky);
 // The browser dispatches real keyboard events with the Russian-layout key and physical Z/Y codes.
 await page.locator('body').dispatchEvent('keydown',{key:'я',code:'KeyZ',ctrlKey:true});expect((await data(page)).prvky).toEqual(before.prvky);
 await page.locator('body').dispatchEvent('keydown',{key:'н',code:'KeyY',ctrlKey:true});expect((await data(page)).prvky).toEqual(after.prvky);
 await page.locator('#zoomIn').click();await expect(page.locator('#zoomFit')).toHaveText('125 %');await page.locator('#zoomFit').click();
 await page.locator('#zoomIn').click();const view=await page.locator('#plan').getAttribute('viewBox'),box=await page.locator('#plan').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down({button:'middle'});await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+40,{steps:4});await page.mouse.up({button:'middle'});expect(await page.locator('#plan').getAttribute('viewBox')).not.toBe(view);expect((await data(page)).prvky).toEqual(after.prvky);
});

test('all workflow stages, preserved layers and responsive viewport',async({page})=>{
 for(const step of ['calc','report','plan']){await page.locator(`[data-step=${step}]`).click();await expect(page.locator(`[data-step=${step}]`)).toHaveAttribute('aria-current','step');}
 await page.locator('summary').filter({hasText:'Vrstvy a zobrazení'}).click();await page.locator('#showAppliances').uncheck();await page.locator('[data-step=plan]').click();await expect(page.locator('#showAppliances')).not.toBeChecked();
 for(const width of [390,768,1024]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('#undo').scrollIntoViewIfNeeded();await expect(page.locator('#undo')).toBeInViewport({ratio:1});await expect(page.locator('#cancel')).toBeInViewport({ratio:1});}
});

test('malformed import retains project; v2–v14 migrate and v15 roundtrips',async({page})=>{
 for(let verze=2;verze<=14;verze++){const p=project([point(1,'socket',200,200)]);p.verze=verze;delete p.okruhy;await open(page,p);await expect.poll(async()=> (await data(page)).prvky.length).toBe(1);}
 const before=await data(page);await open(page,{verze:15});expect(await data(page)).toEqual(before);await expect(page.locator('#status')).toContainText('Projekt nelze otevřít');
});

test('restore error preserves recovery bytes and never overwrites bad backup',async({page})=>{
 await saved(page);await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('elektroplan-autosave',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const t=db.transaction('projects','readwrite');t.objectStore('projects').put({json:'broken',revision:'bad',savedAt:1},'current');t.oncomplete=resolve;t.onabort=reject});db.close()});
 await page.reload();await expect(page.locator('#autosaveStatus')).toHaveAttribute('data-state','error');await expect(page.locator('#recoverAutosave')).toBeVisible();
 const stored=await page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('elektroplan-autosave',1);r.onsuccess=()=>resolve(r.result)});const v=await new Promise(resolve=>{const r=db.transaction('projects').objectStore('projects').get('current');r.onsuccess=()=>resolve(r.result)});db.close();return v});expect(stored.json).toBe('broken');
});

test('independent 1N, 2N, 3N and socket reserve control examples in real browser',async({page})=>{
 const p=project([point(1,'panel',100,100),point(2,'outlet',200,200),point(3,'outlet',300,200),point(4,'socket',400,200),point(5,'socket',500,200),appliance(6,'hob',{x:200,y:250},{connectionPointId:2,phases:[0,1]}),appliance(7,'ev',{x:300,y:250},{connectionPointId:3,powerW:11000}),appliance(8,'custom',{x:400,y:250},{connectionPointId:4,powerW:2300,phases:[2]})],[circuit(9,'fixed',[2]),circuit(10,'fixed',[3]),circuit(11,'socket',[4]),circuit(12,'socket',[5])]);
 await open(page,p);const b=await page.evaluate(()=>getLoadBalance());expect(b.installedW).toBe(20500);expect(b.designW).toBe(22000);expect(b.breakdown.reserveW).toBe(1500);expect(b.phaseA.reduce((a,v)=>a+v,0)).toBeCloseTo(7200/230+3*11000/(Math.sqrt(3)*400)+10+1500/230,6);
 await page.locator('[data-step=calc]').click();await expect(page.locator('#calcOverview')).toContainText('překračuje');
});

test('private current apartment (opt-in, never committed)',async({page})=>{
 test.skip(!process.env.ELEKTROPLAN_PRIVATE_PROJECT,'Set private JSON path to repeat apartment verification locally');
 await open(page,process.env.ELEKTROPLAN_PRIVATE_PROJECT);await saved(page);const before=await data(page);for(const step of ['plan','calc','report'])await page.locator(`[data-step=${step}]`).click();await page.reload();await saved(page);expect(await data(page)).toEqual(before);
 await page.locator('[data-step=calc]').click();await page.locator('#calculateProject').click();
 if(await page.getByRole('button',{name:'Použít návrh',exact:true}).isVisible()){
  await page.getByRole('button',{name:'Použít návrh',exact:true}).click();await saved(page);
  const after=await data(page);expect(after.prvky.filter(a=>a.type==='route')).toEqual(before.prvky.filter(a=>a.type==='route'));
  expect(after.prvky.filter(a=>a.type==='appliance'&&a.connectionPointId!=null).length).toBe(before.prvky.filter(a=>a.type==='appliance'&&a.connectionPointId!=null).length);
  console.log('Private apartment: '+before.prvky.filter(a=>a.type==='appliance'&&a.connectionPointId!=null).length+' → '+after.prvky.filter(a=>a.type==='appliance'&&a.connectionPointId!=null).length+' connected appliances; existing routes unchanged.');
  await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.keyboard.press('Control+z');expect((await data(page)).prvky).toEqual(before.prvky);expect((await data(page)).okruhy).toEqual(before.okruhy);
 }
});

test('tool changes and export preserve draft when cancellation is chosen',async({page})=>{
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('[data-tool=route]').click();await page.locator('#routeKind').selectOption('other');await at(page,200,200);await at(page,300,400);
 const draft=await page.evaluate(()=>JSON.stringify(pending));
 page.once('dialog',d=>d.dismiss());await page.locator('[data-tool=select]').first().click();expect(await page.evaluate(()=>JSON.stringify(pending))).toBe(draft);
 page.once('dialog',d=>d.dismiss());await page.locator('[data-step=plan]').click();await expect(page.locator('[data-step=calc]')).toHaveAttribute('aria-current','step');
 page.once('dialog',d=>d.dismiss());await page.locator('#export').click();expect(await page.evaluate(()=>JSON.stringify(pending))).toBe(draft);
 await page.locator('#undo').click();expect(await page.evaluate(()=>pending.length)).toBe(1);await page.locator('#redo').click();expect(await page.evaluate(()=>pending.length)).toBe(2);
});

test('routed socket can be moved with real pointer drag and follows route',async({page})=>{
 await open(page,project([point(1,'panel',200,200),point(2,'socket',400,400)],[circuit(3,'socket',[2])]));
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('#routeDesign').click();await page.locator('#finish').click();await page.locator('[data-tool=select]').first().click();
 const loc=async(x,y)=>page.locator('#plan').evaluate((s,p)=>{const m=s.getScreenCTM();return {x:m.a*p.x+m.e,y:m.d*p.y+m.f}}, {x,y});const a=await loc(400,400),b=await loc(450,450);
 await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();await saved(page);
 const p=await data(page),socket=p.prvky.find(a=>a.id===2),route=p.prvky.find(a=>a.type==='route');expect(socket.p).not.toEqual({x:400,y:400});expect(route.points.at(-1)).toMatchObject({...socket.p,componentId:2});
 await page.locator('#closeProperties').click();await page.keyboard.press('Control+z');expect((await data(page)).prvky.find(a=>a.id===2).p).toEqual({x:400,y:400});
});

test('manual routes: lengths, crossings, overlaps, markings and CSV',async({page})=>{
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('[data-tool=route]').click();await page.locator('#routeKind').selectOption('data');await page.locator('#vertical').fill('2');await at(page,100,200);await at(page,600,200);await page.locator('#finish').click();
 await page.locator('#vertical').fill('0');await at(page,300,100);await at(page,300,400);await page.locator('#finish').click();await at(page,200,200);await at(page,400,200);await page.locator('#finish').click();
 await page.locator('[data-step=report]').click();await expect(page.locator('#length')).toHaveText('13,2 m');await expect(page.locator('#sharedReport')).toContainText('8 m');await expect(page.locator('#sharedReport')).toContainText('2 m');
 await page.locator('#openMarkings').click();const rows=await page.locator('#markingsReport').innerText();expect(rows).toContain('K-1');expect(rows).toContain('K-2');expect(rows).toContain('K-3');const promise=page.waitForEvent('download');await page.locator('#exportMarkings').click();expect((await promise).suggestedFilename()).toContain('.csv');
});

test('lighting values, unknown watts and demand factor use editable browser controls',async({page})=>{
 await open(page,project([{id:1,type:'room',points:[{x:100,y:100},{x:600,y:500}],thickness:150},point(2,'name',200,200,{name:'Pracovna'}),point(3,'light',300,300,{watts:40,lumens:4000}),point(4,'light',400,300,{watts:null,lumens:null})]));
 await page.locator('[data-step=calc]').click();await page.locator('#openLighting').click();await expect(page.locator('#lightingReport')).toContainText('112 lx');await expect(page.locator('#lightingReport')).toContainText('1 bodů bez údajů');await page.locator('#closeLighting').click();
 await page.locator('#openLoadBalance').click();await expect(page.locator('#loadDetails')).toContainText('0,04 kW');await page.locator('#loadBasic').getByLabel('Současnost známých zátěží (%)').fill('50');await page.locator('#applyLoadSettings').click();await expect(page.locator('#loadDetails')).toContainText('0,02 kW');
 await page.locator('#loadBasic').getByLabel('Současnost známých zátěží (%)').fill('101');await page.locator('#applyLoadSettings').click();await expect(page.locator('#loadStatus')).toContainText('Neplatné');expect((await data(page)).loadSettings.demandFactor).toBe(.5);
});

test('v1 image and routed v14 project migrate in browser',async({page})=>{
 const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=100;return c.toDataURL('image/png')});
 await open(page,{verze:1,podklad:image,rozmery:{sirka:100,vyska:100},meritko:null,kalibrace:null,rezerva:10,prvky:[]});await saved(page);expect((await data(page)).rezim).toBe('obrazek');
 const p=project([point(1,'panel',200,200),point(2,'socket',400,200),{id:3,type:'route',kind:'socket',circuit:true,cable:'CYKY-J 3×2,5',vertical:0,points:[{x:200,y:200,componentId:1},{x:400,y:200,componentId:2}]}]);p.verze=14;delete p.okruhy;
 await open(page,p);await saved(page);const after=await data(page);expect(after.okruhy).toMatchObject([{id:3,pointIds:[2],panelId:1}]);expect(after.prvky).toEqual(p.prvky);await page.reload();await saved(page);expect(await data(page)).toEqual(after);
});

test('phase locks transfer with repaired circuit and Ctrl+Z in a field is native',async({page})=>{
 const p=project([{id:1,type:'room',points:[{x:100,y:100},{x:600,y:500}],thickness:150},point(2,'panel',200,200),point(3,'socket',300,300),appliance(4,'fridge',{x:310,y:310})],[circuit(5,'socket',[],{panelId:2,applianceIds:[4]}),circuit(6,'socket',[3],{panelId:2})]);p.loadSettings.assignments={'r:5':[2]};
 await open(page,p);await page.locator('[data-step=calc]').click();await page.locator('#openCircuits').click();await page.locator('#proposeCircuits').click();await page.getByRole('button',{name:'Použít návrh',exact:true}).click();expect((await data(page)).loadSettings.assignments).toEqual({'r:6':[2]});expect((await data(page)).okruhy).toHaveLength(1);
 await page.locator('#circuitDesign summary').click();await page.locator('#circuitDesign').getByLabel('Pevné fáze (1;2;3, prázdné = auto)',{exact:true}).fill('1');await page.locator('#circuitDesign').getByRole('button',{name:'Použít fáze',exact:true}).click();expect((await data(page)).loadSettings.assignments).toEqual({'r:6':[0]});await page.locator('#closeCircuits').click();
 await page.locator('[data-step=plan]').click();await page.locator('[data-tool=name]').click();await page.locator('#roomName').fill('Pracovna');await page.locator('#roomName').press('Control+z');expect((await data(page)).loadSettings.assignments).toEqual({'r:6':[0]});
});

test('parallel tabs cannot overwrite a newer project revision',async({page,context})=>{
 const other=await context.newPage();await start(other);await page.locator('[data-step=plan]').click();await page.locator('[data-tool=socket]').click();await at(page,200,200);await saved(page);
 await other.locator('[data-step=plan]').click();await other.locator('[data-tool=socket]').click();await at(other,300,300);await expect(other.locator('#autosaveStatus')).toHaveAttribute('data-state','error');
 await page.reload();await saved(page);expect((await data(page)).prvky).toMatchObject([{type:'socket',p:{x:200,y:200}}]);
});

test('switch wizard commits a complete 6–7–6 group, with atomic undo/redo',async({page})=>{
 await page.locator('[data-step=plan]').click();await page.locator('summary').filter({hasText:'Další body a ovládání'}).click();await page.locator('[data-tool=switch6]').click();await page.locator('#switchWizardAgain').click();await page.locator('#switchCount').fill('3');await page.locator('#startSwitchWizard').click();await at(page,200,200);await at(page,300,300);await at(page,400,200);await saved(page);
 const before=await data(page);expect(before.prvky.filter(a=>a.type.startsWith('switch')).map(a=>a.type)).toEqual(['switch6','switch7','switch6']);expect(before.prvky.filter(a=>a.controlLink)).toHaveLength(2);
 await page.keyboard.press('Control+z');expect((await data(page)).prvky).toHaveLength(0);await page.keyboard.press('Control+y');expect((await data(page)).prvky).toEqual(before.prvky);await page.reload();await saved(page);expect(await data(page)).toEqual(before);
});

test('changing route kind or circuit cannot corrupt an unfinished planned route',async({page})=>{
 await open(page,project([point(1,'panel',200,200),point(2,'socket',400,400),point(3,'socket',600,400)],[circuit(4,'socket',[2]),circuit(5,'socket',[3])]));
 await page.locator('[data-step=calc]').click();await page.locator('#editRoutes').click();await page.locator('#routeDesign').click();const draft=await page.evaluate(()=>JSON.stringify(pending));
 await expect(page.locator('#routeKind')).toBeDisabled();await expect(page.locator('#routeCircuit')).toBeDisabled();expect(await page.evaluate(()=>JSON.stringify(pending))).toBe(draft);
 await page.locator('#cancel').click();await expect(page.locator('#routeKind')).toBeEnabled();await page.locator('#routeKind').selectOption('data');expect(await page.evaluate(()=>pending.length)).toBe(0);
 await at(page,200,200);await at(page,400,400);await page.locator('#finish').click();await saved(page);await page.reload();await saved(page);expect((await data(page)).prvky.find(a=>a.type==='route').kind).toBe('data');
});
