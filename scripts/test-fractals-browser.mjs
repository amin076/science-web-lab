import assert from "node:assert/strict";
import {chromium} from "playwright";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1250,height:900}});
 await page.addInitScript(()=>{
  const registered=[];
  Object.defineProperty(document,"modelContext",{configurable:true,value:{registerTool:async tool=>{registered.push(tool);}}});
  window.__registeredFractalTools=registered;
 });
 await page.goto(pathToFileURL(resolve("public/fractal-lab/index.html")).href);
 await page.waitForFunction(()=>Boolean(window.EsbikoFractalLab) && window.__registeredFractalTools?.length===7);
 const init=await page.evaluate(()=>window.EsbikoFractalLab.getState());
 assert.equal(init.simulationId,"math.geometry.fractals-2d");
 const result=await page.evaluate(()=>{
  const api=window.EsbikoFractalLab;
  api.configure({type:"mandelbrot",level:6,palette:"prism",glow:100,gradient:true});
  api.setCamera({zoom:50000,x:-.7,y:.13});
  return api.getState();
 });
 assert.equal(result.parameters.type,"mandelbrot");
 assert.equal(result.parameters.palette,"prism");
 assert.equal(result.camera.zoom,50000);
 const toolResult=await page.evaluate(async ()=>{
  const t=window.__registeredFractalTools.find(x=>x.name==="esbiko_fractals_get_state");
  return JSON.parse(await t.execute({}));
 });
 assert.equal(toolResult.ok,true);
 assert.equal(toolResult.data.parameters.type,"mandelbrot");
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(200);
 const responsive=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth,
  width:document.querySelector("#fractalCanvas").getBoundingClientRect().width}));
 assert.ok(responsive.body<=responsive.viewport+3,JSON.stringify(responsive));
 assert.ok(responsive.width>250);
 console.log("PASS: Chromium full HTML viewer, 7 browser WebMCP tools, 50k zoom, palette and responsive mobile");
}finally{await browser.close();}
