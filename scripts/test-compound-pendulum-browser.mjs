import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base=process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173";
const url=base+"/examples/compound-pendulum-preview/index.html";
const output="artifacts/compound-pendulum";
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--ignore-gpu-blocklist"]});
const sizes=[{width:360,height:500},{width:600,height:600},{width:900,height:650},{width:1280,height:720}];
const prefix="esbiko_compound_pendulum";
async function pageFor(viewport){
 const page=await browser.newPage({viewport,acceptDownloads:true});
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e)));
 await page.addInitScript(()=>{
   window.__tools={};
   Object.defineProperty(document,"modelContext",{configurable:true,value:{
     registerTool:async tool=>{window.__tools[tool.name]=tool;},
   }});
 });
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(p=>Boolean(window.__tools?.[p+"_get_state"]),prefix,{timeout:25000});
 await page.locator(".cp-root canvas").waitFor({state:"visible"});
 return {page,errors};
}
async function invoke(page,name,input={}){
 return page.evaluate(async({name,input})=>{
   const tool=window.__tools["esbiko_compound_pendulum_"+name];
   if(!tool)throw Error("missing tool "+name);
   return JSON.parse(await tool.execute(input));
 },{name,input});
}
try {
 for(const viewport of sizes){
  const {page,errors}=await pageFor(viewport);
  const m=await page.evaluate(()=>{
    const canvas=document.querySelector(".cp-root canvas");
    const rect=canvas.getBoundingClientRect();
    return {scrollWidth:document.documentElement.scrollWidth,innerWidth,
       canvasWidth:rect.width,canvasHeight:rect.height,canvasTop:rect.top};
  });
  assert.ok(m.canvasWidth>=Math.min(viewport.width-35,300),JSON.stringify(m));
  assert.ok(m.canvasHeight>=250,JSON.stringify(m));
  assert.ok(m.scrollWidth<=m.innerWidth+3,"horizontal overflow: "+JSON.stringify(m));
  if(viewport.width<=600)assert.ok(m.canvasTop<150,"canvas not mobile-first");
  const st=await invoke(page,"get_state");
  assert.equal(st.ok,true,JSON.stringify(st));
  assert.equal(st.data.physics.rodCount,4);
  const caps=await invoke(page,"get_capabilities");
  assert.equal(caps.ok,true);
  assert.equal(caps.data.parameterSchema.properties.lengthM4.unit,"m");
  if(viewport.width===360){
    const configure=await invoke(page,"configure",{
      rodCount:2,lengthM1:1.25,lengthM2:.9,initialAngleDeg1:0,initialOmegaRadps1:14,
      initialAngleDeg2:0,initialOmegaRadps2:0,
      trace1:false,trace2:true,trace3:false,trace4:false,
      playbackRate:1.5,
    });
    assert.equal(configure.ok,true,JSON.stringify(configure));
    await page.waitForTimeout(200);
    const reduced=await invoke(page,"get_state");
    assert.equal(reduced.data.physics.rodCount,2);
    assert.equal(reduced.data.parameters.trace1,false);
    assert.equal(reduced.data.parameters.trace2,true);
    assert.equal(reduced.data.physics.tipsM.length,2);
    assert.equal(await page.locator('[data-rod="3"]').isVisible(),false);
    assert.equal((await invoke(page,"get_trajectory",{rodIndex:3})).ok,false);
    assert.equal((await invoke(page,"configure",{lengthM1:0})).ok,false);
    assert.equal((await invoke(page,"set_camera",{zoom:2})).ok,true);
    assert.equal((await invoke(page,"clear_trails")).ok,true);
    assert.equal((await invoke(page,"step_once")).ok,false); // simulation auto-playing
    assert.equal((await invoke(page,"set_playback",{running:false})).ok,true);
    assert.equal((await invoke(page,"step_once")).ok,true);
    assert.equal((await invoke(page,"set_playback",{running:true})).ok,true);
    assert.equal((await invoke(page,"get_trajectory",{rodIndex:2,limit:100})).ok,true);
  }
  assert.deepEqual(errors,[],"Browser page errors");
  await page.screenshot({path:path.join(output,"preview-"+viewport.width+".png"),fullPage:true});
  await page.close();
  console.log("COMPOUND PENDULUM VIEWPORT / API / WebMCP PASS",viewport.width);
 }
 const {page,errors}=await pageFor({width:960,height:720});
 for(const mode of ["landscape","shorts"]){
   const start=await invoke(page,"start_video",{mode});
   assert.equal(start.ok,true,JSON.stringify(start));
   assert.equal(start.data.status,"recording");
   await page.waitForTimeout(2100);
   const stopped=await invoke(page,"stop_video");
   assert.equal(stopped.ok,true,JSON.stringify(stopped));
   await page.waitForFunction(async()=>{
     const tool=window.__tools?.esbiko_compound_pendulum_video_status;
     if(!tool)return false;
     const response=JSON.parse(await tool.execute({}));
     if(response.data?.status==="failed")throw new Error(JSON.stringify(response));
     return response.data?.status==="ready";
   },null,{timeout:15000});
   const status=await invoke(page,"video_status");
   assert.equal(status.data.status,"ready");
   assert.equal(status.data.audioIncluded,false);
   assert.ok(status.data.file.bytes>1000,"WebM file empty");
   const downloadEvent=page.waitForEvent("download",{timeout:15000});
   await page.locator('[data-cp="rec-download"]').click();
   const download=await downloadEvent;
   const target=path.join(output,"pendulum-"+mode+".webm");
   await download.saveAs(target);
   assert.ok(fs.statSync(target).size>1000,"Empty downloaded WebM");
   console.log("COMPOUND PENDULUM "+mode+" VIDEO PASS",fs.statSync(target).size);
 }
 assert.deepEqual(errors,[],"Browser page errors");
 await page.close();
} finally {
 await browser.close();
}
console.log("Compound pendulum responsive, API, advanced WebMCP and recorded WebM browser smoke complete.");
