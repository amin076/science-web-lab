import assert from 'node:assert/strict';
import {constantAccelerationStep,centralGravity,uniformGravity,pairGravityForce,springForce,accelerationFromForce,kineticEnergy,velocityVerletStep,createParticleModel,circularOrbitSpeed,orbitalPeriod,EARTH_MU_SI,calculateOpticalElement,vector} from '../src/esbiko-physics/index.js';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b} (tol ${t})`);
const ballistic=constantAccelerationStep({position:[0,0,0],velocity:[20,20,0]},2,uniformGravity(9.81));
close(ballistic.position[0],40);close(ballistic.position[1],20.38);close(ballistic.velocity[1],0.38);assert.equal(ballistic.position[2],0);
close(vector.magnitude(centralGravity([2,0,0],100)),25);
close(vector.magnitude(centralGravity([4,0,0],100)),6.25);
assert.deepEqual(centralGravity([5,3,0],100,[3,3,0]),[-25,-0,-0]);
const f=pairGravityForce([0,0,0],2,[3,4,0],7),back=pairGravityForce([3,4,0],7,[0,0,0],2);
f.forEach((x,i)=>close(x,-back[i],1e-25));
assert.throws(()=>centralGravity([0,0,0],1),RangeError);
assert.throws(()=>accelerationFromForce([1,0,0],0),RangeError);
assert.throws(()=>vector.vector3([1,NaN,0]),TypeError);
assert.throws(()=>velocityVerletStep({position:[0,0,0],velocity:[0,0,0]},-1,()=>[0,0,0]),RangeError);
close(circularOrbitSpeed(7e6)**2,EARTH_MU_SI/7e6,1e-8);
close(orbitalPeriod(7e6),2*Math.PI*7e6/circularOrbitSpeed(7e6),1e-9);
function orbitError(n) {
 let s={position:[1,0,0],velocity:[0,1,0]},maxEnergy=0;
 for(let i=0;i<n;i++){s=velocityVerletStep(s,2*Math.PI/n,p=>centralGravity(p,1));maxEnergy=Math.max(maxEnergy,Math.abs(kineticEnergy(s.velocity,1)-1/vector.magnitude(s.position)+0.5));}
 close(vector.cross(s.position,s.velocity)[2],1,1e-12);
 assert.ok(maxEnergy<1e-4);
 return Math.hypot(s.position[0]-1,s.position[1]);
}
assert.ok(orbitError(400)<orbitError(200)/3);
const spring=createParticleModel({position:[1,0,0],velocity:[0,0,0],dtSeconds:0.001,accelerationAt:p=>accelerationFromForce(springForce(p,[0,0,0],4),1)});
const out=spring.step(1000);close(out.position[0],Math.cos(2),1e-6);assert.equal(out.position[1],0);assert.equal(out.position[2],0);
out.position[0]=99;assert.notEqual(spring.snapshot().position[0],99);spring.reset();assert.equal(spring.snapshot().timeSeconds,0);spring.dispose();assert.throws(()=>spring.step(),/DISPOSED/);
const init={position:[0,0,0],velocity:[1,2,0],dtSeconds:0.01,accelerationAt:()=>[0,-9.81,0]};
const a=createParticleModel(init),b=createParticleModel(init);a.step(100);for(let i=0;i<100;i++)b.step();assert.deepEqual(a.snapshot(),b.snapshot());
assert.throws(()=>a.step(10001),RangeError);
const image=calculateOpticalElement('convex-lens',10,30,3);close(image.di,15);close(image.m,-0.5);close(image.hi,-1.5);
assert.equal(calculateOpticalElement('convex-lens',10,10,3).di,10000);
assert.equal(calculateOpticalElement('concave-lens',10,30,3).isReal,false);
console.log('Esbiko Physics v0.1: ballistic, inverse-square, reaction forces, orbital convergence/conservation, spring, lifecycle, dimension embedding, optics passed');
