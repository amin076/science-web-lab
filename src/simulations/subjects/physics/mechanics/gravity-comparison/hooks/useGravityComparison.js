// src/simulations/subjects/physics/mechanics/gravity-comparison/hooks/useGravityComparison.js
// Custom hook that manages animation timing, physics updates, selected world, pan/zoom view state, and simulation state.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ANIMATION_SETTINGS,
  DEFAULT_FREE_FALL_SETTINGS,
  DEFAULT_PROJECTILE_SETTINGS,
  DEFAULT_SIMULATION_MODE,
  GRAVITY_WORLDS,
  SIMULATION_MODES,
} from "../constants";

import { degToRad, updateTrailPoints } from "../utils/gravityMotion";

function getInitialVelocity(mode, projectileSettings) {
  if (mode !== SIMULATION_MODES.PROJECTILE) {
    return { x: 0, y: 0 };
  }

  const angleRad = degToRad(projectileSettings.angleDeg);

  return {
    x: projectileSettings.speed * Math.cos(angleRad),
    y: projectileSettings.speed * Math.sin(angleRad),
  };
}

function createInitialBodies(mode = DEFAULT_SIMULATION_MODE, projectileSettings = DEFAULT_PROJECTILE_SETTINGS) {
  const initialY =
    mode === SIMULATION_MODES.PROJECTILE
      ? projectileSettings.height
      : DEFAULT_FREE_FALL_SETTINGS.height;

  return GRAVITY_WORLDS.map((world) => ({
    ...world,
    position: { x: 0, y: initialY },
    velocity: getInitialVelocity(mode, projectileSettings),
    hasLanded: false,
    trail: [{ x: 0, y: initialY }],
    impactTime: null,
    maxHeight: initialY,
    impactSpeed: null,
  }));
}

export function useGravityComparison() {
  const [mode, setModeState] = useState(DEFAULT_SIMULATION_MODE);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedWorldId, setSelectedWorldId] = useState("earth");

  const [viewOptions, setViewOptions] = useState({
    showTrails: true,
    showGrid: true,
    showLabels: true,
    showHeightLines: true,
  });

  const [viewTransform, setViewTransform] = useState({
    scale: 1,
    panX: 0,
    panY: 0,
  });

  const [freeFallSettings, setFreeFallSettings] = useState(
    DEFAULT_FREE_FALL_SETTINGS,
  );

  const [projectileSettings, setProjectileSettings] = useState(
    DEFAULT_PROJECTILE_SETTINGS,
  );

  const [bodies, setBodies] = useState(() =>
    createInitialBodies(DEFAULT_SIMULATION_MODE, DEFAULT_PROJECTILE_SETTINGS),
  );

  const animationRef = useRef(null);
  const lastTimestampRef = useRef(null);

  const enabledBodies = useMemo(
    () => bodies.filter((body) => body.enabled),
    [bodies],
  );

  const selectedBody = useMemo(
    () => bodies.find((body) => body.id === selectedWorldId) || enabledBodies[0] || bodies[0],
    [bodies, enabledBodies, selectedWorldId],
  );

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setBodies(createInitialBodies(mode, projectileSettings));
    lastTimestampRef.current = null;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [mode, projectileSettings]);

  const setMode = useCallback(
    (nextMode) => {
      setModeState(nextMode);
      setIsRunning(false);
      setTime(0);
      setBodies(createInitialBodies(nextMode, projectileSettings));
      lastTimestampRef.current = null;
    },
    [projectileSettings],
  );

  const toggleWorld = useCallback(
    (worldId) => {
      setBodies((currentBodies) =>
        currentBodies.map((body) =>
          body.id === worldId
            ? {
                ...body,
                enabled: !body.enabled,
                position: {
                  x: 0,
                  y:
                    mode === SIMULATION_MODES.PROJECTILE
                      ? projectileSettings.height
                      : freeFallSettings.height,
                },
                velocity: getInitialVelocity(mode, projectileSettings),
                hasLanded: false,
                trail: [
                  {
                    x: 0,
                    y:
                      mode === SIMULATION_MODES.PROJECTILE
                        ? projectileSettings.height
                        : freeFallSettings.height,
                  },
                ],
                impactTime: null,
                impactSpeed: null,
              }
            : body,
        ),
      );
    },
    [freeFallSettings.height, mode, projectileSettings],
  );

  const updateViewOption = useCallback((key, value) => {
    setViewOptions((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewTransform({
      scale: 1,
      panX: 0,
      panY: 0,
    });
  }, []);

  const zoomView = useCallback((direction) => {
  setViewTransform((current) => {
    const nextScale =
      direction > 0
        ? Math.min(current.scale * 1.12, 5)
        : Math.max(current.scale / 1.12, 0.12);

    return {
      ...current,
      scale: nextScale,
    };
  });
}, []);

  const panView = useCallback((deltaX, deltaY) => {
    setViewTransform((current) => ({
      ...current,
      panX: current.panX + deltaX,
      panY: current.panY + deltaY,
    }));
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

         if (deltaSeconds <= 0) {
  return body;
}

const nextPosition = {
  x: body.position.x + body.velocity.x * deltaSeconds,
  y:
    body.position.y +
    body.velocity.y * deltaSeconds -
    0.5 * body.gravity * deltaSeconds * deltaSeconds,
};

const nextVelocity = {
  x: body.velocity.x,
  y: body.velocity.y - body.gravity * deltaSeconds,
};

const isProjectileStarting =
  mode === SIMULATION_MODES.PROJECTILE &&
  body.position.y <= 0 &&
  body.velocity.y > 0;

const hasLanded =
  !isProjectileStarting && nextPosition.y <= 0 && nextVelocity.y < 0;

            const safePosition = {
              x: nextPosition.x,
              y: hasLanded ? 0 : nextPosition.y,
            };

            const speed = Math.sqrt(
              nextVelocity.x * nextVelocity.x + nextVelocity.y * nextVelocity.y,
            );

            return {
              ...body,
              position: safePosition,
              velocity: hasLanded ? { x: 0, y: 0 } : nextVelocity,
              hasLanded,
              impactTime: hasLanded ? nextTime : body.impactTime,
              impactSpeed: hasLanded ? speed : body.impactSpeed,
              maxHeight: Math.max(body.maxHeight || 0, safePosition.y),
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
    [mode],
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
    selectedBody,
    selectedWorldId,
    setSelectedWorldId,

    freeFallSettings,
    setFreeFallSettings,

    projectileSettings,
    setProjectileSettings,

    viewOptions,
    updateViewOption,

    viewTransform,
    resetView,
    zoomView,
    panView,

    toggleWorld,
    resetSimulation,
  };
}