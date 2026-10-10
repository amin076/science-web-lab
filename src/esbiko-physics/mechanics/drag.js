import { subtract, scale, magnitude, finite, positive } from '../math/vector3.js';
function nonnegative(value,name){finite(value,name);if(value<0)throw new RangeError(name+' must be nonnegative');return value;}
/** Relative velocity m/s, density kg/m³, reference frontal area m². */
export function quadraticDragForce(velocity,{densityKgM3=1.225,dragCoefficient=0.47,areaM2,windVelocity=[0,0,0]}) {
  nonnegative(densityKgM3,'densityKgM3');nonnegative(dragCoefficient,'dragCoefficient');nonnegative(areaM2,'areaM2');
  const relative=subtract(velocity,windVelocity);
  return scale(relative,-0.5*densityKgM3*dragCoefficient*areaM2*magnitude(relative));
}
/** Linear viscous damping, coefficient kg/s. Not the default spherical air model. */
export function linearDragForce(velocity,coefficientKgS,windVelocity=[0,0,0]) {
  return scale(subtract(velocity,windVelocity),-nonnegative(coefficientKgS,'coefficientKgS'));
}
export const sphereFrontalArea = radiusM => Math.PI*positive(radiusM,'radiusM')**2;
