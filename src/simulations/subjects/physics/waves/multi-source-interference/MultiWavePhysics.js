import { idx } from "../surface-waves-double-slit/surfaceWaves.math.js";

/**
 * Applies multiple continuous point sources to the grid using Gaussian injection.
 * This prevents "square" waves by smoothing the source over multiple pixels.
 */
export function applyMultiSources(state, sources, dt) {
  const { w, h, u, t } = state;

  sources.forEach((source) => {
    if (!source.active) return;

    // Calculate Source Signal
    const omega = 2 * Math.PI * source.frequency;
    const signal = source.amplitude * Math.sin(omega * t + (source.phase || 0));

    // Center coordinates
    const cx = source.x * w;
    const cy = source.y * h;

    // Define influence radius (Sigma).
    // Larger sigma = rounder waves but less "sharp". 1.5 is a good balance.
    const sigma = 1.5;
    const sigmaSq2 = 2 * sigma * sigma;
    const radius = Math.ceil(sigma * 2.5); // range to calculate

    const startX = Math.floor(cx - radius);
    const endX = Math.ceil(cx + radius);
    const startY = Math.floor(cy - radius);
    const endY = Math.ceil(cy + radius);

    // Loop over the area around the source
    for (let y = startY; y <= endY; y++) {
      if (y < 1 || y >= h - 1) continue;

      for (let x = startX; x <= endX; x++) {
        if (x < 1 || x >= w - 1) continue;

        // 1. Calculate distance from exact source center
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;

        // 2. Calculate Gaussian Weight (0.0 to 1.0)
        const weight = Math.exp(-distSq / sigmaSq2);

        // 3. "Soft Force" the grid
        // Instead of hard overwriting u[i] = signal, we blend it.
        // This ensures the source feels "round" to the physics engine.
        // We multiply weight by 0.5 to make the coupling slightly loose, reducing reflections.
        const i = idx(x, y, w);
        const blend = weight * 0.8;

        u[i] = u[i] * (1 - blend) + signal * blend;
      }
    }
  });
}
