import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless:true, args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"] });
try {
  const page=await browser.newPage({viewport:{width:390,height:740}});
  const errors=[];
  page.on("pageerror", e => errors.push(String(e)));
  await page.addInitScript(() => {
    window.__microscopeTools={};
    Object.defineProperty(document,"modelContext",{
      configurable:true,
      value:{registerTool: async (tool) => {window.__microscopeTools[tool.name]=tool;}}
    });
  });
  await page.goto(base+"/experiments/physics.optics.microscope/run?embed=mcp-app&mcp.focus=0.4&mcp.zoom=3&mcp.light=1.4",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(() => Boolean(window.__microscopeTools?.esbiko_microscope_configure),{timeout:30000});
  const call=async (name,input={})=>page.evaluate(async ([name,input])=>JSON.parse(
    await window.__microscopeTools[name].execute(input)),[name,input]);
  const before=await call("esbiko_microscope_get_state");
  assert.equal(before.ok,true);
  assert.equal(before.data.focus,0.4);
  assert.equal(before.data.zoom,3);
  assert.equal(before.data.light,1.4);
  const configured=await call("esbiko_microscope_configure",{focus:0.8,zoom:7,light:1.1});
  assert.equal(configured.ok,true,JSON.stringify(configured));
  const read=await call("esbiko_microscope_get_state");
  assert.equal(read.data.focus,0.8);
  assert.equal(read.data.zoom,7);
  assert.equal(read.data.light,1.1);
  assert.equal((await call("esbiko_microscope_configure",{zoom:100})).ok,false);
  assert.equal((await call("esbiko_microscope_configure",{unknown:3})).ok,false);
  const reset=await call("esbiko_microscope_reset");
  assert.equal(reset.ok,true);
  assert.equal(reset.data.zoom,3);
  assert.equal(reset.data.focus,0.4);
  assert.equal(reset.data.light,1.4);
  assert.deepEqual(errors,[]);
  console.log("MICROSCOPE ADVANCED WEBMCP PASS",JSON.stringify(reset.data));
} finally { await browser.close(); }
