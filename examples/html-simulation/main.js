import { constantAccelerationStep, uniformGravity } from "../../src/esbiko-physics/index.js";
import { createHtmlSimulationRuntime } from "../../src/platform/html-simulation/createHtmlSimulationRuntime.js";

// Demonstration model only. Real simulations import their domain model from esbiko-physics.
// No scientific formula is duplicated in the HTML adapter.
const controls = {
  startXM: {type:"number",minimum:-10,maximum:10,default:0,step:0.5,unit:"m",label:"Initial x"},
  startYM: {type:"number",minimum:0,maximum:30,default:2,step:0.5,unit:"m",label:"Initial y"},
  velocityXMps: {type:"number",minimum:-30,maximum:40,default:20,step:1,unit:"m/s",label:"Initial vx"},
  velocityYMps: {type:"number",minimum:-30,maximum:40,default:20,step:1,unit:"m/s",label:"Initial vy"},
  gravityMps2: {type:"number",minimum:0,maximum:20,default:9.81,step:0.01,unit:"m/s²",label:"Gravity"},
};
const parameterSchema = {
  type:"object",additionalProperties:false,
  properties:Object.fromEntries(Object.entries(controls).map(([k,{type,minimum,maximum}]) =>
    [k,{type,minimum,maximum}])),
};
const defaults = Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,v.default]));
let configuration = {...defaults};
let state = {position:[0,2,0],velocity:[20,20,0]};
let trail = [];

const engine = {
  configure(params) { configuration = {...params}; },
  reset(params) {
    configuration = {...params};
    state = {
      position:[configuration.startXM,configuration.startYM,0],
      velocity:[configuration.velocityXMps,configuration.velocityYMps,0],
    };
    trail = [state.position.slice(0,2)];
  },
  step(dtSeconds) {
    state = constantAccelerationStep(state,dtSeconds,uniformGravity(configuration.gravityMps2));
    if (trail.length === 0 || Math.hypot(
      state.position[0] - trail[trail.length-1][0],
      state.position[1] - trail[trail.length-1][1],
    ) >= 0.05) {
      trail.push(state.position.slice(0,2));
      if (trail.length > 2000) trail.shift();
    }
  },
  snapshot() {
    return {position:[...state.position],velocity:[...state.velocity],trail:trail.map(p=>[...p])};
  },
};

