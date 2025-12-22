// src/components/entireSolar/CinematicTour.jsx
import React, { useEffect, useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Sequence of planets to visit
const TOUR_SEQUENCE = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

// TIMING (Total 20s)
const TIME_FLIGHT = 4000; // 4s: Fly to planet
const TIME_HELIX = 10000; // 10s: Spiral close-up
const TIME_DRIFT = 6000; // 6s: Pull back / wide shot
const TOTAL_DURATION = TIME_FLIGHT + TIME_HELIX + TIME_DRIFT;

export default function CinematicTour({
  planetPositions,
  scaleData,
  scaleMode,
  onStop,
  onInfo, // send HUD info to parent
}) {
  const { camera } = useThree();

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState("APPROACH"); // APPROACH | SCANNING | DEPARTING

  const stepStartTimeRef = useRef(Date.now());

  // Start position of camera at beginning of each step
  const flightStartPositionRef = useRef(new THREE.Vector3());
  // Previous target position for smooth lookAt interpolation
  const prevTargetEndPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // Snapshot of target position at beginning of step (so we don't chase it forever)
  const targetSnapshotRef = useRef(new THREE.Vector3());
  const snapshotValidRef = useRef(false);

  const onStopRef = useRef(onStop);
  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  // Reusable vectors
  const currentTargetVec = useMemo(() => new THREE.Vector3(), []);
  const cameraDest = useMemo(() => new THREE.Vector3(), []);
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const idealPos = useMemo(() => new THREE.Vector3(), []);
  const idealLookAt = useMemo(() => new THREE.Vector3(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Smoothed lookAt to remove jitter
  const smoothLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  const targetId = TOUR_SEQUENCE[stepIndex];

  // STEP TIMER – advance to next planet
  useEffect(() => {
    stepStartTimeRef.current = Date.now();

    const timer = setInterval(() => {
      // Capture where we are now for next step's flight
      flightStartPositionRef.current.copy(camera.position);
      prevTargetEndPosRef.current.copy(currentTargetVec);

      // invalidate snapshot for next step
      snapshotValidRef.current = false;

      setStepIndex((prev) => {
        const next = prev + 1;
        stepStartTimeRef.current = Date.now();

        if (next >= TOUR_SEQUENCE.length) {
          if (onStopRef.current) onStopRef.current();
          return 0; // loop back to Sun
        }
        return next;
      });
    }, TOTAL_DURATION);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once when tour starts

  useFrame((state, delta) => {
    // --- A. Resolve target position ---
    let targetIsReady = false;

    if (targetId === "sun") {
      currentTargetVec.set(0, 0, 0);
      targetIsReady = true;
    } else {
      const pos = planetPositions[targetId];
      if (pos) {
        currentTargetVec.set(pos[0], pos[1], pos[2]);
        targetIsReady = true;
      }
    }

    if (!targetIsReady) return;

    // On first frame of this step when target is ready, capture snapshot
    if (!snapshotValidRef.current) {
      targetSnapshotRef.current.copy(currentTargetVec);
      snapshotValidRef.current = true;
    }

    // --- B. Radius & distances ---
    let radius = 2;
    if (targetId === "sun") {
      radius = scaleData.sun?.radius ?? 10;
    } else if (scaleData[targetId]) {
      radius = scaleData[targetId].radius;
    }

    let closeUpMult = 3.5;
    let wideMult = 8.0;

    // Tiny bodies (Moon, Mercury, etc.) → we want to get much closer
    if (radius < 1) {
      closeUpMult = 3.0;
      wideMult = 9.0;
    }

    // Special cases
    if (targetId === "saturn") {
      closeUpMult = 5.0;
      wideMult = 12.0;
    }
    if (targetId === "sun") {
      closeUpMult = 4.0;
      wideMult = 10.0;
    }

    if (scaleMode === "realistic") {
      closeUpMult = 2.5;
      wideMult = 6.0;
    }

    // 🔧 Distance tuning:
    //  - small bodies → allow camera very close (≈1–1.2 units)
    //  - larger bodies → keep safer distance (3–4 units)
    let minCloseDistance;
    if (radius < 1) {
      minCloseDistance = scaleMode === "realistic" ? 1.0 : 1.2;
    } else {
      minCloseDistance = scaleMode === "realistic" ? 3.0 : 4.0;
    }

    const helixOrbitDistance = Math.max(radius * closeUpMult, minCloseDistance);

    // Height above orbital plane: smaller for tiny bodies
    const basePlaneHeight = radius < 1 ? 0.6 : 1.5; // lower for Mercury / Moon so we don't feel too high
    const minPlaneHeight = Math.max(radius * 1.2, basePlaneHeight);

    // --- C. Time & phase ---
    const timeElapsed = Date.now() - stepStartTimeRef.current;

    let currentPhase = phase;
    if (timeElapsed < TIME_FLIGHT) {
      currentPhase = "APPROACH";
    } else if (timeElapsed < TIME_FLIGHT + TIME_HELIX) {
      currentPhase = "SCANNING";
    } else {
      currentPhase = "DEPARTING";
    }

    if (currentPhase !== phase) {
      setPhase(currentPhase);
    }

    // HUD info → parent
    const totalProgress = Math.min((timeElapsed / TOTAL_DURATION) * 100, 100);
    if (onInfo) {
      onInfo({
        phase: currentPhase,
        targetId,
        progress: totalProgress,
      });
    }

    idealLookAt.copy(currentTargetVec);

    const snapshotTarget = targetSnapshotRef.current;

    // --- D. Camera position based on phase ---
    if (timeElapsed < TIME_FLIGHT) {
      // PHASE 1: APPROACH (fly to snapshot so we don't chase a moving planet)
      const t = timeElapsed / TIME_FLIGHT;
      const easeT = t * t * (3 - 2 * t); // smoothstep

      const startPos = flightStartPositionRef.current;

      idealPos.set(
        snapshotTarget.x + helixOrbitDistance,
        snapshotTarget.y + helixOrbitDistance * 1.0 + minPlaneHeight,
        snapshotTarget.z
      );

      idealPos.lerpVectors(startPos, idealPos, easeT);
      idealLookAt.lerpVectors(
        prevTargetEndPosRef.current,
        snapshotTarget,
        easeT
      );
    } else if (timeElapsed < TIME_FLIGHT + TIME_HELIX) {
      // PHASE 2: SCANNING (helix) — orbit around live target
      const t = (timeElapsed - TIME_FLIGHT) / TIME_HELIX;
      const angle = t * Math.PI * 2;

      const rawHeight = THREE.MathUtils.lerp(
        helixOrbitDistance * 1.5,
        radius * 0.3,
        t
      );
      const heightOffset = Math.max(rawHeight, minPlaneHeight);

      idealPos.set(
        currentTargetVec.x + Math.cos(angle) * helixOrbitDistance,
        currentTargetVec.y + heightOffset,
        currentTargetVec.z + Math.sin(angle) * helixOrbitDistance
      );
    } else {
      // PHASE 3: DEPARTING
      const t = (timeElapsed - (TIME_FLIGHT + TIME_HELIX)) / TIME_DRIFT;
      const easeT = t * (2 - t);

      const startDist = helixOrbitDistance;
      const targetWideDist = radius * wideMult;

      const currentDist = THREE.MathUtils.lerp(
        startDist,
        targetWideDist,
        easeT
      );
      const rawHeight = THREE.MathUtils.lerp(radius * 0.3, radius * 3.0, easeT);
      const heightOffset = Math.max(rawHeight, minPlaneHeight);
      const angle = Math.PI * 2 + t * 0.5;

      idealPos.set(
        currentTargetVec.x + Math.cos(angle) * currentDist,
        currentTargetVec.y + heightOffset,
        currentTargetVec.z + Math.sin(angle) * currentDist
      );
    }

    // --- E. Safety clamps ---
    if (idealPos.y < currentTargetVec.y + minPlaneHeight) {
      idealPos.y = currentTargetVec.y + minPlaneHeight;
    }

    tempVec.subVectors(idealPos, currentTargetVec);
    const currentDistance = tempVec.length();
    const minDistance = minCloseDistance;
    if (currentDistance < minDistance && currentDistance > 0.0001) {
      tempVec.setLength(minDistance);
      idealPos.copy(currentTargetVec).add(tempVec);
    }

    // --- F. Apply to camera with softer lerp ---
    const posLerpSpeed = timeElapsed < TIME_FLIGHT ? 2.0 : 1.5; // slower → smoother

    cameraDest.copy(idealPos);
    lookAtTarget.copy(idealLookAt);

    state.camera.position.lerp(cameraDest, delta * posLerpSpeed);

    // lookAt — smooth to reduce jitter around small fast-moving bodies
    if (smoothLookAtRef.current.lengthSq() === 0) {
      smoothLookAtRef.current.copy(lookAtTarget);
    } else {
      smoothLookAtRef.current.lerp(lookAtTarget, delta * 3.0);
    }
    state.camera.lookAt(smoothLookAtRef.current);
  });

  // R3F-only: no JSX UI
  return null;
}
