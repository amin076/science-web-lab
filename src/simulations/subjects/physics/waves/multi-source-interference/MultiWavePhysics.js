import { idx } from "../surface-waves-double-slit/surfaceWaves.math.js";

const TAU = Math.PI * 2;

export const SOURCE_MOTION_PRESETS = [
  { value: "static", label: "Static" },
  { value: "circle", label: "Circular" },
  { value: "ellipse", label: "Elliptical" },
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "figure-eight", label: "Figure 8" },
  { value: "random-drift", label: "Random Drift" },
];

function clamp01(value) {
  return Math.max(0.04, Math.min(0.96, value));
}

function phaseForSource(source) {
  return source.motionPhase ?? source.id * 1.618;
}

export function sourceWithMotionDefaults(source) {
  return {
    motion: "static",
    motionSpeed: 0.22,
    motionRadius: 0.16,
    sourceSize: 0.32,
    pulseEnabled: false,
    pulseOnTime: 0.1,
    pulseOffTime: 0.5,
    ...source,
  };
}

function isPulseVisible(source, elapsed) {
  if (!source.pulseEnabled) return true;

  const onTime = Math.max(0.02, source.pulseOnTime ?? 0.1);
  const offTime = Math.max(0, source.pulseOffTime ?? 0.5);
  const cycle = onTime + offTime;
  const phase = ((elapsed + phaseForSource(source) * 0.01) % cycle + cycle) % cycle;

  return phase < onTime;
}

export function getAnimatedSources(sources, elapsed) {
  return sources.map((rawSource) => {
    const source = sourceWithMotionDefaults(rawSource);
    const motion = source.motion ?? "static";

    if (motion === "static") {
      const visible = isPulseVisible(source, elapsed);
      return {
        ...source,
        active: source.active !== false && visible,
        pulseVisible: visible,
      };
    }

    const phase = phaseForSource(source);
    const speed = Math.max(0, source.motionSpeed ?? 0.22);
    const radius = Math.max(0.01, source.motionRadius ?? 0.16);
    const t = elapsed * speed * TAU + phase;
    let x = source.x;
    let y = source.y;

    if (motion === "circle") {
      x = source.x + Math.cos(t) * radius;
      y = source.y + Math.sin(t) * radius;
    } else if (motion === "ellipse") {
      x = source.x + Math.cos(t) * radius * 1.45;
      y = source.y + Math.sin(t) * radius * 0.68;
    } else if (motion === "horizontal") {
      x = source.x + Math.sin(t) * radius * 1.65;
    } else if (motion === "vertical") {
      y = source.y + Math.sin(t) * radius * 1.18;
    } else if (motion === "figure-eight") {
      x = source.x + Math.sin(t) * radius * 1.35;
      y = source.y + Math.sin(t * 2) * radius * 0.72;
    } else if (motion === "random-drift") {
      x = source.x + Math.sin(t * 0.81 + phase * 2.3) * radius * 1.15;
      y = source.y + Math.cos(t * 1.17 + phase * 0.7) * radius * 0.85;
    }

    const visible = isPulseVisible(source, elapsed);

    return {
      ...source,
      x: clamp01(x),
      y: clamp01(y),
      active: source.active !== false && visible,
      pulseVisible: visible,
    };
  });
}

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
