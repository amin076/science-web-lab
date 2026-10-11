import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright";
import {createControlDocument,executeSimulationCommand,exposeControlState}
 from "../functions/control/controlCore.mjs";

const serverBase="http://127.0.0.1:4173";
const sessionId="a1111111-b222-4333-8444-c55555555555";
const token="a".repeat(64);
let doc=createControlDocument({paneCount:2,p1_rodCount:3,p2_rodCount:3,
 p2_initialAngleDeg1:155.2});
let commands=0;
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:780,height:820}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/api/v1/control/sessions/**",async(route)=>{
  const request=route.request();
  const headers=request.headers();
  if(headers["x-esbiko-control-token"]!==token)
   return route.fulfill({status:403,contentType:"application/json",
    body:JSON.stringify({ok:false,error:"INVALID_SESSION_TOKEN"})});
  const url=new URL(request.url());
  if(request.method()==="GET"){
   if(url.searchParams.get("since")===String(doc.revision))
    return route.fulfill({status:200,contentType:"application/json",
      body:JSON.stringify({ok:true,unchanged:true,revision:doc.revision})});
   return route.fulfill({status:200,contentType:"application/json",
    body:JSON.stringify({ok:true,sessionId,revision:doc.revision,
     checkpoint:doc.checkpoint,camera:doc.camera,...exposeControlState(doc)})});
  }
  if(request.method()==="POST"){
   const input=JSON.parse(request.postData());
   commands++;
   try{
    const result=executeSimulationCommand(doc,input);
    doc=result.document;
    return route.fulfill({status:200,contentType:"application/json",
     body:JSON.stringify({ok:true,revision:doc.revision,result:result.result})});
   }catch(e){
    return route.fulfill({status:400,contentType:"application/json",
     body:JSON.stringify({ok:false,error:e.code||"INVALID_COMMAND"})});
   }
  }
  return route.fulfill({status:405,body:"Method not allowed"});
 });
 const url=serverBase+"/examples/compound-pendulum-comparison/index.html?embed=mcp-app&remoteSessionId="+sessionId;
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:40000});
 await page.locator(".cpc-root canvas").waitFor();
 await page.evaluate(({sessionId,token})=>window.postMessage({
  type:"esbiko-control-session-v1",sessionId,token},"*"),{sessionId,token});
 await page.waitForFunction(()=>
  document.querySelector('[data-compare="mcp-status"]')?.textContent?.includes("ChatGPT remote session"),null,{timeout:15000});
 assert.ok(!page.url().includes(token));
 assert.equal(await page.evaluate(()=>window.__compoundComparison.api.getState().parameters.p2_initialAngleDeg1),155.2);
 const tick=executeSimulationCommand(doc,{action:"advance",seconds:.5});
 doc=tick.document;
 await page.waitForFunction(()=>
  window.__compoundComparison.api.getState().elapsedSeconds>.4,null,{timeout:12000});
 const after=await page.evaluate(()=>window.__compoundComparison.api.getState());
 assert.equal(after.physics.pendulums.length,2);
 assert.ok(after.physics.comparisons[0].tipSeparationM>0);
 await page.selectOption('[data-compare="selected"]',"2");
 await page.waitForFunction(()=>document.querySelector('[data-agent-param="p2_rodCount"]'));
 await page.locator('[data-compare="controls"] [data-field="rodCount"]').selectOption("2");
 await page.waitForFunction(()=>window.__compoundComparison.api.getState().parameters.p2_rodCount===2,null,{timeout:12000});
 assert.equal(doc.checkpoint.parameters.p2_rodCount,2);
 assert.equal(doc.checkpoint.parameters.p1_rodCount,3);
 assert.ok(commands>=1);
 const text=await page.locator("body").innerText();
 assert.ok(!text.includes(token));
 assert.deepEqual(errors,[]);
 fs.mkdirSync("artifacts/control-bridge",{recursive:true});
 await page.screenshot({path:"artifacts/control-bridge/remote-compound-pendulum.png"});
 console.log("MCP App remote session -> browser checkpoint -> agent advance -> UI command -> same HTTP API PASS");
 await page.close();
}finally{await browser.close();}
