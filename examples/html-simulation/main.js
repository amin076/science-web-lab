import {HTML_REFERENCE_ID,HTML_REFERENCE_DEFAULTS,HTML_REFERENCE_SCHEMA,createHtmlReferenceProjectile} from "../../src/esbiko-physics/mechanics/htmlReferenceProjectile.js";
import { createHtmlSimulationRuntime } from "../../src/platform/html-simulation/createHtmlSimulationRuntime.js";

// Demonstration model only. Real simulations import their domain model from esbiko-physics.
// No scientific formula is duplicated in the HTML adapter.
// Labels and slider increments are presentational; bounds/defaults come from the model.
const labels={
 startXM:{step:.5,label:"Initial x"},startYM:{step:.5,label:"Initial y"},
 velocityXMps:{step:1,label:"Initial vx"},velocityYMps:{step:1,label:"Initial vy"},
 gravityMps2:{step:.01,label:"Gravity"},
};
const controls=Object.fromEntries(Object.entries(labels).map(([key,meta])=>[
 key,{...HTML_REFERENCE_SCHEMA.properties[key],default:HTML_REFERENCE_DEFAULTS[key],...meta},
]));
const parameterSchema=HTML_REFERENCE_SCHEMA;
const defaults=HTML_REFERENCE_DEFAULTS;
// Browser, HTTP and MCP sessions all use this same pure scientific model.
const engine=createHtmlReferenceProjectile();

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
let remoteActive=false;
function reflectControls(s){
 for(const [key,meta] of Object.entries(controls)){
  const slider=document.querySelector('[data-agent-param="'+key+'"]');
  if(slider&&document.activeElement!==slider)slider.value=s.parameters[key];
  const output=$("out-"+key);
  if(output)output.textContent=s.parameters[key]+" "+meta.unit;
 }
}

function updateUI(s) {
  const now=performance.now();
  if (now-lastUiAt<70 && s.running) return;
  lastUiAt=now;
  $("time").textContent=s.elapsedSeconds.toFixed(2)+" s";
  reflectControls(s);
  if (!s.physics) { $("status").textContent=s.error?.message || "Invalid physical state — reset"; return; }
  $("x").textContent=s.physics.position[0].toFixed(2)+" m";
  $("y").textContent=s.physics.position[1].toFixed(2)+" m";
  $("vx").textContent=s.physics.velocity[0].toFixed(2)+" m/s";
  $("vy").textContent=s.physics.velocity[1].toFixed(2)+" m/s";
  $("status").textContent=s.error?.message || (remoteActive?"Remote API session · advance using MCP tools":(s.running?"Simulation running":"Simulation paused"));
  $("play").disabled=s.running;
  $("pause").disabled=!s.running;
}
runtime=createHtmlSimulationRuntime({
  id:HTML_REFERENCE_ID,
  canvas:$("simulation-canvas"),parameterSchema,defaults,engine,draw,
  onStatus:updateUI,
});
// Honor server-validated MCP parameters on open_science_simulation as well as local URLs.
const initialMcp={};
const query=new URLSearchParams(location.search);
for(const key of Object.keys(parameterSchema.properties)){
 const value=query.get("mcp."+key);
 if(value!==null&&value.trim()!=="")initialMcp[key]=Number(value);
}
if(Object.keys(initialMcp).length){
 try{runtime.configure(initialMcp);}
 catch(error){$("status").textContent="Invalid MCP initial settings: "+error.message;}
}
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
    const value=Number(slider.value);
    safely(()=>runtime.configure({[key]:value}));
  });
  label.append(heading,slider);
  $("sliders").append(label);
}
reflectControls(runtime.getState());
function safely(fn) {try{Promise.resolve(fn()).catch(e=>{$("status").textContent=e.message;});}catch(e){$("status").textContent=e.message;}}
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

// MCP App bridges a confidential capability token to this iframe via postMessage.
// Never put tokens in URL, DOM, logs, localStorage, or a global object.
const remoteId=new URL(location.href).searchParams.get("remoteSessionId");
let remoteTimer=null,remoteRevision=-1,remoteAttached=false;
async function acceptRemote(event){
 if(!remoteId||event.source!==window.parent||remoteAttached)return;
 const message=event.data;
 if(message?.type!=="esbiko-control-session-v1"||
    message.sessionId!==remoteId||!(/^[a-f0-9]{64}$/.test(message.token||"")))return;
 const token=message.token;
 const base="/api/v1/control/sessions/"+encodeURIComponent(remoteId);
 async function request(suffix="",init={}){
  const resp=await fetch(base+suffix,{
   ...init,cache:"no-store",
   headers:{"X-Esbiko-Control-Token":token,
    ...(init.body?{"Content-Type":"application/json"}:{})},
  });
  const body=await resp.json();
  if(!resp.ok||!body.ok)throw Error(body.error||"REMOTE_SESSION_ERROR");
  return body;
 }
 async function refresh(force=false){
  const v=await request("?checkpoint=1"+(!force&&remoteRevision>=0?"&since="+remoteRevision:""));
  if(v.unchanged||v.revision<remoteRevision)return;
  remoteRevision=v.revision;
  runtime.loadCheckpoint({checkpoint:v.checkpoint,camera:v.camera,serverRunning:v.running});
  $("mcp-status").textContent="Remote MCP + HTTP session · revision "+v.revision;
 }
 try {
  await refresh(true);
  remoteAttached=true;remoteActive=true;
  runtime.setCommandHandler(async(action,input)=>{
   try {
    const result=await request("/commands",{method:"POST",
     body:JSON.stringify({action,...input,expectedRevision:remoteRevision})});
    await refresh(true);return result.result;
   }catch(error){$("status").textContent=error.message;throw error;}
  });
  // No credential in the acknowledgement.
  if(window.parent!==window)window.parent.postMessage({
   type:"esbiko-control-attached-v1",sessionId:remoteId},"*");
  remoteTimer=setInterval(()=>refresh().catch(error=>{
   $("mcp-status").textContent="Remote session disconnected: "+error.message;
   clearInterval(remoteTimer);remoteTimer=null;
   remoteActive=false;remoteAttached=false;
   runtime.setCommandHandler(null);
  }),1250);
 }catch(error){$("mcp-status").textContent="Remote session error: "+error.message;}
}
window.addEventListener("message",acceptRemote);

window.addEventListener("pagehide",()=>{clearInterval(recorderPoll);if(remoteTimer)clearInterval(remoteTimer);window.removeEventListener("message",acceptRemote);runtime.dispose();},{once:true});
