import { clamp, idx, gaussian2 } from "./surfaceWaves.math.js";

export function createWaveState(w, h) {
  return {
    w,
    h,
    t: 0,
    u: new Float32Array(w * h),
    uPrev: new Float32Array(w * h),
    uNext: new Float32Array(w * h),
    obstacles: new Uint8Array(w * h), // 1 = wall, 0 = free
    dampingMap: new Float32Array(w * h), // Edge absorption
  };
}

export function clearWave(state) {
  state.u.fill(0);
  state.uPrev.fill(0);
  state.uNext.fill(0);
  state.t = 0;
}

export function buildDampingMap(state) {
  const { w, h, dampingMap } = state;
  const spongeSize = 25; // Slightly larger sponge for better absorption

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let d = 0;
      const dx = Math.min(x, w - 1 - x);
      const dy = Math.min(y, h - 1 - y);
      const dist = Math.min(dx, dy);

      if (dist < spongeSize) {
        d = 0.25 * Math.pow((spongeSize - dist) / spongeSize, 2);
      }
      dampingMap[idx(x, y, w)] = d;
    }
  }
}

export function buildDoubleSlitObstacle(obstacles, w, h, opts) {
  obstacles.fill(0);
  if (!opts.enabled) return;

  const wallX = clamp(Math.floor(opts.wallX ?? Math.floor(w / 2)), 5, w - 5);
  const thickness = clamp(Math.floor(opts.thickness ?? 2), 1, 10);
  const slitSize = clamp(Math.floor(opts.slitSize ?? 10), 1, Math.floor(h / 3));
  const slitSeparation = clamp(
    Math.floor(opts.slitSeparation ?? 26),
    2,
    Math.floor(h / 2)
  );
  const cy = Math.floor(h / 2);

  for (let y = 0; y < h; y++) {
    for (let tx = 0; tx < thickness; tx++) {
      obstacles[idx(wallX + tx, y, w)] = 1;
    }
  }

  const s1Top = cy - slitSeparation - slitSize;
  const s1Bot = cy - slitSeparation + slitSize;
  for (let y = s1Top; y <= s1Bot; y++) {
    for (let tx = 0; tx < thickness; tx++) {
      if (y > 1 && y < h - 2) obstacles[idx(wallX + tx, y, w)] = 0;
    }
  }

  const s2Top = cy + slitSeparation - slitSize;
  const s2Bot = cy + slitSeparation + slitSize;
  for (let y = s2Top; y <= s2Bot; y++) {
    for (let tx = 0; tx < thickness; tx++) {
      if (y > 1 && y < h - 2) obstacles[idx(wallX + tx, y, w)] = 0;
    }
  }
}

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
      u[i] += amp * g;
      uPrev[i] += amp * g;
    }
  }
}

function applyContinuousSource(state, params, dt) {
  const { w, h, u, t, obstacles } = state;
  if (params.sourceMode !== "continuous") return;

  const amp = params.amplitude ?? 1;
  const freqHz = params.frequency ?? 1;
  const omega = 2 * Math.PI * freqHz;
  const value = amp * Math.sin(omega * t);

  // Soft Gaussian injection for point source to prevent square artifacts
  if (params.sourceShape === "point") {
    const sx = clamp(Math.floor(params.sourceX ?? w * 0.18), 2, w - 3);
    const sy = clamp(Math.floor(params.sourceY ?? h * 0.5), 2, h - 3);

    // 3x3 kernel
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const i = idx(sx + dx, sy + dy, w);
        if (obstacles[i] === 0) {
          // Simple weight based on distance
          const weight = dx === 0 && dy === 0 ? 0.5 : 0.125;
          u[i] = u[i] * (1 - weight) + value * weight;
        }
      }
    }
  }
  // Plane source (Line)
  else if (params.sourceShape === "plane") {
    const x = clamp(Math.floor(params.sourceX ?? 10), 5, w - 5);
    for (let y = 5; y < h - 5; y++) {
      const i = idx(x, y, w);
      if (obstacles[i] === 0) u[i] = value;
    }
  }
}

export function stepWave(state, params, dt) {
  const { w, h, u, uPrev, uNext, obstacles, dampingMap } = state;

  const dx = 1;
  // Courant stability check
  const c = Math.min(params.waveSpeed ?? 10, (0.6 * dx) / dt);
  const r = (c * dt) / dx;
  const r2 = r * r;

  const baseDamp = clamp(params.damping ?? 0.05, 0, 1) * 0.1;

  applyContinuousSource(state, params, dt);

  // --- MAIN LOOP ---
  // Using 9-Point Stencil for Isotropic (Circular) Propagation

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    const prevRow = (y - 1) * w;
    const nextRow = (y + 1) * w;

    for (let x = 1; x < w - 1; x++) {
      const i = rowOffset + x;

      if (obstacles[i] === 1) {
        uNext[i] = 0;
        continue;
      }

      const uC = u[i];
      const d = baseDamp + dampingMap[i];

      // 1. Cross Neighbors (Up, Down, Left, Right)
      const valCross = u[i - 1] + u[i + 1] + u[prevRow + x] + u[nextRow + x];

      // 2. Diagonal Neighbors (Corners)
      const valDiag =
        u[prevRow + x - 1] +
        u[prevRow + x + 1] +
        u[nextRow + x - 1] +
        u[nextRow + x + 1];

      // 3. Isotropic Laplacian Approximation
      // 0.5 weight to cross, 0.25 weight to diagonals, -3 center
      // This magic ratio balances the propagation speed in all directions.
      const lap = 0.5 * valCross + 0.25 * valDiag - 3.0 * uC;

      // Wave Equation
      uNext[i] = (2 - d) * uC - (1 - d) * uPrev[i] + r2 * lap;
    }
  }

  // Swap
  state.uPrev.set(state.u);
  state.u.set(state.uNext);
  state.t += dt;
}
