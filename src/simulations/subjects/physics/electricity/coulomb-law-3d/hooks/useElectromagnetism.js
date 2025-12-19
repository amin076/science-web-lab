// src/components/features/electricity/useElectromagnetism.js
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export const useElectromagnetism = () => {
  // --- STATE ---

  // Charge values (µC)
  const [q1, setQ1] = useState(1);
  const [q2, setQ2] = useState(-1);

  // Positions (meters/arbitrary units)
  const [pos1, setPos1] = useState({ x: -3, y: 0, z: 0 });
  const [pos2, setPos2] = useState({ x: 3, y: 0, z: 0 });

  // Physics Constants
  const [k, setK] = useState(8.99); // Coulomb constant scaled
  const SPHERE_RADIUS = 0.5;
  const DAMPING = 0.995;

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);

  // Visualization States
  const [showField, setShowField] = useState(false); // Vector Field (Grid)
  const [showFlux, setShowFlux] = useState(true); // Flux Lines (Continuous)

  // Refs for the simulation loop
  const positionsRef = useRef({
    p1: { x: -3, y: 0, z: 0 },
    p2: { x: 3, y: 0, z: 0 },
  });
  const velocitiesRef = useRef({
    v1: { x: 0, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 0 },
  });
  const requestRef = useRef();
  const lastTimeRef = useRef();

  // Sync Refs when state changes (only when NOT simulating to allow user drag)
  useEffect(() => {
    if (!isSimulating) {
      positionsRef.current.p1 = pos1;
      positionsRef.current.p2 = pos2;
      velocitiesRef.current.v1 = { x: 0, y: 0, z: 0 };
      velocitiesRef.current.v2 = { x: 0, y: 0, z: 0 };
    }
  }, [pos1, pos2, isSimulating]);

  // --- PHYSICS ENGINE ---
  const updatePhysics = useCallback(
    (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = time;

      const dt = Math.min(deltaTime, 0.05);

      const p1 = positionsRef.current.p1;
      const p2 = positionsRef.current.p2;
      const v1 = velocitiesRef.current.v1;
      const v2 = velocitiesRef.current.v2;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Collision Detection
      if (dist <= SPHERE_RADIUS * 2) {
        setIsSimulating(false);
        return;
      }

      // F = k * |q1*q2| / r^2
      const forceMag = (k * Math.abs(q1 * q2)) / (dist * dist);

      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;

      let dirFactor = 0;
      if (q1 * q2 > 0) dirFactor = -1; // Repulsive
      else dirFactor = 1; // Attractive

      const fx = forceMag * nx * dirFactor;
      const fy = forceMag * ny * dirFactor;
      const fz = forceMag * nz * dirFactor;

      // Euler Integration
      v1.x = (v1.x + fx * dt) * DAMPING;
      v1.y = (v1.y + fy * dt) * DAMPING;
      v1.z = (v1.z + fz * dt) * DAMPING;

      v2.x = (v2.x - fx * dt) * DAMPING;
      v2.y = (v2.y - fy * dt) * DAMPING;
      v2.z = (v2.z - fz * dt) * DAMPING;

      p1.x += v1.x * dt;
      p1.y += v1.y * dt;
      p1.z += v1.z * dt;

      p2.x += v2.x * dt;
      p2.y += v2.y * dt;
      p2.z += v2.z * dt;

      setPos1({ ...p1 });
      setPos2({ ...p2 });

      requestRef.current = requestAnimationFrame(updatePhysics);
    },
    [q1, q2, k]
  );

  // Animation Loop Management
  useEffect(() => {
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulating, updatePhysics]);

  // Derived UI State
  const physicsState = useMemo(() => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const r = dist === 0 ? 0.0001 : dist;
    const forceMagnitude = (k * Math.abs(q1 * q2)) / Math.pow(r, 2);
    const forceDirection = q1 * q2 > 0 ? "repulsive" : "attractive";

    return {
      distance: dist,
      force: { magnitude: forceMagnitude, direction: forceDirection },
    };
  }, [pos1, pos2, q1, q2, k]);

  // Helpers
  const updatePos1 = (axis, value) => {
    if (!isSimulating)
      setPos1((prev) => ({ ...prev, [axis]: parseFloat(value) }));
  };
  const updatePos2 = (axis, value) => {
    if (!isSimulating)
      setPos2((prev) => ({ ...prev, [axis]: parseFloat(value) }));
  };

  const startSimulation = useCallback(() => setIsSimulating(true), []);
  const pauseSimulation = useCallback(() => setIsSimulating(false), []);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setPos1({ x: -3, y: 0, z: 0 });
    setPos2({ x: 3, y: 0, z: 0 });
    velocitiesRef.current = {
      v1: { x: 0, y: 0, z: 0 },
      v2: { x: 0, y: 0, z: 0 },
    };
  }, []);

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
    // VISUALIZATION STATES
    showField,
    setShowField,
    showFlux,
    setShowFlux,
  };
};
