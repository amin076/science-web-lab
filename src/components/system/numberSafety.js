export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function safeNumber(n, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export function safeVec3(v, fallback = { x: 0, y: 0, z: 0 }) {
  return {
    x: Number.isFinite(v?.x) ? v.x : fallback.x,
    y: Number.isFinite(v?.y) ? v.y : fallback.y,
    z: Number.isFinite(v?.z) ? v.z : fallback.z,
  };
}
