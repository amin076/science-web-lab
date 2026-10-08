import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const output = "artifacts/archimedes-responsive";
fs.mkdirSync(output, { recursive: true });
try {
  for (const [width, height] of [[360,640],[600,600],[900,700],[1440,900]]) {
    const page = await browser.newPage({viewport:{width,height}});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/experiments/physics.fluid-mechanics.archimedes-principle/run?embed=mcp-app&mcp.objDensity=600&mcp.fluidDensity=1000", {waitUntil:"domcontentloaded",timeout:60000});
    const stage = page.locator("[data-esbiko-archimedes-stage]");
    try {
      await stage.waitFor({state:"visible",timeout:15000});
    } catch (error) {
      const debug = await page.evaluate(() => ({
        url: location.href,
        text: document.body?.innerText?.slice(0,2500),
        element: Boolean(document.querySelector('[data-esbiko-archimedes-stage]')),
      }));
      console.error("ARCHIMEDES LOAD FAILURE", {width,height,debug,errors});
      await page.screenshot({path:output+"/diagnostic-"+width+"x"+height+".png",fullPage:true});
      throw error;
    }
    const layout = await page.evaluate(()=>{
      const stage=document.querySelector("[data-esbiko-archimedes-stage]").getBoundingClientRect();
      const analysis=[...document.querySelectorAll("h3")].find(e=>e.textContent.trim()==="Analysis")?.closest(".flex.flex-col");
      const controls=[...document.querySelectorAll("h6")].find(e=>e.textContent.includes("Simulation Controls"))?.closest(".MuiCard-root");
      const box=r=>({top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height});
      return {stage:box(stage),analysis:analysis?box(analysis.getBoundingClientRect()):null,controls:controls?box(controls.getBoundingClientRect()):null,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,canvas:document.querySelector("[data-esbiko-archimedes-stage] canvas")!==null};
    });
    assert(layout.canvas,"3D canvas missing");
    assert(layout.stage.width>=Math.min(300,width-40),"Stage width collapsed: "+JSON.stringify(layout));
    assert(layout.scrollWidth<=width+3,"Horizontal overflow: "+JSON.stringify(layout));
    if (width<1280) {
      assert(layout.analysis && layout.controls,"Panels missing: "+JSON.stringify(layout));
      assert(layout.analysis.top>=layout.stage.bottom-2,"Analysis overlays canvas: "+JSON.stringify(layout));
      assert(layout.controls.top>=layout.analysis.bottom-2,"Controls overlay analysis: "+JSON.stringify(layout));
    }
    assert.equal(errors.length,0,"Runtime errors: "+errors.join("\n"));
    await page.screenshot({path:output+"/archimedes-"+width+"x"+height+".png",fullPage:true});
    console.log("ARCHIMEDES RESPONSIVE PASS",width,height);
    await page.close();
  }
} finally { await browser.close(); }
