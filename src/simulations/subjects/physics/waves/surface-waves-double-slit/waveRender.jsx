// src/simulations/subjects/physics/waves/surface-waves-double-slit/waveRender.js
import { clamp } from "./surfaceWaves.math.js";

/**
 * High-contrast visualization (similar to your reference app):
 * - Positive: cyan/white
 * - Negative: deep blue
 * - Wall: dark gray
 */
export function renderWaveToImageData(state, imgData, opts = {}) {
  const { u, obstacles } = state;
  const pixels = imgData.data;

  const scale = opts.colorScale ?? 6.0; // adjust for stronger contrast

  for (let i = 0; i < u.length; i++) {
    const p = i * 4;

    if (obstacles[i] === 1) {
      pixels[p] = 40;
      pixels[p + 1] = 40;
      pixels[p + 2] = 40;
      pixels[p + 3] = 255;
      continue;
    }

    const val = u[i];
    const intensity = clamp(Math.abs(val) * scale, 0, 255);

    if (val >= 0) {
      // cyan-ish
      pixels[p] = intensity * 0.1;
      pixels[p + 1] = intensity;
      pixels[p + 2] = intensity;
    } else {
      // deep blue-ish
      pixels[p] = 0;
      pixels[p + 1] = 0;
      pixels[p + 2] = intensity * 0.85;
    }

    pixels[p + 3] = 255;
  }
}
