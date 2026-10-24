import {ENTIRE_SOLAR_EDUCATIONAL,ENTIRE_SOLAR_SEMI_REALISTIC,ENTIRE_SOLAR_REALISTIC}
  from "../../simulations/subjects/astronomy/space/solar-system/physics/entireSolarScale.jsx";
import {validateModelPatch} from "../mechanics/simplePendulumModel.js";
export const SOLAR_DEFAULTS={speed:1,scaleMode:"educational",focusTarget:"system",showTrails:true,showOrbits:true,showAxis:true,showStars:true,showLabels:true};
export const SOLAR_SCHEMA={type:"object",additionalProperties:false,properties:{
  speed:{type:"number",minimum:0,maximum:30},scaleMode:{type:"string",enum:["educational","semiRealistic","realistic"]},
  focusTarget:{type:"string",enum:["system","sun","mercury","venus","earth","moon","mars","jupiter","saturn","uranus","neptune"]},
  ...Object.fromEntries(["showTrails","showOrbits","showAxis","showStars","showLabels"].map(k=>[k,{type:"boolean"}]))}};
export const solarScale=mode=>mode==="realistic"?ENTIRE_SOLAR_REALISTIC:mode==="semiRealistic"?ENTIRE_SOLAR_SEMI_REALISTIC:ENTIRE_SOLAR_EDUCATIONAL;
// Preserve the existing visual orbital convention (0.1 display-days per phase second).
// These are prescribed ellipse animations, not an N-body or ephemeris calculation.
export function solarPlanetPosition(data,phaseSeconds){
  const a=phaseSeconds*0.1/(data.year||1)*2*Math.PI;
  return [Math.cos(a)*data.orbitMajor-data.focusOffset,0,Math.sin(a)*data.orbitMinor];
}
export function solarMoonPosition(data,phaseSeconds){
  const a=phaseSeconds/(data.period||1)*2*Math.PI;
  return [data.orbitRadius*Math.cos(a),0,data.orbitRadius*Math.sin(a)];
}
function incline([x,y,z],degrees=0){const a=degrees*Math.PI/180;return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a),z];}
export function solarPositions(parameters,phaseSeconds){
  const scale=solarScale(parameters.scaleMode),positions={sun:[0,0,0]};
  for(const id of ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"])
    positions[id]=incline(solarPlanetPosition(scale[id],phaseSeconds),scale[id].inclination);
  positions.moon=incline(solarMoonPosition(scale.moon,phaseSeconds),scale.moon.inclination).map((v,i)=>v+positions.earth[i]);
  return positions;
}
export function createSolarSessionModel(initial={}){
  let parameters={...SOLAR_DEFAULTS},elapsedSeconds=0,phaseSeconds=0,trail=[];
  const configure=patch=>{validateModelPatch(SOLAR_SCHEMA,patch);parameters={...parameters,...patch};};configure(initial);
  return {configure,reset(){elapsedSeconds=0;phaseSeconds=0;trail=[];},
    advance(seconds){elapsedSeconds+=seconds;phaseSeconds+=seconds*parameters.speed;trail.push([elapsedSeconds,...solarPositions(parameters,phaseSeconds).earth]);trail=trail.slice(-400);},
    snapshot:()=>({parameters:{...parameters},elapsedSeconds,phaseSeconds,positions:solarPositions(parameters,phaseSeconds),
      positionUnits:"display scene units",model:"prescribed visual ellipses; not N-body or ephemeris"}),
    checkpoint:()=>({parameters:{...parameters},elapsedSeconds,phaseSeconds,trail:structuredClone(trail)}),
    restore(cp){validateModelPatch(SOLAR_SCHEMA,cp.parameters);if(![cp.elapsedSeconds,cp.phaseSeconds].every(Number.isFinite))throw new Error("Invalid solar checkpoint");parameters={...cp.parameters};elapsedSeconds=cp.elapsedSeconds;phaseSeconds=cp.phaseSeconds;trail=structuredClone(cp.trail||[]);},
    trajectory:()=>structuredClone(trail),clearTrails:()=>{trail=[];}};
}
