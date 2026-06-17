import { SCENES } from "./footballGravity.constants";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function easeInOutCubic(value) {
  const t = clamp01(value);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(value) {
  const t = clamp01(value);
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp01(t);
}

export function sceneProgress(videoTime, start, end) {
  return clamp01((videoTime - start) / (end - start));
}

export function getSceneAtTime(videoTime) {
  if (videoTime < 2.2) return SCENES.INTRO;
  if (videoTime < 5.4) return SCENES.LAUNCH;
  if (videoTime < 28.0) return SCENES.FOLLOW_MOON;
  if (videoTime < 32.8) return SCENES.WIDE_REVEAL;
  return SCENES.RESULTS;
}

export function getPhysicsTime(videoTime) {
  if (videoTime < 2.2) return 0;

  // Real-time flight after the kick. This lets the Moon ball actually land
  // before the final reveal and result board.
  return videoTime - 2.2;
}
