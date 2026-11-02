import {useCallback,useEffect,useRef,useState} from "react";
import {createHtmlSimulationRuntime} from "../../../../../platform/html-simulation/createHtmlSimulationRuntime.js";
import {useRemoteSimulationSession} from "../../../../../platform/control/useRemoteSimulationSession.js";
import {POLYGON_ID,POLYGON_DEFAULTS,POLYGON_SCHEMA,createRegularPolygonModel} from "../../../../../esbiko-physics/math/regularPolygonModel.js";
import {drawPolygonCanvas} from "./drawPolygonCanvas.js";
import "./regularPolygons.css";

const presets=[3,4,5,6,8,10,12,20,50,100];
const names={3:"Equilateral triangle",4:"Square",5:"Regular pentagon",6:"Regular hexagon",7:"Regular heptagon",8:"Regular octagon",10:"Regular decagon",12:"Regular dodecagon",20:"Regular icosagon",100:"Regular hectogon"};
const number=x=>Number(x).toLocaleString("en-US",{maximumFractionDigits:5});
const symbol=(coefficient,power=1)=>number(coefficient)+(power===2?" R²":" R");
const form=(value)=>number(value);
const headings=["Side length","Perimeter","Area","Apothem (center to edge)","Circumradius (center to vertex)","Vertical height"];
function metrics(g){
 const R=g.radius;
 return [
  [symbol(g.coefficients.innerSide),symbol(g.coefficients.outerSide),g.inner.side,g.outer.side],
  [symbol(g.coefficients.innerPerimeter),symbol(g.coefficients.outerPerimeter),g.inner.perimeter,g.outer.perimeter],
  [symbol(g.coefficients.innerArea,2),symbol(g.coefficients.outerArea,2),g.inner.area,g.outer.area],
  [symbol(g.coefficients.innerApothem),"R",g.inner.apothem,g.outer.apothem],
  ["R",symbol(g.outer.circumradius/R),g.inner.circumradius,g.outer.circumradius],
  [symbol(g.coefficients.innerHeight),symbol(g.coefficients.outerHeight),g.inner.height,g.outer.height],
 ];
}
function ControlField({label,value,onChange,min,max,step,disabled}){
 return <label className="rp-field"><span>{label}</span>
  <div className="rp-field-values">
   <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} disabled={disabled}/>
   <input aria-label={label+" numeric value"} type="number" min={min} max={max} step={step} value={value}
    onChange={e=>{const v=Number(e.target.value);if(e.target.value!=="" && Number.isFinite(v)&&v>=min&&v<=max)onChange(v);}}
    disabled={disabled}/>
  </div></label>;
}
export default function RegularPolygonsLab(){
 const canvas=useRef(null),api=useRef(null),pending=useRef(null);
 const [state,setState]=useState(null),[notice,setNotice]=useState(""),[videoMode,setVideoMode]=useState("landscape");
 const [sessionStatus,setSessionStatus]=useState("Local simulation");
 const onRemote=useCallback(async data=>{
   if(!api.current||!data?.checkpoint)return;
   api.current.loadCheckpoint({checkpoint:data.checkpoint,camera:data.camera||data.checkpoint.camera,serverRunning:false});
 },[]);
 const remote=useRemoteSimulationSession(onRemote);
 const remoteCommand=useRef(remote.command);remoteCommand.current=remote.command;
 useEffect(()=>{
   if(!canvas.current)return undefined;
   const engine=createRegularPolygonModel();
   const controller=createHtmlSimulationRuntime({
     id:POLYGON_ID,parameterSchema:POLYGON_SCHEMA,defaults:POLYGON_DEFAULTS,
     engine,canvas:canvas.current,draw:drawPolygonCanvas,
     onStatus:snapshot=>setState(snapshot),
   });
   api.current=controller;
   const removeHandler=remote.requested?controller.setCommandHandler((action,input)=>remoteCommand.current(action,input)):()=>{};
   controller.registerWebMcp("esbiko_regular_polygons").then(result=>{
     if(result.status==="error")setNotice("Browser WebMCP registration failed.");
   }).catch(e=>setNotice("WebMCP: "+e.message));
   // A narrow, documented local JavaScript API; not an arbitrary command evaluator.
   const sdk=Object.freeze({
     version:"1.0",getState:()=>controller.getState(),getCapabilities:()=>controller.getCapabilities(),
     configure:p=>controller.configure(p),play:()=>controller.play(),pause:()=>controller.pause(),
     reset:()=>controller.reset(),setCamera:p=>controller.setCamera(p),fitCamera:()=>controller.fitCamera(),
     stepOnce:()=>controller.stepOnce(),startVideo:options=>controller.startVideo(options),
     stopVideo:()=>controller.stopVideo(),getVideoStatus:()=>controller.getVideoStatus(),downloadVideo:()=>controller.downloadVideo(),
   });
   window.esbikoRegularPolygonsV1=sdk;
   const interval=setInterval(()=>{if(api.current===controller){
     const video=controller.getVideoStatus();
     if(["recording","processing","ready","failed"].includes(video.status))
       setState(controller.getState());
   }},450);
   return ()=>{clearInterval(interval);removeHandler();delete window.esbikoRegularPolygonsV1;
     api.current=null;controller.dispose();};
 },[remote.requested]);
 useEffect(()=>setSessionStatus(remote.status),[remote.status]);
 const invoke=useCallback(async fn=>{
   if(!api.current)return;
   try{setNotice("");await fn(api.current);setState(api.current.getState());}
   catch(error){setNotice(error?.message||"Unable to complete operation");}
 },[]);
 const patch=values=>invoke(runtime=>runtime.configure(values));
 const params=state?.parameters||POLYGON_DEFAULTS;
 const g=state?.physics?.geometry;
 const vid=state?.recording||{status:"idle"};
 const supported=typeof window!=="undefined"&&typeof window.MediaRecorder==="function"&&
   typeof HTMLCanvasElement!=="undefined"&&typeof HTMLCanvasElement.prototype.captureStream==="function";
 const downloadPng=()=>{
   if(!canvas.current)return;
   canvas.current.toBlob(blob=>{
     if(!blob){setNotice("PNG export is unavailable.");return;}
     const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;
     a.download="esbiko-regular-polygons-"+params.sides+"-sides.png";a.click();
     setTimeout(()=>URL.revokeObjectURL(url),1500);
   },"image/png");
 };
 return <div className="rp-lab" lang="en" dir="ltr">
   <header className="rp-header">
     <div><div className="rp-kicker">ESBIKO · MATHEMATICS · INTERACTIVE GEOMETRY</div>
       <h1>Inscribed & Circumscribed Polygons</h1>
       <p>Explore regular polygons around a circle. Change the number of sides and radius to see exact measurements, angles and limiting behavior.</p>
     </div>
     <span className="rp-session">{sessionStatus}</span>
   </header>
   <div className="rp-layout">
    <section className="rp-stage rp-card" aria-label="Live geometry diagram">
     <div className="rp-stage-heading"><h2>{g?(names[g.sides]||"Regular "+g.sides+"-gon"):"Regular polygon"}</h2>
      <div className="rp-legend"><span><b className="rp-inner"/>Inscribed</span><span><b className="rp-outer"/>Circumscribed</span><span><b className="rp-circle"/>Circle</span></div>
     </div>
     <div className="rp-canvas-wrap"><canvas data-simulation-canvas ref={canvas} aria-label="A regular inscribed polygon, a regular circumscribed polygon and their shared circle" role="img"/></div>
     <div className="rp-stage-footer"><span>The circle's radius is R. Both polygons are regular and share the same center.</span>
       <button type="button" onClick={downloadPng}>Save PNG</button></div>
     <div className="rp-record">
      <h3>Video recording</h3>
      <div className="rp-buttons">
       <label className="rp-video-select">Aspect ratio <select aria-label="Recording aspect ratio" value={videoMode}
        onChange={e=>setVideoMode(e.target.value)} disabled={vid.status==="recording"||vid.status==="processing"}>
        <option value="landscape">16:9 landscape</option><option value="shorts">9:16 portrait</option>
       </select></label>
       {vid.status==="recording"?
        <button className="rp-danger" type="button" onClick={()=>invoke(a=>a.stopVideo())}>Stop recording</button>:
        <button type="button" disabled={!supported||vid.status==="processing"} onClick={()=>invoke(a=>a.startVideo({mode:videoMode}))}>Start recording</button>}
       <button type="button" disabled={vid.status!=="ready"} onClick={()=>invoke(a=>a.downloadVideo())}>Download WebM</button>
      </div>
      <div className="rp-hint" aria-live="polite">Status: {supported?vid.status:"unsupported"}{vid.file?" · "+number(vid.file.bytes)+" bytes":""}
        {vid.error?.message?" · "+vid.error.message:""}. Silent canvas-only recording; no camera or microphone access.</div>
     </div>
    </section>
    <aside className="rp-controls rp-card">
      <h2>Experiment controls</h2>
      <ControlField label="Number of sides" min={3} max={100} step={1} value={params.sides} onChange={v=>patch({sides:v})}/>
      <div className="rp-presets" aria-label="Quick side-count presets">{presets.map(n=><button key={n}
       type="button" aria-pressed={params.sides===n} onClick={()=>patch({sides:n})}>{n}</button>)}</div>
      <ControlField label="Circle radius R" min={0.1} max={10} step={0.1} value={params.radius} onChange={v=>patch({radius:v})}/>
      <p className="rp-hint">The circle stays fixed as both polygons change. Lengths scale with R; areas scale with R².</p>
      <div className="rp-options">
       {[[ "showGuides","Radii & apothems"],["showTangencies","Points of tangency"],["showAngles","Central-angle sector"]].map(([key,label])=>
        <label key={key}><input type="checkbox" checked={params[key]} onChange={e=>patch({[key]:e.target.checked})}/>{label}</label>)}
      </div>
      <ControlField label="Sector sweep (rev/min)" min={0.1} max={5} step={0.1} value={params.animationSpeed} onChange={v=>patch({animationSpeed:v})}/>
      <div className="rp-buttons">
       <button type="button" onClick={()=>invoke(a=>a.play())} disabled={state?.running}>Play</button>
       <button type="button" onClick={()=>invoke(a=>a.pause())} disabled={!state?.running}>Pause</button>
       <button type="button" onClick={()=>invoke(a=>a.stepOnce())} disabled={state?.running}>Step</button>
       <button type="button" onClick={()=>invoke(a=>a.reset())}>Reset</button>
      </div>
      <div className="rp-buttons"><button type="button" onClick={()=>invoke(a=>a.setCamera({zoom:Math.min(8,(state?.camera.zoom||1)*1.2)}))}>Zoom +</button>
       <button type="button" onClick={()=>invoke(a=>a.setCamera({zoom:Math.max(.2,(state?.camera.zoom||1)/1.2)}))}>Zoom −</button>
       <button type="button" onClick={()=>invoke(a=>a.fitCamera())}>Fit view</button></div>
      <p className="rp-hint">Playback animates a reference ray; it does not change polygon dimensions.</p>
      {notice&&<div className="rp-error" role="alert">{notice}</div>}
    </aside>
    <section className="rp-results">
      {g&&<>
       <div className="rp-summary">
        {[[ "Interior angle",form(g.interiorAngleDegrees)+"°","180° − 360° / n"],
          ["Central angle",form(g.centralAngleDegrees)+"°","360° / n"],
          ["Side ratio",form(g.ratios.side),"1 / cos(π / n)"],
          ["Area ratio",form(g.ratios.area),"1 / cos²(π / n)"]].map(([label,val,equation])=>
         <div className="rp-stat rp-card" key={label}><span>{label}</span><strong>{val}</strong><small>{equation}</small></div>)}
       </div>
       <div className="rp-card rp-comparison">
         <h2>Measurements in terms of R</h2>
         <p>The first line gives a coefficient of R or R². The second is the calculated measurement at the selected radius.</p>
         <div className="rp-table-wrap"><table><thead><tr><th>Quantity</th><th>Inscribed (blue)</th><th>Circumscribed (orange)</th></tr></thead>
          <tbody>{metrics(g).map(([a,b,an,bn],i)=><tr key={headings[i]}><th>{headings[i]}</th>
            <td><strong>{a}</strong><small>= {number(an)}</small></td><td><strong>{b}</strong><small>= {number(bn)}</small></td></tr>)}</tbody></table></div>
       </div>
       <div className="rp-card rp-formulas"><h2>General formulas (n ≥ 3)</h2>
        <div className="rp-formula-grid">
         <div>Inscribed side <strong>2R sin(π/n)</strong></div><div>Circumscribed side <strong>2R tan(π/n)</strong></div>
         <div>Inscribed area <strong>(n/2)R² sin(2π/n)</strong></div><div>Circumscribed area <strong>nR² tan(π/n)</strong></div>
         <div>Interior angle <strong>(n − 2) × 180° / n</strong></div><div>Outer / inner area <strong>sec²(π/n)</strong></div>
        </div>
        <p>Vertical height is measured from the lowest horizontal side to the highest vertex or side. For odd n, it differs from twice the apothem. As n → ∞, both areas approach πR² and both perimeters approach 2πR.</p>
       </div>
      </>}
    </section>
   </div>
 </div>;
}
