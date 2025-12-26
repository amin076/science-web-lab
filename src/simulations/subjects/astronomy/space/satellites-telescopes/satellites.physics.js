// src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.physics.js
import { vec } from "./satellites.math.js";

// Earth constants
export const EARTH = {
  radiusKm: 6371, // km
  muKm3s2: 398600.4418, // km^3 / s^2
  omegaRadS: (2 * Math.PI) / 86164.0905, // rad/s (sidereal day)
};

export function accelGravityKmS2(posKm) {
  const r = vec.len(posKm);
  const r3 = r * r * r || 1;
  const factor = -EARTH.muKm3s2 / r3;
  return { x: posKm.x * factor, y: posKm.y * factor };
}

// State: { pos:{x,y} km, vel:{x,y} km/s }
export function rk4Step(state, dtS) {
  const f = (s) => ({
    dpos: s.vel,
    dvel: accelGravityKmS2(s.pos),
  });

  const k1 = f(state);
  const s2 = {
    pos: vec.add(state.pos, vec.mul(k1.dpos, dtS / 2)),
    vel: vec.add(state.vel, vec.mul(k1.dvel, dtS / 2)),
  };

  const k2 = f(s2);
  const s3 = {
    pos: vec.add(state.pos, vec.mul(k2.dpos, dtS / 2)),
    vel: vec.add(state.vel, vec.mul(k2.dvel, dtS / 2)),
  };

  const k3 = f(s3);
  const s4 = {
    pos: vec.add(state.pos, vec.mul(k3.dpos, dtS)),
    vel: vec.add(state.vel, vec.mul(k3.dvel, dtS)),
  };

  const k4 = f(s4);

  const dpos = vec.mul(
    vec.add(
      vec.add(k1.dpos, vec.mul(k2.dpos, 2)),
      vec.add(vec.mul(k3.dpos, 2), k4.dpos)
    ),
    1 / 6
  );

  const dvel = vec.mul(
    vec.add(
      vec.add(k1.dvel, vec.mul(k2.dvel, 2)),
      vec.add(vec.mul(k3.dvel, 2), k4.dvel)
    ),
    1 / 6
  );

  return {
    pos: vec.add(state.pos, vec.mul(dpos, dtS)),
    vel: vec.add(state.vel, vec.mul(dvel, dtS)),
  };
}

export function makeCircularOrbit(altitudeKm, phaseDeg = 0) {
  const r = EARTH.radiusKm + altitudeKm;
  const v = Math.sqrt(EARTH.muKm3s2 / r); // circular speed
  const phase = (phaseDeg * Math.PI) / 180;

  // start on x-axis rotated by phase
  const pos = { x: r * Math.cos(phase), y: r * Math.sin(phase) };

  // tangential velocity (90deg ahead)
  const vel = { x: -v * Math.sin(phase), y: v * Math.cos(phase) };

  return { pos, vel };
}

export function orbitalPeriodSec(radiusKm) {
  // T = 2π * sqrt(a^3 / μ)
  return 2 * Math.PI * Math.sqrt(radiusKm ** 3 / EARTH.muKm3s2);
}

// Ground telescope on equator in this 2D model:
// position rotates with Earth: θ = ω t + θ0
export function groundTelescopeECI(tSec, lon0Deg = 0) {
  const th0 = (lon0Deg * Math.PI) / 180;
  const th = EARTH.omegaRadS * tSec + th0;
  return {
    pos: { x: EARTH.radiusKm * Math.cos(th), y: EARTH.radiusKm * Math.sin(th) },
    normal: { x: Math.cos(th), y: Math.sin(th) }, // outward
    theta: th,
  };
}

// Visible if satellite is above local horizon:
// (sat - site) ⋅ normal > 0
export function isVisibleFromGround(site, satPosKm) {
  const rel = vec.sub(satPosKm, site.pos);
  return vec.dot(rel, site.normal) > 0;
}
