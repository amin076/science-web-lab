// src/simulations/subjects/physics/mechanics/gravity-comparison/hooks/useGravityComparison.js
// Custom hook that manages animation timing, physics updates, and simulation state for the Gravity Comparison simulation.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ANIMATION_SETTINGS,
  DEFAULT_FREE_FALL_SETTINGS,
  DEFAULT_PROJECTILE_SETTINGS,
  DEFAULT_SIMULATION_MODE,
  GRAVITY_WORLDS,
} from "../constants";

import { updateTrailPoints } from "../utils/gravityMotion";

function createInitialBodies() {
  return GRAVITY_WORLDS.map((world) => ({
    ...world,
    position: {
      x: 0,
      y: DEFAULT_FREE_FALL_SETTINGS.height,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    hasLanded: false,
    trail: [
      {
        x: 0,
        y: DEFAULT_FREE_FALL_SETTINGS.height,
      },
    ],
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
              position: {
                x: 0,
                y: DEFAULT_FREE_FALL_SETTINGS.height,
              },
              velocity: {
                x: 0,
                y: 0,
              },
              hasLanded: false,
              trail: [
                {
                  x: 0,
                  y: DEFAULT_FREE_FALL_SETTINGS.height,
                },
              ],
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

            const nextVelocity = {
              x: body.velocity.x,
              y: body.velocity.y - body.gravity * deltaSeconds,
            };

            const nextPosition = {
              x: body.position.x + nextVelocity.x * deltaSeconds,
              y: body.position.y + nextVelocity.y * deltaSeconds,
            };

            const hasLanded = nextPosition.y <= 0;

            const safePosition = {
              x: nextPosition.x,
              y: hasLanded ? 0 : nextPosition.y,
            };

            return {
              ...body,
              position: safePosition,
              velocity: hasLanded
                ? {
                    x: 0,
                    y: 0,
                  }
                : nextVelocity,
              hasLanded,
              trail: updateTrailPoints({
                trail: body.trail,
                point: safePosition,
                maxTrailPoints: ANIMATION_SETTINGS.maxTrailPoints,
              }),
            };
          }),
        );

        return nextTime;
      });

      animationRef.current = requestAnimationFrame(updateFrame);
    },
    [],
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
      enabledBodies.length > 0 &&
      enabledBodies.every((body) => body.hasLanded),
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