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
  if(width<=760){
    const panels=await page.locator(".timeline-grid").evaluate(grid=>{
      const classes=["timeline-main","timeline-bottom","timeline-desktop-journeys","timeline-desktop-hud"];
      return classes.map(name=>{
        const el=grid.querySelector("."+name);
        const rect=el.getBoundingClientRect();
        return {name,top:rect.top,bottom:rect.bottom,visible:getComputedStyle(el).display!=="none",width:rect.width};
      });
    });
    assert(panels.every(panel=>panel.visible&&panel.width>0),"Missing mobile panels: "+JSON.stringify({width,panels}));
    assert(panels.every((panel,index)=>index===0||panel.top>=panels[index-1].bottom-1),"Incorrect mobile panel order: "+JSON.stringify({width,panels}));
    for(const selector of [".timeline-desktop-journeys .timeline-journey-button",".timeline-desktop-hud .timeline-details-button"]){
      await page.locator(selector).first().scrollIntoViewIfNeeded();
      assert(await page.locator(selector).first().isVisible(),"Missing usable panel controls: "+selector);
    }
    console.log("EVOLUTION MOBILE PANELS PASS",width);
  }
  console.log("EVOLUTION EMBED SCROLL PASS",width,data.after);
  await page.close();
 }
}finally{await browser.close();}
