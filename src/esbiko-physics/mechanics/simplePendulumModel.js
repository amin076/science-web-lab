export const PENDULUM_DEFAULTS={lengthM:2.1,massKg:2,entryAngle:38,elasticity:1,
  pxPerMeter:160,bobRadius:22,trailLen:200,showVectors:true,showTrail:true,showGraph:false};
export const PENDULUM_SCHEMA={type:"object",additionalProperties:false,properties:{
  lengthM:{type:"number",minimum:0.5,maximum:3,unit:"m"},massKg:{type:"number",minimum:0.1,maximum:10,unit:"kg"},
  entryAngle:{type:"number",minimum:-170,maximum:170,unit:"deg"},elasticity:{type:"number",minimum:0.98,maximum:1},
  pxPerMeter:{type:"number",minimum:100,maximum:250},bobRadius:{type:"number",minimum:10,maximum:50},
  trailLen:{type:"integer",minimum:0,maximum:400},showVectors:{type:"boolean"},showTrail:{type:"boolean"},showGraph:{type:"boolean"}}};
export function validateModelPatch(schema,patch){
  if(!patch||typeof patch!=="object"||Array.isArray(patch))throw Object.assign(new Error("Expected parameter object"),{status:400,code:"INVALID_CONTROL_INPUT"});
  for(const [key,value] of Object.entries(patch)){
    const r=schema.properties[key];
    if(!r||((r.type==="number"||r.type==="integer")?
      typeof value!=="number"||!Number.isFinite(value)||(r.type==="integer"&&!Number.isInteger(value))||value<r.minimum||value>r.maximum:
      typeof value!==r.type)||(r.enum&&!r.enum.includes(value)))throw Object.assign(new Error("Invalid parameter: "+key),{status:400,code:"INVALID_CONTROL_INPUT"});
  }
}
export function stepPendulumState(s,p,seconds){
  const count=Math.ceil(seconds/(1/240)),dt=seconds/count;
  for(let i=0;i<count;i++){
    s.alpha=-(9.81/p.lengthM)*Math.sin(s.theta);
    s.omega=(s.omega+s.alpha*dt)*Math.pow(p.elasticity,dt*60);
    s.theta+=s.omega*dt;s.tSec+=dt;
  }
  return s;
}
export function pendulumMeasurements(s,p){
  const posX=p.lengthM*Math.sin(s.theta),posY=p.lengthM*Math.cos(s.theta);
  const speed=Math.abs(p.lengthM*s.omega),ke=0.5*p.massKg*speed*speed;
  const pe=p.massKg*9.81*(p.lengthM-posY);
  return {posX,posY,velX:p.lengthM*s.omega*Math.cos(s.theta),velY:-p.lengthM*s.omega*Math.sin(s.theta),speed,ke,pe,total:ke+pe};
}
export function createSimplePendulumModel(initial={}){
  let parameters={...PENDULUM_DEFAULTS},state,trail=[];
  const reset=()=>{state={theta:parameters.entryAngle*Math.PI/180,omega:0,alpha:0,tSec:0};trail=[];};
  const configure=patch=>{validateModelPatch(PENDULUM_SCHEMA,patch);parameters={...parameters,...patch};if(!state||"entryAngle" in patch)reset();};
  configure(initial);
  return {configure,reset,advance(seconds){stepPendulumState(state,parameters,seconds);trail.push([state.tSec,state.theta]);trail=trail.slice(-400);},
    snapshot:()=>({parameters:{...parameters},...state,elapsedSeconds:state.tSec,...pendulumMeasurements(state,parameters)}),
    checkpoint:()=>({parameters:{...parameters},...state,trail:structuredClone(trail)}),
    restore(cp){validateModelPatch(PENDULUM_SCHEMA,cp.parameters);if(![cp.theta,cp.omega,cp.alpha,cp.tSec].every(Number.isFinite))throw new Error("Invalid pendulum checkpoint");parameters={...cp.parameters};state={theta:cp.theta,omega:cp.omega,alpha:cp.alpha,tSec:cp.tSec};trail=structuredClone(cp.trail||[]);},
    trajectory:()=>structuredClone(trail),clearTrails:()=>{trail=[];}};
}
