import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser=await chromium.launch({headless:true});
try{
 for(const width of [360,600,900,1440]){
  const page=await browser.newPage({viewport:{width,height:550}});
  await page.goto((process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173")+"/experiments/evolution-of-life/run?embed=mcp-app",{waitUntil:"domcontentloaded"});
  await page.locator(".timeline-workspace").waitFor({state:"visible"});
  const data=await page.locator(".timeline-workspace").evaluate(el=>{
    const before={height:el.clientHeight,scrollHeight:el.scrollHeight,overflow:getComputedStyle(el).overflowY};
    el.scrollTop=el.scrollHeight;return {...before,after:el.scrollTop};
  });
  assert.equal(data.overflow,"auto");
  assert(data.scrollHeight>data.height+100,"No vertical scroll range: "+JSON.stringify({width,data}));
  assert(data.after>100,"Scroll is locked: "+JSON.stringify({width,data}));
  await page.locator(".timeline-controller").scrollIntoViewIfNeeded();
  assert(await page.locator(".timeline-controller").isVisible());
  console.log("EVOLUTION EMBED SCROLL PASS",width,data.after);
  await page.close();
 }
}finally{await browser.close();}
