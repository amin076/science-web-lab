import { createCompoundPendulumModel, COMPOUND_PENDULUM_DEFAULTS,
 COMPOUND_PENDULUM_PARAMETER_SCHEMA, COMPOUND_PENDULUM_PRESETS, ROD_COLORS
} from "../../../esbiko-physics/mechanics/compoundPendulum.js";
import { createHtmlSimulationRuntime } from "../../../platform/html-simulation/createHtmlSimulationRuntime.js";
import "./compoundPendulumAdmin.css";

const $ = (root, key) => root.querySelector('[data-cp="'+key+'"]');
const labels = ["Cyan","Gold","Coral","Violet"];
const globals = [
  ["gravityMps2","Gravity","m/s²",0.01],
  ["linearDensityKgPerM","Linear density","kg/m",0.1],
  ["playbackRate","Simulation speed","×",0.1],
];
const fields = [
  ["lengthM","Length","m",0.05],
  ["initialAngleDeg","Initial angle","°",1],
  ["initialOmegaRadps","Angular velocity","rad/s",0.5],
  ["hingeDampingNms","Hinge damping","N·m·s/rad",0.005],
];
function rangeMarkup(key,title,unit,step,color="") {
  const rule=COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties[key];
  const value=COMPOUND_PENDULUM_DEFAULTS[key];
  return '<label class="cp-field" style="--accent:'+color+'"><span>'+title+
    '<output data-cp="out-'+key+'">'+value+' '+unit+'</output></span>'+
    '<input type="range" data-parameter="'+key+'" data-agent-param="'+key+'" '+
    'aria-label="'+title+'" min="'+rule.minimum+'" max="'+rule.maximum+
    '" step="'+step+'" value="'+value+'"></label>';
}
function layout() {
  return '<header class="cp-header"><div><h1>Esbiko · Compound Pendulum</h1>'+
    '<p>Shared Esbiko Physics · 1–4 uniform rigid rods · independent tip trails</p></div>'+
    '<span class="cp-pill">Admin scientific preview · HTML runtime</span></header>'+
    '<div class="cp-layout"><section class="cp-stage" aria-label="Compound pendulum simulation">'+
    '<div class="cp-view"><canvas data-cp="canvas" role="img" aria-label="Interactive multi-link pendulum canvas"></canvas>'+
    '<div class="cp-overlay">Drag to pan · Scroll to zoom · Paths in metres</div></div>'+
    '<div class="cp-metrics">'+
    ['Time|time','Kinetic energy|kinetic','Potential energy|potential','Total energy|total','Energy change|change'].map(s=>{
      const [name,key]=s.split('|');return '<div class="cp-metric"><span>'+name+'</span><strong data-cp="'+key+'">—</strong></div>';
    }).join('')+'</div><p class="cp-hint" data-cp="sim-status" role="status">Preparing physics engine…</p></section>'+
    '<aside class="cp-controls" aria-label="Pendulum controls">'+
    '<h2>System configuration</h2><label class="cp-field"><span>Number of rods</span>'+
    '<select data-cp="rod-count" data-agent-param="rodCount" aria-label="Number of rods">'+
    [1,2,3,4].map(n=>'<option value="'+n+'">'+n+' rod'+(n>1?'s':'')+'</option>').join('')+'</select></label>'+
    '<div class="cp-actions"><button data-cp="play" data-agent-action="play">Play</button>'+
    '<button data-cp="pause" data-agent-action="pause">Pause</button>'+
    '<button data-cp="reset" data-agent-action="reset">Reset</button>'+
    '<button data-cp="clear" data-agent-action="clearTrails">Clear paths</button></div>'+
    '<button class="cp-wide" data-cp="preset">Load original two-rod settings</button>'+
    '<section class="cp-traces"><h3>Trajectories — select endpoints</h3><div class="cp-tracegrid">'+
    Array.from({length:4},(_,i)=>'<label class="cp-trace" style="--color:'+ROD_COLORS[i]+'">'+
      '<input type="checkbox" data-parameter="trace'+(i+1)+'" data-agent-param="trace'+(i+1)+'" checked>'+
      '<span class="cp-dot"></span> Tip '+(i+1)+'</label>').join('')+
    '</div><div class="cp-actions"><button data-cp="all">Show all</button><button data-cp="none">Hide all</button></div></section>'+
    '<div class="cp-flags">'+
    [['showTrails','Show trails'],['fadeTrails','Fade older paths'],['showRods','Show rods'],['showGrid','Show grid']].map(([key,title])=>
      '<label><input type="checkbox" data-parameter="'+key+'" data-agent-param="'+key+'">'+title+'</label>').join('')+'</div>'+
    globals.map(([k,t,u,step])=>rangeMarkup(k,t,u,step)).join('')+
    '<div data-cp="rod-fields">'+Array.from({length:4},(_,i)=>
       '<section class="cp-rod" data-rod="'+(i+1)+'" style="--color:'+ROD_COLORS[i]+'"><h3>Rod '+(i+1)+' · '+labels[i]+'</h3>'+
       fields.map(([p,t,u,step])=>rangeMarkup(p+(i+1),t,u,step,ROD_COLORS[i])).join('')+'</section>').join('')+'</div>'+
    '<section class="cp-video"><h3>Virtual camera & video</h3>'+
    '<div class="cp-actions"><button data-cp="fit" data-agent-action="fitCamera">Fit camera</button>'+
    '<button data-cp="rec-land">Record 16:9</button><button data-cp="rec-short">Record 9:16</button>'+
    '<button data-cp="rec-stop">Stop video</button><button data-cp="rec-download">Download</button></div>'+
    '<p data-cp="video-status" role="status">Video idle</p></section>'+
    '<section><h3>AI / MCP connection</h3><p data-cp="mcp-status" role="status">Checking browser agent control…</p>'+
    '<p class="cp-small">All visible settings use one validated simulation API. The preview is not in the public catalog.</p></section>'+
    '</aside></div>';
}
function createDraw(model) {
  return function draw(ctx,s,{width:w,height:h,camera}) {
    ctx.fillStyle="#091626";ctx.fillRect(0,0,w,h);
    if(!s.physics)return;
    const p=s.parameters,n=p.rodCount,tips=s.physics.tipsM;
    const totalLength=Array.from({length:n},(_,i)=>p["lengthM"+(i+1)]).reduce((a,b)=>a+b,0);
    const sc=Math.min(w*.42,h*.40)/totalLength*camera.zoom;
    const ox=w/2+camera.x,oy=h*.47+camera.y;
    const X=x=>ox+x*sc,Y=y=>oy+y*sc;
    if(p.showGrid) {
      ctx.strokeStyle="#24435b";ctx.lineWidth=1;ctx.beginPath();
      const grid=sc>14?sc:40;
      for(let x=((ox%grid)+grid)%grid;x<w;x+=grid){ctx.moveTo(x,0);ctx.lineTo(x,h);}
      for(let y=((oy%grid)+grid)%grid;y<h;y+=grid){ctx.moveTo(0,y);ctx.lineTo(w,y);}
      ctx.stroke();
      ctx.fillStyle="#81a9bf";ctx.font="11px system-ui";ctx.fillText(sc>14?"Grid 1 m":"Zoom in for 1 m grid",10,h-14);
    }
    if(p.showTrails)for(let i=0;i<n;i++){
      if(!p["trace"+(i+1)])continue;
      const trail=model.trajectory({rodIndex:i+1,limit:9000});
      if(trail.length<2)continue;
      ctx.strokeStyle=ROD_COLORS[i];ctx.lineWidth=i===n-1?1.7:1.35;
      if(p.fadeTrails) {
        for(let k=1;k<trail.length;k++){
          ctx.globalAlpha=.1+.86*k/trail.length;ctx.beginPath();
          ctx.moveTo(X(trail[k-1][0]),Y(trail[k-1][1]));
          ctx.lineTo(X(trail[k][0]),Y(trail[k][1]));ctx.stroke();
        }
        ctx.globalAlpha=1;
      } else {
        ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(X(trail[0][0]),Y(trail[0][1]));
        for(let j=1;j<trail.length;j++)ctx.lineTo(X(trail[j][0]),Y(trail[j][1]));
        ctx.stroke();ctx.globalAlpha=1;
      }
    }
    if(p.showRods){
      ctx.lineCap="round";ctx.strokeStyle="#e9f2fa";ctx.lineWidth=9;
      ctx.beginPath();ctx.moveTo(ox-24,oy-18);ctx.lineTo(ox+24,oy-18);ctx.stroke();
      let prev=[0,0];
      for(let i=0;i<n;i++){
        const point=tips[i];ctx.strokeStyle=ROD_COLORS[i];ctx.lineWidth=7;ctx.beginPath();
        ctx.moveTo(X(prev[0]),Y(prev[1]));ctx.lineTo(X(point[0]),Y(point[1]));ctx.stroke();
        ctx.fillStyle="#f4f9ff";ctx.beginPath();ctx.arc(X(prev[0]),Y(prev[1]),4.5,0,Math.PI*2);ctx.fill();
        prev=point;
      }
    }
    for(let i=0;i<n;i++){
      const a=tips[i];ctx.fillStyle=ROD_COLORS[i];ctx.beginPath();ctx.arc(X(a[0]),Y(a[1]),5.4,0,Math.PI*2);ctx.fill();
    }
    ctx.font="12px system-ui";ctx.fillStyle="#e5f1fc";
    ctx.fillText(n+" rods · "+s.elapsedSeconds.toFixed(1)+" s",12,22);
    for(let i=0;i<n;i++){
      ctx.fillStyle=ROD_COLORS[i];ctx.fillRect(12,33+i*19,10,10);
      ctx.fillStyle=p["trace"+(i+1)]?"#ecf4fe":"#7995ae";
      ctx.fillText("Tip "+(i+1)+(p["trace"+(i+1)]?"":" (trail off)"),29,43+i*19);
    }
  };
}
export function mountCompoundPendulumAdmin(container) {
  container.classList.add("cp-root");
  container.innerHTML=layout();
  const listeners=[];
  const on=(el,event,fn,options)=>{el.addEventListener(event,fn,options);listeners.push(()=>el.removeEventListener(event,fn,options));};
  const model=createCompoundPendulumModel();
  const canvas=$(container,"canvas");
  let api=null,drawAt=0,formAt=0,disposed=false;
  const showError=e=>{$(container,"sim-status").textContent=e?.message || String(e);};
  function refresh(state) {
    if(disposed)return;
    const now=performance.now();
    if(state?.physics && now-drawAt>65){
      drawAt=now;
      const e=state.physics.energy,format=x=>Number.isFinite(x)?x.toFixed(2):"—";
      $(container,"time").textContent=format(state.elapsedSeconds)+" s";
      $(container,"kinetic").textContent=format(e.kineticJ)+" J";
      $(container,"potential").textContent=format(e.potentialJ)+" J";
      $(container,"total").textContent=format(e.totalJ)+" J";
      $(container,"change").textContent=(e.changeJ>0?"+":"")+format(e.changeJ)+" J";
      $(container,"sim-status").textContent=state.error?.message || state.physics.rodCount+" rods · "+(state.running?"Running":"Paused")+" · Adaptive RK4";
    }else if(state?.error)$(container,"sim-status").textContent=state.error.message;
    if(now-formAt>150) {
      formAt=now;
      for(const input of container.querySelectorAll("[data-parameter]")){
        const value=state.parameters[input.dataset.parameter];
        if(input.type==="checkbox")input.checked=!!value;
        else if(document.activeElement!==input)input.value=value;
        const output=$(container,"out-"+input.dataset.parameter);
        if(output) {
          const unit=fields.find(([p])=>input.dataset.parameter.startsWith(p))?.[2]||
            globals.find(([p])=>p===input.dataset.parameter)?.[2]||"";
          output.textContent=value+" "+unit;
        }
      }
      $(container,"rod-count").value=state.parameters.rodCount;
      for(const card of container.querySelectorAll("[data-rod]"))
        card.hidden=Number(card.dataset.rod)>state.parameters.rodCount;
      for(let i=1;i<=4;i++){
        const trace=container.querySelector('[data-parameter="trace'+i+'"]');
        trace.disabled=i>state.parameters.rodCount;
        trace.closest("label").classList.toggle("cp-inactive",trace.disabled);
      }
      $(container,"play").disabled=state.running;
      $(container,"pause").disabled=!state.running;
    }
  }
  api=createHtmlSimulationRuntime({
    id:"physics.mechanics.compound-pendulum",canvas,
    parameterSchema:COMPOUND_PENDULUM_PARAMETER_SCHEMA,defaults:COMPOUND_PENDULUM_DEFAULTS,
    engine:model,draw:createDraw(model),onStatus:refresh,
  });
  for(const input of container.querySelectorAll("[data-parameter]")){
    const key=input.dataset.parameter;
    on(input,input.type==="range"?"input":"change",()=>{
      if(input.type==="range"){
        const output=$(container,"out-"+key);
        if(output)output.textContent=input.value;
      }
      if(input.type==="range")return;
      try{api.configure({[key]:input.type==="checkbox"?input.checked:Number(input.value)});}
      catch(e){showError(e);}
    });
    if(input.type==="range")on(input,"change",()=>{try{api.configure({[key]:Number(input.value)});}catch(e){showError(e);}});
  }
  on($(container,"rod-count"),"change",e=>{try{api.configure({rodCount:Number(e.target.value)});}catch(err){showError(err);}});
  const action=(id,fn)=>on($(container,id),"click",()=>{try{fn();}catch(e){showError(e);}});
  action("play",()=>api.play());action("pause",()=>api.pause());
  action("reset",()=>api.reset());action("clear",()=>api.clearTrails());
  action("fit",()=>api.fitCamera());
  action("all",()=>api.configure(Object.fromEntries(Array.from({length:4},(_,i)=>["trace"+(i+1),true]))));
  action("none",()=>api.configure(Object.fromEntries(Array.from({length:4},(_,i)=>["trace"+(i+1),false]))));
  action("preset",()=>{api.configure(COMPOUND_PENDULUM_PRESETS.originalDouble);api.reset();});
  action("rec-land",()=>api.startVideo({mode:"landscape"}));
  action("rec-short",()=>api.startVideo({mode:"shorts"}));
  action("rec-stop",()=>api.stopVideo());
  action("rec-download",()=>api.downloadVideo());
  const syncRecorder=()=>{
    if(disposed)return;
    const r=api.getVideoStatus();
    $(container,"video-status").textContent="Video: "+r.status+(r.file?" · "+Math.round(r.file.bytes/1024)+" KB":"")+(r.error?" · "+r.error.message:"");
    $(container,"rec-land").disabled=["recording","processing"].includes(r.status);
    $(container,"rec-short").disabled=["recording","processing"].includes(r.status);
    $(container,"rec-stop").disabled=r.status!=="recording";
    $(container,"rec-download").disabled=r.status!=="ready";
  };
  const timer=setInterval(syncRecorder,300);syncRecorder();
  let drag=null;
  on(canvas,"pointerdown",event=>{drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
  on(canvas,"pointermove",event=>{
    if(!drag)return;
    const c=api.getState().camera;
    try{api.setCamera({x:c.x+event.clientX-drag.x,y:c.y+event.clientY-drag.y});}catch(e){showError(e);}
    drag={x:event.clientX,y:event.clientY};
  });
  on(canvas,"pointerup",()=>drag=null);on(canvas,"pointercancel",()=>drag=null);
  on(canvas,"wheel",event=>{
    event.preventDefault();
    const c=api.getState().camera;
    try{api.setCamera({zoom:Math.min(8,Math.max(.2,c.zoom*Math.exp(-.001*event.deltaY)))});}catch(e){showError(e);}
  },{passive:false});
  api.registerWebMcp("esbiko_compound_pendulum").then(r=>{
    if(!disposed)$(container,"mcp-status").textContent=r.status==="ready"?
      "WebMCP ready · "+r.registered.length+" control tools":"WebMCP "+r.status+" · local controls available";
  }).catch(e=>{if(!disposed)$(container,"mcp-status").textContent="WebMCP error: "+e.message;});
  refresh(api.getState());api.play();
  return {api,dispose(){
    if(disposed)return;
    clearInterval(timer);listeners.forEach(fn=>fn());api.dispose();
    disposed=true;container.innerHTML="";
  }};
}
