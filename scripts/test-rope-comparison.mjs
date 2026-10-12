import assert from 'node:assert/strict';
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=path.resolve('artifacts/rope-beta/public');
const server=http.createServer((req,res)=>{const f=path.join(dir,new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));try{res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
try{
 for(const width of [360,1280]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>document.getElementById('rope-4')?.simulationApi);
  assert.equal(await page.locator('canvas').count(),4);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return new Set(ids).size===ids.length;}),true);
  let states=await page.evaluate(()=>[1,2,3,4].map(i=>document.getElementById('rope-'+i).simulationApi.getState()));
  assert.deepEqual(states.map(s=>s.parameters.boundary),['free','fixed','traveling','fixed']);assert.equal(states[3].parameters.excitation,'burst');
  await page.locator('#rope-2 [data-boundary="traveling"]').click();
  await page.locator('#rope-4 [data-ui="pulse-cycles"]').selectOption('.75'.replace('.75','0.75'));
  await page.evaluate(()=>document.getElementById('rope-4').simulationApi.configure({playbackRate:1}));
  await page.locator('#rope-4 [data-ui="send-pulse"]').click();await page.waitForTimeout(1100);
  states=await page.evaluate(()=>[1,2,3,4].map(i=>document.getElementById('rope-'+i).simulationApi.getState()));
  assert.equal(states[0].parameters.boundary,'free');assert.equal(states[0].physics.timeSeconds,0);assert.equal(states[1].parameters.boundary,'traveling');assert.equal(states[3].parameters.pulseCycles,.75);assert.equal(states[3].physics.source.driveM,0);assert.ok(states[3].physics.samples.some(s=>Math.abs(s.yM)>.01));
  await page.click('#pause-all');await page.click('#restart-all');await page.waitForTimeout(150);await page.click('#pause-all');assert.ok(await page.evaluate(()=>[1,2,3,4].every(i=>document.getElementById('rope-'+i).simulationApi.getState().physics.timeSeconds>0)));
  await page.screenshot({path:'artifacts/rope-waves/comparison-'+width+'.png',fullPage:true});assert.deepEqual(errors,[]);await page.close();console.log('PASS '+width+'px: independent settings, finite pulse stops, four canvases, global controls, unique IDs, no overflow/errors');
 }
}finally{await browser.close();server.close();}
