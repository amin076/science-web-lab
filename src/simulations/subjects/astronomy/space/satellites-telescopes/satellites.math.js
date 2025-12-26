// src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.math.js

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const vec = {
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  mul: (a, s) => ({ x: a.x * s, y: a.y * s }),
  dot: (a, b) => a.x * b.x + a.y * b.y,
  len: (a) => Math.hypot(a.x, a.y),
  norm: (a) => {
    const L = Math.hypot(a.x, a.y) || 1;
    return { x: a.x / L, y: a.y / L };
  },
};

export function rotate2D(p, angRad) {
  const c = Math.cos(angRad);
  const s = Math.sin(angRad);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

export function formatKm(n) {
  return `${n.toFixed(0)} km`;
}

export function formatDeg(n) {
  return `${n.toFixed(1)}°`;
}
