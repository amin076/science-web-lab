import assert from 'node:assert/strict';
import { compoundInstrument, paraxialImage, propagateParaxialRay, refractParaxialRay } from '../src/esbiko-physics/index.js';
import { defaultInstrumentParameters as defaults, configureInstrument, focusInstrument, sampleInstrument } from '../src/simulations/subjects/physics/optics/microscope-telescope/instrumentModel.js';
const near = (a,b,t=1e-10) => assert.ok(Math.abs(a-b)<t, `${a} != ${b}`);
// Independent thin-lens reference: 6 mm objective, object at 6.2 mm => 186 mm image.
near(paraxialImage(0.006,0.0062).distance,0.186);
assert.equal(paraxialImage(0.01,0.01).imageKind,'infinity');
near(paraxialImage(0.01,0.005).distance,-0.01);
assert.throws(()=>paraxialImage(0,1));
// Parallel on-axis rays converge at the focal plane, regardless of pupil height.
for(const y of [-0.004,0,0.004]) near(propagateParaxialRay(refractParaxialRay({height:y,slope:0},0.1),0.1).height,0);
const micro=sampleInstrument(defaults);
near(micro.intermediateImageDistance,0.072); near(micro.objectiveMagnification,-8);
near(micro.angularMagnification,-100); near(micro.exitAngularSpread,0);
assert.equal(micro.finalImageKind,'infinity');
for(const mode of ['refractor','reflector']) {
  const p=configureInstrument(defaults,{mode}); const s=sampleInstrument(p);
  near(s.angularMagnification,-p.objectiveFocal/p.eyepieceFocal);
  near(s.exitAngularSpread,0);
  for(const r of s.rays) near(r.outgoing.slope,-p.objectiveFocal/p.eyepieceFocal*p.fieldAngle*Math.PI/180);
  const defocused=configureInstrument(p,{separation:p.separation+12});
  assert.ok(sampleInstrument(defocused).exitAngularSpread>0);
  assert.equal(sampleInstrument(defocused).angularMagnification,null);
  near(sampleInstrument(focusInstrument(defocused)).exitAngularSpread,0);
}
// A flat secondary adds no power in the unfolded path model.
const p={mode:'refractor',objectiveFocal:0.3,eyepieceFocal:0.03,separation:0.33,fieldAngle:0.002,apertureRadius:0.01};
assert.deepEqual(compoundInstrument(p).rays,compoundInstrument({...p,mode:'reflector'}).rays);
for(const objectDistance of [5,8,9,100]) {
  const s=sampleInstrument(configureInstrument(defaults,{objectDistance}));
  assert.ok(!JSON.stringify(s).includes('NaN'));
  assert.ok(s.rays.every(r=>Number.isFinite(r.outgoing.slope)));
}
assert.equal(sampleInstrument(configureInstrument(defaults,{objectDistance:8})).intermediateImageKind,'infinity');
assert.throws(()=>focusInstrument({...defaults,objectDistance:5}));
for(const patch of [{separation:NaN},{mode:'bad'},{zoom:0},{oops:1}]) assert.throws(()=>configureInstrument(defaults,patch));
assert.equal(defaults.mode,'microscope');
console.log('Compound optics: lens references, afocal ray fans, magnification, defocus, mode presets and validation passed.');
