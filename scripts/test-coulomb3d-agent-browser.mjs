import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"]});
try {
  const page=await browser.newPage({viewport:{width:600,height:680}});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.addInitScript(()=>{
    window.__coulombTools={};
    Object.defineProperty(document,"modelContext",{configurable:true,
      value:{registerTool:async (tool)=>{window.__coulombTools[tool.name]=tool;}}});
  });
  await page.goto((process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173")+
    "/experiments/physics.electricity.coulomb-law-3d/run?embed=mcp-app&mcp.q1=2&mcp.z1=3",
    {waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>Boolean(window.__coulombTools?.esbiko_coulomb3d_get_state),null,{timeout:30000});
  const call=async (name,input={})=>page.evaluate(async ([name,input])=>
    JSON.parse(await window.__coulombTools[name].execute(input)),[name,input]);
  const before=await call("esbiko_coulomb3d_get_state");
  assert.equal(before.ok,true,JSON.stringify(before));
  assert.equal(before.data.q1,2);
  assert.equal(before.data.pos1.z,3);
  const modified=await call("esbiko_coulomb3d_configure",
    {q1:3,q2:-2,x1:-4,y1:1,z1:2,x2:4,y2:-1,z2:-2,showField:true,showFlux:false});
  assert.equal(modified.ok,true,JSON.stringify(modified));
  await page.waitForTimeout(200);
  const after=await call("esbiko_coulomb3d_get_state");
  assert.equal(after.data.q1,3);
  assert.equal(after.data.pos1.x,-4);
  assert.equal(after.data.pos2.z,-2);
  assert.equal(after.data.showField,true);
  assert.equal(after.data.showFlux,false);
  assert.equal((await call("esbiko_coulomb3d_configure",{q1:11})).ok,false);
  assert.equal((await call("esbiko_coulomb3d_configure",{unknown:2})).ok,false);
  assert.equal((await call("esbiko_coulomb3d_set_playback",{running:true})).ok,true);
  await page.waitForTimeout(200);
  assert.equal((await call("esbiko_coulomb3d_get_state")).data.running,true);
  assert.equal((await call("esbiko_coulomb3d_configure",{x1:1})).ok,false);
  assert.equal((await call("esbiko_coulomb3d_reset")).ok,true);
  await page.waitForTimeout(200);
  assert.equal((await call("esbiko_coulomb3d_get_state")).data.running,false);
  assert.deepEqual(errors,[]);
  console.log("COULOMB 3D ADVANCED MCP PASS");
} finally {await browser.close();}
