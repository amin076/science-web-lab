// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.lagrange.js
import {
  MU_EARTH,
  MU_MOON,
  DISTANCE_EARTH_MOON_M,
} from "./orbit.physics";

export const SUN_EARTH_L2_DISTANCE_M = 1_500_000_000;

function collinearEquation(x, mu) {
  const r1 = Math.abs(x + mu);
  const r2 = Math.abs(x - 1 + mu);

  return (
    x -
    ((1 - mu) * (x + mu)) / r1 ** 3 -
    (mu * (x - 1 + mu)) / r2 ** 3
  );
}

function solveBisection(fn, a, b, iterations = 80) {
  let left = a;
  let right = b;

  for (let i = 0; i < iterations; i++) {
    const mid = (left + right) / 2;
    const fLeft = fn(left);
    const fMid = fn(mid);

    if (fLeft * fMid <= 0) right = mid;
    else left = mid;
  }

  return (left + right) / 2;
}

export function getEarthMoonLagrangePointsMeters(
  distanceM = DISTANCE_EARTH_MOON_M,
) {
  const mu = MU_MOON / (MU_EARTH + MU_MOON);

  const l1x = solveBisection((x) => collinearEquation(x, mu), 0.01, 0.98);
  const l2x = solveBisection((x) => collinearEquation(x, mu), 1.01, 1.5);
  const l3x = solveBisection((x) => collinearEquation(x, mu), -1.5, -0.01);

  const toEarthCenteredX = (x) => (x + mu) * distanceM;

  return [
    {
      id: "L1",
      system: "Earth-Moon",
      pos: [toEarthCenteredX(l1x), 0, 0],
      color: "#22C55E",
    },
    {
      id: "L2",
      system: "Earth-Moon",
      pos: [toEarthCenteredX(l2x), 0, 0],
      color: "#F97316",
    },
    {
      id: "L3",
      system: "Earth-Moon",
      pos: [toEarthCenteredX(l3x), 0, 0],
      color: "#EF4444",
    },
    {
      id: "L4",
      system: "Earth-Moon",
      pos: [0.5 * distanceM, (Math.sqrt(3) / 2) * distanceM, 0],
      color: "#3B82F6",
    },
    {
      id: "L5",
      system: "Earth-Moon",
      pos: [0.5 * distanceM, -(Math.sqrt(3) / 2) * distanceM, 0],
      color: "#A855F7",
    },
  ];
}

export function getSunEarthL2PointMeters() {
  return {
    id: "JWST-L2",
    system: "Sun-Earth",
    pos: [SUN_EARTH_L2_DISTANCE_M, 0, 0],
    color: "#FFA726",
  };
}