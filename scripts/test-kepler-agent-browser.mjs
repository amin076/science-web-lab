import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"]});
try {
  const page=await browser.newPage({viewport:{width:600,height:680}});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.addInitScript(()=>{
    window.__keplerTools={};
    Object.defineProperty(document,"modelContext",{configurable:true,
      value:{registerTool:async(tool)=>{window.__keplerTools[tool.name]=tool;}}});
  });
  await page.goto((process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173")+
    "/experiments/astronomy.kepler-lab/run?embed=mcp-app&mcp.launchDistance=300&mcp.launchVelocity=70",
    {waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>Boolean(window.__keplerTools?.esbiko_kepler_get_state),null,{timeout:30000});
  const call=async (name,input={})=>page.evaluate(async([name,input])=>
    JSON.parse(await window.__keplerTools[name].execute(input)),[name,input]);
  const initial=await call("esbiko_kepler_get_state");
  assert.equal(initial.ok,true,JSON.stringify(initial));
  assert.equal(initial.data.params.launchDistance,300);
  assert.equal(initial.data.params.launchVelocity,70);
  const changed=await call("esbiko_kepler_configure",
    {launchDistance:400,launchVelocity:42,launchAngle:-45,showSweeps:false});
  assert.equal(changed.ok,true,JSON.stringify(changed));
  await page.waitForTimeout(200);
  const live=await call("esbiko_kepler_get_state");
  assert.equal(live.data.params.launchDistance,400);
  assert.equal(live.data.params.launchVelocity,42);
  assert.equal(live.data.params.showSweeps,false);
  assert.equal((await call("esbiko_kepler_configure",{launchVelocity:200})).ok,false);
  assert.equal((await call("esbiko_kepler_configure",{fake:2})).ok,false);
  assert.equal((await call("esbiko_kepler_set_playback",{running:true})).ok,true);
  await page.waitForTimeout(180);
  assert.equal((await call("esbiko_kepler_get_state")).data.running,true);
  assert.equal((await call("esbiko_kepler_reset")).ok,true);
  await page.waitForTimeout(150);
  const reset=await call("esbiko_kepler_get_state");
  assert.equal(reset.data.running,false);
  assert.equal(reset.data.params.launchDistance,400);
  assert.deepEqual(errors,[]);
  console.log("KEPLER ADVANCED MCP PASS");
}finally{await browser.close();}
