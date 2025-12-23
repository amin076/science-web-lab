// src/simulations/subjects/physics/waves/surface-waves-double-slit/wavePhysics.js
import { clamp, idx, gaussian2 } from "./surfaceWaves.math.js";

/**
 * A simple 2D wave equation solver (finite-difference time-domain).
 * uNext = (2 - d) u - (1 - d) uPrev + r^2 * Laplacian(u)
 * where r = c * dt / dx (Courant number), must be <= ~0.707 for 2D stability.
 */

export function createWaveState(w, h) {
  return {
    w,
    h,
    t: 0,
    u: new Float32Array(w * h),
    uPrev: new Float32Array(w * h),
    uNext: new Float32Array(w * h),
    obstacles: new Uint8Array(w * h), // 1 = wall, 0 = free
  };
}

export function clearWave(state) {
  state.u.fill(0);
  state.uPrev.fill(0);
  state.uNext.fill(0);
  state.t = 0;
}

export function buildDoubleSlitObstacle(obstacles, w, h, opts) {
  obstacles.fill(0);

  const enabled = !!opts.enabled;
  if (!enabled) return;

  const wallX = clamp(Math.floor(opts.wallX ?? Math.floor(w / 2)), 2, w - 3);
  const thickness = clamp(Math.floor(opts.thickness ?? 2), 1, 8);

  const slitSize = clamp(Math.floor(opts.slitSize ?? 10), 2, Math.floor(h / 3));
  const slitSeparation = clamp(
    Math.floor(opts.slitSeparation ?? 26),
    2,
    Math.floor(h / 2) - slitSize - 2
  );

  const cy = Math.floor(h / 2);

  // Paint wall (vertical band)
  for (let y = 1; y < h - 1; y++) {
    for (let tx = 0; tx < thickness; tx++) {
      obstacles[idx(wallX + tx, y, w)] = 1;
    }
  }

  // Cut two slits (clear obstacles)
  const slit1Y0 = cy - slitSeparation - slitSize;
  const slit1Y1 = cy - slitSeparation + slitSize;

  const slit2Y0 = cy + slitSeparation - slitSize;
  const slit2Y1 = cy + slitSeparation + slitSize;

  for (let y = slit1Y0; y <= slit1Y1; y++) {
    if (y <= 1 || y >= h - 2) continue;
    for (let tx = 0; tx < thickness; tx++) {
      obstacles[idx(wallX + tx, y, w)] = 0;
    }
  }

  for (let y = slit2Y0; y <= slit2Y1; y++) {
    if (y <= 1 || y >= h - 2) continue;
    for (let tx = 0; tx < thickness; tx++) {
      obstacles[idx(wallX + tx, y, w)] = 0;
    }
  }
}

/**
 * Ensure no energy "lives" inside walls after obstacle changes.
 */
export function zeroInsideObstacles(state) {
  const { obstacles, u, uPrev, uNext } = state;
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i] === 1) {
      u[i] = 0;
      uPrev[i] = 0;
      uNext[i] = 0;
    }
  }
}

export function injectPulse(state, x, y, amp = 1, radius = 8) {
  const { w, h, obstacles, u, uPrev } = state;
  const r = clamp(Math.floor(radius), 2, 60);
  const cx = clamp(Math.floor(x), 1, w - 2);
  const cy = clamp(Math.floor(y), 1, h - 2);

  for (let yy = cy - r; yy <= cy + r; yy++) {
    if (yy <= 1 || yy >= h - 2) continue;
    for (let xx = cx - r; xx <= cx + r; xx++) {
      if (xx <= 1 || xx >= w - 2) continue;

      const i = idx(xx, yy, w);
      if (obstacles[i] === 1) continue;

      const g = gaussian2(xx - cx, yy - cy, r * 0.45);
      const add = amp * g;

      // Add displacement with near-zero initial velocity (keep uPrev close to u)
      u[i] += add;
      uPrev[i] += add;
    }
  }
}

function applyContinuousSource(state, params, dt) {
  const { w, h, u, uPrev, obstacles, t } = state;

  if (params.sourceMode !== "continuous") return;

  const amp = params.amplitude ?? 1;
  const freqHz = params.frequency ?? 1; // Hz in "simulation seconds"
  const omega = 2 * Math.PI * freqHz;
  const value = amp * Math.sin(omega * t);

  if (params.sourceShape === "plane") {
    // Drive a vertical line to create plane waves (parallel wavefronts)
    const x = clamp(Math.floor(params.sourceX ?? 10), 2, w - 3);
    for (let y = 2; y < h - 2; y++) {
      const i = idx(x, y, w);
      if (obstacles[i] === 1) continue;
      u[i] = value;
      uPrev[i] = value;
    }
  } else {
    // Point source (circular waves)
    const sx = clamp(
      Math.floor(params.sourceX ?? Math.floor(w * 0.18)),
      2,
      w - 3
    );
    const sy = clamp(
      Math.floor(params.sourceY ?? Math.floor(h * 0.5)),
      2,
      h - 3
    );
    const i = idx(sx, sy, w);
    if (obstacles[i] === 0) {
      u[i] = value;
      uPrev[i] = value;
    }
  }
}

/**
 * One physics step.
 * params: { waveSpeed, damping, dx, sourceMode, sourceShape, ... }
 */
export function stepWave(state, params, dt) {
  const { w, h, u, uPrev, uNext, obstacles } = state;

  const dx = params.dx ?? 1; // grid spacing
  const c = params.waveSpeed ?? 10; // "cells per second"
  const r = (c * dt) / dx;
  const r2 = r * r;

  // Damping as a velocity-proportional term (small recommended).
  // UI could be 0..1, we map to 0..0.02-ish per step.
  const dampUI = clamp(params.damping ?? 0.1, 0, 1);
  const d = dampUI * 0.02;

  // Apply continuous source BEFORE stepping so it injects energy cleanly
  applyContinuousSource(state, params, dt);

  // Absorbing boundary (zero edges) to reduce reflections from frame
  for (let x = 0; x < w; x++) {
    uNext[idx(x, 0, w)] = 0;
    uNext[idx(x, h - 1, w)] = 0;
  }
  for (let y = 0; y < h; y++) {
    uNext[idx(0, y, w)] = 0;
    uNext[idx(w - 1, y, w)] = 0;
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y, w);

      if (obstacles[i] === 1) {
        uNext[i] = 0;
        continue;
      }

      const uC = u[i];
      const lap =
        u[idx(x - 1, y, w)] +
        u[idx(x + 1, y, w)] +
        u[idx(x, y - 1, w)] +
        u[idx(x, y + 1, w)] -
        4 * uC;

      // Wave equation with damping
      uNext[i] = (2 - d) * uC - (1 - d) * uPrev[i] + r2 * lap;
    }
  }

  // Swap buffers
  state.uPrev = state.u;
  state.u = state.uNext;
  state.uNext = uPrev; // reuse old uPrev array as the next buffer

  // Time update
  state.t += dt;
}
