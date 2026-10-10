import { add, scale, dot, subtract, positive, finite } from '../math/vector3.js';
/** Force N, mass kg, acceleration m/s². */
export const accelerationFromForce = (force,massKg) => scale(force,1/positive(massKg,'massKg'));
export const momentum = (velocity,massKg) => scale(velocity,positive(massKg,'massKg'));
export const kineticEnergy = (velocity,massKg) => finite(0.5*positive(massKg,'massKg')*dot(velocity,velocity));
export function springForce(position, equilibrium, stiffnessNPerM) {
  finite(stiffnessNPerM,'stiffnessNPerM');
  if (stiffnessNPerM < 0) throw new RangeError('stiffness must be nonnegative');
  return scale(subtract(position,equilibrium),-stiffnessNPerM);
}
/** Exact constant-acceleration propagation, no drag/contact. */
export function constantAccelerationStep({position,velocity},dtSeconds,acceleration) {
  finite(dtSeconds,'dtSeconds');
  if(dtSeconds<0) throw new RangeError('dtSeconds must be nonnegative');
  return {position:add(add(position,scale(velocity,dtSeconds)),scale(acceleration,0.5*dtSeconds**2)),velocity:add(velocity,scale(acceleration,dtSeconds))};
}
