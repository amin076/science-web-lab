import assert from "node:assert/strict";
import fs from "node:fs";
import {
 DESCRIPTOR,createControlDocument,exposeControlState,executeSimulationCommand,
} from "../functions/control/controlCore.mjs";
import {createCompoundPendulumModel}
 from "../src/esbiko-physics/mechanics/compoundPendulum.js";
import {createCompoundPendulumComparison}
 from "../src/simulations/subjects/physics/mechanics/compound-pendulum/comparisonModel.js";

const contract=["get_state","get_capabilities","configure","advance","step","play",
 "pause","reset","get_trajectory","clear_trails","set_camera"];
assert.deepEqual(DESCRIPTOR.commands,contract);
assert.equal(DESCRIPTOR.transport.join(","),"http,mcp");
assert.equal(DESCRIPTOR.supportedMedia.serverVideoCapture,false);
assert.equal(DESCRIPTOR.schema.properties.p2_initialOmegaRadps1.unit,"rad/s");
const single=createCompoundPendulumModel({rodCount:2});
single.step(1/240);
const cp=single.checkpoint();
const clone=createCompoundPendulumModel({rodCount:1});
assert.deepEqual(clone.restore(cp).anglesRad,single.snapshot().anglesRad);
single.step(1/240);clone.step(1/240);
assert.deepEqual(single.snapshot().omegasRadps,clone.snapshot().omegasRadps);
assert.throws(()=>clone.restore({...cp,anglesRad:[NaN,0]}),RangeError);
single.dispose();clone.dispose();
const compare=createCompoundPendulumComparison();
compare.step(1/240);
const saved=compare.checkpoint();
const replica=createCompoundPendulumComparison();
replica.restore(saved);
assert.deepEqual(replica.snapshot(),compare.snapshot());
compare.step(1/240);replica.step(1/240);
assert.deepEqual(replica.snapshot(),compare.snapshot());
compare.dispose();replica.dispose();

const initial=createControlDocument({paneCount:2,p1_rodCount:3,p2_rodCount:3});
assert.equal(initial.simulationId,DESCRIPTOR.id);
let doc=initial;
const cmd=(action,rest={})=>{
 const result=executeSimulationCommand(doc,{action,...rest});
 doc=result.document;return result;
};
assert.equal(cmd("get_state").result.state.pendulums.length,2);
assert.equal(doc.revision,0);
assert.equal(exposeControlState(doc).state.parameters.p2_initialOmegaRadps1,15.05);
assert.equal(cmd("get_capabilities").result.limits.maxAdvanceSeconds,2);
assert.equal(cmd("configure",{parameters:{p2_initialAngleDeg1:155.1}}).mutation,true);
assert.equal(doc.revision,1);
assert.equal(doc.checkpoint.parameters.p1_initialAngleDeg1,155);
assert.equal(doc.checkpoint.parameters.p2_initialAngleDeg1,155.1);
assert.throws(()=>cmd("configure",{parameters:{p2_initialAngleDeg1:NaN}}),/Invalid|out of range/i);
assert.throws(()=>cmd("configure",{parameters:{p1_rodCount:5}}),/range/i);
assert.throws(()=>cmd("configure",{parameters:{p1_unknown:20}}),/Unknown parameter/);
assert.equal(doc.revision,1);
cmd("play");assert.equal(doc.running,true);
const before=exposeControlState(doc);
assert.equal(before.elapsedSeconds,0);
cmd("advance",{seconds:0.2});
const now=exposeControlState(doc);
assert.ok(Math.abs(now.elapsedSeconds-0.2)<1e-8);
assert.ok(now.state.pendulums.every(p=>p.anglesRad.every(Number.isFinite)));
assert.ok(now.state.comparisons[0].tipSeparationM>0);
assert.ok(Number.isFinite(now.state.pendulums[0].energy.totalJ));
assert.throws(()=>cmd("advance",{seconds:3}),/Advance seconds/);
assert.throws(()=>cmd("advance",{seconds:0}),/Advance seconds/);
assert.ok(cmd("get_trajectory",{paneIndex:1,rodIndex:2,limit:25}).result.pointsM.length>0);
assert.throws(()=>cmd("get_trajectory",{paneIndex:9,rodIndex:2}),RangeError);
cmd("set_camera",{camera:{x:15,zoom:2.1}});
assert.equal(doc.camera.zoom,2.1);
cmd("pause");assert.equal(doc.running,false);
cmd("clear_trails",{paneIndex:2});
cmd("reset");assert.equal(doc.checkpoint.timeSeconds,0);
assert.equal(doc.running,false);
assert.throws(()=>cmd("unsupported"),/Unknown control action/);
assert.equal(exposeControlState(doc).state.pendulums.length,2);
// A replay from a checkpoint must remain deterministic.
const current=structuredClone(doc);
const a=executeSimulationCommand(current,{action:"advance",seconds:0.15}).result;
const b=executeSimulationCommand(current,{action:"advance",seconds:0.15}).result;
assert.deepEqual(a.state,b.state);
const apiText=fs.readFileSync("functions/control/http.mjs","utf8");
const mcpText=fs.readFileSync("functions/mcp/transport.mjs","utf8");
for(const name of ["createControlSession","commandControlSession","readControlSession"])
  assert.ok(apiText.includes(name)&&mcpText.includes(name),name+" must serve both transports");
console.log("Simulation Control API scientific + checkpoint + validation + state readback + commands + shared HTTP/MCP service PASS");
