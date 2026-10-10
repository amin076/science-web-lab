import assert from 'node:assert/strict';
import {defaultProjectileParameters as p,sampleProjectile,advanceProjectile,validateProjectilePatch} from '../src/components/admin/examples/simpleProjectileModel.js';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const initial=sampleProjectile(0,p), mid=sampleProjectile(initial.flightTime/2,p),end=sampleProjectile(999,p);
close(initial.range,p.launchSpeed**2*Math.sin(2*p.angleDeg*Math.PI/180)/p.gravity);
close(mid.y,p.launchSpeed**2*Math.sin(p.angleDeg*Math.PI/180)**2/(2*p.gravity));
assert.equal(end.y,0);assert.equal(end.landed,true);close(end.x,initial.range);close(end.time,initial.flightTime);
const launchEnergy=initial.kineticEnergyJ+initial.potentialEnergyJ;
for(let i=0;i<=100;i++){const s=sampleProjectile(initial.flightTime*i/100,p);close(s.kineticEnergyJ+s.potentialEnergyJ,launchEnergy,1e-7);assert.ok(s.y>=0);}
const elevated=sampleProjectile(999,{...p,launchHeight:20});close(elevated.y,0);assert.ok(elevated.range>end.range);
assert.throws(()=>validateProjectilePatch({gravity:0}));assert.throws(()=>validateProjectilePatch({unknown:1}));assert.throws(()=>validateProjectilePatch({launchSpeed:NaN}));assert.throws(()=>sampleProjectile(-1,p));
close(advanceProjectile(initial,0.05,p).time,0.05);
const fast=advanceProjectile(initial,0.05,{...p,speed:2});close(fast.time,0.1);
assert.equal(initial.engine,'Esbiko Physics');
console.log('Simple Projectile: analytic trajectory, energy, touchdown, elevated launch, validation and engine adapter passed');
