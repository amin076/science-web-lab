import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const errors=[];
fs.mkdirSync('artifacts/rope-waves',{recursive:true});
try{
 for(const width of [360,600,900,1280]){
 const page=await browser.newPage({viewport:{width,height:720},acceptDownloads:true,...(width===360?{isMobile:true,hasTouch:true}:{})});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/examples/rope-waves/index.html'+(width===600?'?embed=mcp-app&mcp.boundary=free':''));
 await page.waitForFunction(()=>document.getElementById('rope-lab').simulationApi);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
 const api=fn=>page.evaluate(fn);
 await page.click('#play');await page.waitForTimeout(300);await page.click('#pause');
 assert.ok(await api(()=>document.getElementById('rope-lab').simulationApi.getState().physics.timeSeconds>0));
 for(const boundary of ['traveling','free','fixed']){await page.click('[data-boundary="'+boundary+'"]');assert.equal(await api(()=>document.getElementById('rope-lab').simulationApi.getState().parameters.boundary),boundary);}
 await page.selectOption('#excitation','sine');assert.equal(await api(()=>document.getElementById('rope-lab').simulationApi.getState().parameters.excitation),'sine');
 await page.evaluate(()=>{const a=document.getElementById('rope-lab').simulationApi;a.configure({boundary:'free'});for(let i=0;i<400;i++)a.stepOnce();});
 if(width===360||width===1280)await page.screenshot({path:'artifacts/rope-waves/'+width+'.png',fullPage:true});
 if(width===1280){
 await page.locator('summary').filter({hasText:'Record video'}).click();
 for(const mode of ['landscape','shorts']){
 await page.click('#record-'+mode);await page.click('#play');await page.waitForTimeout(1200);await page.click('#pause');await page.click('#stop-record');await page.waitForFunction(()=>document.getElementById('recording-status').textContent.startsWith('ready'));
 const download=page.waitForEvent('download');await page.click('#download-record');const file=await download;const dest='artifacts/rope-waves/'+mode+'.webm';await file.saveAs(dest);assert.ok(fs.statSync(dest).size>1000);
 }
 }
 await page.close();console.log('PASS viewport '+width);
 }
 assert.deepEqual(errors,[]);console.log('PASS browser controls, embedding, mobile scroll, two recorded WebM downloads; no page errors');
}finally{await browser.close();}
