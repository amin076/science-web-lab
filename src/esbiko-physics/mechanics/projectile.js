import { vector3, positive, finite, add, magnitude } from '../math/vector3.js';
import { constantAccelerationStep, accelerationFromForce, kineticEnergy } from './laws.js';
import { uniformGravity } from './gravity.js';
import { quadraticDragForce, sphereFrontalArea } from './drag.js';
import { rk4ParticleStep } from './integrators.js';
/** All physical quantities SI. No lift, spin, wind or atmospheric variation in this model. */
export function launchVelocity(speedMps,angleDeg){positive(speedMps,'speedMps');finite(angleDeg,'angleDeg');const a=angleDeg*Math.PI/180;return vector3([speedMps*Math.cos(a),speedMps*Math.sin(a),0]);}
export function vacuumFlight({launchSpeed,angleDeg,launchHeight,gravity}) {
  positive(gravity,'gravity');finite(launchHeight,'launchHeight');if(launchHeight<0)throw new RangeError('launchHeight must be nonnegative');
  const [vx,vy]=launchVelocity(launchSpeed,angleDeg),duration=(vy+Math.sqrt(vy*vy+2*gravity*launchHeight))/gravity;
  return {vx,vy,duration,range:vx*duration,maxHeight:launchHeight+Math.max(vy,0)**2/(2*gravity)};
}
export function initialProjectile(p){vacuumFlight(p);positive(p.massKg,'massKg');return {position:[0,p.launchHeight,0],velocity:launchVelocity(p.launchSpeed,p.angleDeg),time:0,landed:false,peakHeight:p.launchHeight};}
export function projectileMeasurements(state,p){
  return {x:state.position[0],y:state.position[1],vx:state.velocity[0],vy:state.velocity[1],speedMps:magnitude(state.velocity),kineticEnergyJ:kineticEnergy(state.velocity,p.massKg),potentialEnergyJ:p.massKg*p.gravity*state.position[1]};
}
/** Bounded RK4 substeps and bisection ground event; pre-impact velocity is retained. */
export function advanceProjectileState(state,dt,p) {
  finite(dt,'dt');if(dt<0||dt>1)throw new RangeError('dt must be 0..1 second');
  if(state.landed || dt===0)return structuredClone(state);
  const g=uniformGravity(p.gravity),field=(_,v)=>add(g,p.airResistance?accelerationFromForce(quadraticDragForce(v,{densityKgM3:p.airDensity,dragCoefficient:p.dragCoefficient,areaM2:sphereFrontalArea(p.radiusM)}),p.massKg):[0,0,0]);
  const integrate=(s,h)=>p.airResistance?rk4ParticleStep(s,h,field):constantAccelerationStep(s,h,g);
  let s=structuredClone(state),remaining=dt;
  while(remaining>1e-12){
    const h=Math.min(remaining,1/240),next=integrate(s,h);
    if(next.position[1]<0){
      let lo=0,hi=h;
      for(let i=0;i<32;i++){const m=(lo+hi)/2;if(integrate(s,m).position[1]>=0)lo=m;else hi=m;}
      const impact=integrate(s,lo);impact.position[1]=0;
      return {...impact,time:s.time+lo,landed:true,peakHeight:Math.max(s.peakHeight,impact.position[1])};
    }
    s={...next,time:s.time+h,landed:false,peakHeight:Math.max(s.peakHeight,next.position[1])};remaining-=h;
  }
  return s;
}
