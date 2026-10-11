/**
 * A presentation-level ensemble of 1–4 independent physical pendulums.
 * All equations, energy and integrators remain in esbiko-physics.
 * Each pendulum advances through the SAME simulated time increment.
 */
import {
 createCompoundPendulumModel, COMPOUND_PENDULUM_DEFAULTS,
 COMPOUND_PENDULUM_PARAMETER_SCHEMA,
} from "../../../../../esbiko-physics/mechanics/compoundPendulum.js";

export const COMPARISON_MAX = 4;
const fields=Object.keys(COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties).filter(k=>k!=="playbackRate");
export const COMPARISON_PANE_FIELDS=Object.freeze(fields);
export const COMPARISON_PARAMETER_SCHEMA=Object.freeze({
 type:"object",additionalProperties:false,properties:{
  paneCount:{type:"integer",minimum:1,maximum:4},
  selectedPane:{type:"integer",minimum:1,maximum:4},
  playbackRate:{type:"number",minimum:0.25,maximum:2},
  ...Object.fromEntries(Array.from({length:COMPARISON_MAX},(_,i)=>
    fields.map(k=>["p"+(i+1)+"_"+k,COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties[k]])).flat()),
 }
});
export const COMPARISON_DEFAULTS=Object.freeze({
 paneCount:2,selectedPane:1,playbackRate:1,
 ...Object.fromEntries(Array.from({length:COMPARISON_MAX},(_,i)=>
  fields.map(k=>["p"+(i+1)+"_"+k,COMPOUND_PENDULUM_DEFAULTS[k]])).flat()),
 // Tiny perturbation makes the default comparison educational without introducing a new force.
 p2_initialOmegaRadps1:15.05,
 p3_initialAngleDeg1:155.2,
 p4_lengthM2:1.025,
});
export function paneConfig(config,index){
 if(!Number.isInteger(index)||index<1||index>COMPARISON_MAX)throw new RangeError("Invalid pane");
 return Object.fromEntries(fields.map(key=>[key,config["p"+index+"_"+key]]));
}
export function panePatch(index,patch){
 if(!Number.isInteger(index)||index<1||index>COMPARISON_MAX)throw new RangeError("Invalid pane");
 const result={};
 for(const [key,value] of Object.entries(patch)){
  if(!fields.includes(key))throw new RangeError("Unknown pane parameter "+key);
  result["p"+index+"_"+key]=value;
 }
 return result;
}
export function createCompoundPendulumComparison(initial=COMPARISON_DEFAULTS) {
 const models=Array.from({length:COMPARISON_MAX},()=>createCompoundPendulumModel());
 let config={...COMPARISON_DEFAULTS,...initial},disposed=false,liveTime=0;
 const check=()=>{if(disposed)throw new Error("COMPARISON_DISPOSED");};
 function validate(value) {
  for(const [key,v] of Object.entries(value)){
   const rule=COMPARISON_PARAMETER_SCHEMA.properties[key];
   if(!rule)throw new RangeError("Unknown comparison parameter: "+key);
   if((rule.type==="boolean" && typeof v!=="boolean") ||
      ((rule.type==="number"||rule.type==="integer") &&
       (typeof v!=="number"||!Number.isFinite(v)||v<rule.minimum||v>rule.maximum||
        (rule.type==="integer"&&!Number.isInteger(v))))throw new RangeError("Invalid "+key);
  }
  if(value.selectedPane>value.paneCount)throw new RangeError("Selected pane exceeds active pane count");
 }
 function reset(settings=config){
  check();const next={...COMPARISON_DEFAULTS,...settings};
  validate(next);
  config=next;
  models.forEach((m,i)=>m.reset(paneConfig(next,i+1)));
  liveTime=0;
  return snapshot();
 }
 function configure(next) {
  check();
  const proposed={...config,...next};
  if(Object.hasOwn(next,"paneCount") && !Object.hasOwn(next,"selectedPane"))
   proposed.selectedPane=Math.min(proposed.selectedPane,proposed.paneCount);
  validate(proposed);
  const physicsChanged=Object.entries(proposed).some(([key,v])=>
    v!==config[key] && (key==="paneCount" || (/^p[1-4]_/.test(key) &&
    !["trace","showTrails","fadeTrails","showRods","showGrid"].some(field=>
      key.replace(/^p[1-4]_/, "").startsWith(field)))));
  if(physicsChanged) { reset(proposed);return {reset:true,parameters:{...config}}; }
  config=proposed;
  // Display-only settings must update the underlying model without resetting time.
  for(let i=0;i<COMPARISON_MAX;i++){
   const subset={};
   for(const [key,value] of Object.entries(next)){
     const prefix="p"+(i+1)+"_";
     if(key.startsWith(prefix))subset[key.slice(prefix.length)]=value;
   }
   if(Object.keys(subset).length)models[i].configure(subset);
  }
  return {reset:false,parameters:{...config}};
 }
 function step(dt){
  check();
  if(!Number.isFinite(dt)||dt<0||dt>0.1)throw new RangeError("Invalid time step");
  for(let i=0;i<config.paneCount;i++)models[i].step(dt);
  liveTime+=dt;
  return snapshot();
 }
 function snapshot(){
  check();
  return {
   paneCount:config.paneCount,selectedPane:config.selectedPane,timeSeconds:liveTime,
   pendulums:models.slice(0,config.paneCount).map((m,i)=>({
      paneIndex:i+1,...m.snapshot(),
   })),
   comparisons:models.slice(1,config.paneCount).map((m,i)=>{
     const a=models[0].snapshot().tipsM.at(-1);
     const b=m.snapshot().tipsM.at(-1);
     return {paneIndex:i+2,tipSeparationM:Math.hypot(a[0]-b[0],a[1]-b[1])};
   }),
   units:{time:"s",tipSeparation:"m"},
  };
 }
 function trajectory({paneIndex=config.selectedPane,rodIndex,limit=1000}={}){
  check();
  if(!Number.isInteger(paneIndex)||paneIndex<1||paneIndex>config.paneCount)throw new RangeError("Inactive comparison pane");
  return models[paneIndex-1].trajectory({rodIndex,limit});
 }
 function clearTrails({paneIndex}={}) {
  check();
  if(paneIndex!==undefined){
   if(!Number.isInteger(paneIndex)||paneIndex<1||paneIndex>config.paneCount)throw new RangeError("Inactive comparison pane");
   models[paneIndex-1].clearTrails();
  }else models.slice(0,config.paneCount).forEach(m=>m.clearTrails());
  return {cleared:true,paneIndex:paneIndex||"all"};
 }
 function dispose(){if(disposed)return;disposed=true;models.forEach(m=>m.dispose());}
 reset(config);
 return {configure,reset,step,snapshot,trajectory,clearTrails,dispose,getParameters:()=>({...config})};
}
