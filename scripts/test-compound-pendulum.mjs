import assert from "node:assert/strict";
import {
 createCompoundPendulumModel, compoundPendulumAccelerations,
 COMPOUND_PENDULUM_DEFAULTS, COMPOUND_PENDULUM_PRESETS,
 validateCompoundPendulumConfig,
} from "../src/esbiko-physics/index.js";

const close=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<=tol,actual+" != "+expected);
assert.throws(()=>validateCompoundPendulumConfig({rodCount:0}),RangeError);
assert.throws(()=>validateCompoundPendulumConfig({rodCount:5}),RangeError);
assert.throws(()=>validateCompoundPendulumConfig({lengthM1:0}),RangeError);
assert.throws(()=>validateCompoundPendulumConfig({gravityMps2:NaN}),RangeError);
assert.throws(()=>validateCompoundPendulumConfig({unexpected:1}),RangeError);
const n1={rodCount:1,gravityMps2:9.81,lengthM1:2,linearDensityKgPerM:1,
 initialAngleDeg1:30,initialOmegaRadps1:0,hingeDampingNms1:0};
const single=createCompoundPendulumModel(n1);
const angle=Math.PI/6;
close(compoundPendulumAccelerations(n1,[angle],[0])[0],-3*9.81/(2*2)*Math.sin(angle),1e-10);
assert.equal(single.snapshot().tipsM.length,1);
assert.equal(single.snapshot().units.tipsM,"m");
const before=single.snapshot();
before.anglesRad[0]=100;
assert.notEqual(single.snapshot().anglesRad[0],100);
single.configure({rodCount:2});
assert.equal(single.snapshot().rodCount,2);
assert.equal(single.snapshot().timeSeconds,0);
single.configure(COMPOUND_PENDULUM_PRESETS.originalDouble);
assert.equal(single.snapshot().rodCount,2);
close(single.snapshot().anglesRad[0],0);
close(single.snapshot().omegasRadps[0],14);
close(single.snapshot().omegasRadps[1],0);
const reduced=createCompoundPendulumModel({rodCount:2,gravityMps2:9.81,linearDensityKgPerM:1});
const tails=createCompoundPendulumModel({rodCount:2,gravityMps2:9.81,linearDensityKgPerM:1,
 lengthM3:2.4,lengthM4:2.2,hingeDampingNms3:1,hingeDampingNms4:1,
 initialAngleDeg3:172,initialOmegaRadps4:-29});
for(let i=0;i<100;i++){reduced.step(1/240);tails.step(1/240);}
assert.deepEqual(reduced.snapshot().anglesRad,tails.snapshot().anglesRad);
assert.deepEqual(reduced.snapshot().omegasRadps,tails.snapshot().omegasRadps);
assert.equal(tails.snapshot().tipsM.length,2);
assert.throws(()=>tails.trajectory({rodIndex:3}),RangeError);
for(let n=1;n<=4;n++)for(const damping of [0,.03]){
 const params={rodCount:n};
 for(let i=1;i<=4;i++)params["hingeDampingNms"+i]=damping;
 const model=createCompoundPendulumModel(params);
 const start=model.snapshot().energy.totalJ;
 for(let k=0;k<2400;k++)model.step(1/240);
 const state=model.snapshot();
 close(state.timeSeconds,10,1e-9);
 assert.ok(state.anglesRad.every(Number.isFinite));
 assert.ok(state.omegasRadps.every(Number.isFinite));
 assert.equal(state.tipsM.length,n);
 const delta=state.energy.totalJ-start;
 if(!damping){
   assert.ok(Math.abs(delta)/(Math.abs(start)||1)<5e-5,
     "Energy drift n="+n+" delta="+delta);
 }else{
   assert.ok(delta<0,"Damped dynamics increased energy n="+n);
 }
 assert.ok(model.trajectory({rodIndex:1,limit:200}).length<=201);
 model.clearTrails();
 assert.equal(model.trajectory({rodIndex:1}).length,1);
 const firstTime=model.snapshot().timeSeconds;
 model.configure({trace1:false,showTrails:false,playbackRate:3});
 close(model.snapshot().timeSeconds,firstTime,1e-9);
 model.configure({lengthM1:1.5});
 assert.equal(model.snapshot().timeSeconds,0);
 model.dispose();
 assert.throws(()=>model.snapshot(),/DISPOSED/);
}
console.log("Compound pendulum 1..4: analytical single rod, inactive tails, SI/state, 10s energy, damped decay, NaN guards, trajectories and lifecycle passed.");
