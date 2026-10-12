import assert from 'node:assert/strict';
import {createRopeWave,ropeSample,ropeMetrics,ROPE_WAVE_DEFAULTS as defaults} from '../src/esbiko-physics/waves/ropeWave.js';
const d={...defaults,lengthM:10,excitation:'pulse'};
const close=(a,b,e=1e-10)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
close(ropeMetrics(d).speedMps,10);close(ropeMetrics(d).wavelengthM,10);
close(ropeMetrics({...d,tensionN:80}).speedMps,20);
close(ropeMetrics({...d,densityKgM:.05}).speedMps,20);
for(const excitation of ['pulse','sine'])for(const boundary of ['fixed','free','traveling']){
 const p={...d,boundary,excitation};
 for(let t=0;t<20;t+=.073){const q=ropeSample(p.lengthM,t,p);if(boundary==='fixed')close(q.yM,0);if(boundary==='free')close(q.slope,0);if(boundary==='traveling')close(q.reflectedM,0);}
 // Verify wave PDE away from the onset using independent centered finite differences.
 const x=4.2,t=1.63,h=1e-4,y=(x,t)=>ropeSample(x,t,p).yM;
 const ytt=(y(x,t+h)-2*y(x,t)+y(x,t-h))/h**2,yxx=(y(x+h,t)-2*y(x,t)+y(x-h,t))/h**2;
 close(ytt,100*yxx,2e-5);
}
const fixed=ropeSample(8,1.7,d),free=ropeSample(8,1.7,{...d,boundary:'free'});close(fixed.reflectedM,-.2);close(free.reflectedM,.2);
close(ropeSample(2,.7,{...d,boundary:'traveling'}).yM,.2);
close(ropeSample(7,1.2,{...d,boundary:'traveling'}).yM,.2);
const model=createRopeWave(d);model.step(1);const checkpoint=model.checkpoint();model.configure({playbackRate:1});close(model.snapshot().timeSeconds,1);model.configure({tensionN:30});close(model.snapshot().timeSeconds,0);model.restore(checkpoint);close(model.snapshot().timeSeconds,1);
for(const patch of [{frequencyHz:NaN},{densityKgM:0},{boundary:'bad'},{unknown:1},JSON.parse('{"__proto__":1}')])assert.throws(()=>model.configure(patch));
// After a finite pulse and its return leave the matched source, no residual energy remains.
model.step(2);model.step(1);assert.ok(model.snapshot().samples.every(q=>q.yM===0&&q.velocityMps===0));
// Net energy flux at either reflecting endpoint is zero: -T*y_t*y_x.
for(const boundary of ['free','fixed']){const p={...d,boundary,excitation:'sine'},s=ropeSample(10,2.3,p);close(-p.tensionN*s.velocityMps*s.slope,0);}
console.log('PASS: wave speed scaling, travel time, reflection sign, both endpoint conditions, PDE, zero boundary flux, reset/checkpoint and validation.');

assert.equal(defaults.lengthM/ropeMetrics(defaults).wavelengthM,4);
const driven=createRopeWave({boundary:'traveling'});driven.step(1.25);close(driven.snapshot().source.driveM,driven.snapshot().samples[0].yM);
