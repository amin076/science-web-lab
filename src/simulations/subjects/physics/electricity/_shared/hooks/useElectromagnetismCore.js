// src/simulations/subjects/physics/electricity/_shared/hooks/useElectromagnetismCore.js
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const safeNumber = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);

export function useElectromagnetismCore(options = {}) {
  const {
    initialQ1 = 1,
    initialQ2 = -1,
    initialPos1 = { x: -3, y: 0, z: 0 },
    initialPos2 = { x: 3, y: 0, z: 0 },
    initialK = 8.99,
    sphereRadius = 0.5,
    damping = 0.995,
    maxDt = 0.05, // seconds
    minR = 1e-4, // avoid division by 0
    stopOnCollision = true,
  } = options;

  // --- STATE ---
  const [q1, setQ1] = useState(initialQ1);
  const [q2, setQ2] = useState(initialQ2);

  const [pos1, setPos1] = useState(initialPos1);
  const [pos2, setPos2] = useState(initialPos2);

  const [k, setK] = useState(initialK);

  const [isSimulating, setIsSimulating] = useState(false);

  const [showField, setShowField] = useState(false);
  const [showFlux, setShowFlux] = useState(true);

  // --- RAF refs ---
  const positionsRef = useRef({
    p1: { ...initialPos1 },
    p2: { ...initialPos2 },
  });

  const velocitiesRef = useRef({
    v1: { x: 0, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 0 },
  });

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Keep refs aligned when NOT simulating (dragging mode)
  useEffect(() => {
    if (!isSimulating) {
      positionsRef.current.p1 = { ...pos1 };
      positionsRef.current.p2 = { ...pos2 };
      velocitiesRef.current.v1 = { x: 0, y: 0, z: 0 };
      velocitiesRef.current.v2 = { x: 0, y: 0, z: 0 };
    }
  }, [pos1, pos2, isSimulating]);

  const stop = useCallback(() => {
    setIsSimulating(false);
  }, []);

  const updatePhysics = useCallback(
    (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = safeNumber((time - lastTimeRef.current) / 1000, 0);
      lastTimeRef.current = time;

      const dt = clamp(deltaTime, 0, maxDt);

      const p1 = positionsRef.current.p1;
      const p2 = positionsRef.current.p2;
      const v1 = velocitiesRef.current.v1;
      const v2 = velocitiesRef.current.v2;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const r = Math.max(dist, minR);

      // Collision Detection
      if (stopOnCollision && dist <= sphereRadius * 2) {
        stop();
        return;
      }

      // Force magnitude (scaled)
      const qProd = safeNumber(q1 * q2, 0);
      const forceMag = safeNumber((k * Math.abs(qProd)) / (r * r), 0);

      const nx = dx / r;
      const ny = dy / r;
      const nz = dz / r;

      const dirFactor = qProd > 0 ? -1 : 1; // repulsive if same sign

      const fx = forceMag * nx * dirFactor;
      const fy = forceMag * ny * dirFactor;
      const fz = forceMag * nz * dirFactor;

      // Euler Integration (damped)
      v1.x = safeNumber((v1.x + fx * dt) * damping, 0);
      v1.y = safeNumber((v1.y + fy * dt) * damping, 0);
      v1.z = safeNumber((v1.z + fz * dt) * damping, 0);

      v2.x = safeNumber((v2.x - fx * dt) * damping, 0);
      v2.y = safeNumber((v2.y - fy * dt) * damping, 0);
      v2.z = safeNumber((v2.z - fz * dt) * damping, 0);

      p1.x = safeNumber(p1.x + v1.x * dt, p1.x);
      p1.y = safeNumber(p1.y + v1.y * dt, p1.y);
      p1.z = safeNumber(p1.z + v1.z * dt, p1.z);

      p2.x = safeNumber(p2.x + v2.x * dt, p2.x);
      p2.y = safeNumber(p2.y + v2.y * dt, p2.y);
      p2.z = safeNumber(p2.z + v2.z * dt, p2.z);

      // Push to state (UI)
      setPos1({ ...p1 });
      setPos2({ ...p2 });

      requestRef.current = requestAnimationFrame(updatePhysics);
    },
    [q1, q2, k, damping, maxDt, minR, sphereRadius, stopOnCollision, stop]
  );

  useEffect(() => {
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      lastTimeRef.current = null;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isSimulating, updatePhysics]);

  const physicsState = useMemo(() => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const r = Math.max(dist, minR);
    const qProd = safeNumber(q1 * q2, 0);
    const forceMagnitude = safeNumber((k * Math.abs(qProd)) / (r * r), 0);

    return {
      distance: dist,
      force: {
        magnitude: forceMagnitude,
        direction: qProd > 0 ? "repulsive" : "attractive",
      },
    };
  }, [pos1, pos2, q1, q2, k, minR]);

  // Helpers (lock when simulating)
  const updatePos1 = useCallback(
    (axis, value) => {
      if (isSimulating) return;
      const v = parseFloat(value);
      setPos1((prev) => ({ ...prev, [axis]: safeNumber(v, prev[axis]) }));
    },
    [isSimulating]
  );

  const updatePos2 = useCallback(
    (axis, value) => {
      if (isSimulating) return;
      const v = parseFloat(value);
      setPos2((prev) => ({ ...prev, [axis]: safeNumber(v, prev[axis]) }));
    },
    [isSimulating]
  );

  const startSimulation = useCallback(() => setIsSimulating(true), []);
  const pauseSimulation = useCallback(() => setIsSimulating(false), []);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setPos1({ ...initialPos1 });
    setPos2({ ...initialPos2 });
    velocitiesRef.current = {
      v1: { x: 0, y: 0, z: 0 },
      v2: { x: 0, y: 0, z: 0 },
    };
  }, [initialPos1, initialPos2]);

  return {
    q1,
    setQ1,
    q2,
    setQ2,
    pos1,
    updatePos1,
    pos2,
    updatePos2,
    k,
    setK,
    distance: physicsState.distance,
    force: physicsState.force,
    isSimulating,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    showField,
    setShowField,
    showFlux,
    setShowFlux,
  };
}

export default useElectromagnetismCore;
