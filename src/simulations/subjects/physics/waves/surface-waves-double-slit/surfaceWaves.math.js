// src/simulations/subjects/physics/waves/surface-waves-double-slit/surfaceWaves.math.js

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function idx(x, y, w) {
  return y * w + x;
}

export function gaussian2(dx, dy, sigma) {
  const s2 = sigma * sigma;
  return Math.exp(-(dx * dx + dy * dy) / (2 * s2));
}
