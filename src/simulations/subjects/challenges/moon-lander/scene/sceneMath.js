export const WORLD_SCALE = 38;
export const WORLD_CENTER_X = 450;

export function engineXToScene(x) {
  return (x - WORLD_CENTER_X) / WORLD_SCALE;
}

export function engineYToScene(y) {
  return y / WORLD_SCALE;
}

export function sceneXToEngine(x) {
  return x * WORLD_SCALE + WORLD_CENTER_X;
}

export function landerScenePosition(state) {
  const lander = state?.lander || {};
  const position = lander.position || { x: WORLD_CENTER_X, y: 0 };

  return [
    engineXToScene(position.x),
    engineYToScene(position.y) + 0.78,
    0,
  ];
}

export function padSceneX(state) {
  return engineXToScene(state?.mission?.landingPad?.x || 680);
}

export function padSceneWidth(state) {
  return (state?.mission?.landingPad?.width || 140) / WORLD_SCALE;
}

export function getFlightMetrics(state) {
  const lander = state?.lander || {};
  const thresholds = state?.mission?.thresholds || {};
  const verticalSpeed = Math.abs(Math.min(0, lander.velocity?.y || 0));
  const horizontalSpeed = Math.abs(lander.velocity?.x || 0);
  const tilt = Math.abs(lander.angle || 0);

  return {
    verticalSpeed,
    horizontalSpeed,
    tilt,
    danger:
      verticalSpeed > (thresholds.maxVerticalSpeed || 3) * 1.25 ||
      horizontalSpeed > (thresholds.maxHorizontalSpeed || 2) * 1.4 ||
      tilt > (thresholds.maxTilt || 8) * 1.25,
  };
}
