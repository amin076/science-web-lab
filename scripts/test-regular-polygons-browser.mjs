import assert from "node:assert/strict";
import fs from "node:fs";
import {createServer} from "vite";
import {chromium} from "playwright";

for(const [key,value] of Object.entries({VITE_FIREBASE_API_KEY:"test-only",VITE_FIREBASE_PROJECT_ID:"demo-esbiko",
  VITE_FIREBASE_AUTH_DOMAIN:"demo-esbiko.firebaseapp.com",VITE_FIREBASE_APP_ID:"1:123:web:test"}))process.env[key]||=value;
const vite=await createServer({server:{host:"127.0.0.1",port:4175,strictPort:true},logLevel:"error"});
await vite.listen();
const browser=await chromium.launch({headless:true,args:["--autoplay-policy=no-user-gesture-required"]});
const base="http://127.0.0.1:4175/experiments/math.geometry.regular-polygons-circle/run";
try{
 for(const width of [360,600,900,1280]){
  const page=await browser.newPage({viewport:{width,height:750},acceptDownloads:true,
    ...(width===360?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
  const faults=[];page.on("pageerror",e=>faults.push(e.message));
  await page.addInitScript(()=>{
   Object.defineProperty(document,"modelContext",{configurable:true,value:{
    registerTool:async tool=>{window.__polygonTools??={};window.__polygonTools[tool.name]=tool;}
   }});
  });
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
  await page.locator(".rp-lab canvas").waitFor({timeout:20000});
  await page.waitForFunction(()=>window.esbikoRegularPolygonsV1?.getState()?.physics?.geometry?.sides===3);
  const sizes=await page.evaluate(()=>({
    outer:document.documentElement.scrollWidth,inner:innerWidth,
    lab:document.querySelector(".rp-lab").scrollWidth,available:document.querySelector(".rp-lab").clientWidth,
    canvas:document.querySelector(".rp-lab canvas").getBoundingClientRect().width
  }));
  assert.ok(sizes.outer<=sizes.inner+2,"Document overflow at "+width+" "+JSON.stringify(sizes));
  assert.ok(sizes.lab<=sizes.available+2,"Lab overflow at "+width+" "+JSON.stringify(sizes));
  assert.ok(sizes.canvas>220,"Usable canvas required at "+width);
  await page.locator('.rp-presets button').filter({hasText:/^20$/}).click();
  await page.waitForFunction(()=>window.esbikoRegularPolygonsV1.getState().parameters.sides===20);
  assert.equal(await page.locator(".rp-comparison tbody tr").count(),6);
  const cmd=await page.evaluate(async()=>{
   const tool=window.__polygonTools?.esbiko_regular_polygons_configure;
   if(!tool)throw new Error("Browser WebMCP configure tool missing");
   return JSON.parse(await tool.execute({sides:5,radius:3}));
  });
  assert.equal(cmd.ok,true,"WebMCP configure must operate on canonical model");
  await page.waitForFunction(()=>window.esbikoRegularPolygonsV1.getState().physics.geometry.sides===5);
  if(width===360){
    const rect=await page.locator(".rp-lab canvas").boundingBox();
    await page.touchscreen.tap(rect.x+rect.width/2,rect.y+rect.height/2);
  }
  if(width===1280){
    for(const mode of ["landscape","shorts"]){
      await page.locator(".rp-video-select select").selectOption(mode);
      await page.getByRole("button",{name:"Start recording"}).click();
      await page.waitForFunction(()=>window.esbikoRegularPolygonsV1.getVideoStatus().status==="recording",{timeout:8000});
      await page.waitForTimeout(1350);
      await page.getByRole("button",{name:"Stop recording"}).click();
      await page.waitForFunction(()=>window.esbikoRegularPolygonsV1.getVideoStatus().status==="ready",{timeout:15000});
      const promise=page.waitForEvent("download",{timeout:12000});
      await page.getByRole("button",{name:"Download WebM"}).click();
      const download=await promise;
      const folder="artifacts/regular-polygons";
      fs.mkdirSync(folder,{recursive:true});
      const dest=folder+"/"+mode+".webm";
      await download.saveAs(dest);
      assert.ok(fs.statSync(dest).size>1000,"Real "+mode+" WebM recording must have frames");
    }
  }
  assert.deepEqual(faults,[],"Uncaught browser errors at width "+width);
  fs.mkdirSync("artifacts/regular-polygons",{recursive:true});
  if(width===360||width===1280)await page.screenshot({path:"artifacts/regular-polygons/"+width+".png",fullPage:true});
  await page.close();
 }
 console.log("Regular polygon browser: 360/600/900/1280, WebMCP, live geometry, touch, both WebM formats PASS");
}finally{await browser.close();await vite.close();}
