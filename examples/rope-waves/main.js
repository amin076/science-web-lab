import {createRopeWave,ROPE_WAVE_ID,ROPE_WAVE_DEFAULTS,ROPE_WAVE_SCHEMA,ROPE_WAVE_FORMULAS} from '../../src/esbiko-physics/waves/ropeWave.js';
import {createHtmlSimulationRuntime} from '../../src/platform/html-simulation/createHtmlSimulationRuntime.js';
const root=document.getElementById('rope-lab'),$=id=>root.querySelector('#'+id),canvas=$('simulation-canvas');
let components=true,lastUI=0;
const names={lengthM:['Length',0.5],tensionN:['Tension',1],densityKgM:['Mass per length',0.01],amplitudeM:['Amplitude',0.01],frequencyHz:['Frequency',0.1],playbackRate:['Playback speed',0.1]};
for(const [key,[label,step]] of Object.entries(names)){
 const s=ROPE_WAVE_SCHEMA.properties[key],field=document.createElement('label');field.className='field';
 field.innerHTML='<span>'+label+'<output id="out-'+key+'"></output></span>';
 const input=document.createElement('input');Object.assign(input,{type:'range',min:s.minimum,max:s.maximum,step,value:ROPE_WAVE_DEFAULTS[key]});input.dataset.agentParam=key;input.setAttribute('aria-label',label);field.append(input);$('sliders').append(field);
}
const explanations={traveling:'Matched termination: the wave leaves the rope without a reflection.',free:'Free end: the returning pulse keeps its sign. The end slides vertically; its slope is zero.',fixed:'Fixed end: the returning pulse is inverted. The end stays at zero displacement.'};
function update(s){
 if(performance.now()-lastUI<80&&s.running)return;lastUI=performance.now();
 if(!s.physics){$('status').textContent=s.error?.message||'Invalid state';return;}
 const p=s.parameters,m=s.physics.metrics;
 $('time').textContent=s.physics.timeSeconds.toFixed(2)+' s';$('speed').textContent=m.speedMps.toFixed(2)+' m/s';$('wavelength').textContent=m.wavelengthM.toFixed(2)+' m';$('travel').textContent=m.travelTimeS.toFixed(2)+' s';
 $('boundary-note').textContent=explanations[p.boundary];$('power').textContent='Mean incident sine-wave power: '+m.incidentMeanPowerW.toFixed(3)+' W';
 $('slope-warning').textContent=m.incidentSlopeScale>0.3?'Large slope setting: real ropes can depart from this linear approximation.':'';
 for(const key of Object.keys(names)){const input=root.querySelector('[data-agent-param="'+key+'"]');if(document.activeElement!==input)input.value=p[key];$('out-'+key).textContent=p[key]+' '+ROPE_WAVE_SCHEMA.properties[key].unit;}
 $('excitation').value=p.excitation;
 for(const b of root.querySelectorAll('[data-boundary]'))b.setAttribute('aria-pressed',String(b.dataset.boundary===p.boundary));
 $('play').disabled=s.running;$('pause').disabled=!s.running;$('step').disabled=s.running;
 $('status').textContent=s.error?.message||(s.running?'Running':'Paused');
}
function draw(ctx,s,{width:w,height:h,camera}){
 if(!s.physics)return;
 const style=getComputedStyle(root),color=k=>style.getPropertyValue(k).trim();
 // Resolve light-dark() colors through a styled DOM probe for Canvas compatibility.
 const resolve=k=>{probe.style.color=color(k);return getComputedStyle(probe).color;};
 const fg=resolve('--fg'),muted=resolve('--muted'),line=resolve('--line'),wave=resolve('--wave'),inc=resolve('--incident'),ref=resolve('--reflected');
 ctx.fillStyle=resolve('--panel');ctx.fillRect(0,0,w,h);
 const p=s.parameters,points=s.physics.samples,left=82,right=w-26,top=42,bottom=h-42,mid=(top+bottom)/2;
 const x=v=>left+v/p.lengthM*(right-left)*camera.zoom+camera.x;
 const scale=(bottom-top)/1.4*camera.zoom,y=v=>mid-v*scale+camera.y;
 ctx.font='12px system-ui';ctx.strokeStyle=line;ctx.lineWidth=1;
 for(const a of [-0.6,-0.3,0,0.3,0.6]){ctx.beginPath();ctx.moveTo(left,y(a));ctx.lineTo(right,y(a));ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='right';ctx.fillText(a.toFixed(1),left-8,y(a)+4);}
 ctx.fillStyle=muted;ctx.textAlign='left';ctx.fillText('y (m)',6,h-21);ctx.textAlign='right';ctx.fillText('x (m)',w-4,h-4);
 for(let i=0;i<=4;i++){const v=p.lengthM*i/4;ctx.textAlign='center';ctx.fillText(v.toFixed(1),x(v),h-21);}
 ctx.save();ctx.beginPath();ctx.rect(left-4,top,right-left+8,bottom-top);ctx.clip();
 const path=(key,c,dash,width)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();points.forEach((pt,i)=>i?ctx.lineTo(x(pt.xM),y(pt[key])):ctx.moveTo(x(pt.xM),y(pt[key])));ctx.stroke();ctx.setLineDash([]);};
 if(components){path('incidentM',inc,[7,5],1.8);path('reflectedM',ref,[3,5],1.8);}path('yM',wave,[],3);
 for(let i=0;i<points.length;i+=12){ctx.fillStyle=wave;ctx.beginPath();ctx.arc(x(points[i].xM),y(points[i].yM),2.5,0,2*Math.PI);ctx.fill();}
 ctx.restore();
 // The drive displacement is supplied by the physics engine, not UI time.
 const driveY=y(s.physics.source.driveM),attachY=y(s.physics.source.attachmentM),sx=x(0)-43;
 ctx.strokeStyle=line;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,top+15);ctx.lineTo(sx,bottom-15);ctx.stroke();
 ctx.fillStyle=inc;ctx.fillRect(sx-9,driveY-9,18,18);
 ctx.strokeStyle=inc;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+9,driveY);ctx.lineTo(x(0)-14,driveY);ctx.lineTo(x(0)-14,attachY);ctx.lineTo(x(0),attachY);ctx.stroke();
 ctx.fillStyle=wave;ctx.beginPath();ctx.arc(x(0),attachY,4,0,2*Math.PI);ctx.fill();
 ctx.fillStyle=muted;ctx.textAlign='center';ctx.fillText('Drive ↕',sx,top-17);
 const end=points.at(-1);ctx.strokeStyle=fg;ctx.lineWidth=2;
 if(p.boundary==='fixed'){ctx.beginPath();ctx.moveTo(x(p.lengthM),mid-34+camera.y);ctx.lineTo(x(p.lengthM),mid+34+camera.y);ctx.stroke();for(let d=-30;d<=30;d+=10){ctx.beginPath();ctx.moveTo(x(p.lengthM),mid+d+camera.y);ctx.lineTo(x(p.lengthM)+9,mid+d-8+camera.y);ctx.stroke();}}
 if(p.boundary==='free'){ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(x(p.lengthM),top);ctx.lineTo(x(p.lengthM),bottom);ctx.stroke();}
 ctx.fillStyle=resolve('--panel');ctx.strokeStyle=fg;ctx.beginPath();ctx.arc(x(end.xM),y(end.yM),5,0,2*Math.PI);ctx.fill();ctx.stroke();
 const tracked=points[96];ctx.fillStyle=ref;ctx.beginPath();ctx.arc(x(tracked.xM),y(tracked.yM),5,0,2*Math.PI);ctx.fill();
 ctx.fillStyle=muted;ctx.textAlign='left';ctx.fillText('Rope →',left,25);ctx.textAlign='right';ctx.fillText(p.boundary==='fixed'?'Fixed':p.boundary==='free'?'Free':'Absorbing',right,25);
}
const probe=document.createElement('span');probe.hidden=true;root.append(probe);
const runtime=createHtmlSimulationRuntime({id:ROPE_WAVE_ID,parameterSchema:ROPE_WAVE_SCHEMA,defaults:ROPE_WAVE_DEFAULTS,engine:createRopeWave(),canvas,draw,onStatus:update});
const safe=fn=>{try{Promise.resolve(fn()).catch(e=>$('status').textContent=e.message);}catch(e){$('status').textContent=e.message;}};
for(const input of root.querySelectorAll('[data-agent-param]'))input.addEventListener('input',()=>safe(()=>runtime.configure({[input.dataset.agentParam]:input.tagName==='SELECT'?input.value:Number(input.value)})));
for(const b of root.querySelectorAll('[data-boundary]'))b.onclick=()=>safe(()=>runtime.configure({boundary:b.dataset.boundary}));
$('components').onchange=e=>{components=e.target.checked;runtime.resize();};
$('play').onclick=()=>safe(()=>runtime.play());$('pause').onclick=()=>safe(()=>runtime.pause());$('step').onclick=()=>safe(()=>runtime.stepOnce());$('reset').onclick=()=>safe(()=>{runtime.reset();runtime.play();});$('fit').onclick=()=>safe(()=>runtime.fitCamera());
$('zoom-in').onclick=()=>safe(()=>runtime.setCamera({zoom:Math.min(8,runtime.getState().camera.zoom*1.2)}));$('zoom-out').onclick=()=>safe(()=>runtime.setCamera({zoom:Math.max(.2,runtime.getState().camera.zoom/1.2)}));
$('record-landscape').onclick=()=>safe(()=>runtime.startVideo({mode:'landscape'}));$('record-shorts').onclick=()=>safe(()=>runtime.startVideo({mode:'shorts'}));$('stop-record').onclick=()=>safe(()=>runtime.stopVideo());$('download-record').onclick=()=>safe(()=>runtime.downloadVideo());
for(const key of ['speed','wavelength','period','equation','solution','fixed','free']){const el=document.createElement('span');el.textContent=ROPE_WAVE_FORMULAS[key];$('formulas').append(el);}
let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;const c=runtime.getState().camera;runtime.setCamera({x:c.x+e.clientX-drag.x,y:c.y+e.clientY-drag.y});drag={x:e.clientX,y:e.clientY};});for(const ev of ['pointerup','pointercancel'])canvas.addEventListener(ev,()=>drag=null);
const query=new URLSearchParams(location.search),initial={};for(const [key,s] of Object.entries(ROPE_WAVE_SCHEMA.properties)){const raw=query.get('mcp.'+key);if(raw!==null)initial[key]=s.type==='string'?raw:Number(raw);}if(Object.keys(initial).length)safe(()=>runtime.configure(initial));
runtime.registerWebMcp('esbiko_rope_wave').then(r=>{$('mcp-status').textContent=r.status==='ready'?'Browser WebMCP ready':'Browser WebMCP unavailable in this browser. Local controls remain available.';});
const timer=setInterval(()=>{const v=runtime.getVideoStatus();$('recording-status').textContent=v.status+(v.file?' · '+Math.round(v.file.bytes/1024)+' KB':'')+(v.error?' · '+v.error.message:'');$('stop-record').disabled=v.status!=='recording';$('download-record').disabled=v.status!=='ready';for(const id of ['record-landscape','record-shorts'])$(id).disabled=['recording','processing','unsupported'].includes(v.status);},250);
// Narrow, immutable local SDK: the exact same controller used by UI and WebMCP.
Object.defineProperty(root,'simulationApi',{value:Object.freeze({getState:runtime.getState,getCapabilities:runtime.getCapabilities,configure:runtime.configure,play:runtime.play,pause:runtime.pause,reset:runtime.reset,stepOnce:runtime.stepOnce,setCamera:runtime.setCamera}),configurable:true});
window.addEventListener('pagehide',()=>{clearInterval(timer);runtime.dispose();},{once:true});

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
  remoteAttached=true;
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
   remoteAttached=false;
   runtime.setCommandHandler(null);
  }),1250);
 }catch(error){$("mcp-status").textContent="Remote session error: "+error.message;}
}
window.addEventListener("message",acceptRemote);

window.addEventListener("pagehide",()=>{if(remoteTimer)clearInterval(remoteTimer);window.removeEventListener("message",acceptRemote);},{once:true});
