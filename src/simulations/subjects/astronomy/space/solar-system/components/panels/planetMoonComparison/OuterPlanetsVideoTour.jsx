import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// 30s Earth vs Jupiter vs Sun cinematic comparison.
// Replace:
// src/simulations/subjects/astronomy/space/solar-system/components/panels/planetMoonComparison/OuterPlanetsVideoTour.jsx
//
// Goal:
// - Show Earth, Jupiter, and Sun in the same story.
// - Keep motion smooth.
// - Avoid empty frames.
// - Designed for 9:16 Shorts recording.

const TOTAL_DURATION = 30000;

const SHOTS = [
  {
    id: "wide-scale-reveal",
    label: "Earth vs Jupiter vs Sun",
    duration: 6000,
    mode: "wideScale",
    fovA: 42,
    fovB: 38,
  },
  {
    id: "earth-to-jupiter",
    label: "Earth Beside Jupiter",
    duration: 6000,
    mode: "earthJupiter",
    fovA: 36,
    fovB: 30,
  },
  {
    id: "jupiter-in-front-of-sun",
    label: "Jupiter in Front of the Sun",
    duration: 7000,
    mode: "jupiterSunForeground",
    fovA: 32,
    fovB: 26,
  },
  {
    id: "sun-dominates",
    label: "The Sun Dominates",
    duration: 7000,
    mode: "sunDominates",
    fovA: 30,
    fovB: 34,
  },
  {
    id: "final-solar-scale",
    label: "Solar Scale",
    duration: 4000,
    mode: "finalScale",
    fovA: 36,
    fovB: 44,
  },
];

function flattenBodies(bodies) {
  const all = [];
  bodies.forEach((body) => {
    all.push(body);
    body.moons?.forEach((moon) => all.push(moon));
  });
  return all;
}

function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function getShotAtTime(elapsedMs) {
  const clamped = Math.min(Math.max(elapsedMs, 0), TOTAL_DURATION - 1);
  let cursor = 0;

  for (const shot of SHOTS) {
    const start = cursor;
    const end = cursor + shot.duration;

    if (clamped >= start && clamped < end) {
      return {
        shot,
        local: (clamped - start) / shot.duration,
        progress: (clamped / TOTAL_DURATION) * 100,
      };
    }

    cursor = end;
  }

  return {
    shot: SHOTS[SHOTS.length - 1],
    local: 1,
    progress: 100,
  };
}

function getBody(allBodies, id) {
  return allBodies.find((body) => body.id === id);
}

function setVecFromBody(body, out) {
  if (!body?.position) {
    out.set(0, 0, 0);
    return false;
  }

  out.set(body.position[0] || 0, body.position[1] || 0, body.position[2] || 0);
  return true;
}

function getRadius(body, fallback = 1) {
  return Math.max(body?.radius || fallback, 0.001);
}

function safeDirection(from, to, out) {
  out.copy(to).sub(from);

  if (out.lengthSq() < 0.000001) {
    out.set(1, 0, 0);
  }

  out.normalize();
  return out;
}

