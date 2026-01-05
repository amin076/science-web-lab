import { clamp } from "./surfaceWaves.math.js";

/**
 * Realistic "Daylight" Water Rendering
 *
 * - Base: Clear Blue-Grey
 * - Crests: Refract light intensely (Pure White)
 * - Troughs: Cast soft shadows (Darker Blue)
 * - Gradient: Smooth transitions
 */
export function renderWaveToImageData(state, imgData, opts = {}) {
  const { u, obstacles } = state;
  const pixels = imgData.data;

  // Scale factor for wave height visualization
  const scale = opts.colorScale ?? 2.5;

  // Base Water Color (Lighter, like a pool or ripple tank)
  const baseR = 40;
  const baseG = 110;
  const baseB = 160;

  for (let i = 0; i < u.length; i++) {
    const p = i * 4;

    // Walls
    if (obstacles[i] === 1) {
      pixels[p] = 60;
      pixels[p + 1] = 60;
      pixels[p + 2] = 65;
      pixels[p + 3] = 255;
      continue;
    }

    const val = u[i];

    // We create a "lighting" effect.
    // Real waves are smooth, so we map the value non-linearly.

    if (val > 0) {
      // --- CRESTS (Highlights) ---
      // We want distinct, sharp bright lines for the tops of waves
      const intensity = Math.pow(val * scale, 0.8) * 120;

      pixels[p] = clamp(baseR + intensity, 0, 255);
      pixels[p + 1] = clamp(baseG + intensity, 0, 255);
      pixels[p + 2] = clamp(baseB + intensity, 0, 255); // Whiten towards 255
    } else {
      // --- TROUGHS (Shadows) ---
      // Shadows should be diffuse and not pitch black
      const intensity = Math.pow(Math.abs(val) * scale, 0.8) * 80;

      pixels[p] = clamp(baseR - intensity * 0.8, 0, 255);
      pixels[p + 1] = clamp(baseG - intensity * 0.8, 0, 255);
      pixels[p + 2] = clamp(baseB - intensity * 0.5, 10, 255); // Keep blue hue
    }

    pixels[p + 3] = 255;
  }
}
