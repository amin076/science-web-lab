import assert from "node:assert/strict";
import { educationalDistanceKm, educationalPosition } from "../src/simulations/subjects/astronomy/space/satellites-telescopes/educationalScale.js";
import { EARTH, makeCircularOrbit } from "../src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.physics.js";
import { MOON, ORBIT_PRESETS } from "../src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.constants.js";

const entries = [
  ["ISS", EARTH.radiusKm + ORBIT_PRESETS.ISS],
  ["LEO", EARTH.radiusKm + ORBIT_PRESETS.LEO],
  ["MEO", EARTH.radiusKm + ORBIT_PRESETS.MEO],
  ["GEO", EARTH.radiusKm + ORBIT_PRESETS.GEO],
  ["Moon", MOON.orbitRadiusKm],
  ["JWST", ORBIT_PRESETS.JWST],
];
const values = entries.map(([label, r]) => ({ label, real: r, visual: educationalDistanceKm(r) }));
for (let i = 1; i < values.length; i++) {
  assert(values[i].real > values[i-1].real);
  assert(values[i].visual > values[i-1].visual,
    "Educational order inverted: " + JSON.stringify(values));
}
assert(educationalDistanceKm(MOON.orbitRadiusKm) - educationalDistanceKm(EARTH.radiusKm + ORBIT_PRESETS.GEO) > 5000);
assert(educationalDistanceKm(ORBIT_PRESETS.JWST) - educationalDistanceKm(MOON.orbitRadiusKm) > 5000);
for (let r = 0; r <= 2000000; r += 100) {
  assert(educationalDistanceKm(r + 1) > educationalDistanceKm(r), "non-monotonic at " + r);
}
for (const altitude of [408, 1200, 20200, 35786]) {
  const state = makeCircularOrbit(altitude, 70);
  const before = Math.hypot(state.pos.x, state.pos.y);
  const after = Math.hypot(...Object.values(educationalPosition(state.pos)));
  assert(Math.abs(after - educationalDistanceKm(before)) < 1e-6);
  assert(Math.abs(before - (EARTH.radiusKm + altitude)) < 1e-6);
}
assert.throws(() => educationalDistanceKm(-1), RangeError);
console.log("SATELLITE EDUCATIONAL ORBIT ORDER PASS", JSON.stringify(values));
