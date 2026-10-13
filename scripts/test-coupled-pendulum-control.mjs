import assert from "node:assert/strict";
import fs from "node:fs";
import {COUPLED_ID,COUPLED_SCHEMA,createCoupledPendulumsModel} from "../src/esbiko-physics/waves/coupledPendulumCordModel.js";
import {COUPLED_DESCRIPTOR,createCoupledControlDocument,exposeCoupledControlState,
 executeCoupledControlCommand} from "../functions/control/coupledPendulumControl.mjs";
import {requireSimulationControlAdapter} from "../functions/control/adapterRegistry.mjs";

assert.equal(COUPLED_DESCRIPTOR.id,COUPLED_ID);
assert.equal(requireSimulationControlAdapter(COUPLED_ID).descriptor.id,COUPLED_ID);
assert.equal(COUPLED_DESCRIPTOR.supportedMedia.browserCanvasWebM,true);
assert.equal(COUPLED_DESCRIPTOR.supportedMedia.serverVideoCapture,false);
assert.ok(COUPLED_DESCRIPTOR.commands.includes("advance"));
assert.equal(COUPLED_SCHEMA.properties.count.maximum,10);
assert.equal(COUPLED_SCHEMA.properties.p10_lengthM.minimum,.45);
for(const count of [1,2,3,4,7,10]){
 const m=createCoupledPendulumsModel({count,connected:true,initialPreset:"middle"});
 const s=m.snapshot();
 assert.equal(s.pendulums.length,count);
 assert.equal(s.knots.length,count);
 assert.ok(s.pendulums.every(p=>Number.isFinite(p.energyJ)));
 m.advance(.06);
 assert.ok(m.snapshot().timeSeconds>.05);
 const cp=m.checkpoint();
 const restored=createCoupledPendulumsModel();
 restored.restore(cp);
 assert.deepEqual(restored.snapshot(),m.snapshot());
}
const source=createCoupledPendulumsModel({count:10,connected:true,supportDamping:0,damping:0,
 tension:55,axialEA:280});
const E0=source.snapshot().energy.totalJ;
source.advance(.5);source.advance(.5);
const Ef=source.snapshot().energy.totalJ;
assert.ok(Math.abs(Ef-E0)/Math.max(.01,Math.abs(E0))<.0001,
 "Conservative system must not create mechanical energy");
const others=source.snapshot().pendulums.filter(p=>p.index!==5);
assert.ok(others.some(p=>Math.abs(p.angleDeg)>1e-8),
 "Coupled pendulums should respond to the middle bob excitation");
const isolated=createCoupledPendulumsModel({count:10,connected:false,
 initialPreset:"middle",supportDamping:0,damping:0});
isolated.advance(1);
assert.ok(isolated.snapshot().pendulums.every(p=>p.index===5||Math.abs(p.angleRad)<1e-12));
const lengths=createCoupledPendulumsModel({count:5,lengthPreset:"ascending"});
assert.deepEqual(lengths.snapshot().pendulums.map(p=>Number(p.lengthM.toFixed(2))),
 [1,1.1,1.2,1.3,1.4]);
assert.throws(()=>lengths.configure({count:11}),/Invalid parameter/);
assert.throws(()=>lengths.configure({p1_massKg:-1}),/Invalid parameter/);
assert.throws(()=>lengths.configure({evil:true}),/Unknown parameter/);
assert.throws(()=>lengths.advance(3),/Advance seconds/);
const doc0=createCoupledControlDocument({count:4,lengthPreset:"equal",initialPreset:"first"});
assert.equal(exposeCoupledControlState(doc0).state.pendulums.length,4);
let doc=doc0;
const cmd=(action,rest={})=>{
 const reply=executeCoupledControlCommand(doc,{action,...rest});doc=reply.document;return reply;
};
assert.equal(cmd("get_state").mutation,false);
assert.equal(cmd("get_capabilities").result.schema.properties.count.maximum,10);
const configured=cmd("configure",{parameters:{p2_lengthM:1.1,p3_massKg:.25}});
assert.equal(configured.mutation,true);
assert.equal(configured.result.state.pendulums[1].lengthM,1.1);
assert.equal(configured.result.state.pendulums[2].massKg,.25);
cmd("play");assert.equal(doc.running,true);
cmd("advance",{seconds:.2});assert.ok(Math.abs(doc.checkpoint.elapsed-.2)<1e-8);
const traj=cmd("get_trajectory",{paneIndex:1,limit:60});
assert.equal(traj.mutation,false);assert.ok(traj.result.points.length>1);
assert.ok(traj.result.points.every(p=>Number.isFinite(p.xM)&&Number.isFinite(p.angleRad)));
const rev=doc.revision;cmd("get_state");assert.equal(doc.revision,rev);
cmd("fire",{paneIndex:3,angleDeg:25});
assert.ok(Math.abs(doc.checkpoint.bobs[2].theta-25*Math.PI/180)<1e-10);
assert.throws(()=>cmd("configure",{parameters:{p1_lengthM:5}}),/Invalid parameter/);
assert.throws(()=>cmd("unknown"),/Unsupported action/);
cmd("pause");assert.equal(doc.running,false);
cmd("reset");assert.equal(doc.checkpoint.elapsed,0);
const cp=createCoupledControlDocument({count:4});
assert.deepEqual(executeCoupledControlCommand(cp,{action:"advance",seconds:.12}).result.state,
 executeCoupledControlCommand(cp,{action:"advance",seconds:.12}).result.state);

const html=fs.readFileSync("src/simulations/subjects/physics/waves/coupled-pendulums-cord/lab.html","utf8");
const react=fs.readFileSync("src/simulations/subjects/physics/waves/coupled-pendulums-cord/index.jsx","utf8");
const transport=fs.readFileSync("functions/mcp/transport.mjs","utf8");
for(const v of ["videoStart","videoStop","videoSave","function startVideo","hydrateCoupled","esbiko-coupled-control-v1"])
 assert.ok(html.includes(v),"Missing browser feature "+v);
assert.ok(react.includes("registerWebMcpTools"));
assert.ok(react.includes("remoteSessionId")&&react.includes("checkpoint=1"));
assert.ok(transport.includes("angleDeg:z.number()")&&transport.includes("max(10).optional()"));
console.log("COUPLED PENDULUMS FIVE-GATE HEADLESS PHYSICS + API + MCP CONTRACT PASS");