export default function OuterPlanetsVideoTour({
  bodies = [],
  enabled,
  onSelect,
  onInfo,
  onVisibilityChange,
  shortsMode = false,
}) {
  const { camera } = useThree();

  const startRef = useRef(Date.now());
  const wasEnabledRef = useRef(false);
  const lastShotIdRef = useRef(null);

  const onSelectRef = useRef(onSelect);
  const onInfoRef = useRef(onInfo);
  const onVisibilityChangeRef = useRef(onVisibilityChange);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onInfoRef.current = onInfo;
    onVisibilityChangeRef.current = onVisibilityChange;
  }, [onSelect, onInfo, onVisibilityChange]);

  const allBodies = useMemo(() => flattenBodies(bodies), [bodies]);

  const sunPos = useMemo(() => new THREE.Vector3(), []);
  const jupiterPos = useMemo(() => new THREE.Vector3(), []);
  const earthPos = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const dirSunToJupiter = useMemo(() => new THREE.Vector3(), []);
  const dirJupiterToEarth = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const smoothTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!enabled) {
      wasEnabledRef.current = false;
      return;
    }

    const sun = getBody(allBodies, "sun");
    const jupiter = getBody(allBodies, "jupiter");
    const earth = getBody(allBodies, "earth");

    if (!sun || !jupiter || !earth) return;

    setVecFromBody(sun, sunPos);
    setVecFromBody(jupiter, jupiterPos);
    setVecFromBody(earth, earthPos);

    const sunRadius = getRadius(sun, 20);
    const jupiterRadius = getRadius(jupiter, 4);
    const earthRadius = getRadius(earth, 0.5);

    safeDirection(sunPos, jupiterPos, dirSunToJupiter);
    safeDirection(jupiterPos, earthPos, dirJupiterToEarth);

    side.crossVectors(up, dirSunToJupiter);
    if (side.lengthSq() < 0.000001) side.set(1, 0, 0);
    side.normalize();

    const jupiterEarthSpan = Math.max(
      jupiterPos.distanceTo(earthPos),
      jupiterRadius * 4,
      earthRadius * 16,
    );

    const sunJupiterSpan = Math.max(
      sunPos.distanceTo(jupiterPos),
      sunRadius + jupiterRadius,
      sunRadius * 1.4,
    );

    const elapsed = Date.now() - startRef.current;
    const { shot, local, progress } = getShotAtTime(elapsed);
    const t = smootherstep(local);

    if (!wasEnabledRef.current) {
      wasEnabledRef.current = true;
      startRef.current = Date.now();
      lastShotIdRef.current = null;
      onVisibilityChangeRef.current?.(["sun", "jupiter", "earth"]);
      onSelectRef.current?.(jupiter);
      smoothTarget.copy(jupiterPos);
    }

    if (lastShotIdRef.current !== shot.id) {
      lastShotIdRef.current = shot.id;
      onVisibilityChangeRef.current?.(["sun", "jupiter", "earth"]);
      onSelectRef.current?.(
        shot.mode.includes("sun") ? sun : shot.mode.includes("earth") ? earth : jupiter,
      );
    }

    if (shot.mode === "wideScale") {
      center.copy(sunPos).lerp(jupiterPos, 0.62).lerp(earthPos, 0.12);

      const distance = Math.max(sunJupiterSpan * 0.65, sunRadius * 2.8);
      const drift = THREE.MathUtils.lerp(-0.28, 0.18, t);

      desiredPos
        .copy(center)
        .addScaledVector(dirSunToJupiter, distance * 0.35)
        .addScaledVector(side, distance * drift)
        .addScaledVector(up, distance * THREE.MathUtils.lerp(0.34, 0.24, t));

      desiredTarget.copy(center).addScaledVector(side, sunRadius * 0.08);
    }

    if (shot.mode === "earthJupiter") {
      center.copy(jupiterPos).lerp(earthPos, 0.22);

      const distance = Math.max(jupiterEarthSpan * 1.25, jupiterRadius * 7.5);
      const sideDrift = THREE.MathUtils.lerp(-0.42, 0.18, t);

      desiredPos
        .copy(center)
        .addScaledVector(dirJupiterToEarth, distance * 0.55)
        .addScaledVector(side, distance * sideDrift)
        .addScaledVector(up, distance * THREE.MathUtils.lerp(0.26, 0.14, t));

      desiredTarget.copy(center).lerp(jupiterPos, 0.18);
    }

    if (shot.mode === "jupiterSunForeground") {
      const distance = Math.max(
        jupiterRadius * THREE.MathUtils.lerp(7.0, 4.7, t),
        jupiterRadius + 3,
      );

      desiredPos
        .copy(jupiterPos)
        .addScaledVector(dirSunToJupiter, distance)
        .addScaledVector(side, jupiterRadius * THREE.MathUtils.lerp(-1.8, 1.1, t))
        .addScaledVector(up, jupiterRadius * THREE.MathUtils.lerp(1.35, 0.42, t));

      desiredTarget
        .copy(jupiterPos)
        .lerp(sunPos, THREE.MathUtils.lerp(0.18, 0.38, t))
        .addScaledVector(up, jupiterRadius * 0.08);
    }

    if (shot.mode === "sunDominates") {
      const distance = Math.max(
        jupiterRadius * THREE.MathUtils.lerp(5.2, 8.8, t),
        jupiterRadius + 4,
      );

      desiredPos
        .copy(jupiterPos)
        .addScaledVector(dirSunToJupiter, distance)
        .addScaledVector(side, jupiterRadius * THREE.MathUtils.lerp(1.2, -2.2, t))
        .addScaledVector(up, jupiterRadius * THREE.MathUtils.lerp(0.28, 1.05, t));

      desiredTarget
        .copy(sunPos)
        .lerp(jupiterPos, THREE.MathUtils.lerp(0.28, 0.16, t))
        .addScaledVector(side, sunRadius * THREE.MathUtils.lerp(0.05, -0.05, t));
    }

    if (shot.mode === "finalScale") {
      center.copy(sunPos).lerp(jupiterPos, 0.45).lerp(earthPos, 0.08);

      const distance = Math.max(
        sunJupiterSpan * THREE.MathUtils.lerp(0.42, 0.72, t),
        sunRadius * 2.5,
      );

      desiredPos
        .copy(center)
        .addScaledVector(dirSunToJupiter, distance * 0.45)
        .addScaledVector(side, distance * THREE.MathUtils.lerp(-0.12, 0.28, t))
        .addScaledVector(up, distance * THREE.MathUtils.lerp(0.16, 0.34, t));

      desiredTarget.copy(center).lerp(sunPos, 0.18);
    }

    const posDamping = 1 - Math.exp(-1.15 * delta);
    const lookDamping = 1 - Math.exp(-1.45 * delta);
    const fovDamping = 1 - Math.exp(-1.2 * delta);

    camera.position.lerp(desiredPos, posDamping);
    smoothTarget.lerp(desiredTarget, lookDamping);
    camera.lookAt(smoothTarget);

    const nextFov = THREE.MathUtils.lerp(shot.fovA, shot.fovB, t);
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      shortsMode ? nextFov : Math.max(nextFov, 34),
      fovDamping,
    );

    camera.updateProjectionMatrix();

    onInfoRef.current?.({
      label: shot.label,
      phase: shot.id,
      progress: Math.round(progress),
      durationMs: TOTAL_DURATION,
    });
  });

  return null;
}

