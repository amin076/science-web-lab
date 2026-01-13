import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  GRAVITY,
  WATER_LEVEL,
  TANK_FLOOR_Y,
  DAMPING_FACTOR,
} from "./constants";
import { calculateSubmergedVolume } from "./Shapes";

export const usePhysics = (
  objectDensity,
  fluidDensity,
  shapeData, // Now receiving shapeData
  isPlaying,
  resetTrigger,
  onUpdate
) => {
  const blockRef = useRef();
  const velocity = useRef(0);
  const position = useRef(8);
  const acc = useRef(0);
  const lastHudT = useRef(0);

  const reset = () => {
    position.current = 8;
    velocity.current = 0;
    acc.current = 0;

    if (blockRef.current) blockRef.current.position.y = 8;

    // Initial state (fully out of water)
    const mass = objectDensity * shapeData.volume;
    onUpdate?.({
      buoyantForce: 0,
      weight: mass * GRAVITY,
      submergedPct: 0,
      heightIn: 0,
      heightOut: shapeData.height,
      volIn: 0,
      volOut: shapeData.volume,
      isSinking: objectDensity > fluidDensity,
    });
  };

  // Reset when density or shape changes
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, objectDensity, fluidDensity, shapeData.type]);

  const computeState = () => {
    const mass = objectDensity * shapeData.volume;
    const weightForce = mass * GRAVITY;

    const y = position.current;

    // Calculate Submerged Volume using our shape helper
    const volIn = calculateSubmergedVolume(shapeData, y, WATER_LEVEL);

    // Derived values
    const volOut = Math.max(0, shapeData.volume - volIn);
    const buoyantForce = fluidDensity * volIn * GRAVITY;
    const submergedPct = Math.min(
      100,
      Math.round((volIn / shapeData.volume) * 100)
    );

    // Approximate heights for display (simplified for non-prisms)
    const bottom = y - shapeData.height / 2;
    const top = y + shapeData.height / 2;
    const heightIn = Math.max(0, Math.min(top, WATER_LEVEL) - bottom);

    return {
      buoyantForce,
      weight: weightForce,
      submergedPct,
      heightIn,
      heightOut: Math.max(0, shapeData.height - heightIn),
      volIn,
      volOut,
      isSinking: objectDensity > fluidDensity,
    };
  };

  const step = (dt) => {
    const mass = objectDensity * shapeData.volume;
    const { buoyantForce, weight } = computeState();

    // Damping (drag)
    const drag = -velocity.current * DAMPING_FACTOR * mass;
    const net = buoyantForce - weight + drag;
    const a = net / mass;

    velocity.current += a * dt;
    position.current += velocity.current * dt;

    // Floor collision
    const floorLimit = TANK_FLOOR_Y + shapeData.height / 2 + 0.05;
    if (position.current <= floorLimit) {
      position.current = floorLimit;
      velocity.current = 0;
    }
  };

  useFrame((state, delta) => {
    if (!blockRef.current) return;

    acc.current += Math.min(delta, 0.25);
    const fixedDt = 1 / 60;
    const maxSubSteps = 10;

    if (isPlaying) {
      let n = 0;
      while (acc.current >= fixedDt && n < maxSubSteps) {
        step(fixedDt);
        acc.current -= fixedDt;
        n++;
      }
      blockRef.current.position.y = position.current;
    } else {
      acc.current = 0;
    }

    // HUD update (throttled to 20Hz)
    const t = state.clock.getElapsedTime();
    if (onUpdate && t - lastHudT.current > 0.05) {
      lastHudT.current = t;
      onUpdate(computeState());
    }
  });

  return { blockRef };
};
