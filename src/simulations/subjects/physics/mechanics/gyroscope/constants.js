// src/simulations/subjects/physics/mechanics/gyroscope/constants.js
// Shared helpers for template simulations (Canvas 2D focused)

export const PX_PER_METER = 60; // visual scaling (px per meter)
export const MAX_DT = 1 / 30; // dt clamp (seconds) ~33ms
export const GRID_STEP = 50; // px

// ------------------------
// Math helpers
// ------------------------
export function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}

export function clamp01(v) {
  return clamp(v, 0, 1);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function isFiniteNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

export function safeNumber(x, fallback = 0) {
  const n = typeof x === "number" ? x : parseFloat(x);
  return Number.isFinite(n) ? n : fallback;
}

export function formatNumber(v, digits = 3) {
  if (!Number.isFinite(v)) return String(v);
  return Number(v).toFixed(digits);
}

// ------------------------
// Array / buffer helpers
// ------------------------

/**
 * Push a sample into an array and cap its length to max.
 * Prevents memory growth in chart data.
 */
export function pushCapped(arr, item, max) {
  arr.push(item);
  if (arr.length > max) {
    arr.splice(0, arr.length - max);
  }
}

// ------------------------
// Canvas helpers
// ------------------------

/**
 * Resize canvas to match its parent size and set DPR transform for sharp rendering.
 * Returns { ctx, cssW, cssH, dpr } (ctx can be null if no 2d context)
 */
export function resizeCanvasToParentDPR(canvas) {
  if (!canvas) return { ctx: null, cssW: 0, cssH: 0, dpr: 1 };

  const parent = canvas.parentElement;
  if (!parent) return { ctx: null, cssW: 0, cssH: 0, dpr: 1 };

  const cssW = parent.clientWidth;
  const cssH = parent.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  // avoid 0x0
  const w = Math.max(1, Math.floor(cssW * dpr));
  const h = Math.max(1, Math.floor(cssH * dpr));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { ctx, cssW, cssH, dpr };
}
