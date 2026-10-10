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
