import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--ignore-gpu-blocklist"]});
try{
 const page=await browser.newPage({viewport:{width:600,height:680}});
 const errors=[];page.on("pageerror",e=>errors.push(String(e)));
 await page.addInitScript(()=>{
   window.__rippleTools={};
   Object.defineProperty(document,"modelContext",{configurable:true,
     value:{registerTool:async(tool)=>{window.__rippleTools[tool.name]=tool;}}});
 });
 await page.goto((process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173")+
   "/experiments/physics.waves.surface-waves-double-slit/run?embed=mcp-app&mcp.frequency=2.5&mcp.slitGap=50",
   {waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>Boolean(window.__rippleTools?.esbiko_ripple_get_state),null,{timeout:30000});
 const call=async(name,input={})=>page.evaluate(async([name,input])=>
   JSON.parse(await window.__rippleTools[name].execute(input)),[name,input]);
 const before=await call("esbiko_ripple_get_state");
 assert.equal(before.ok,true);
 assert.equal(before.data.frequency,2.5);
 assert.equal(before.data.slitGap,50);
 const changed=await call("esbiko_ripple_configure",{sourceMode:"click",amplitude:2.2,frequency:4,
   waveSpeed:15,damping:0.02,barrierEnabled:false,barrierX01:0.7,barrierThickness:5,slitGap:40,slitWidth:12});
 assert.equal(changed.ok,true,JSON.stringify(changed));
 await page.waitForTimeout(180);
 const next=await call("esbiko_ripple_get_state");
 assert.equal(next.data.frequency,4);
 assert.equal(next.data.slitGap,40);
 assert.equal(next.data.barrierEnabled,false);
 assert.equal((await call("esbiko_ripple_configure",{amplitude:99})).ok,false);
 assert.equal((await call("esbiko_ripple_configure",{fake:1})).ok,false);
 assert.equal((await call("esbiko_ripple_set_playback",{running:false})).ok,true);
 await page.waitForTimeout(80);
 assert.equal((await call("esbiko_ripple_get_state")).data.running,false);
 assert.equal((await call("esbiko_ripple_reset")).ok,true);
 assert.equal((await call("esbiko_ripple_get_state")).data.running,true);
 assert.deepEqual(errors,[]);
 console.log("RIPPLE TANK ADVANCED MCP PASS");
}finally{await browser.close();}
