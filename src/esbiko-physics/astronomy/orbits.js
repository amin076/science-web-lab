import { positive } from '../math/vector3.js';
export const EARTH_MU_SI=3.986004418e14;
export const EARTH_RADIUS_M=6371000;
export function circularOrbitSpeed(radiusM,mu=EARTH_MU_SI) {
  return Math.sqrt(positive(mu,'mu')/positive(radiusM,'radiusM'));
}
/** Circular period, also elliptic period when radiusM is the semi-major axis. */
export function orbitalPeriod(radiusM,mu=EARTH_MU_SI) {
  return 2*Math.PI*Math.sqrt(positive(radiusM,'radiusM')**3/positive(mu,'mu'));
}