function draw(ctx, snapshot, {width,height,camera}) {
  ctx.fillStyle="#071626"; ctx.fillRect(0,0,width,height);
  const scale = 14 * camera.zoom;
  const originX = width * 0.23 + camera.x;
  const originY = height * 0.72 + camera.y;
  const px = x => originX + x*scale, py = y => originY - y*scale;
  ctx.strokeStyle="#1b4158";ctx.lineWidth=1;
  const interval=5;
  for(let x=Math.floor((-originX/scale)/interval)*interval;x<(width-originX)/scale;x+=interval){
    const sx=px(x);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,height);ctx.stroke();
  }
  for(let y=Math.floor((originY-height)/scale/interval)*interval;y<originY/scale;y+=interval){
    const sy=py(y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(width,sy);ctx.stroke();
  }
  ctx.strokeStyle="#66899e";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,originY);ctx.lineTo(width,originY);ctx.stroke();
  const route=snapshot.physics.trail;
  if(route.length>1) {
    ctx.strokeStyle="#ffca56";ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<route.length;i++)i?ctx.lineTo(px(route[i][0]),py(route[i][1])):ctx.moveTo(px(route[i][0]),py(route[i][1]));
    ctx.stroke();
  }
  const [x,y] = snapshot.physics.position;
  ctx.fillStyle="#41d8ff";ctx.beginPath();ctx.arc(px(x),py(y),8,0,2*Math.PI);ctx.fill();
  ctx.strokeStyle="#b9f6ff";ctx.lineWidth=2;ctx.stroke();
}
const $ = id => document.getElementById(id);
let runtime;
let lastUiAt = 0;
function updateUI(s) {
  const now=performance.now();
  if (now-lastUiAt<70 && s.running) return;
  lastUiAt=now;
  $("time").textContent=s.elapsedSeconds.toFixed(2)+" s";
  if (!s.physics) { $("status").textContent=s.error?.message || "Invalid physical state — reset"; return; }
  $("x").textContent=s.physics.position[0].toFixed(2)+" m";
  $("y").textContent=s.physics.position[1].toFixed(2)+" m";
  $("vx").textContent=s.physics.velocity[0].toFixed(2)+" m/s";
  $("vy").textContent=s.physics.velocity[1].toFixed(2)+" m/s";
  $("status").textContent=s.error?.message || (s.running?"Simulation running":"Simulation paused");
  $("play").disabled=s.running;
  $("pause").disabled=!s.running;
}
runtime=createHtmlSimulationRuntime({
  id:"physics.mechanics.html-reference-projectile",
  canvas:$("simulation-canvas"),parameterSchema,defaults,engine,draw,
  onStatus:updateUI,
});
for(const [key,meta] of Object.entries(controls)){
  const label=document.createElement("label");
  const heading=document.createElement("span");
  const name=document.createElement("span");name.textContent=meta.label;
  const output=document.createElement("output");output.textContent=meta.default+" "+meta.unit;output.id="out-"+key;
  heading.append(name,output);
  const slider=document.createElement("input");
  slider.type="range";slider.min=meta.minimum;slider.max=meta.maximum;
  slider.step=meta.step;slider.value=meta.default;slider.setAttribute("aria-label",meta.label);
  slider.dataset.agentParam=key;
  slider.addEventListener("input",()=>{
    try{
      const value=Number(slider.value);
      runtime.configure({[key]:value});
      output.textContent=value+" "+meta.unit;
    }catch(e){$("status").textContent=e.message;}
  });
  label.append(heading,slider);
  $("sliders").append(label);
}
function safely(fn) {try{fn();}catch(e){$("status").textContent=e.message;}}
$("play").onclick=()=>safely(()=>runtime.play());
$("pause").onclick=()=>safely(()=>runtime.pause());
$("reset").onclick=()=>safely(()=>runtime.reset());
$("fit").onclick=()=>safely(()=>runtime.fitCamera());
$("record-landscape").onclick=()=>safely(()=>runtime.startVideo({mode:"landscape"}));
$("record-shorts").onclick=()=>safely(()=>runtime.startVideo({mode:"shorts"}));
$("stop-record").onclick=()=>safely(()=>runtime.stopVideo());
$("download-record").onclick=()=>safely(()=>runtime.downloadVideo());
let drag=null;
const canvas=$("simulation-canvas");
canvas.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{
  if(!drag)return;
  const camera=runtime.getState().camera;
  safely(()=>runtime.setCamera({x:camera.x+e.clientX-drag.x,y:camera.y+e.clientY-drag.y}));
  drag={x:e.clientX,y:e.clientY};
});
canvas.addEventListener("pointerup",()=>drag=null);
canvas.addEventListener("pointercancel",()=>drag=null);
canvas.addEventListener("wheel",e=>{
  e.preventDefault();
  const camera=runtime.getState().camera;
  safely(()=>runtime.setCamera({zoom:Math.min(8,Math.max(0.2,camera.zoom*(e.deltaY>0?0.9:1.1)))}));
},{passive:false});
const recorderPoll=window.setInterval(()=>{
  const v=runtime.getVideoStatus();
  $("recording-status").textContent="Recording: "+v.status+(v.file?" · "+Math.round(v.file.bytes/1024)+" KB":"")+(v.error?" · "+v.error.message:"");
  $("stop-record").disabled=v.status!=="recording";
  $("download-record").disabled=v.status!=="ready";
  $("record-landscape").disabled=["recording","processing"].includes(v.status);
  $("record-shorts").disabled=["recording","processing"].includes(v.status);
},250);
runtime.registerWebMcp("esbiko_html_reference").then(r=>{
  $("mcp-status").textContent=r.status==="ready"?
    "WebMCP ready: "+r.registered.length+" controls":"WebMCP "+r.status+" (simulation remains fully usable)";
}).catch(e=>{$("mcp-status").textContent="WebMCP unavailable: "+e.message;});
window.addEventListener("pagehide",()=>{clearInterval(recorderPoll);runtime.dispose();},{once:true});
