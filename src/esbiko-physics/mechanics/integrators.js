import { add, scale, vector3, finite } from '../math/vector3.js';
/** Position-dependent, autonomous acceleration only. Not valid for velocity-dependent drag. */
export function velocityVerletStep({position,velocity},dtSeconds,accelerationAt) {
  vector3(position); vector3(velocity); finite(dtSeconds,'dtSeconds');
  if(dtSeconds<0) throw new RangeError('dtSeconds must be nonnegative');
  if(typeof accelerationAt!=='function') throw new TypeError('accelerationAt must be a function');
  const half=add(velocity,scale(accelerationAt([...position]),dtSeconds/2));
  const next=add(position,scale(half,dtSeconds));
  return {position:next,velocity:add(half,scale(accelerationAt([...next]),dtSeconds/2))};
}
/** General autonomous particle RK4; acceleration may depend on position AND velocity. */
export function rk4ParticleStep({position,velocity},dtSeconds,accelerationAt) {
  vector3(position);vector3(velocity);finite(dtSeconds,'dtSeconds');
  if(dtSeconds<0)throw new RangeError('dtSeconds must be nonnegative');
  if(typeof accelerationAt!=='function')throw new TypeError('accelerationAt required');
  const derivative=s=>({position:vector3(s.velocity),velocity:vector3(accelerationAt([...s.position],[...s.velocity]))});
  const shifted=(s,k,h)=>({position:add(s.position,scale(k.position,h)),velocity:add(s.velocity,scale(k.velocity,h))});
  const state={position,velocity},a=derivative(state),b=derivative(shifted(state,a,dtSeconds/2)),c=derivative(shifted(state,b,dtSeconds/2)),d=derivative(shifted(state,c,dtSeconds));
  const combine=key=>scale(add(add(a[key],scale(b[key],2)),add(scale(c[key],2),d[key])),dtSeconds/6);
  return {position:add(position,combine('position')),velocity:add(velocity,combine('velocity'))};
}
