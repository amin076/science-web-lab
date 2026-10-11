import {createHtmlSimulationRuntime} from "../../../../../platform/html-simulation/createHtmlSimulationRuntime.js";
import {readEmbeddedMcpParameters} from "../../../../../platform/agent/readEmbeddedMcpParameters.js";
import {ROD_COLORS,COMPOUND_PENDULUM_DEFAULTS,COMPOUND_PENDULUM_PARAMETER_SCHEMA}
 from "../../../../../esbiko-physics/mechanics/compoundPendulum.js";
import {createCompoundPendulumComparison, COMPARISON_DEFAULTS, COMPARISON_PARAMETER_SCHEMA,
 panePatch, paneConfig, COMPARISON_PANE_FIELDS} from "./comparisonModel.js";
import "./comparison.css";

const $=(root,key)=>root.querySelector('[data-compare="'+key+'"]');
const letters=["A","B","C","D"];
const fieldGroups=[
 ["lengthM","Rod length","m",0.05],
 ["initialAngleDeg","Initial angle","°",1],
 ["initialOmegaRadps","Angular speed","rad/s",0.05],
 ["hingeDampingNms","Joint damping","N·m·s",0.005],
];
const sharedFields=[
 ["gravityMps2","Gravity","m/s²",.01],
 ["linearDensityKgPerM","Linear density","kg/m",.1],
];
const visualFields=[
 ["showTrails","Show paths"],["fadeTrails","Fade old paths"],["showRods","Show rods"],["showGrid","Show grid"],
];
function slider(key,label,unit,step,value,rule){
 return '<label class="cpc-field"><span>'+label+'<output data-output="'+key+'">'+value+' '+unit+'</output></span>'+
 '<input type="range" data-field="'+key+'" data-agent-param="'+key+'" aria-label="'+label+'" min="'+rule.minimum+
 '" max="'+rule.maximum+'" step="'+step+'" value="'+value+'"></label>';
}
function renderControls(selected,params){
 const cfg=paneConfig(params,selected),parts=[];
 parts.push('<section class="cpc-section"><h3>Experiment '+letters[selected-1]+' — physics</h3>'+
 '<label class="cpc-field">Number of connected rods<select data-field="rodCount" data-agent-param="p'+selected+'_rodCount">'+
 [1,2,3,4].map(i=>'<option value="'+i+'"'+(i===cfg.rodCount?" selected":"")+'>'+i+' rod'+(i===1?"":"s")+'</option>').join('')+'</select></label>');
 for(const [key,label,unit,step] of sharedFields)
  parts.push(slider(key,label,unit,step,cfg[key],COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties[key]));
 parts.push('</section><section class="cpc-section"><h3>Endpoint trails</h3><div class="cpc-check-grid">');
 for(let i=1;i<=4;i++)parts.push('<label class="cpc-check" style="--tip-color:'+ROD_COLORS[i-1]+'">'+
 '<input type="checkbox" data-field="trace'+i+'" data-agent-param="p'+selected+'_trace'+i+'"'+
 (cfg["trace"+i]?" checked":"")+(i>cfg.rodCount?" disabled":"")+'><span class="cpc-tip-dot"></span>Tip '+i+'</label>');
 parts.push('</div><div class="cpc-check-grid">');
 for(const [key,label] of visualFields)
  parts.push('<label class="cpc-check"><input type="checkbox" data-field="'+key+'" data-agent-param="p'+selected+'_'+key+'"'+
    (cfg[key]?" checked":"")+'>'+label+'</label>');
 parts.push('</div></section>');
 for(let i=1;i<=cfg.rodCount;i++){
  parts.push('<section class="cpc-rod" style="--tip-color:'+ROD_COLORS[i-1]+'"><h3>Rod '+i+'</h3>');
  for(const [stem,label,unit,step] of fieldGroups){
   const key=stem+i;
   parts.push(slider(key,label+' · '+i,unit,step,cfg[key],COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties[key]));
  }
  parts.push('</section>');
 }
 return parts.join("");
}
function pageMarkup(){
 return '<div class="cpc-top"><div><h1>Compound Pendulum</h1>'+
 '<p>Compare independent 1–4 rod systems under matched simulation time · Esbiko Physics</p></div>'+
 '<div class="cpc-tag">Canvas 2D · Physics Lab</div></div>'+
 '<div class="cpc-grid"><section class="cpc-stage">'+
 '<div class="cpc-stage-head"><label>Experiments on screen<select data-compare="count" aria-label="Number of experiments">'+
 [1,2,3,4].map(n=>'<option value="'+n+'">'+n+' experiment'+(n===1?"":"s")+'</option>').join('')+'</select></label>'+
 '<div class="cpc-buttons"><button data-compare="play" data-agent-action="play">Play all</button>'+
 '<button data-compare="pause" data-agent-action="pause">Pause all</button>'+
 '<button data-compare="reset" data-agent-action="reset">Reset all</button>'+
 '<button data-compare="clear" data-agent-action="clearTrails">Clear paths</button></div></div>'+
 '<div class="cpc-viewport" data-compare="viewport"><canvas data-compare="canvas" role="img" aria-label="Comparative multi-pendulum paths; tap a pane to select it"></canvas></div>'+
 '<div class="cpc-readouts"><span data-compare="time">Time 0.00 s</span><span data-compare="difference">Tip difference: —</span>'+
 '<span data-compare="status" role="status">Initializing…</span></div></section>'+
 '<aside class="cpc-side"><h2>Experiment settings</h2>'+
 '<p>Select an experiment to independently change its angles, lengths, speeds and trails.</p>'+
 '<label class="cpc-field">Editing<select data-compare="selected" aria-label="Selected experiment"></select></label>'+
 '<div class="cpc-buttons"><button data-compare="copy-from-a" title="Make selected experiment identical to A">Match experiment A</button>'+
 '<button data-compare="perturb" title="Add a 0.1 degree change to rod 1">+0.1° to rod 1</button></div>'+
 '<label class="cpc-field">Common playback speed<select data-compare="speed">'+
 '<option value="0.25">0.25×</option><option value="0.5">0.5×</option>'+
 '<option value="1" selected>1×</option><option value="2">2×</option></select></label>'+
 '<div data-compare="controls"></div>'+
 '<section class="cpc-section"><h3>Virtual camera & recording</h3><div class="cpc-buttons">'+
 '<button data-compare="fit" data-agent-action="fitCamera">Fit</button>'+
 '<button data-compare="landscape">Record 16:9</button>'+
 '<button data-compare="shorts">Record 9:16</button>'+
 '<button data-compare="stop-video">Stop video</button>'+
 '<button data-compare="download">Download video</button></div>'+
 '<p data-compare="video-status" role="status">Video idle</p></section>'+
 '<section class="cpc-section"><h3>AI / MCP</h3><p data-compare="mcp-status" role="status">Detecting WebMCP…</p>'+
 '<p>Agent API parameters use p1_, p2_, p3_, p4_ prefixes; each experiment has independent physics.</p></section>'+
 '</aside></div>';
}
function drawing(model){
 return (ctx,state,{width:w,height:h,camera})=>{
  ctx.fillStyle="#071525";ctx.fillRect(0,0,w,h);
  if(!state.physics)return;
  const count=state.physics.paneCount;
  const cols=w<720?1:(count===1?1:2),rows=Math.ceil(count/cols);
  const cellW=w/cols,cellH=h/rows;
  const maxPoints=count>2?450:850;
  for(let p=0;p<count;p++){
   const column=p%cols,row=Math.floor(p/cols),x0=column*cellW,y0=row*cellH;
   const item=state.physics.pendulums[p],config=paneConfig(state.parameters,p+1);
   ctx.save();ctx.beginPath();ctx.rect(x0+1,y0+1,cellW-2,cellH-2);ctx.clip();
   ctx.fillStyle=state.parameters.selectedPane===p+1?"#112941":"#0c1e31";
   ctx.fillRect(x0,y0,cellW,cellH);
   const sum=Array.from({length:config.rodCount},(_,i)=>config["lengthM"+(i+1)]).reduce((a,b)=>a+b,0);
   const scale=Math.min(cellW*.38,cellH*.34)/sum*camera.zoom;
   const ox=x0+cellW*.50+camera.x,oy=y0+cellH*.48+camera.y;
   const X=x=>ox+x*scale,Y=y=>oy+y*scale;
   if(config.showGrid&&scale>18){
    ctx.strokeStyle="#23415c";ctx.lineWidth=1;ctx.beginPath();
    for(let x=((ox-x0)%scale+scale)%scale+x0;x<x0+cellW;x+=scale){ctx.moveTo(x,y0);ctx.lineTo(x,y0+cellH);}
    for(let y=((oy-y0)%scale+scale)%scale+y0;y<y0+cellH;y+=scale){ctx.moveTo(x0,y);ctx.lineTo(x0+cellW,y);}
    ctx.stroke();
   }
   if(config.showTrails)for(let i=0;i<config.rodCount;i++){
    if(!config["trace"+(i+1)])continue;
    const points=model.trajectory({paneIndex:p+1,rodIndex:i+1,limit:maxPoints});
    if(points.length<2)continue;
    ctx.strokeStyle=ROD_COLORS[i];ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(X(points[0][0]),Y(points[0][1]));
    for(let j=1;j<points.length;j++)ctx.lineTo(X(points[j][0]),Y(points[j][1]));
    if(config.fadeTrails)ctx.globalAlpha=.55;
    ctx.stroke();ctx.globalAlpha=1;
   }
   if(config.showRods){
    ctx.strokeStyle="#e3efff";ctx.lineCap="round";ctx.lineWidth=7;ctx.beginPath();
    ctx.moveTo(ox-20,oy-14);ctx.lineTo(ox+20,oy-14);ctx.stroke();
    let from=[0,0];
    for(let i=0;i<config.rodCount;i++){
     const to=item.tipsM[i];
     ctx.strokeStyle=ROD_COLORS[i];ctx.lineWidth=5.5;ctx.beginPath();
     ctx.moveTo(X(from[0]),Y(from[1]));ctx.lineTo(X(to[0]),Y(to[1]));ctx.stroke();
     ctx.fillStyle="#f5faff";ctx.beginPath();ctx.arc(X(from[0]),Y(from[1]),3.5,0,Math.PI*2);ctx.fill();
     from=to;
    }
   }
   for(let i=0;i<config.rodCount;i++){
    const t=item.tipsM[i];ctx.fillStyle=ROD_COLORS[i];ctx.beginPath();ctx.arc(X(t[0]),Y(t[1]),4,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle="#e8f5ff";ctx.font="bold 13px system-ui";
   ctx.fillText("Experiment "+letters[p]+ " · "+config.rodCount+" rods",x0+11,y0+22);
   ctx.font="11px system-ui";ctx.fillStyle="#a4c3d8";
   ctx.fillText("E "+item.energy.totalJ.toFixed(2)+" J",x0+11,y0+39);
   if(p>0){
    const diff=state.physics.comparisons[p-1]?.tipSeparationM;
    if(Number.isFinite(diff))ctx.fillText("vs A: "+diff.toFixed(3)+" m",x0+11,y0+55);
   }
   if(state.parameters.selectedPane===p+1){
    ctx.strokeStyle="#75dfff";ctx.lineWidth=2;ctx.strokeRect(x0+2,y0+2,cellW-4,cellH-4);
   }else{
    ctx.strokeStyle="#315471";ctx.lineWidth=1;ctx.strokeRect(x0+1,y0+1,cellW-2,cellH-2);
   }
   ctx.restore();
  }
 };
}
export function mountCompoundComparison(container){
 container.classList.add("cpc-root");container.innerHTML=pageMarkup();
 const model=createCompoundPendulumComparison();
 const canvas=$(container,"canvas"),viewport=$(container,"viewport");
 const disposers=[];let api,disposed=false,lastUi=0,lastPanel=-1;
 const on=(node,event,fn,opts)=>{node.addEventListener(event,fn,opts);disposers.push(()=>node.removeEventListener(event,fn,opts));};
 const err=e=>{$(container,"status").textContent=e.message||String(e);};
 function syncControlPanel(state){
  const selected=state.parameters.selectedPane;
  if(lastPanel!==selected){
   lastPanel=selected;
   $(container,"controls").innerHTML=renderControls(selected,state.parameters);
   const root=$(container,"controls");
   for(const input of root.querySelectorAll("[data-field]")){
    const key=input.dataset.field,whole="p"+selected+"_"+key;
    const update=()=>{
     try{
      const value=input.type==="checkbox"?input.checked:
         input.tagName==="SELECT"?Number(input.value):Number(input.value);
      api.configure({[whole]:value});
     }catch(e){err(e);}
    };
    on(input,"change",update);
    if(input.type==="range")on(input,"input",()=>{
      const output=root.querySelector('[data-output="'+key+'"]');
      if(output)output.textContent=input.value;
    });
   }
  }
  $(container,"count").value=state.parameters.paneCount;
  $(container,"speed").value=String(state.parameters.playbackRate);
  const select=$(container,"selected");
  if(select.options.length!==state.parameters.paneCount){
   select.innerHTML=Array.from({length:state.parameters.paneCount},(_,i)=>
    '<option value="'+(i+1)+'">Experiment '+letters[i]+'</option>').join("");
  }
  select.value=selected;
  const cfg=paneConfig(state.parameters,selected);
  const controls=$(container,"controls");
  for(const input of controls.querySelectorAll("[data-field]")){
   const key=input.dataset.field,actual=cfg[key];
   if(input.type==="checkbox")input.checked=actual;
   else if(document.activeElement!==input)input.value=String(actual);
   const output=controls.querySelector('[data-output="'+key+'"]');
   if(output){
    const unit=fieldGroups.find(x=>key.startsWith(x[0]))?.[2]||
       sharedFields.find(x=>x[0]===key)?.[2]||"";
    if(document.activeElement!==input)output.textContent=actual+" "+unit;
   }
  }
  $(container,"play").disabled=state.running;
  $(container,"pause").disabled=!state.running;
  $(container,"copy-from-a").disabled=selected===1;
 }
 function syncViewport(state){
  viewport.dataset.count=state.physics?.paneCount||state.parameters.paneCount;
 }
 api=createHtmlSimulationRuntime({
  id:"physics.mechanics.compound-pendulum",canvas,
  parameterSchema:COMPARISON_PARAMETER_SCHEMA,defaults:COMPARISON_DEFAULTS,engine:model,
  draw:drawing(model),
  onStatus:state=>{
   if(disposed)return;
   const now=performance.now();
   if(now-lastUi<120 && state.running && lastPanel===state.parameters.selectedPane &&
      String(state.parameters.paneCount)===viewport.dataset.count)return;
   lastUi=now;
   syncViewport(state);
   syncControlPanel(state);
   $(container,"time").textContent="Time: "+state.elapsedSeconds.toFixed(2)+" s";
   const sel=state.parameters.selectedPane,diff=state.physics?.comparisons?.find(v=>v.paneIndex===sel)?.tipSeparationM;
   $(container,"difference").textContent="Tip difference vs A: "+
     (Number.isFinite(diff)?diff.toFixed(3)+" m":"select B, C or D");
   $(container,"status").textContent=state.error?.message||(state.running?"Running":"Paused");
  },
 });
 const act=(id,fn)=>on($(container,id),"click",()=>{try{fn();}catch(e){err(e);}});
 on($(container,"count"),"change",e=>{try{api.configure({paneCount:Number(e.target.value)});}catch(ex){err(ex);}});
 on($(container,"selected"),"change",e=>{try{lastPanel=-1;api.configure({selectedPane:Number(e.target.value)});}catch(ex){err(ex);}});
 on($(container,"speed"),"change",e=>{try{api.configure({playbackRate:Number(e.target.value)});}catch(ex){err(ex);}});
 act("play",()=>api.play());act("pause",()=>api.pause());act("reset",()=>api.reset());
 act("clear",()=>api.clearTrails());act("fit",()=>api.fitCamera());
 act("copy-from-a",()=>{
  const state=api.getState(),sel=state.parameters.selectedPane;
  if(sel===1)return;
  api.configure(panePatch(sel,paneConfig(state.parameters,1)));
 });
 act("perturb",()=>{
  const state=api.getState(),sel=state.parameters.selectedPane,config=paneConfig(state.parameters,sel);
  api.configure(panePatch(sel,{initialAngleDeg1:Math.min(180,config.initialAngleDeg1+.1)}));
 });
 act("landscape",()=>api.startVideo({mode:"landscape"}));
 act("shorts",()=>api.startVideo({mode:"shorts"}));
 act("stop-video",()=>api.stopVideo());
 act("download",()=>api.downloadVideo());
 let down=null;
 const choose=(event)=>{
  const r=canvas.getBoundingClientRect(),w=r.width,h=r.height;
  const c=api.getState().parameters.paneCount,cols=w<720?1:c===1?1:2;
  const row=Math.floor((event.clientY-r.top)/(h/Math.ceil(c/cols)));
  const col=Math.floor((event.clientX-r.left)/(w/cols));
  const index=row*cols+col+1;
  if(index>=1&&index<=c){lastPanel=-1;api.configure({selectedPane:index});}
 };
 on(canvas,"pointerdown",event=>{down={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
 on(canvas,"pointerup",event=>{
  if(!down)return;const dist=Math.hypot(event.clientX-down.x,event.clientY-down.y);
  if(dist<9)try{choose(event);}catch(e){err(e);}
  down=null;
 });
 on(canvas,"pointercancel",()=>down=null);
 on(canvas,"wheel",e=>{
  e.preventDefault();
  try{const z=api.getState().camera.zoom;api.setCamera({zoom:Math.max(.2,Math.min(8,z*Math.exp(-e.deltaY*.001)))});}catch(ex){err(ex);}
 },{passive:false});
 let lastVideo="";
 const timer=setInterval(()=>{
  if(disposed)return;
  const s=api.getVideoStatus(),label="Video: "+s.status+(s.file?" · "+Math.round(s.file.bytes/1024)+" KB":"")+(s.error?" · "+s.error.message:"");
  if(label!==lastVideo)$(container,"video-status").textContent=lastVideo=label;
  $(container,"stop-video").disabled=s.status!=="recording";
  $(container,"download").disabled=s.status!=="ready";
  for(const id of ["landscape","shorts"])$(container,id).disabled=["recording","processing"].includes(s.status);
 },300);

 // MCP App delivers the bearer token via postMessage to this specific iframe,
 // never through the URL; all remote changes persist in Firestore.
 let remoteTimer=null,remoteActive=false,remoteRevision=-1;
 const remoteId=new URLSearchParams(window.location.search).get("remoteSessionId");
 const acceptRemote=async(event)=>{
  if(disposed||!remoteId||event.source!==window.parent)return;
  const msg=event.data;
  if(!msg||msg.type!=="esbiko-control-session-v1"||
     msg.sessionId!==remoteId||!(/^[a-f0-9]{64}$/.test(msg.token||"")))return;
  if(remoteActive)return;
  const base="/api/v1/control/sessions/"+encodeURIComponent(remoteId);
  const token=msg.token;
  const request=async(suffix="",options={})=>{
   const response=await fetch(base+suffix,{
     ...options,headers:{"X-Esbiko-Control-Token":token,
       ...(options.body?{"Content-Type":"application/json"}:{})},cache:"no-store",
   });
   const body=await response.json();
   if(!response.ok||!body.ok)throw Error(body.error||"Remote control unavailable");
   return body;
  };
  const apply=async(force=false)=>{
   if(disposed)return;
   const result=await request("?checkpoint=1"+(!force&&remoteRevision>=0?"&since="+remoteRevision:""));
   if(result.unchanged||result.revision<remoteRevision)return;
   remoteRevision=result.revision;
   api.loadCheckpoint({checkpoint:result.checkpoint,camera:result.camera,
     serverRunning:result.running});
   $(container,"mcp-status").textContent="ChatGPT remote session · revision "+remoteRevision+
     " · advance simulation through the agent";
  };
  try {
   await apply(true);remoteActive=true;
   api.setCommandHandler(async(action,input)=>{
    try {
     const response=await request("/commands",{method:"POST",
       body:JSON.stringify({action,...input})});
     await apply(true);
     return response.result;
    }catch(error){err(error);throw error;}
   });
   remoteTimer=setInterval(()=>apply().catch(e=>{
    $(container,"mcp-status").textContent="Session disconnected: "+e.message;
    clearInterval(remoteTimer);remoteTimer=null;
    api.setCommandHandler(null);remoteActive=false;
   }),1250);
  }catch(error){err(error);}
 };
 on(window,"message",acceptRemote);

 const hydration=readEmbeddedMcpParameters("physics.mechanics.compound-pendulum",COMPARISON_DEFAULTS);
 if(hydration.embeddedMcpApp && hydration.providedKeys.length)api.configure(hydration.values);
 api.registerWebMcp("esbiko_compound_pendulum").then(x=>{
  if(!disposed)$(container,"mcp-status").textContent=x.status==="ready"?
    "WebMCP connected: "+x.registered.length+" tools":"WebMCP "+x.status+" · controls still work";
 }).catch(err=>{if(!disposed)$(container,"mcp-status").textContent="WebMCP: "+err.message;});
 syncViewport(api.getState());syncControlPanel(api.getState());if(!remoteId)api.play();
 return {api,dispose(){if(disposed)return;disposed=true;clearInterval(timer);if(remoteTimer)clearInterval(remoteTimer);disposers.forEach(fn=>fn());api.dispose();container.innerHTML="";}};
}
