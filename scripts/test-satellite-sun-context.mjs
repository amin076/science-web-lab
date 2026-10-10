import assert from "node:assert/strict";
import { SOLAR_DISTANCE_KM, SUN_RADIUS_KM, EARTH_RADIUS_KM, MOON_DISTANCE_KM,
  earthSolarOrbit, EARTH_YEAR_SECONDS, drawEarthSolarOrbit, sunDisplayGeometry, drawSun, drawSunContext, drawSunlightDirection, drawEarthSunlitHemisphere } from "../src/simulations/subjects/astronomy/space/satellites-telescopes/sunContext.js";

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

for (const mode of ["EDUCATIONAL", "REALISTIC"]) {
  const sun = sunDisplayGeometry(mode);
  assert(sun.x < 0 && sun.radius > 0);
  if (mode === "REALISTIC") assert.equal(-sun.x, SOLAR_DISTANCE_KM * (1-0.0167));
  else {
    assert(sun.radius >= EARTH_RADIUS_KM * 10, "Sun must dwarf Earth");
    assert(-sun.x - sun.radius > 34000 * 10, "Sun must be far beyond Moon orbit");
  }
  for (const [width, height] of [[360,290], [800,500]]) {
    const zoom = Math.min(width * 0.65, height * 0.65) * EARTH_RADIUS_KM /
      ((Math.abs(sun.x) + sun.radius * 3.4) * Math.min(width,height) * 0.28 * 5);
    const kmToPx = Math.min(width,height) * 0.28 * zoom * 5 / EARTH_RADIUS_KM;
    const earthX = width / 2 - sun.x * kmToPx / 2;
    const sunX = earthX + sun.x * kmToPx;
    const radius = Math.max(6, sun.radius * kmToPx) * 1.7;
    assert(sunX - radius > 0 && earthX < width, "Sun and Earth must fit viewport");
    const rendered=[];
    const canvas=new Proxy({}, {get(_,key) {
      if(key === "createRadialGradient") return () => ({addColorStop(){}});
      return (...args)=>rendered.push([key,...args]);
    },set(){return true;}});
    drawSun(canvas,sunX,height/2,sun.radius*kmToPx);
    assert(rendered.filter(c=>c[0] === "arc").length === 2, "Separate corona and solid solar disc");
    assert(rendered.some(c=>c[0] === "fillText" && c[1].startsWith("Sun")));
  }
}
console.log("SUN SCENE GEOMETRY AND RENDER PASS");

for(const t of [0, EARTH_YEAR_SECONDS/4, EARTH_YEAR_SECONDS/2, EARTH_YEAR_SECONDS]) {
  const o=earthSolarOrbit(t);
  assert(o.b<o.a && o.e===0.0167);
  // Rotate Earth-relative origin back into the ellipse's unrotated frame.
  const dx=-o.centerX,dy=-o.centerY;
  const x=dx*Math.cos(o.angle)-dy*Math.sin(o.angle);
  const y=dx*Math.sin(o.angle)+dy*Math.cos(o.angle);
  assert(Math.abs(x*x/(o.a*o.a)+y*y/(o.b*o.b)-1)<1e-10,"Earth lies on ellipse");
  assert(Math.abs(Math.hypot(o.a*o.e*Math.cos(o.angle),o.a*o.e*Math.sin(o.angle))-o.a*o.e)<1e-6);
}
console.log("EARTH SOLAR ELLIPSE / FOCUS / ANNUAL MOTION PASS");

const { lunarRelativeState } = await import("../src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.physics.js");
const { SATELLITE_CONFIGS, MOON } = await import("../src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.constants.js");
for(const type of ["LRO","CAPSTONE","GATEWAY"]) {
  const c=SATELLITE_CONFIGS[type];
  const initial=lunarRelativeState(c,0);
  const opposite=lunarRelativeState(c,initial.period/2);
  const returned=lunarRelativeState(c,initial.period);
  assert(Math.hypot(initial.pos.x,initial.pos.y)>MOON.radiusKm);
  assert(Math.hypot(opposite.pos.x,opposite.pos.y)>MOON.radiusKm);
  assert(Math.hypot(returned.pos.x-initial.pos.x,returned.pos.y-initial.pos.y)<1e-6);
  assert.equal(c.centralBody,"MOON");
}
assert(SATELLITE_CONFIGS.GATEWAY.planned);
assert(SATELLITE_CONFIGS.CAPSTONE.historical);
console.log("LUNAR BODY / PERIOD / MISSION LABELS PASS");
