/**
 * Shared HTML reference projectile model. Pure ES module for browser and Node.
 * Scientific law is imported from Esbiko Physics; UI/recording/transports stay outside.
 * This is a deterministic educational reference, not a contact/drag/ground-impact solver.
 */
import {constantAccelerationStep} from "./laws.js";
import {uniformGravity} from "./gravity.js";

export const HTML_REFERENCE_ID="physics.mechanics.html-reference-projectile";
export const HTML_REFERENCE_DEFAULTS=Object.freeze({
 startXM:0,startYM:2,velocityXMps:20,velocityYMps:20,gravityMps2:9.81,
});
export const HTML_REFERENCE_SCHEMA=Object.freeze({
 type:"object",additionalProperties:false,properties:{
  startXM:{type:"number",minimum:-10,maximum:10,unit:"m"},
  startYM:{type:"number",minimum:0,maximum:30,unit:"m"},
  velocityXMps:{type:"number",minimum:-30,maximum:40,unit:"m/s"},
  velocityYMps:{type:"number",minimum:-30,maximum:40,unit:"m/s"},
  gravityMps2:{type:"number",minimum:0,maximum:20,unit:"m/s²"},
 },
});
const bounds=HTML_REFERENCE_SCHEMA.properties;
function patchValid(patch){
 if(!patch||typeof patch!=="object"||Array.isArray(patch)||Object.getPrototypeOf(patch)!==Object.prototype)
  throw new TypeError("Expected plain parameter object");
 for(const [key,value] of Object.entries(patch)){
  const rule=bounds[key];
  if(!rule)throw new RangeError("Unknown parameter: "+key);
  if(typeof value!=="number"||!Number.isFinite(value)||value<rule.minimum||value>rule.maximum)
   throw new RangeError("Invalid parameter: "+key);
 }
}
function finiteVector(array,name){
 if(!Array.isArray(array)||array.length!==3||!array.every(x=>typeof x==="number"&&Number.isFinite(x)))
  throw new RangeError("Invalid vector: "+name);
}
const copy=x=>structuredClone(x);
export function createHtmlReferenceProjectile(initial={}){
 patchValid(initial);
 let parameters={...HTML_REFERENCE_DEFAULTS,...initial};
 let physical,trail,timeSeconds;
 const reset=()=>{
  physical={position:[parameters.startXM,parameters.startYM,0],
   velocity:[parameters.velocityXMps,parameters.velocityYMps,0]};
  trail=[physical.position.slice(0,2)];timeSeconds=0;
  return snapshot();
 };
 const snapshot=()=>({...copy(physical),trail:copy(trail),timeSeconds});
 reset();
 return {
  getParameters:()=>copy(parameters),
  configure(patch){
   patchValid(patch);const next={...parameters,...patch};
   const changed=Object.keys(patch).some(k=>next[k]!==parameters[k]);
   parameters=next;
   if(changed)reset();
   return {reset:changed,parameters:copy(parameters)};
  },
  reset,
  step(dt){
   if(typeof dt!=="number"||!Number.isFinite(dt)||dt<0||dt>0.1)
    throw new RangeError("Invalid simulation step");
   if(dt===0)return snapshot();
   physical=constantAccelerationStep(physical,dt,uniformGravity(parameters.gravityMps2));
   timeSeconds+=dt;
   const tip=physical.position.slice(0,2),last=trail[trail.length-1];
   if(!last||Math.hypot(tip[0]-last[0],tip[1]-last[1])>=0.05){
    trail.push(tip);
    if(trail.length>1200)trail.shift();
   }
   return snapshot();
  },
  snapshot,
  checkpoint:()=>({parameters:copy(parameters),...snapshot()}),
  restore(checkpoint){
   if(!checkpoint||typeof checkpoint!=="object"||Array.isArray(checkpoint))
    throw new TypeError("Invalid reference checkpoint");
   patchValid(checkpoint.parameters);
   if(Object.keys(checkpoint.parameters).length!==Object.keys(HTML_REFERENCE_DEFAULTS).length)
    throw new RangeError("Incomplete reference checkpoint parameters");
   finiteVector(checkpoint.position,"position");
   finiteVector(checkpoint.velocity,"velocity");
   if(typeof checkpoint.timeSeconds!=="number"||!Number.isFinite(checkpoint.timeSeconds)||
      checkpoint.timeSeconds<0||checkpoint.timeSeconds>120.001)
    throw new RangeError("Invalid reference checkpoint time");
   if(!Array.isArray(checkpoint.trail)||checkpoint.trail.length<1||
      checkpoint.trail.length>1200||checkpoint.trail.some(p=>!Array.isArray(p)||p.length!==2||
      !p.every(x=>typeof x==="number"&&Number.isFinite(x))))
    throw new RangeError("Invalid reference trail");
   parameters=copy(checkpoint.parameters);physical={position:copy(checkpoint.position),
     velocity:copy(checkpoint.velocity)};trail=copy(checkpoint.trail);
   timeSeconds=checkpoint.timeSeconds;return snapshot();
  },
  trajectory:({limit=150}={})=>{
   if(!Number.isInteger(limit)||limit<1||limit>300)throw new RangeError("Invalid trajectory limit");
   return copy(trail.slice(-limit));
  },
  clearTrails:()=>{trail=[physical.position.slice(0,2)];return {cleared:true};},
  dispose:()=>{},
 };
}
