// constants.js
export const PX_PER_METER = 20; // Zoom level
export const MAX_DT = 1 / 30; // 33ms cap
export const GRID_STEP = 50; // px

// Visual scaling
export const TRAIL_LENGTH = 200;

// ------------------------
// Math helpers
// ------------------------
export function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}

export function isFiniteNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

export function formatNumber(v, digits = 3) {
  if (!Number.isFinite(v)) return String(v);
  return Number(v).toFixed(digits);
}

export function degreesToRad(deg) {
  return (deg * Math.PI) / 180;
}

// ------------------------
// Array / buffer helpers
// ------------------------
export function pushCapped(arr, item, max) {
  arr.push(item);
  if (arr.length > max) {
    arr.splice(0, arr.length - max);
  }
}

// ------------------------
// Canvas helpers
// ------------------------
export function resizeCanvasToParentDPR(canvas) {
  if (!canvas) return { ctx: null, cssW: 0, cssH: 0, dpr: 1 };

  const parent = canvas.parentElement;
  if (!parent) return { ctx: null, cssW: 0, cssH: 0, dpr: 1 };

  const cssW = parent.clientWidth;
  const cssH = parent.clientHeight;
  const dpr = window.devicePixelRatio || 1;

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
