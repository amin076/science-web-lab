// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.factory.js
import * as THREE from "three";
import {
  R_EARTH_M,
  MU_EARTH,
  R_MOON_M,
  MU_MOON,
  stepVelocityVerlet,
  orbitalPeriod,
  makeCircularOrbitState,
} from "./orbit.physics";

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function calculateOrbitPath(initialState, mu) {
  const rVec = new THREE.Vector3(
    initialState.r[0],
    initialState.r[1],
    initialState.r[2]
  );
  const rMag = rVec.length();
  const period = orbitalPeriod(rMag, mu);
  const segments = 120;
  const dt = period / segments;

  const path = [];
  let simState = { r: [...initialState.r], v: [...initialState.v] };

  for (let i = 0; i <= segments; i++) {
    path.push(simState.r);
    simState = stepVelocityVerlet(simState, dt, mu);
  }
  path.push(path[0]);
  return path;
}

export function makeBody({
  name,
  color,
  altitudeM,
  inclinationDeg,
  type = "satellite",
  parent = "earth",
  raanDeg,
  trueAnomalyDeg,
}) {
  const isMoonOrbit = parent === "moon";
  const MU = isMoonOrbit ? MU_MOON : MU_EARTH;
  const PARENT_R = isMoonOrbit ? R_MOON_M : R_EARTH_M;

  const state = makeCircularOrbitState({
    altitudeM,
    inclinationDeg,
    raanDeg: raanDeg ?? rand(0, 360),
    trueAnomalyDeg: trueAnomalyDeg ?? rand(0, 360),
    mu: MU,
    radiusOfParent: PARENT_R,
  });

  const orbitPath = calculateOrbitPath(state, MU);

  return {
    id: `${name}-${Math.random().toString(16).slice(2)}`,
    name,
    color,
    type,
    parent,
    initialAlt: altitudeM,
    state,
    orbitPath,
    trail: [],
    lastVisible: true,
  };
}