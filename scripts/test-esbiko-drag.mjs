import assert from 'node:assert/strict';
import {quadraticDragForce,linearDragForce,rk4ParticleStep,vector} from '../src/esbiko-physics/index.js';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const config={densityKgM3:2,dragCoefficient:0.5,areaM2:1};
const f=quadraticDragForce([3,4,0],config);close(f[0],-7.5);close(f[1],-10);assert.ok(vector.dot(f,[3,4,0])<0);
assert.deepEqual(quadraticDragForce([0,0,0],config),[-0,-0,-0]);close(vector.magnitude(quadraticDragForce([6,8,0],config)),4*vector.magnitude(f));
assert.deepEqual(quadraticDragForce([3,4,0],{...config,windVelocity:[3,4,0]}),[-0,-0,-0]);assert.throws(()=>quadraticDragForce([1,0,0],{...config,densityKgM3:-1}));
let s={position:[0,0,0],velocity:[1,0,0]};for(let i=0;i<100;i++)s=rk4ParticleStep(s,0.01,(_,v)=>linearDragForce(v,2));close(s.velocity[0],Math.exp(-2));close(s.position[0],(1-Math.exp(-2))/2);
// Quadratic fall: dv/dt=g-k*v², v(t)=sqrt(g/k)*tanh(sqrt(g*k)*t).
s={position:[0,0,0],velocity:[0,0,0]};for(let i=0;i<300;i++)s=rk4ParticleStep(s,0.01,(_,v)=>vector.add([0,-9.81,0],quadraticDragForce(v,config)));
close(s.velocity[1],-Math.sqrt(9.81/0.5)*Math.tanh(Math.sqrt(9.81*0.5)*3),1e-6);
console.log('Esbiko drag: v² scaling, opposition, wind-relative velocity, zero speed, linear RK4 and terminal fall analytic reference passed');
