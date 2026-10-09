import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs";
const base=process.env.ESBIKO_TEST_BASE_URL||"http://127.0.0.1:4173";
const labs=[
  {id:"evolution-of-life",name:"evolution",tools:"esbiko_evolution",mark:".timeline-workspace",param:"&mcp.subjectId=cats&mcp.stageIndex=2"},
  {id:"physics.challenges.moon-lander",name:"lander",tools:"esbiko_lander",mark:".MuiBox-root",param:""},
  {id:"physics.optics.lens-mirror-3d",name:"optics3d",tools:"esbiko_optics3d",mark:"[data-esbiko-optics3d-stage]",param:"&mcp.objDistance=300&mcp.objHeight=40"},
  {id:"earth-science.geology.plate-tectonics",name:"geology",tools:"esbiko_geology",mark:"[data-esbiko-geology-stage]",param:"&mcp.sliceDepth=3&mcp.showClouds=false"},
  {id:"astronomy.space.satellites-telescopes",name:"satellites",tools:"esbiko_satellites",mark:"[data-esbiko-satellites-stage]",param:"&mcp.timeScale=120&mcp.zoom=0.1"},
];
fs.mkdirSync("artifacts/final-six",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--disable-dev-shm-usage"]});
try{
 for(const lab of labs){
  for(const width of [360,600,900,1440]){
   const page=await browser.newPage({viewport:{width,height:740},reducedMotion:"reduce"});
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e)));
   await page.addInitScript(()=>{
    window.__mcpTools={};
    Object.defineProperty(document,"modelContext",{configurable:true,value:{
      registerTool:async tool=>{window.__mcpTools[tool.name]=tool;}
    }});
   });
   await page.goto(base+"/experiments/"+lab.id+"/run?embed=mcp-app"+lab.param,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator(lab.mark).first().waitFor({state:"visible",timeout:35000});
   await page.waitForFunction(p=>Boolean(window.__mcpTools?.[p+"_get_state"]),lab.tools,{timeout:35000});
   const dimensions=await page.evaluate(selector=>{
      const el=document.querySelector(selector);
      const r=el?.getBoundingClientRect();
      return {stage:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,
        bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth};
   },lab.mark);
   assert(dimensions.stage && dimensions.stage.width>150,"Missing stage "+JSON.stringify(dimensions));
   assert(dimensions.bodyWidth<=width+10,"Horizontal overflow "+JSON.stringify(dimensions));
   const call=async (method,input={})=>page.evaluate(async ([name,input])=>
      JSON.parse(await window.__mcpTools[name].execute(input)),[lab.tools+"_"+method,input]);
   const state=await call("get_state");
   assert.equal(state.ok,true,JSON.stringify(state));
   if(width===360){
    switch(lab.name){
      case "evolution":{
        assert.equal(state.data.state.subjectId,"cats");
        assert.equal(state.data.state.stageIndex,2);
        assert.equal((await call("configure",{subjectId:"horses"})).ok,true);
        await page.waitForTimeout(80);
        assert.equal((await call("configure",{stageIndex:4})).ok,true);
        await page.waitForTimeout(80);
        assert.equal((await call("get_state")).data.state.stageIndex,4);
        assert.equal((await call("configure",{subjectId:"bad"})).ok,false);
        assert.equal((await call("configure",{stageIndex:999})).ok,false);
        assert.equal((await call("set_playback",{playing:true})).ok,true);
        assert.equal((await call("reset")).ok,true);
        break;
      }
      case "gearbox":{
        assert.equal(state.data.state.params.inputRPM,1800);
        assert.equal((await call("configure",{inputRPM:2100,gearRatio:3,turning:true,turnFactor:0.3,diffLocked:false})).ok,true);
        await page.waitForTimeout(80);
        const out=(await call("get_state")).data.state.outputs;
        assert(Math.abs(out.gearboxOutRPM-700)<0.001);
        assert(Math.abs(out.rightWheelRPM)>Math.abs(out.leftWheelRPM));
        assert.equal((await call("configure",{gearRatio:0})).ok,false);
        assert.equal((await call("set_playback",{running:true})).ok,true);
        assert.equal((await call("reset")).ok,true);
        break;
      }
      case "lander":{
        assert(state.data.state.physics);
        assert.equal((await call("configure",{rotateLeft:true})).ok,true);
        assert.equal((await call("configure",{rotateLeft:false,mainThrust:true})).ok,true);
        assert.equal((await call("configure",{mainThrust:"yes"})).ok,false);
        assert.equal((await call("set_playback",{running:false})).ok,true);
        assert.equal((await call("reset")).ok,true);
        break;
      }
      case "optics3d":{
        assert.equal(state.data.state.objDistance,300);
        assert.equal((await call("configure",{lensType:"concave-mirror",objDistance:220,objHeight:50,objType:"arrow",objSide:"right"})).ok,true);
        await page.waitForTimeout(80);
        assert.equal((await call("get_state")).data.state.objType,"arrow");
        assert.equal((await call("configure",{focalLength:1000})).ok,false);
        assert.equal((await call("reset")).ok,true);
        break;
      }
      case "geology":{
        assert.equal(state.data.state.sliceDepth,3);
        assert.equal(state.data.state.showClouds,false);
        assert.equal((await call("configure",{showNight:true,scaleMode:"schematic",sliceDepth:4})).ok,true);
        await page.waitForTimeout(80);
        assert.equal((await call("get_state")).data.state.scaleMode,"schematic");
        assert.equal((await call("configure",{sliceDepth:9})).ok,false);
        assert.equal((await call("reset")).ok,true);
        break;
      }
      case "satellites":{
        assert.equal(state.data.state.settings.timeScale,120);
        const added=await call("add_preset",{preset:"HUBBLE"});
        assert.equal(added.ok,true,JSON.stringify(added));
        await page.waitForTimeout(80);
        const obj=(await call("get_state")).data.state.objects.find(o=>o.type==="HUBBLE");
        assert(obj);
        assert.equal((await call("select",{id:obj.id})).ok,true);
        assert.equal((await call("set_visibility",{id:obj.id,visible:false})).ok,true);
        assert.equal((await call("remove",{id:obj.id})).ok,true);
        assert.equal((await call("configure",{dt:-10})).ok,false);
        assert.equal((await call("set_playback",{running:false})).ok,true);
        assert.equal((await call("reset")).ok,true);
        break;
      }
    }
   }
   if(lab.name!=="lander")await page.screenshot({path:"artifacts/final-six/"+lab.name+"-"+width+".png",timeout:40000,animations:"disabled"});
   assert.deepEqual(errors,[],"JS exceptions: "+errors.join("\n"));
   console.log("FINAL SIX MCP RESPONSIVE PASS",lab.name,width);
   await page.close();
  }
 }
}finally{await browser.close();}
