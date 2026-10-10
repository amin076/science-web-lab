import { subtract, scale, magnitude, positive, finite } from '../math/vector3.js';
export const GRAVITATIONAL_CONSTANT = 6.67430e-11; // m³ kg⁻¹ s⁻², CODATA 2018
/** Point-mass field, position/source in m; mu in m³/s². Coincidence is singular. */
export function centralGravity(position,mu,sourcePosition=[0,0,0]) {
  positive(mu,'mu');
  const r=subtract(position,sourcePosition), distance=magnitude(r);
  positive(distance,'distance from source');
  return scale(r,-mu/distance**3);
}
export function pairGravityForce(positionA,massAKg,positionB,massBKg) {
  positive(massAKg,'massAKg'); positive(massBKg,'massBKg');
  return scale(centralGravity(positionA,GRAVITATIONAL_CONSTANT*massBKg,positionB),massAKg);
}
export function uniformGravity(g=9.80665,direction=[0,-1,0]) {
  finite(g,'g'); if(g<0)throw new RangeError('g must be nonnegative');
  const length=positive(magnitude(direction),'direction length');
  return scale(direction,g/length);
}
