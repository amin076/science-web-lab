import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createFractalModel,DEFAULTS,FRACTAL_ID,TYPES,PALETTES,stats,normalise,walkFractal,escapePoint} from "../src/esbiko-physics/math/fractalModel.js";
import {requireSimulationControlAdapter} from "../functions/control/adapterRegistry.mjs";
assert.equal(FRACTAL_ID,"math.geometry.fractals-2d");
assert.equal(Object.keys(TYPES).length,19);
assert.equal(PALETTES.length,10);
for(const type of Object.keys(TYPES)){
 const p=normalise(DEFAULTS,{type,level:Math.min(3,TYPES[type].max)});
 const s=stats(p);
 assert.ok(Number.isFinite(s.theoreticalElements)&&s.theoreticalElements>=1,type);
 if(!["mandelbrot","julia","burning_ship","tricorn"].includes(type)){
  const result=walkFractal(p,{maxNodes:250000,scale:1e8,minPixels:0});
  assert.equal(result.limited,false,type);
 }
}
for(const family of ["mandelbrot","julia","burning_ship","tricorn"]){
 assert.equal(escapePoint(family,3,3,300).inside,false,family);
}
assert.throws(()=>normalise(DEFAULTS,{ratio:.99}));
assert.throws(()=>normalise(DEFAULTS,{glow:150}));
const adapter=requireSimulationControlAdapter(FRACTAL_ID);
assert.ok(adapter.descriptor.commands.includes("set_camera"));
assert.equal(adapter.descriptor.supportedMedia.browserCanvasWebM,true);
let doc=adapter.create({type:"julia",level:4,palette:"aurora"});
assert.equal(adapter.expose(doc).state.parameters.palette,"aurora");
assert.throws(()=>adapter.execute(doc,{action:"configure",parameters:{level:200}}));
assert.throws(()=>adapter.execute(doc,{action:"set_camera",camera:{zoom:50001}}));
doc=adapter.execute(doc,{action:"set_camera",camera:{zoom:50000,x:120.5,y:-7}}).document;
assert.equal(adapter.expose(doc).camera.zoom,50000);
doc=adapter.execute(doc,{action:"advance",seconds:1.4}).document;
const clone=JSON.parse(JSON.stringify(doc));
assert.deepEqual(adapter.expose(clone),adapter.expose(doc),"checkpoint must roundtrip");
doc=adapter.execute(doc,{action:"configure",parameters:{gradient:false,glow:0}}).document;
assert.equal(adapter.expose(doc).state.parameters.gradient,false);
const html=readFileSync(new URL("../public/fractal-lab/index.html",import.meta.url),"utf8");
assert.match(html,/esbiko_fractals_get_state/);
assert.match(html,/esbiko-fractal-snapshot-v1/);
assert.match(html,/pointermove/);
assert.match(html,/MediaRecorder/);
assert.match(html,/@media \(max-width:560px\)/);
console.log("PASS: 19 fractal families, deterministic shared model, advanced MCP adapter, 50k zoom, WebMCP, video and mobile source");
