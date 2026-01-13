// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.physics.js
import {
  v3,
  len3,
  mul3,
  deg2rad,
  rotX,
  rotZ,
  matMulMat3,
  matMulVec3,
} from "./orbit.math";

// ---- Constants (SI) ----
export const R_EARTH_M = 6_371_000;
export const MU_EARTH = 3.986004418e14;

// Moon Constants
export const R_MOON_M = 1_737_400;
export const MU_MOON = 4.9048695e12;
export const DISTANCE_EARTH_MOON_M = 384_400_000;

// Rendering helper
export function metersPerRenderUnit(earthRenderRadius = 1) {
  return R_EARTH_M / earthRenderRadius;
}

export function toRenderUnits(vecMeters, mPerUnit) {
  return [
    vecMeters[0] / mPerUnit,
    vecMeters[1] / mPerUnit,
    vecMeters[2] / mPerUnit,
  ];
}

export function circularOrbitSpeed(rMeters, mu = MU_EARTH) {
  return Math.sqrt(mu / rMeters);
}

export function orbitalPeriod(rMeters, mu = MU_EARTH) {
  return 2 * Math.PI * Math.sqrt(rMeters ** 3 / mu);
}

export function accelGravity(rMetersVec, mu = MU_EARTH) {
  const r = len3(rMetersVec);
  if (r <= 0) return v3(0, 0, 0);
  const factor = -mu / (r * r * r);
  return mul3(rMetersVec, factor);
}

export function makeCircularOrbitState({
  altitudeM,
  inclinationDeg = 0,
  raanDeg = 0,
  trueAnomalyDeg = 0,
  mu = MU_EARTH,

  radiusOfParent = R_EARTH_M,
}) {
  const r0 = radiusOfParent + altitudeM;
  const v0 = circularOrbitSpeed(r0, mu);
  const nu = deg2rad(trueAnomalyDeg);

  // In orbital plane (xy)
  const posPlane = v3(r0 * Math.cos(nu), r0 * Math.sin(nu), 0);
  const velPlane = v3(-v0 * Math.sin(nu), v0 * Math.cos(nu), 0);

  // Rotate
  const R = matMulMat3(rotZ(deg2rad(raanDeg)), rotX(deg2rad(inclinationDeg)));

  const rRel = matMulVec3(R, posPlane);
  const vRel = matMulVec3(R, velPlane);

  // Add parent position/velocity (assuming parent is static 0,0,0 or handled in loop,
  // but for initial state 'r' is relative to center usually, so we return relative)
  return { r: rRel, v: vRel };
}

// Updated Integrator to handle Relative Gravity (Parent body)
export function stepVelocityVerlet(state, dt, mu) {
  const a0 = accelGravity(state.r, mu);

  const vHalf = [
    state.v[0] + a0[0] * (dt * 0.5),
    state.v[1] + a0[1] * (dt * 0.5),
    state.v[2] + a0[2] * (dt * 0.5),
  ];

  const r1 = [
    state.r[0] + vHalf[0] * dt,
    state.r[1] + vHalf[1] * dt,
    state.r[2] + vHalf[2] * dt,
  ];

  const a1 = accelGravity(r1, mu);

  const v1 = [
    vHalf[0] + a1[0] * (dt * 0.5),
    vHalf[1] + a1[1] * (dt * 0.5),
    vHalf[2] + a1[2] * (dt * 0.5),
  ];

  return { r: r1, v: v1 };
}
