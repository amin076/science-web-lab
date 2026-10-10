import assert from "node:assert/strict";
import { SOLAR_DISTANCE_KM, SUN_RADIUS_KM, EARTH_RADIUS_KM, MOON_DISTANCE_KM,
  drawSunContext, drawSunlightDirection, drawEarthSunlitHemisphere } from "../src/simulations/subjects/astronomy/space/satellites-telescopes/sunContext.js";

assert(SOLAR_DISTANCE_KM > MOON_DISTANCE_KM * 300, "Sun must be much farther than Moon");
assert(SUN_RADIUS_KM > EARTH_RADIUS_KM * 100, "Sun is over 100 Earth radii");
const calls=[];
const ctx=new Proxy({}, {get(_,prop) {
  if(prop==="canvas")return {};
  if(["beginPath","roundRect","fill","stroke","arc","moveTo","lineTo","setLineDash","closePath","save","restore","fillText"].includes(prop))
    return (...args)=>calls.push([prop,...args]);
  return undefined;
},set(){return true;}});
for(const mode of ["EDUCATIONAL","REALISTIC"]) {
  calls.length=0;
  drawSunContext(ctx,360,650,mode,Math.PI / 3);
  assert(calls.some(c=>c[0]==="fillText" && c[1].includes(mode==="EDUCATIONAL"?"Education":"Realistic")));
  assert(calls.some(c=>c[0]==="fillText" && c[1].includes("149.6 million km")));
  assert(calls.some(c=>c[0]==="fillText" && c[1].toLowerCase().includes("not to scale")));
}
drawSunlightDirection(ctx,180,220,35,360,650);
drawEarthSunlitHemisphere(ctx,180,220,35);
assert(calls.some(c=>c[0]==="fillText" && c[1].includes("384,400 km")));
assert(calls.filter(c=>c[0]==="arc").length >= 4);
console.log("SUN 2D CONTEXT TEST PASS");
