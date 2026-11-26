const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..');
const L=vm.runInNewContext(fs.readFileSync(path.join(root,'load-engine.js'),'utf8')+';LoadEngine');
const appliance=(id,key,p,extra={})=>({...L.makeAppliance(key),id,type:'appliance',p,...extra});
const point=(id,type,x,y,extra={})=>({id,type,p:{x,y},...extra});
// Deliberately synthetic geometry; never replace this with a user's apartment.
function project(prvky=[],okruhy=[]){return {verze:15,rezim:'kresba',podklad:null,rozmery:{sirka:1500,vyska:1000},meritko:.01,kalibrace:null,rezerva:10,zobrazeni:{},posledniId:Math.max(0,...prvky.map(a=>a.id),...okruhy.map(a=>a.id)),loadSettings:L.defaults(),prvky,okruhy};}
const circuit=(id,kind,pointIds,extra={})=>({id,kind,name:'Test '+id,panelId:1,pointIds,applianceIds:[],cable:kind==='lighting'?'CYKY-J 3×1,5':'CYKY-J 3×2,5',...extra});
async function start(page){await page.goto('/');await page.locator('#autosaveStatus').filter({hasText:/uloženo|Obnoveno/}).waitFor();}
async function open(page,data){const value=typeof data==='string'?fs.readFileSync(data):Buffer.from(JSON.stringify(data));page.once('dialog',d=>d.accept());await page.locator('#projectFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:value});await require('@playwright/test').expect(page.locator('#open')).toBeEnabled();}
async function saved(page){await require('@playwright/test').expect(page.locator('#autosaveStatus')).toHaveAttribute('data-state','saved');}
async function data(page){return page.evaluate(()=>projectData());}
async function at(page,x,y,options={}){const p=await page.locator('#plan').evaluate((svg,{x,y})=>{const m=svg.getScreenCTM();return {x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f}}, {x,y});await page.mouse.click(p.x,p.y,options);}
module.exports={L,appliance,point,project,circuit,start,open,saved,data,at};
