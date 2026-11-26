const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
// Only application assets are served; private fixtures are never exposed.
const allowed=new Set(['index.html','circuit-engine.js','load-engine.js','estimate-engine.js','estimate-ui.js']);
http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 fs.createReadStream(path.join(__dirname,'..',name)).pipe(res);
}).listen(Number(process.env.ELEKTROPLAN_TEST_PORT||4173),'127.0.0.1');
