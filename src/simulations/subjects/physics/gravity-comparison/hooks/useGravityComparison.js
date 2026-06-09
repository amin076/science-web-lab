//src/simulations/subjects/physics/gravity-comparison/hooks/useGravityComparison.js
// Custom hook to manage the state and logic for the Gravity Comparison simulation.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ANIMATION_SETTINGS,
  DEFAULT_FREE_FALL_SETTINGS,
  DEFAULT_PROJECTILE_SETTINGS,
  DEFAULT_SIMULATION_MODE,
  GRAVITY_WORLDS,
  SIMULATION_MODES,
} from "../constants";

import {
  calculateMotionPosition,
  updateTrailPoints,
} from "../utils/gravityMotion";

function createInitialBodies() {
  return GRAVITY_WORLDS.map((world) => ({
    ...world,
    position: { x: 0, y: 0 },
    hasLanded: false,
    trail: [],
  }));
}

export function useGravityComparison() {
  const [mode, setMode] = useState(DEFAULT_SIMULATION_MODE);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  const [freeFallSettings, setFreeFallSettings] = useState(
    DEFAULT_FREE_FALL_SETTINGS,
  );

  const [projectileSettings, setProjectileSettings] = useState(
    DEFAULT_PROJECTILE_SETTINGS,
  );

  const [bodies, setBodies] = useState(createInitialBodies);

  const animationRef = useRef(null);
  const lastTimestampRef = useRef(null);

  const enabledBodies = useMemo(
    () => bodies.filter((body) => body.enabled),
    [bodies],
  );

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setBodies(createInitialBodies());
    lastTimestampRef.current = null;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const toggleWorld = useCallback((worldId) => {
    setBodies((currentBodies) =>
      currentBodies.map((body) =>
        body.id === worldId
          ? {
              ...body,
              enabled: !body.enabled,
              position: { x: 0, y: 0 },
              hasLanded: false,
              trail: [],
            }
          : body,
      ),
    );
  }, []);

  const updateFrame = useCallback(
    (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaSeconds =
        ((timestamp - lastTimestampRef.current) / 1000) *
        ANIMATION_SETTINGS.timeScale;

      lastTimestampRef.current = timestamp;

      setTime((currentTime) => {
        const nextTime = currentTime + deltaSeconds;

        setBodies((currentBodies) =>
          currentBodies.map((body) => {
            if (!body.enabled || body.hasLanded) {
              return body;
            }

            const position = calculateMotionPosition({
              mode,
              world: body,
              time: nextTime,
              freeFallSettings,
              projectileSettings,
              simulationModes: SIMULATION_MODES,
            });

            return {
              ...body,
              position: {
                x: position.x,
                y: position.y,
              },
              hasLanded: position.hasLanded,
              trail: updateTrailPoints({
                trail: body.trail,
                point: {
                  x: position.x,
                  y: position.y,
                },
                maxTrailPoints: ANIMATION_SETTINGS.maxTrailPoints,
              }),
            };
          }),
        );

        return nextTime;
      });

      animationRef.current = requestAnimationFrame(updateFrame);
    },
    [freeFallSettings, mode, projectileSettings],
  );

  useEffect(() => {
    if (!isRunning) {
      lastTimestampRef.current = null;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      return;
    }

    animationRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateFrame]);

  const allEnabledBodiesHaveLanded = useMemo(
    () =>
      enabledBodies.length > 0 && enabledBodies.every((body) => body.hasLanded),
    [enabledBodies],
  );

  useEffect(() => {
    if (allEnabledBodiesHaveLanded) {
      setIsRunning(false);
    }
  }, [allEnabledBodiesHaveLanded]);

  return {
    mode,
    setMode,

    isRunning,
    setIsRunning,

    time,
    bodies,
    enabledBodies,

    freeFallSettings,
    setFreeFallSettings,

    projectileSettings,
    setProjectileSettings,

    toggleWorld,
    resetSimulation,
  };
}
