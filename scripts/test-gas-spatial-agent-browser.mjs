import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless:true,
  args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--autoplay-policy=no-user-gesture-required"],
});
const base=process.env.ESBIKO_TEST_BASE_URL ?? "http://127.0.0.1:4173";
fs.mkdirSync("artifacts/gas-spatial-audio", { recursive:true });
const cases=[
  {id:"physics.thermodynamics.gas",prefix:"esbiko_ideal_gas",stage:"[data-esbiko-gas-stage]",controls:"[data-esbiko-gas-controls]"},
  {id:"physics.acoustics.spatial-audio",prefix:"esbiko_spatial_audio",stage:"[data-esbiko-spatial-stage]",controls:"[data-esbiko-spatial-controls]"},
];
try {
 for (const item of cases) {
  for (const viewport of [{width:360,height:640},{width:600,height:700},{width:900,height:700},{width:1440,height:900}]) {
   const page=await browser.newPage({viewport});
   const errors=[];
   page.on("pageerror",error=>errors.push(String(error)));
   await page.addInitScript(()=>{
     window.__agentTools={};
     Object.defineProperty(document,"modelContext",{
       configurable:true,value:{registerTool:async(tool)=>{window.__agentTools[tool.name]=tool;}},
     });
   });
   const params=item.id.includes("thermodynamics")
     ? "?embed=mcp-app&mcp.volume=15" : "?embed=mcp-app&mcp.x=4&mcp.z=-3&mcp.volume=0.6";
   await page.goto(base+"/experiments/"+item.id+"/run"+params,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator(item.stage).waitFor({state:"visible",timeout:30000});
   await page.waitForFunction((name)=>Boolean(window.__agentTools?.[name]),item.prefix+"_get_state",{timeout:30000});
   const layout=await page.evaluate(({stage,controls})=>{
     const rect=(selector)=>{const r=document.querySelector(selector)?.getBoundingClientRect();
       return r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}:null;};
     const s=rect(stage);const p=rect(controls);
     const canvas=document.querySelector(stage+" canvas")?.getBoundingClientRect();
     return {s,p,canvas:canvas?{width:canvas.width,height:canvas.height}:null,
       width:innerWidth,documentWidth:document.documentElement.scrollWidth};
   },item);
   assert(layout.canvas && layout.canvas.width>120 && layout.canvas.height>120,
     "Canvas too small/missing: "+JSON.stringify(layout));
   assert(layout.documentWidth <= layout.width+4,"Horizontal overflow: "+JSON.stringify(layout));
   if(viewport.width<1280){
     assert(layout.s.width >= viewport.width-50,"Stage squeezed: "+JSON.stringify(layout));
     assert(layout.p && layout.p.y >= layout.s.bottom-2,
       "Controls overlap stage: "+JSON.stringify(layout));
   }
   const call=async(name,input={})=>page.evaluate(async({name,input})=>
     JSON.parse(await window.__agentTools[name].execute(input)),{name:item.prefix+"_"+name,input});
   if(viewport.width===360){
     if(item.prefix==="esbiko_ideal_gas"){
       const start=await call("get_state");
       assert.equal(start.ok,true);
       assert.equal(start.data.volume,15);
       assert(Math.abs(start.data.pressure-(0.0821*300/15))<1e-8);
       assert.equal((await call("configure",{lockedParam:"V"})).ok,true);
       const changed=await call("configure",{temperature:400});
       assert.equal(changed.ok,true,JSON.stringify(changed));
       const actual=await call("get_state");
       assert.equal(actual.data.temperature,400);
       assert.equal(actual.data.volume,15);
       assert(Math.abs(actual.data.pressure-(0.0821*400/15))<1e-8);
       assert.equal((await call("configure",{volume:10})).ok,false);
       assert.equal((await call("configure",{pressure:-10})).ok,false);
       assert.equal((await call("configure",{volume:10,temperature:300})).ok,false);
       assert.equal((await call("reset")).ok,true);
       const reset=await call("get_state");
       assert.equal(reset.data.volume,20);
       assert.equal(reset.data.lockedParam,"T");
     } else {
       const start=await call("get_state");
       assert.equal(start.ok,true);
       assert.equal(start.data.x,4);
       assert.equal(start.data.z,-3);
       assert.equal(start.data.volume,0.6);
       assert.equal((await call("configure",{x:-4,z:2,volume:0.25})).ok,true);
       const actual=await call("get_state");
       assert.equal(actual.data.x,-4);
       assert.equal(actual.data.z,2);
       assert.equal(actual.data.volume,0.25);
       assert.equal((await call("configure",{x:100})).ok,false);
       assert.equal((await call("configure",{bad:2})).ok,false);
       const playing=await call("set_playback",{playing:true});
       assert.equal(playing.ok,true,JSON.stringify(playing));
       const during=await call("get_state");
       assert.equal(during.data.playing,true);
       assert.equal(during.data.audioContextState,"running");
       assert.equal((await call("set_playback",{playing:false})).ok,true);
       assert.equal((await call("reset")).ok,true);
       const reset=await call("get_state");
       assert.equal(reset.data.playing,false);
       assert.equal(reset.data.x,4);
       assert.equal(reset.data.z,-3);
     }
   }
   await page.screenshot({path:"artifacts/gas-spatial-audio/"+item.prefix+"-"+viewport.width+".png",fullPage:true});
   assert.deepEqual(errors,[],"Browser runtime errors: "+JSON.stringify(errors));
   console.log("GAS/AUDIO RESPONSIVE + MCP PASS",item.id,viewport.width);
   await page.close();
  }
 }
} finally {await browser.close();}
