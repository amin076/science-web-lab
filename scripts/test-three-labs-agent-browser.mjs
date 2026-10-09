import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base=process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173";
const labs=[
 {id:"physics.optics.lens-mirror-2d",tag:"optics",stage:"[data-esbiko-optics-stage]",panel:"[data-esbiko-optics-controls]",tool:"esbiko_optics2d"},
 {id:"physics.electricity.circuits",tag:"circuit",stage:"[data-esbiko-circuit-stage]",panel:".circuit-root aside",tool:"esbiko_circuit"},
 {id:"creative.patterns.ambient-pattern-studio",tag:"ambient",stage:"[data-esbiko-ambient-stage]",panel:"[data-esbiko-ambient-controls]",tool:"esbiko_ambient"},
];
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"]});
fs.mkdirSync("artifacts/three-agent-ready",{recursive:true});
try {
 for(const lab of labs){
  for(const width of [360,600,900,1440]){
   const page=await browser.newPage({viewport:{width,height:720}});
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e)));
   await page.addInitScript(()=>{
    window.__labTools={};
    Object.defineProperty(document,"modelContext",{
      configurable:true,value:{registerTool:async tool=>{window.__labTools[tool.name]=tool;}}
    });
   });
   const url=base+"/experiments/"+lab.id+"/run?embed=mcp-app"+
     (lab.tag==="optics"?"&mcp.objDistance=300&mcp.objHeight=40":
      lab.tag==="ambient"?"&mcp.speed=3&mcp.pattern=aurora":lab.tag==="circuit"&&width===600?"&mcp.componentType=resistor&mcp.x=120&mcp.y=80":"");
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator(lab.stage).waitFor({state:"visible",timeout:30000});
   await page.waitForFunction(tool=>Object.keys(window.__labTools||{}).some(x=>x.startsWith(tool)),lab.tool,{timeout:30000});
   const layout=await page.evaluate(({stage,panel})=>{
    const rect=sel=>{
     const r=document.querySelector(sel)?.getBoundingClientRect();
     return r?{top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null;
    };
    return {stage:rect(stage),panel:rect(panel),scroll:document.documentElement.scrollWidth,viewport:innerWidth};
   },lab);
   assert(layout.stage&&layout.panel,"Missing stage/panel "+JSON.stringify(layout));
   assert(layout.stage.width>(width<1280?width*0.75:(lab.tag==="circuit"?width*0.5:width-460)),"Stage squeezed "+JSON.stringify(layout));
   assert(layout.scroll<=width+5,"Horizontal overflow "+JSON.stringify(layout));
   if(width<1280)assert(layout.panel.top>=layout.stage.bottom-2,"Panel overlays stage "+JSON.stringify(layout));
   const call=async(name,input={})=>page.evaluate(async ([name,input])=>{
      const raw=await window.__labTools[name].execute(input);
      return JSON.parse(raw);
    },[lab.tool+"_"+name,input]);
   if(width===360){
    if(lab.tag==="optics"){
      const initial=await call("get_state");
      assert.equal(initial.ok,true,JSON.stringify(initial));
      assert.equal(initial.data.objDistance,300);
      const configured=await call("configure",{lensType:"concave-mirror",objDistance:200,objHeight:50,objSide:"right",objType:"arrow",focalLength:140});
      assert.equal(configured.ok,true,JSON.stringify(configured));
      const after=await call("get_state");
      assert.equal(after.data.lensType,"concave-mirror");
      assert.equal(after.data.objType,"arrow");
      assert.equal(after.data.objSide,"right");
      assert.equal(after.data.objHeight,50);
      assert(Number.isFinite(after.data.optics.m));
      assert.equal((await call("configure",{focalLength:-4})).ok,false);
      assert.equal((await call("configure",{fake:12})).ok,false);
      assert.equal((await call("reset")).ok,true);
      await page.waitForTimeout(70);
      assert.equal((await call("get_state")).data.objDistance,250);
    } else if(lab.tag==="circuit"){
      const initial=await call("get_state");
      assert.equal(initial.ok,true,JSON.stringify(initial));
      assert.equal(initial.data.components.length,0);
      assert.equal((await call("set_playback",{running:true})).ok,false);
      const g=await call("add_component",{componentType:"ground",x:80,y:110});
      assert.equal(g.ok,true,JSON.stringify(g));
      await page.waitForTimeout(60);
      const b=await call("add_component",{componentType:"battery",x:170,y:135});
      assert.equal(b.ok,true,JSON.stringify(b));
      await page.waitForTimeout(60);
      const state=await call("get_state");
      assert(state.data.components.some(c=>c.id===g.data.id));
      assert(state.data.components.some(c=>c.id===b.data.id));
      assert.equal((await call("update_component",{id:b.data.id,props:{voltage:12}})).ok,true);
      await page.waitForTimeout(60);
      const updated=await call("get_state");
      assert.equal(updated.data.components.find(c=>c.id===b.data.id).props.voltage,12);
      const edge=await call("connect",{fromId:g.data.id,toId:b.data.id,fromTerminal:"left",toTerminal:"right"});
      assert.equal(edge.ok,true,JSON.stringify(edge));
      await page.waitForTimeout(60);
      assert.equal((await call("get_state")).data.connections.length,1);
      assert.equal((await call("select",{id:b.data.id})).ok,true);
      assert.equal((await call("rotate",{id:b.data.id})).ok,true);
      assert.equal((await call("open_lab",{lab:"resistor"})).ok,true);
      assert.equal((await call("close_lab")).ok,true);
      assert.equal((await call("delete_connection",{id:edge.data.id})).ok,true);
      await page.waitForTimeout(80);
      assert.equal((await call("get_state")).data.connections.length,0);
      assert.equal((await call("connect",{fromId:g.data.id,toId:b.data.id,fromTerminal:"left",toTerminal:"right"})).ok,true);
      assert.equal((await call("set_playback",{running:true})).ok,true);
      await page.waitForTimeout(120);
      assert.equal((await call("get_state")).data.isSimulating,true);
      assert.equal((await call("reset")).ok,true);
      await page.waitForTimeout(60);
      assert.equal((await call("get_state")).data.isSimulating,false);
      assert.equal((await call("clear")).ok,true);
      await page.waitForTimeout(60);
      assert.equal((await call("get_state")).data.components.length,0);
      assert.equal((await call("add_component",{componentType:"fake"})).ok,false);
    } else {
      const initial=await call("get_state");
      assert.equal(initial.ok,true,JSON.stringify(initial));
      assert.equal(initial.data.settings.pattern,"aurora");
      assert.equal(initial.data.settings.speed,3);
      assert.equal((await call("configure",{pattern:"tunnel",palette:"ember",speed:5,particles:100})).ok,true);
      await page.waitForTimeout(80);
      const configured=await call("get_state");
      assert.equal(configured.data.settings.pattern,"tunnel");
      assert.equal(configured.data.settings.speed,5);
      assert.equal((await call("configure",{speed:200})).ok,false);
      assert.equal((await call("configure",{fake:1})).ok,false);
      assert.equal((await call("set_playback",{playing:false})).ok,true);
      await page.waitForTimeout(50);
      assert.equal((await call("get_state")).data.isPlaying,false);
      assert.equal((await call("reset")).ok,true);
      assert.equal((await call("randomize")).ok,true);
      assert.equal((await call("record",{command:"invalid"})).ok,false);
      const video=await call("video_status");
      assert.equal(video.ok,true,JSON.stringify(video));
      assert.equal(video.data.recording,false);
      assert.equal((await call("video_download",{mode:"landscape"})).ok,false);
    }
   }
   if(lab.tag==="circuit" && width===600){
      const boot=await call("get_state");
      assert.equal(boot.ok,true,JSON.stringify(boot));
      assert.equal(boot.data.components.length,1);
      assert.equal(boot.data.components[0].type,"resistor");
      assert.equal(boot.data.components[0].x,120);
   }
   await page.screenshot({path:"artifacts/three-agent-ready/"+lab.tag+"-"+width+".png",fullPage:lab.tag!=="ambient",timeout:45000,animations:"disabled"});
   assert.deepEqual(errors,[],"Browser JS errors "+lab.id+" "+errors.join("\n"));
   console.log("THREE LABS AGENT RESPONSIVE PASS",lab.id,width);
   await page.close();
  }
 }
} finally {await browser.close();}
