import assert from "node:assert/strict";
import { createHtmlSimulationRuntime,validateHtmlParameters } from "../src/platform/html-simulation/createHtmlSimulationRuntime.js";
import { createHtmlCanvasRecorder } from "../src/platform/html-simulation/createHtmlCanvasRecorder.js";
import { constantAccelerationStep,uniformGravity } from "../src/esbiko-physics/index.js";

const schema = {type:"object",properties:{
  velocityXMps:{type:"number",minimum:-100,maximum:100},
  gravityMps2:{type:"number",minimum:0,maximum:20},
  rodCount:{type:"integer",minimum:1,maximum:4},
  trajectory:{type:"array",minItems:2,maxItems:4,items:{type:"boolean"}},
},additionalProperties:false};
const defaults = {velocityXMps:20,gravityMps2:9.81,rodCount:2,trajectory:[true,true]};
assert.throws(()=>validateHtmlParameters({velocityXMps:NaN},schema),/Invalid/);
assert.throws(()=>validateHtmlParameters({gravityMps2:Infinity},schema),/Invalid/);
assert.throws(()=>validateHtmlParameters({extra:1},schema),/Unknown/);
assert.throws(()=>validateHtmlParameters({rodCount:1.5},schema),/Invalid/);
assert.throws(()=>validateHtmlParameters({trajectory:[true,1]},schema),/Invalid/);
assert.deepEqual(validateHtmlParameters({trajectory:[true,false,true]},schema),{trajectory:[true,false,true]});

let frameNext=1,frames=new Map(),draws=0,conf={...defaults};
let physical={position:[0,0,0],velocity:[20,0,0]};
let corruptNext=false;
const fakeWin={
 devicePixelRatio:3,
 requestAnimationFrame(callback){const id=frameNext++;frames.set(id,callback);return id;},
 cancelAnimationFrame(id){frames.delete(id);},
};
const doc={defaultView:fakeWin};
const canvas={
 ownerDocument:doc,clientWidth:600,clientHeight:360,width:0,height:0,
 getContext(){return {setTransform(){},clearRect(){}};},
 getBoundingClientRect(){return {width:600,height:360};},
};
const model={
 configure(p){conf={...p};},
 reset(p){conf={...p};physical={position:[0,0,0],velocity:[p.velocityXMps,0,0]};},
 step(dt){
   if (corruptNext) {physical.position[0]=NaN;corruptNext=false;return;}
   physical=constantAccelerationStep(physical,dt,uniformGravity(conf.gravityMps2));
 },
 snapshot(){return {...physical,position:[...physical.position],velocity:[...physical.velocity]};},
};
const registered=[];
const modelContext={
 async registerTool(tool,{signal}) {
   assert.ok(signal && !signal.aborted);
   registered.push(tool);
 },
};
const messages=[];
const runtime=createHtmlSimulationRuntime({
 id:"physics.test.html-standard",canvas,engine:model,parameterSchema:schema,defaults,
 draw(_ctx,state){draws++;assert.equal(state.simulationId,"physics.test.html-standard");},
 video:false,modelContext,onStatus:s=>messages.push(s.running),
});
assert.equal(canvas.width,1200); // DPR cap 2
assert.equal(canvas.height,720);
assert.equal(runtime.getState().parameters.rodCount,2);
assert.ok(draws>=1);
const registration=await runtime.registerWebMcp("standard_test");
assert.equal(registration.status,"ready");
assert.equal(registered.length,7);

