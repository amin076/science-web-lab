// orbit.visibility.js
// Visibility + line-of-sight utilities (SI units).
// NOTE: Spherical Earth approximation (good start; later we can upgrade to WGS84).

import { deg2rad, rotZ, matMulVec3, len3, sub3, dot3 } from "./orbit.math";
import { R_EARTH_M } from "./orbit.physics";

// Earth sidereal rotation rate (rad/s)
export const OMEGA_EARTH = 7.292115e-5;

/**
 * Convert lat/lon (deg) to Earth-centered position vector (meters), spherical Earth.
 * lat: [-90..+90], lon: [-180..+180]
 */
export function latLonToECEF(latDeg, lonDeg, radiusM = R_EARTH_M) {
  const lat = deg2rad(latDeg);
  const lon = deg2rad(lonDeg);

  const clat = Math.cos(lat);
  const slat = Math.sin(lat);
  const clon = Math.cos(lon);
  const slon = Math.sin(lon);

  // ECEF axes: x at lon=0, y at lon=90E, z north pole
  const x = radiusM * clat * clon;
  const y = radiusM * clat * slon;
  const z = radiusM * slat;

  return [x, y, z];
}

/**
 * Rotate an ECEF (body-fixed) vector into inertial frame by Earth rotation angle omega*t.
 * Simple model: inertial at t=0 aligned with ECEF.
 */
export function ecefToInertial(rEcefMeters, tSeconds, omega = OMEGA_EARTH) {
  const angle = omega * tSeconds;
  const R = rotZ(angle);
  return matMulVec3(R, rEcefMeters);
}

/**
 * Segment-sphere intersection test.
 * Returns true if line segment p0->p1 intersects sphere of radius R centered at origin.
 * We ignore intersection at t=0 (observer on surface) by using epsilon.
 */
export function segmentIntersectsSphere(p0, p1, radius, epsilon = 1e-6) {
  const d = sub3(p1, p0); // direction
  const a = dot3(d, d);
  const b = 2 * dot3(p0, d);
  const c = dot3(p0, p0) - radius * radius;

  // Solve a t^2 + b t + c = 0
  const disc = b * b - 4 * a * c;
  if (disc < 0) return false;

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  // If either intersection is within segment (epsilon..1-epsilon), it's blocked
  const hit1 = t1 > epsilon && t1 < 1 - epsilon;
  const hit2 = t2 > epsilon && t2 < 1 - epsilon;

  return hit1 || hit2;
}

/**
 * True if observer can see target (line does NOT pass through Earth).
 */
export function hasLineOfSight(
  observerMeters,
  targetMeters,
  earthRadius = R_EARTH_M
) {
  return !segmentIntersectsSphere(observerMeters, targetMeters, earthRadius);
}

/**
 * Elevation angle above local horizon (deg). Positive => above horizon.
 * Uses local zenith n = observer/|observer|.
 */
export function elevationDeg(observerMeters, targetMeters) {
  const rho = sub3(targetMeters, observerMeters); // line-of-sight vector
  const rhoLen = len3(rho);
  if (rhoLen <= 0) return 0;

  const n = observerMeters;
  const nLen = len3(n);
  if (nLen <= 0) return 0;

  const rhoHat = [rho[0] / rhoLen, rho[1] / rhoLen, rho[2] / rhoLen];
  const nHat = [n[0] / nLen, n[1] / nLen, n[2] / nLen];

  // elevation = asin( rhoHat · nHat )
  const s = Math.max(-1, Math.min(1, dot3(rhoHat, nHat)));
  const elev = Math.asin(s);
  return (elev * 180) / Math.PI;
}
