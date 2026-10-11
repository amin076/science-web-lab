import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {chromium} from "playwright";

const base=process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173";
const out="artifacts/compound-comparison";
fs.mkdirSync(out,{recursive:true});
const prefix="esbiko_compound_pendulum_";
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--ignore-gpu-blocklist"]});
const sizes=[{width:360,height:500},{width:600,height:600},{width:900,height:650},{width:1280,height:720}];
async function launch(viewport,route="/examples/compound-pendulum-comparison/index.html"){
 const page=await browser.newPage({viewport,acceptDownloads:true});
 const errors=[];page.on("pageerror",e=>errors.push(String(e)));
 await page.addInitScript(()=>{
  window.__compTools={};
  Object.defineProperty(document,"modelContext",{configurable:true,value:{
   registerTool:async(t)=>{window.__compTools[t.name]=t;},
  }});
 });
 await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:60000});
 await page.locator(".cpc-root canvas").waitFor({state:"visible",timeout:20000});
 await page.waitForFunction(p=>!!window.__compTools?.[p+"get_state"],prefix,{timeout:20000});
 return {page,errors};
}
async function tool(page,action,config={}){
 return page.evaluate(async({action,config,prefix})=>{
  const t=window.__compTools[prefix+action];
  if(!t)throw Error("No registered WebMCP tool "+action);
  return JSON.parse(await t.execute(config));
 },{action,config,prefix});
}
try{
 for(const viewport of sizes){
  const {page,errors}=await launch(viewport);
  const geometry=await page.evaluate(()=>{
   const r=document.querySelector(".cpc-root canvas").getBoundingClientRect();
   return {w:r.width,h:r.height,x:r.x,y:r.y,scroll:document.documentElement.scrollWidth,inner:innerWidth};
  });
  assert.ok(geometry.scroll<=geometry.inner+3,"horizontal overflow "+JSON.stringify(geometry));
  assert.ok(geometry.w>=Math.min(300,viewport.width-32),"canvas collapsed");
  assert.ok(geometry.h>=320,"canvas height collapsed");
  const before=await tool(page,"get_state");
  assert.equal(before.ok,true);
  assert.equal(before.data.physics.paneCount,2);
  assert.ok(Object.keys((await tool(page,"get_capabilities")).data.parameterSchema.properties).length>=100);
  if(viewport.width===360){
   const change=await tool(page,"configure",{paneCount:4,selectedPane:2,p2_rodCount:3,
     p3_rodCount:2,p4_rodCount:1,p2_lengthM1:1.5,p2_initialAngleDeg1:150.2,
     p2_trace1:false});
   assert.equal(change.ok,true,JSON.stringify(change));
   await page.waitForTimeout(350);
   const newer=await tool(page,"get_state");
   assert.equal(newer.data.physics.paneCount,4);
   assert.equal(newer.data.physics.pendulums[1].rodCount,3);
   assert.equal(newer.data.physics.pendulums[0].rodCount,4);
   assert.equal(newer.data.parameters.p2_trace1,false);
   assert.equal(newer.data.parameters.p1_lengthM1,1.2);
   const sep=newer.data.physics.comparisons[0].tipSeparationM;
   assert.ok(Number.isFinite(sep));
   assert.equal((await tool(page,"configure",{p2_lengthM1:0})).ok,false);
   assert.equal((await tool(page,"get_trajectory",{paneIndex:2,rodIndex:1,limit:60})).ok,true);
   const css=await page.evaluate(()=>{
    const stage=document.querySelector(".cpc-viewport");
    const canvas=document.querySelector(".cpc-root canvas");
    return {height:stage.getBoundingClientRect().height,canvasWidth:canvas.width};
   });
   assert.ok(css.height>=1100,"four mobile panes should be scrollable and legible");
   assert.equal((await tool(page,"set_playback",{running:false})).ok,true);
   assert.equal((await tool(page,"step_once")).ok,true);
   assert.equal((await tool(page,"set_playback",{running:true})).ok,true);
  }
  assert.deepEqual(errors,[],"browser errors "+errors.join("; "));
  await page.screenshot({path:path.join(out,"compare-"+viewport.width+".png"),fullPage:true});
  await page.close();
  console.log("Comparison responsive and WebMCP PASS",viewport.width);
 }
 const {page,errors}=await launch({width:1150,height:780},"/experiments/physics.mechanics.compound-pendulum/run");
 assert.equal((await tool(page,"configure",{paneCount:4,p1_rodCount:3,p2_rodCount:3,
    p2_initialAngleDeg1:155.1})).ok,true);
 const init=await tool(page,"get_state");
 assert.equal(init.data.physics.paneCount,4);
 await page.waitForTimeout(1200);
 const state=await tool(page,"get_state");
 assert.ok(state.data.elapsedSeconds>0,"comparison engine froze");
 assert.equal(state.data.physics.pendulums.length,4);
 for(const system of state.data.physics.pendulums){
  assert.ok(system.anglesRad.every(Number.isFinite));
  assert.ok(Number.isFinite(system.energy.totalJ));
 }
 for(const [mode,button] of [["landscape","landscape"],["shorts","shorts"]]){
  await page.locator('[data-compare="'+button+'"]').click();
  await page.waitForTimeout(1950);
  assert.equal((await tool(page,"video_status")).data.status,"recording");
  await page.locator('[data-compare="stop-video"]').click();
  await page.waitForFunction(async(prefix)=>{
   const t=window.__compTools[prefix+"video_status"];
   const v=JSON.parse(await t.execute({})).data;
   if(v.status==="failed")throw Error(JSON.stringify(v.error));
   return v.status==="ready";
  },prefix,{timeout:18000});
  const st=(await tool(page,"video_status")).data;
  assert.ok(st.file.bytes>1000);
  const d=page.waitForEvent("download",{timeout:15000});
  await page.locator('[data-compare="download"]').click();
  const download=await d;
  const dest=path.join(out,"comparison-"+mode+".webm");
  await download.saveAs(dest);
  assert.ok(fs.statSync(dest).size>1000);
  console.log("Comparison "+mode+" WebM PASS",fs.statSync(dest).size);
 }
 assert.deepEqual(errors,[],"browser errors "+errors.join("; "));
 await page.close();
}finally{await browser.close();}
console.log("Compound comparison: public route, responsive, advanced WebMCP, 4-way physics and both video formats PASS");
