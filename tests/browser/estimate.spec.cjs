const {test,expect}=require('@playwright/test'),fs=require('node:fs');
const {appliance,point,project,circuit,start,open,saved,data,at}=require('./helpers.cjs');
const errors=new WeakMap();
test.beforeEach(async({page})=>{const e=[];errors.set(page,e);page.on('pageerror',x=>e.push(x.message));page.on('console',m=>{if(m.type()==='error')e.push(m.text())});await start(page);});
test.afterEach(async({page})=>expect(errors.get(page)).toEqual([]));
test('empty apartment through three steps, no physical appliance link, priced bill and reload',async({page},info)=>{
 let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss()});
 await expect(page.locator('.workflowNav button')).toHaveCount(3);
 await page.locator('[data-tool=room]').click();await at(page,100,100);await at(page,600,500);
 await page.locator('[data-tool=name]').click();await page.locator('#roomName').fill('Kuchyň');await at(page,300,180);
 await page.locator('[data-tool=door]').click();await expect(page.locator('#openingDialog')).not.toBeVisible();await at(page,300,100);await page.locator('#closeProperties').click();
 await page.locator('[data-tool=panel]').click();await at(page,150,250);
 await page.locator('[data-tool=socket]').click();await at(page,300,350);await at(page,500,350);
 await page.locator('[data-tool=appliance]').click();await page.locator('[data-preset=fridge]').click();await page.getByRole('button',{name:'Umístit na plán',exact:true}).click();await at(page,450,280);
 await page.locator('[data-tool=light]').click();await page.locator('#lightPower').fill('40');await page.locator('#lightLumens').fill('4000');await at(page,350,270);
 await page.locator('[data-tool=switch1]').click();await at(page,250,230);
 const initial=await data(page);expect(initial.prvky.find(a=>a.type==='appliance').connectionPointId).toBeNull();expect(initial.okruhy).toHaveLength(0);expect(dialogs).toBe(0);
 await page.screenshot({path:info.outputPath('01-plan.png')});
 await page.locator('[data-step=calc]').click();await page.locator('#calculateProject').click();await expect(page.locator('#calcProposal')).toContainText('Náhled elektroinstalace');await expect(page.locator('#calcProposal')).toContainText('nominální maximum');await expect(page.locator('#calcProposal')).toContainText('Neurčený – světelné zapojení');
 expect((await data(page)).okruhy).toHaveLength(0);await page.screenshot({path:info.outputPath('02-preview.png')});
 await page.getByRole('button',{name:'Použít návrh',exact:true}).click();await saved(page);const after=await data(page);expect(after.okruhy).toHaveLength(2);expect(after.prvky).toEqual(initial.prvky);expect(after.prvky.filter(a=>a.type==='route')).toHaveLength(0);
 await page.keyboard.press('Control+z');expect((await data(page)).okruhy).toHaveLength(0);await page.keyboard.press('Control+y');expect((await data(page)).okruhy).toEqual(after.okruhy);
 await page.locator('#estimateInstallation summary').filter({hasText:'Předpoklady a chybějící údaje'}).click();await page.getByLabel('Svislé vedení na okruh (m)',{exact:true}).fill('2');await page.getByLabel('Svislé vedení na okruh (m)',{exact:true}).press('Tab');await saved(page);
 await page.locator('[data-step=report]').click();await expect(page.locator('#estimateBill')).toContainText('pozic bez ceny');await expect(page.locator('#estimateBill')).toContainText('Příprava tras / drážky');await expect(page.locator('#estimateBill')).toContainText('Neznámé m');
 const price=page.getByLabel('Cena Zásuvkový mechanismus 230 V',{exact:true});await price.fill('123');await price.press('Tab');await saved(page);await expect(page.locator('#estimateBill .tableTotal')).toContainText('246 Kč');
 await page.keyboard.press('Control+z');await expect(page.locator('#estimateBill .tableTotal')).toContainText('0 Kč');await page.keyboard.press('Control+y');await expect(page.locator('#estimateBill .tableTotal')).toContainText('246 Kč');
 const before=await data(page);await page.screenshot({path:info.outputPath('03-bill.png')});
 const down=page.waitForEvent('download');await page.locator('#exportEstimate').click();const csv=fs.readFileSync(await (await down).path(),'utf8');expect(csv).toContain('Zásuvkový mechanismus 230 V');expect(csv).toContain('246');expect(csv).toContain('Neúplný rozsah');expect(csv).toContain('Neznámé');
 await page.reload();await saved(page);expect(await data(page)).toEqual(before);await page.locator('[data-step=report]').click();await expect(page.locator('#estimateBill .tableTotal')).toContainText('246 Kč');
 expect(dialogs).toBe(0);page.removeAllListeners('dialog');await open(page,before);expect(await data(page)).toEqual(before);await page.locator('[data-step=report]').click();
 for(const width of [390,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:info.outputPath('zakazka-'+width+'.png')});}

});
test('repeated estimate keeps manual cable, phase lock, prices and point positions',async({page})=>{
 const p=project([point(1,'panel',100,100),point(2,'socket',400,100),{id:4,type:'route',circuit:true,circuitId:3,kind:'socket',cable:'CUSTOM',vertical:2,points:[{x:100,y:100,componentId:1},{x:400,y:100,componentId:2}]},appliance(5,'dishwasher',{x:300,y:300})],[circuit(3,'socket',[2],{cable:'CUSTOM'})]);p.loadSettings.assignments={'r:3':[2]};
 await open(page,p);const before=await data(page);await page.locator('[data-step=calc]').click();for(let i=0;i<2;i++){await page.locator('#calculateProject').click();await page.getByRole('button',{name:'Použít návrh',exact:true}).click();}
 const after=await data(page);expect(after.okruhy).toHaveLength(2);expect(after.prvky).toEqual(before.prvky);expect(after.loadSettings.assignments).toEqual(before.loadSettings.assignments);await expect(page.locator('#estimateInstallation')).toContainText('ruční trasa zachována');
});
test('unknown input remains visible and stale preview cannot replace current project',async({page})=>{
 await open(page,project([point(1,'socket',200,200),appliance(2,'custom',{x:300,y:300})]));await page.locator('[data-step=calc]').click();await page.locator('#calculateProject').click();await expect(page.locator('#calcProposal')).toContainText('Neznámé');
 await page.evaluate(()=>{recordChange();items.push({id:++seq,type:'panel',p:{x:100,y:100}});render()});await page.getByRole('button',{name:'Použít návrh',exact:true}).click();await expect(page.locator('#calcProposal')).toContainText('Projekt se změnil');expect((await data(page)).okruhy).toHaveLength(0);
 await page.locator('#calculateProject').click();await page.getByRole('button',{name:'Použít návrh',exact:true}).click();await page.locator('[data-step=report]').click();await expect(page.locator('#estimateBill')).toContainText('neúpln');
 const bad=await data(page);bad.estimateSettings.vertical=-1;await open(page,bad);await expect(page.locator('#status')).toContainText('Neplatné nastavení zakázky');expect((await data(page)).estimateSettings.vertical).toBeNull();
});
test('nominal overload stays red when user reduces simultaneity',async({page})=>{
 const p=project([point(1,'panel',100,100),appliance(2,'custom',{x:200,y:200},{powerW:9000,phases:[0]})],[circuit(3,'socket',[],{applianceIds:[2]})]);p.loadSettings.demandFactor=.1;await open(page,p);await page.locator('[data-step=calc]').click();await expect(page.locator('#calcOverview .loadAlert').first()).toBeVisible();await expect(page.locator('#calcOverview')).toContainText('Nominální maximum překračuje');expect((await data(page)).loadSettings.demandFactor).toBe(.1);
});

test('quantity places room demand as one undo operation and preserves v15',async({page})=>{
 await page.locator('[data-tool=socket]').click();await page.locator('#placeCount').fill('3');await at(page,300,300);await saved(page);expect((await data(page)).prvky.filter(a=>a.type==='socket')).toHaveLength(3);await expect(page.locator('#elementLayer')).toContainText('×3');await page.keyboard.press('Control+z');expect((await data(page)).prvky).toHaveLength(0);await page.keyboard.press('Control+y');expect((await data(page)).prvky).toHaveLength(3);await page.reload();await saved(page);expect((await data(page)).prvky).toHaveLength(3);
});