const tool=name=>registered.find(t=>t.name==="standard_test_"+name);
const invoke=async(name,input={})=>JSON.parse(await tool(name).execute(input));
assert.equal((await invoke("get_capabilities")).data.video,false);
assert.equal((await invoke("get_state")).data.parameters.velocityXMps,20);
assert.equal((await invoke("configure",{velocityXMps:12,trajectory:[false,true]})).ok,true);
assert.equal(runtime.getState().parameters.velocityXMps,12);
assert.deepEqual(runtime.getState().parameters.trajectory,[false,true]);
assert.equal((await invoke("configure",{gravityMps2:100})).ok,false);
assert.equal(runtime.getState().parameters.gravityMps2,9.81);
assert.equal((await invoke("configure",{unlisted:4})).ok,false);
assert.equal((await invoke("set_camera",{zoom:2.3,x:17})).ok,true);
assert.equal(runtime.getState().camera.zoom,2.3);
assert.equal((await invoke("set_camera",{zoom:0})).ok,false);
runtime.fitCamera();
assert.equal(runtime.getState().camera.zoom,1);
await invoke("set_playback",{running:true});
for(let i=0;i<=500;i++){
  const queue=[...frames.values()];frames.clear();
  queue.forEach(fn=>fn(i*16));
}
assert.equal(runtime.getState().running,true);
assert.ok(runtime.getState().elapsedSeconds>7.0);
assert.ok(Math.abs(runtime.getState().physics.position[0]-20*runtime.getState().elapsedSeconds)<0.5);
assert.ok(Math.abs(runtime.getState().physics.position[1]+0.5*9.81*runtime.getState().elapsedSeconds**2)<0.5);
await invoke("set_playback",{running:false});
const paused=runtime.getState().elapsedSeconds;
assert.equal(frames.size,0);
assert.equal(runtime.getState().elapsedSeconds,paused);
runtime.reset();
assert.equal(runtime.getState().elapsedSeconds,0);
assert.equal(runtime.getState().parameters.velocityXMps,12);
assert.equal(runtime.getState().physics.position[0],0);
corruptNext=true;
runtime.play();
for(let i=0;i<=4;i++){
  const queue=[...frames.values()];frames.clear();queue.forEach(fn=>fn(i*16));
}
assert.equal(runtime.getState().running,false);
assert.equal(runtime.getState().physics,null);
assert.equal(runtime.getState().error.code,"SIMULATION_NUMERICAL_ERROR");
runtime.reset();
assert.equal(runtime.getState().error,null);
assert.ok(Number.isFinite(runtime.getState().physics.position[0]));
runtime.dispose();
assert.equal(frames.size,0);
assert.throws(()=>runtime.getState(),/DISPOSED/);

// Browser-like media shim verifies the HTML-only recorder lifecycle without a webcam.
let stoppedTracks=0, clickCount=0;
class FakeMediaRecorder {
  static isTypeSupported(type) { return type==="video/webm"; }
  constructor(){this.state="inactive";}
  start(){this.state="recording";}
  stop(){
    this.state="inactive";
    this.ondataavailable?.({data:new Blob(["video bytes"],{type:"video/webm"})});
    this.onstop?.();
  }
}
const mediaWindow={
  Blob,MediaRecorder:FakeMediaRecorder,requestAnimationFrame:()=>123,cancelAnimationFrame:()=>{},
  URL:{createObjectURL:()=>"blob:example",revokeObjectURL:()=>{}},
};
const videoDocument={
  defaultView:mediaWindow,body:{appendChild:()=>{}},
  createElement(tag) {
    if(tag==="canvas")return {
      width:0,height:0,getContext:()=>({fillRect(){},drawImage(){}}),
      captureStream:()=>({getTracks:()=>[{stop(){stoppedTracks++;}}]}),
    };
    if(tag==="a")return {click(){clickCount++;},remove(){}};
    throw new Error(tag);
  },
};
const videoCanvas={ownerDocument:videoDocument,width:800,height:500,captureStream:()=>{}};
const vr=createHtmlCanvasRecorder(videoCanvas);
assert.equal(vr.getStatus().status,"idle");
assert.equal(vr.start("shorts").status,"recording");
assert.equal(vr.stop().status,"ready");
assert.equal(vr.getStatus().file.fileName,"esbiko-simulation-shorts.webm");
assert.ok(vr.getStatus().file.bytes>0);
assert.equal(vr.download().downloadRequested,true);
assert.equal(clickCount,1);
assert.equal(stoppedTracks,1);
assert.equal(vr.start("landscape").status,"recording");
assert.equal(vr.stop().status,"ready");
vr.dispose();
assert.throws(()=>vr.start("shorts"),/DISPOSED/);
console.log("HTML standard: shared model, schema, UI/WebMCP state, camera, time, numerical recovery and disposal OK");
