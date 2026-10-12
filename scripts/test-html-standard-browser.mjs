import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright";
import {createHtmlReferenceDocument,executeHtmlReferenceCommand,exposeHtmlReferenceState}
 from "../functions/control/htmlReferenceControl.mjs";

const base=process.env.ESBIKO_TEST_BASE||"http://127.0.0.1:4173";
const lab=base+"/examples/html-simulation/index.html";
const browser=await chromium.launch({headless:true,args:["--autoplay-policy=no-user-gesture-required"]});
const errors=[];
try{
 for(const width of [360,600,900,1280]){
  const page=await browser.newPage({viewport:{width,height:720},acceptDownloads:true});
  page.on("pageerror",e=>errors.push(e.message));
  const res=await page.goto(lab,{waitUntil:"networkidle",timeout:35000});
  assert.equal(res.status(),200);
  await page.locator("#simulation-canvas").waitFor();
  if(width===600){
   await page.goto(lab+"?embed=mcp-app&mcp.startYM=8&mcp.gravityMps2=5",{waitUntil:"networkidle"});
   assert.equal(parseFloat(await page.locator("#y").innerText()),8);
   assert.equal(await page.locator('[data-agent-param="gravityMps2"]').inputValue(),"5");
  }

  const h=await page.locator("#sliders input").count();
  assert.equal(h,5);
  const dimensions=await page.evaluate(()=>({
   outer:document.documentElement.scrollWidth,inner:window.innerWidth,
   canvas:document.querySelector("canvas").getBoundingClientRect().width,
  }));
  assert.ok(dimensions.outer<=dimensions.inner+2,
   "Horizontal overflow at "+width+": "+JSON.stringify(dimensions));
  assert.ok(dimensions.canvas>160,"Canvas usable at "+width);
  await page.click("#play");
  await page.waitForTimeout(350);
  assert.ok(parseFloat(await page.locator("#time").innerText())>0);
  await page.click("#pause");
  if(width===360||width===1280) {
   for(const mode of ["landscape","shorts"]){
    await page.click(mode==="landscape"?"#record-landscape":"#record-shorts");
    await page.waitForFunction(()=>document.querySelector("#recording-status")?.textContent.includes("recording"),null,{timeout:6000});
    await page.waitForTimeout(1100);
    await page.click("#stop-record");
    await page.waitForFunction(()=>document.querySelector("#recording-status")?.textContent.includes("ready"),null,{timeout:12000});
    const downloadPromise=page.waitForEvent("download",{timeout:12000});
    await page.click("#download-record");
    const download=await downloadPromise;
    assert.ok(download.suggestedFilename().endsWith(mode+".webm"));
    const dir="artifacts/html-standard-browser";
    fs.mkdirSync(dir,{recursive:true});
    const dest=dir+"/"+width+"-"+mode+".webm";
    await download.saveAs(dest);
    assert.ok(fs.statSync(dest).size>1000,"Recorded real WebM must contain frames");
   }
  }
  if(width===360){
   fs.mkdirSync("artifacts/html-standard-browser",{recursive:true});
   await page.screenshot({path:"artifacts/html-standard-browser/mobile-360.png",fullPage:true});
  }
  await page.close();
 }
 // Verify that a remote MCP App iframe and the headless HTTP session mutate the same scientific state.
 const sid="b1111111-b222-4333-8444-c55555555555",token="b".repeat(64);
 let doc=createHtmlReferenceDocument({startYM:5}),mutations=0;
 const page=await browser.newPage({viewport:{width:420,height:850}});
 page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/api/v1/control/sessions/**",async(route)=>{
  const req=route.request(),u=new URL(req.url());
  if(req.headers()["x-esbiko-control-token"]!==token)return route.fulfill({status:403,contentType:"application/json",body:JSON.stringify({ok:false,error:"INVALID_TOKEN"})});
  if(req.method()==="GET"){
   if(u.searchParams.get("since")===String(doc.revision))
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,unchanged:true,revision:doc.revision})});
   return route.fulfill({status:200,contentType:"application/json",
    body:JSON.stringify({ok:true,sessionId:sid,checkpoint:doc.checkpoint,...exposeHtmlReferenceState(doc)})});
  }
  if(req.method()==="POST"){
   try{
    const input=JSON.parse(req.postData());
    if(input.expectedRevision!==doc.revision)
     return route.fulfill({status:409,contentType:"application/json",body:JSON.stringify({ok:false,error:"REVISION_CONFLICT"})});
    const output=executeHtmlReferenceCommand(doc,input);
    doc=output.document;mutations++;
    return route.fulfill({status:200,contentType:"application/json",
     body:JSON.stringify({ok:true,revision:doc.revision,result:output.result})});
   }catch(e){return route.fulfill({status:400,contentType:"application/json",body:JSON.stringify({ok:false,error:e.code||"INVALID_COMMAND"})});}
  }
  return route.fulfill({status:405,body:"Method not allowed"});
 });
 await page.goto(lab+"?embed=mcp-app&remoteSessionId="+sid,{waitUntil:"domcontentloaded"});
 await page.evaluate(({sessionId,token})=>window.postMessage({type:"esbiko-control-session-v1",
  sessionId,token},"*"),{sessionId:sid,token});
 await page.waitForFunction(()=>document.querySelector("#mcp-status")?.textContent.includes("Remote MCP + HTTP session"),null,{timeout:12000});
 assert.ok(!page.url().includes(token));
 assert.equal(parseFloat(await page.locator("#y").innerText()),5);
 doc=executeHtmlReferenceCommand(doc,{action:"advance",seconds:1.5}).document;
 await page.waitForFunction(()=>parseFloat(document.querySelector("#time")?.textContent||"0")>1.4,null,{timeout:12000});
 assert.ok(Math.abs(parseFloat(await page.locator("#x").innerText())-30)<0.1);
 // UI control -> remote API, not a second local physics state.
 const slider=page.locator('input[data-agent-param="gravityMps2"]');
 await slider.evaluate(el=>{el.value="7";el.dispatchEvent(new Event("input",{bubbles:true}));});
 await page.waitForFunction(()=>document.querySelector("#mcp-status")?.textContent.includes("revision 2"),null,{timeout:8000});
 assert.equal(doc.checkpoint.parameters.gravityMps2,7);
 assert.equal(doc.checkpoint.timeSeconds,0,"Parameter edit resets scientific remote model");
 assert.ok(mutations>0);
 assert.equal(await page.locator("body").innerText().then(s=>s.includes(token)),false);
 await page.screenshot({path:"artifacts/html-standard-browser/remote-mobile.png",fullPage:true});
 await page.close();
 assert.deepEqual(errors,[],"Browser JavaScript errors");
 console.log("HTML FIVE-GATE REAL BROWSER: 360/600/900/1280 responsive, WebM landscape/shorts, remote HTTP/MCP state/commands PASS");
}finally{await browser.close();}
