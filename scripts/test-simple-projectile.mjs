import assert from 'node:assert/strict';
import {defaultProjectileParameters as p,sampleProjectile,advanceProjectile,validateProjectilePatch,projectileFlight,projectileCamera} from '../src/components/admin/examples/simpleProjectileModel.js';
const close=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const flight=projectileFlight(p),initial=sampleProjectile(0,p),mid=sampleProjectile(flight.duration/2,p),end=sampleProjectile(999,p);
assert.equal(initial.range,null);assert.equal(initial.flightTime,null);
close(end.range,p.launchSpeed**2*Math.sin(2*p.angleDeg*Math.PI/180)/p.gravity);
close(mid.y,p.launchSpeed**2*Math.sin(p.angleDeg*Math.PI/180)**2/(2*p.gravity));
assert.equal(end.y,0);assert.equal(end.landed,true);close(end.x,flight.range);close(end.time,flight.duration);
const energy=initial.kineticEnergyJ+initial.potentialEnergyJ;
for(let i=0;i<=20;i++){const s=sampleProjectile(flight.duration*i/20,p);close(s.kineticEnergyJ+s.potentialEnergyJ,energy,1e-6);assert.ok(s.y>=0);close(s.speedMps,Math.hypot(s.vx,s.vy));}
const drag={...p,airResistance:true},dragEnd=sampleProjectile(999,drag);
assert.ok(dragEnd.range<end.range);assert.ok(dragEnd.maxHeight<mid.y);assert.ok(dragEnd.kineticEnergyJ<energy);
const zeroDrag=sampleProjectile(999,{...drag,dragCoefficient:0});close(zeroDrag.range,end.range,1e-5);
let stepped=sampleProjectile(0,drag);for(let i=0;i<100;i++)stepped=advanceProjectile(stepped,0.02,drag);const sampled=sampleProjectile(2,drag);close(stepped.x,sampled.x,1e-6);close(stepped.y,sampled.y,1e-6);
for(const values of [{massKg:0.1,radiusM:0.2,dragCoefficient:1.2,airDensity:2},{launchSpeed:80,angleDeg:85,gravity:1}]){let s=sampleProjectile(0,{...drag,...values});for(let i=0;i<100;i++)s=advanceProjectile(s,0.05,{...drag,...values});assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y));}
assert.ok(sampleProjectile(999,{...p,launchHeight:20}).range>end.range);
for(const patch of [{gravity:0},{unknown:1},{launchSpeed:NaN},{massKg:0},{dragCoefficient:-1}])assert.throws(()=>validateProjectilePatch(patch));
assert.throws(()=>sampleProjectile(-1,p));close(advanceProjectile(initial,0.05,p).time,0.05);close(advanceProjectile(initial,0.05,{...p,speed:2}).time,0.1);
assert.equal(initial.engine,'Esbiko Physics');console.log('Simple Projectile: vacuum references, drag dissipation/reduced range, zero-drag limit, timestep comparison, impact and schema passed');

for(const view of [{width:360,height:320},{width:1200,height:700},{width:1,height:1}]){const camera=projectileCamera(view,p);assert.ok(Number.isFinite(camera.scale)&&camera.scale>0);const zoom=projectileCamera(view,{...p,zoom:2});close(zoom.scale,2*camera.scale);const pan=projectileCamera(view,{...p,panX:2,panY:3});close(pan.originX-camera.originX,2*camera.scale);close(pan.originY-camera.originY,-3*camera.scale);}
assert.deepEqual(sampleProjectile(2,{...p,zoom:3,panX:5}),sampleProjectile(2,p));
console.log('Camera: mobile/desktop/tiny viewport, zoom/pan projection and physics independence passed');
