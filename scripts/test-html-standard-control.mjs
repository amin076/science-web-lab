import assert from "node:assert/strict";
import {createHtmlReferenceProjectile,HTML_REFERENCE_DEFAULTS,HTML_REFERENCE_ID} from
 "../src/esbiko-physics/mechanics/htmlReferenceProjectile.js";
import {
 HTML_REFERENCE_DESCRIPTOR,createHtmlReferenceDocument,exposeHtmlReferenceState,executeHtmlReferenceCommand,
} from "../functions/control/htmlReferenceControl.mjs";
import {requireSimulationControlAdapter,listSimulationControlAdapters} from "../functions/control/adapterRegistry.mjs";
import {getSimulationProfile,validateSimulationParameters} from "../functions/mcp/simulationRegistry.mjs";
import fs from "node:fs";

assert.equal(HTML_REFERENCE_ID,HTML_REFERENCE_DESCRIPTOR.id);
assert.ok(listSimulationControlAdapters().some(x=>x.id===HTML_REFERENCE_ID));
assert.equal(requireSimulationControlAdapter(HTML_REFERENCE_ID).descriptor.supportedMedia.browserCanvasWebM,true);
assert.equal(requireSimulationControlAdapter(HTML_REFERENCE_ID).descriptor.supportedMedia.serverVideoCapture,false);
assert.equal(getSimulationProfile(HTML_REFERENCE_ID).runUrl,
 "https://www.esbiko.com/examples/html-simulation/index.html");
assert.deepEqual(validateSimulationParameters(HTML_REFERENCE_ID,{startYM:5}),{startYM:5});
assert.throws(()=>validateSimulationParameters(HTML_REFERENCE_ID,{gravityMps2:25}),/must be <=/);
assert.throws(()=>validateSimulationParameters(HTML_REFERENCE_ID,{code:5}),/Unsupported parameter/);
const browser=createHtmlReferenceProjectile();
const server=createHtmlReferenceProjectile();
for(let i=0;i<240;i++){browser.step(1/240);server.step(1/240);}
assert.deepEqual(browser.snapshot(),server.snapshot());
const checkpoint=browser.checkpoint();
const restored=createHtmlReferenceProjectile();
restored.restore(checkpoint);
assert.deepEqual(restored.snapshot(),browser.snapshot());
const exact=browser.snapshot();
assert.ok(Math.abs(exact.position[0]-20)<1e-7);
assert.ok(Math.abs(exact.position[1]-(2+20-4.905))<1e-7);
assert.ok(Math.abs(exact.velocity[1]-(20-9.81))<1e-7);
assert.throws(()=>restored.restore({...checkpoint,timeSeconds:Infinity}),/checkpoint time/);
assert.throws(()=>restored.restore({...checkpoint,trail:[[NaN,0]]}),/trail/);
assert.throws(()=>restored.configure({gravityMps2:NaN}),/Invalid/);
assert.throws(()=>restored.configure({invalid:5}),/Unknown/);

let doc=createHtmlReferenceDocument();
const cmd=(action,request={})=>{
 const response=executeHtmlReferenceCommand(doc,{action,...request});
 doc=response.document;return response;
};
assert.equal(exposeHtmlReferenceState(doc).revision,0);
assert.equal(cmd("get_state").mutation,false);
assert.equal(cmd("get_capabilities").result.schema.properties.gravityMps2.unit,"m/s²");
assert.equal(cmd("advance",{seconds:1}).result.elapsedSeconds,1.0000000000000007);
assert.equal(exposeHtmlReferenceState(doc).revision,1);
assert.ok(Math.abs(exposeHtmlReferenceState(doc).state.position[0]-20)<1e-7);
assert.ok(cmd("get_trajectory",{limit:40}).result.pointsM.length>3);
assert.equal(doc.revision,1,"Readonly trajectory must not mutate revision");
assert.throws(()=>cmd("advance",{seconds:2.1}),/Advance/);
assert.throws(()=>cmd("configure",{parameters:{gravityMps2:999}}),/Invalid parameter/);
assert.equal(exposeHtmlReferenceState(doc).revision,1);
cmd("set_camera",{camera:{zoom:2,x:17}});
assert.equal(doc.camera.zoom,2);
cmd("configure",{parameters:{gravityMps2:5}});
assert.equal(exposeHtmlReferenceState(doc).elapsedSeconds,0);
assert.equal(exposeHtmlReferenceState(doc).state.parameters.gravityMps2,5);
cmd("play");
assert.equal(doc.running,true);
const unchangedTime=doc.checkpoint.timeSeconds;
assert.equal(unchangedTime,0,"Server play only toggles running; explicit advance is required");
cmd("step");assert.ok(doc.checkpoint.timeSeconds>0);
cmd("clear_trails");assert.equal(doc.checkpoint.trail.length,1);
cmd("reset");assert.equal(doc.checkpoint.timeSeconds,0);
assert.equal(doc.running,false);
const before=structuredClone(doc);
assert.deepEqual(executeHtmlReferenceCommand(before,{action:"advance",seconds:.3}).result.state,
 executeHtmlReferenceCommand(before,{action:"advance",seconds:.3}).result.state);
assert.throws(()=>cmd("hack"),/Unknown control action/);
assert.throws(()=>cmd("get_trajectory",{rodIndex:2}),/Only projectile tip/);
const html=fs.readFileSync("examples/html-simulation/main.js","utf8");
assert.ok(html.includes("createHtmlReferenceProjectile"),"UI must use canonical physics model");
assert.ok(html.includes("loadCheckpoint"),"UI must attach remote checkpoint");
assert.ok(html.includes("setCommandHandler"),"UI actions must forward to same remote session");
const transport=fs.readFileSync("functions/mcp/transport.mjs","utf8");
assert.ok(transport.includes("createControlSession(parameters||{},simulationId)"),
 "MCP session creation must route the requested ID");
console.log("HTML FIVE-GATE ENGINE / HTTP / MCP CONTRACT PASS");
