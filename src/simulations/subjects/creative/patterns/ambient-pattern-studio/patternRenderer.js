// src/simulations/subjects/creative/patterns/ambient-pattern-studio/patternRenderer.js
const TAU = Math.PI * 2;

export const PATTERN_PRESETS = [
  { value: "kaleidoscope", label: "Kaleidoscope Flow" },
  { value: "tunnel", label: "Neon Tunnel" },
  { value: "mandala", label: "Mandala Bloom" },
  { value: "aurora", label: "Aurora Silk" },
  { value: "particles", label: "Particle Constellation" },
  { value: "solar-system", label: "Solar System Dream" },
  { value: "flow-field", label: "Flow Field Silk" },
  { value: "lissajous", label: "Lissajous Bloom" },
  { value: "metaballs", label: "Metaball Dream" },
];

export const PALETTE_PRESETS = [
  {
    value: "aurora",
    label: "Aurora",
    background: ["#020617", "#062238", "#06121f"],
    colors: ["#5eead4", "#22d3ee", "#a78bfa", "#f0abfc", "#bef264"],
  },
  {
    value: "ember",
    label: "Ember",
    background: ["#07030a", "#27110c", "#050308"],
    colors: ["#fb7185", "#f97316", "#facc15", "#f0abfc", "#fdba74"],
  },
  {
    value: "ocean",
    label: "Ocean Glass",
    background: ["#020817", "#06253c", "#02131e"],
    colors: ["#67e8f9", "#38bdf8", "#2dd4bf", "#c4b5fd", "#e0f2fe"],
  },
  {
    value: "violet",
    label: "Violet Pulse",
    background: ["#090416", "#1e103d", "#030712"],
    colors: ["#c084fc", "#818cf8", "#f0abfc", "#67e8f9", "#f9a8d4"],
  },
  {
    value: "cosmic",
    label: "Cosmic Gold",
    background: ["#07111f", "#1c1746", "#090716"],
    colors: ["#fde68a", "#fb7185", "#67e8f9", "#c084fc", "#ffffff"],
  },
  {
    value: "mono",
    label: "Soft White",
    background: ["#050505", "#111827", "#020617"],
    colors: ["#ffffff", "#dbeafe", "#a5f3fc", "#e9d5ff", "#f8fafc"],
  },
];

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getPalette(value) {
  return PALETTE_PRESETS.find((palette) => palette.value === value) || PALETTE_PRESETS[0];
}

function buildParticles(count) {
  const particles = [];
  let seed = 4127;

  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i += 1) {
    particles.push({
      angle: rand() * TAU,
      radius: 0.08 + rand() * 0.78,
      size: 0.35 + rand() * 1.7,
      drift: 0.3 + rand() * 1.7,
      phase: rand() * TAU,
      depth: rand(),
    });
  }

  return particles;
}

const PARTICLES = buildParticles(260);

const SOLAR_BODIES = [
  {
    orbit: 0.16,
    size: 0.026,
    speed: 1.9,
    phase: 0.12,
    color: "#fbbf24",
    accent: "#fef3c7",
    moons: 0,
  },
  {
    orbit: 0.28,
    size: 0.045,
    speed: -1.15,
    phase: 1.3,
    color: "#38bdf8",
    accent: "#a7f3d0",
    moons: 1,
  },
  {
    orbit: 0.43,
    size: 0.065,
    speed: 0.78,
    phase: 2.55,
    color: "#c084fc",
    accent: "#f0abfc",
    moons: 2,
  },
  {
    orbit: 0.59,
    size: 0.038,
    speed: -0.52,
    phase: 4.1,
    color: "#fb7185",
    accent: "#fed7aa",
    moons: 1,
  },
  {
    orbit: 0.74,
    size: 0.084,
    speed: 0.34,
    phase: 5.25,
    color: "#f97316",
    accent: "#fde68a",
    moons: 3,
  },
];

function buildAsteroids(count) {
  const asteroids = [];
  let seed = 90817;

  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i += 1) {
    asteroids.push({
      angle: rand() * TAU,
      radius: 0.34 + rand() * 0.38,
      speed: 0.14 + rand() * 0.45,
      size: 0.7 + rand() * 2.8,
      wobble: rand() * TAU,
      color: rand() > 0.55 ? "#fef3c7" : "#94a3b8",
    });
  }

  return asteroids;
}

const ASTEROIDS = buildAsteroids(120);

function drawBackground(ctx, w, h, palette, phase, settings) {
  const cx = w * (0.5 + Math.sin(phase) * 0.04 * settings.drift);
  const cy = h * (0.5 + Math.cos(phase * 1.7) * 0.035 * settings.drift);
  const radius = Math.max(w, h) * 0.8;
  const bg = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);

  bg.addColorStop(0, palette.background[1]);
  bg.addColorStop(0.55, palette.background[0]);
  bg.addColorStop(1, palette.background[2]);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.65);
  glow.addColorStop(0, rgba(palette.colors[0], 0.18 * settings.backgroundGlow));
  glow.addColorStop(0.42, rgba(palette.colors[2], 0.08 * settings.backgroundGlow));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function drawVignette(ctx, w, h, strength) {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.18, w / 2, h / 2, Math.max(w, h) * 0.68);

  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.7, `rgba(0,0,0,${0.18 * strength})`);
  gradient.addColorStop(1, `rgba(0,0,0,${0.72 * strength})`);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawSoftParticles(ctx, w, h, palette, phase, settings) {
  const count = Math.min(PARTICLES.length, Math.max(0, Math.round(settings.particles)));
  const scale = Math.min(w, h);

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < count; i += 1) {
    const p = PARTICLES[i];
    const orbit = p.angle + phase * settings.cycles * p.drift;
    const wave = Math.sin(phase * (1 + p.depth) + p.phase);
    const r = scale * p.radius * (0.28 + settings.depth * 0.34 + wave * 0.018);
    const x = w / 2 + Math.cos(orbit) * r * (1.35 + settings.drift * 0.18);
    const y = h / 2 + Math.sin(orbit * 0.86 + p.phase * 0.1) * r * 0.78;
    const dot = scale * (0.004 + p.size * 0.003) * (0.7 + p.depth * settings.depth);
    const color = palette.colors[(i + Math.floor(p.depth * 8)) % palette.colors.length];
    const alpha = (0.035 + p.depth * 0.1) * settings.bloom;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, dot * 4.8);

    grad.addColorStop(0, rgba(color, alpha * 1.7));
    grad.addColorStop(0.32, rgba(color, alpha));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, dot * 4.8, 0, TAU);
    ctx.fill();
  }
}

function drawSharpStarField(ctx, w, h, palette, phase, settings) {
  const count = Math.min(PARTICLES.length, Math.max(60, Math.round(settings.particles * 1.35)));

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < count; i += 1) {
    const p = PARTICLES[i];
    const drift = phase * (0.015 + p.depth * 0.035) * settings.cycles;
    const x = ((p.angle / TAU + Math.sin(p.phase + drift) * 0.025 + 1) % 1) * w;
    const y = ((p.radius + Math.cos(p.phase * 1.7 + drift) * 0.018) % 1) * h;
    const twinkle = 0.45 + Math.sin(phase * (2.5 + p.depth * 3) + p.phase) * 0.35;
    const radius = 0.7 + p.depth * 1.7 + settings.depth * 0.5;
    const color = i % 5 === 0 ? palette.colors[i % palette.colors.length] : "#ffffff";

    ctx.fillStyle = rgba(color, (0.16 + twinkle * 0.24) * settings.intensity);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();

    if (i % 17 === 0) {
      ctx.strokeStyle = rgba(color, 0.12 * settings.intensity);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - radius * 3.2, y);
      ctx.lineTo(x + radius * 3.2, y);
      ctx.moveTo(x, y - radius * 3.2);
      ctx.lineTo(x, y + radius * 3.2);
      ctx.stroke();
    }
  }
}

function drawKaleidoscope(ctx, w, h, palette, phase, settings) {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h);
  const symmetry = Math.max(3, Math.round(settings.symmetry));
  const ribbons = Math.round(10 + settings.complexity * 18);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(phase * settings.rotation * 0.18);
  ctx.globalCompositeOperation = "lighter";

  for (let s = 0; s < symmetry; s += 1) {
    ctx.save();
    ctx.rotate((s / symmetry) * TAU);
    if (s % 2) ctx.scale(1, -1);

    for (let i = 0; i < ribbons; i += 1) {
      const color = palette.colors[(i + s) % palette.colors.length];
      const offset = (i / ribbons) * base * 0.56;
      const width = base * (0.004 + settings.intensity * 0.006);
      const alpha = (0.035 + settings.intensity * 0.055) * (1 - i / (ribbons * 1.55));
      const wave = Math.sin(phase * settings.cycles + i * 0.72);

      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.strokeStyle = rgba(color, alpha);
      ctx.shadowColor = color;
      ctx.shadowBlur = 18 * settings.bloom;
      ctx.moveTo(offset * 0.22, wave * base * 0.04);

      for (let k = 1; k <= 10; k += 1) {
        const t = k / 10;
        const x = lerp(offset * 0.18, base * 0.66, t);
        const y =
          Math.sin(t * Math.PI * (2.2 + settings.complexity * 2) + phase * settings.cycles + i) *
          base *
          (0.055 + settings.depth * 0.075) *
          (1 - t * 0.2);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
}

function drawTunnel(ctx, w, h, palette, phase, settings) {
  const cx = w / 2 + Math.sin(phase * 1.3) * w * 0.03 * settings.drift;
  const cy = h / 2 + Math.cos(phase * 1.1) * h * 0.04 * settings.drift;
  const maxR = Math.hypot(w, h) * 0.58;
  const rings = Math.round(32 + settings.complexity * 52);

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < rings; i += 1) {
    const t = i / rings;
    const pulse = (t + phase * 0.2 * settings.cycles) % 1;
    const r = maxR * pulse;
    const alpha = (1 - pulse) * (0.03 + settings.intensity * 0.075);
    const color = palette.colors[i % palette.colors.length];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(phase * settings.rotation + i * 0.08);
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = Math.max(1, (2.4 + settings.depth * 4.5) * (1 - pulse * 0.6));
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * settings.bloom;
    ctx.beginPath();

    for (let k = 0; k <= 120; k += 1) {
      const a = (k / 120) * TAU;
      const wobble =
        Math.sin(a * settings.symmetry + phase * settings.cycles + i * 0.17) *
        maxR *
        0.018 *
        settings.complexity;
      const x = Math.cos(a) * (r + wobble) * (1.12 + 0.12 * Math.sin(a * 2 + phase));
      const y = Math.sin(a) * (r + wobble) * 0.62;

      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

function drawMandala(ctx, w, h, palette, phase, settings) {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h);
  const petals = Math.max(5, Math.round(settings.symmetry * 1.5));
  const layers = Math.round(6 + settings.complexity * 10);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(phase * settings.rotation * 0.4);
  ctx.globalCompositeOperation = "lighter";

  for (let layer = 0; layer < layers; layer += 1) {
    const layerT = layer / layers;
    const radius = base * (0.07 + layerT * 0.42 + Math.sin(phase * settings.cycles + layer) * 0.012);
    const color = palette.colors[layer % palette.colors.length];

    for (let p = 0; p < petals; p += 1) {
      const a = (p / petals) * TAU + layer * 0.035;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius * 0.82;
      const petalW = base * (0.025 + settings.depth * 0.025) * (1 - layerT * 0.35);
      const petalH = base * (0.075 + settings.intensity * 0.08) * (1 - layerT * 0.2);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2 + Math.sin(phase + layer) * 0.18);
      ctx.fillStyle = rgba(color, 0.03 + settings.intensity * 0.08);
      ctx.shadowColor = color;
      ctx.shadowBlur = 26 * settings.bloom;
      ctx.beginPath();
      ctx.ellipse(0, 0, petalW, petalH, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawAurora(ctx, w, h, palette, phase, settings) {
  const layers = Math.round(7 + settings.complexity * 12);

  ctx.globalCompositeOperation = "lighter";

  for (let layer = 0; layer < layers; layer += 1) {
    const t = layer / layers;
    const color = palette.colors[layer % palette.colors.length];
    const yBase = h * (0.28 + t * 0.48);
    const alpha = (0.035 + settings.intensity * 0.065) * (1 - t * 0.35);
    const amp = h * (0.055 + settings.depth * 0.11) * (1 - t * 0.25);

    ctx.beginPath();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = 12 + settings.bloom * 18 * (1 - t * 0.55);
    ctx.shadowColor = color;
    ctx.shadowBlur = 30 * settings.bloom;

    for (let k = 0; k <= 80; k += 1) {
      const x = (k / 80) * w;
      const y =
        yBase +
        Math.sin(k * 0.22 + phase * settings.cycles + layer * 0.65) * amp +
        Math.cos(k * 0.07 - phase * 1.4 + layer) * amp * 0.6;

      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}

function drawFlowField(ctx, w, h, palette, phase, settings) {
  const base = Math.min(w, h);
  const count = Math.round(26 + settings.complexity * 46);
  const steps = Math.round(18 + settings.depth * 18);
  const stepSize = base * (0.008 + settings.depth * 0.006);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 0; i < count; i += 1) {
    const p = PARTICLES[i % PARTICLES.length];
    let x = w * (0.5 + Math.cos(p.angle + phase * (0.42 + p.drift * 0.12)) * p.radius * 0.58);
    let y = h * (0.5 + Math.sin(p.phase + phase * (0.34 + p.depth * 0.16)) * (p.radius - 0.28) * 0.82);
    const color = palette.colors[i % palette.colors.length];
    const alpha = (0.035 + p.depth * 0.075) * settings.intensity;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let step = 0; step < steps; step += 1) {
      const nx = x / w - 0.5;
      const ny = y / h - 0.5;
      const angle =
        Math.sin(nx * 9.5 + phase * settings.cycles + p.phase) +
        Math.cos(ny * 8.4 - phase * 1.2 + p.angle) +
        Math.sin((nx + ny) * 7.2 + phase * 0.8);
      const turn = angle * Math.PI * (0.32 + settings.rotation * 0.08);

      x += Math.cos(turn) * stepSize;
      y += Math.sin(turn) * stepSize;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = base * (0.0012 + settings.bloom * 0.0019);
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * settings.bloom;
    ctx.stroke();
  }

  ctx.restore();
}

function drawLissajous(ctx, w, h, palette, phase, settings) {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h);
  const curves = Math.round(5 + settings.complexity * 8);
  const points = 420;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(phase * settings.rotation * 0.24);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let curve = 0; curve < curves; curve += 1) {
    const curveT = curve / Math.max(1, curves - 1);
    const color = palette.colors[curve % palette.colors.length];
    const ax = 2 + (curve % 4);
    const ay = 3 + ((curve + 1) % 5);
    const scale = base * (0.17 + curveT * 0.28 + settings.depth * 0.04);
    const phaseOffset = curve * 0.72 + phase * settings.cycles;

    ctx.beginPath();
    for (let i = 0; i <= points; i += 1) {
      const t = (i / points) * TAU;
      const pulse = 1 + Math.sin(t * 3 + phase * 2 + curve) * 0.035 * settings.drift;
      const x = Math.sin(ax * t + phaseOffset) * scale * pulse * 1.25;
      const y = Math.sin(ay * t + phaseOffset * 0.74) * scale * pulse * 0.72;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = rgba(color, (0.04 + settings.intensity * 0.055) * (1 - curveT * 0.36));
    ctx.lineWidth = base * (0.0016 + settings.bloom * 0.002);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18 * settings.bloom;
    ctx.stroke();
  }

  ctx.restore();
}

function drawMetaballs(ctx, w, h, palette, phase, settings) {
  const base = Math.min(w, h);
  const count = Math.round(12 + settings.complexity * 18);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < count; i += 1) {
    const p = PARTICLES[(i * 7) % PARTICLES.length];
    const color = palette.colors[i % palette.colors.length];
    const orbit = phase * settings.cycles * (0.18 + p.drift * 0.13) + p.angle;
    const wobble = Math.sin(phase * 1.7 + p.phase) * base * 0.025 * settings.drift;
    const x = w / 2 + Math.cos(orbit) * base * (0.08 + p.radius * 0.38) * 1.28 + wobble;
    const y = h / 2 + Math.sin(orbit * 0.83 + p.phase) * base * (0.07 + p.radius * 0.32) * 0.84;
    const radius = base * (0.055 + p.size * 0.028 + settings.depth * 0.035);
    const alpha = (0.055 + p.depth * 0.075) * settings.intensity;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * (1.8 + settings.bloom * 0.7));

    grad.addColorStop(0, rgba("#ffffff", alpha * 1.3));
    grad.addColorStop(0.18, rgba(color, alpha * 1.9));
    grad.addColorStop(0.58, rgba(color, alpha * 0.55));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.8 + settings.bloom * 0.7), 0, TAU);
    ctx.fill();
  }

  const ringRadius = base * (0.18 + settings.depth * 0.12 + Math.sin(phase * 2) * 0.018);
  ctx.strokeStyle = rgba(palette.colors[0], 0.08 + settings.intensity * 0.055);
  ctx.lineWidth = base * (0.002 + settings.bloom * 0.002);
  ctx.shadowColor = palette.colors[1];
  ctx.shadowBlur = 22 * settings.bloom;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, ringRadius * 1.7, ringRadius * 0.78, phase * settings.rotation, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

function drawConstellation(ctx, w, h, palette, phase, settings) {
  const count = Math.min(PARTICLES.length, Math.max(20, Math.round(settings.particles)));
  const scale = Math.min(w, h);
  const points = [];

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < count; i += 1) {
    const p = PARTICLES[i];
    const orbit = p.angle + phase * settings.cycles * (0.15 + p.drift * 0.25);
    const r = scale * p.radius * (0.16 + settings.depth * 0.44);
    const x = w / 2 + Math.cos(orbit + Math.sin(phase + p.phase) * 0.2) * r * 1.45;
    const y = h / 2 + Math.sin(orbit * 1.17 + p.phase) * r * 0.78;
    points.push({ x, y, color: palette.colors[i % palette.colors.length], depth: p.depth });
  }

  const maxLink = scale * (0.05 + settings.complexity * 0.06);
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < Math.min(points.length, i + 10); j += 1) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < maxLink * maxLink) {
        const alpha = (1 - d2 / (maxLink * maxLink)) * 0.11 * settings.intensity;
        ctx.strokeStyle = rgba(points[i].color, alpha);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }

  points.forEach((point) => {
    const radius = scale * (0.003 + point.depth * 0.006) * (0.7 + settings.bloom);
    const grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 5);
    grad.addColorStop(0, rgba(point.color, 0.55 * settings.intensity));
    grad.addColorStop(0.2, rgba(point.color, 0.18 * settings.intensity));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 5, 0, TAU);
    ctx.fill();
  });
}

function drawOrbitPath(ctx, cx, cy, rx, ry, color, alpha, width = 1) {
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.stroke();
}

function drawPlanet(ctx, x, y, radius, body, palette, settings, phase) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * (3.4 + settings.bloom * 0.85));

  glow.addColorStop(0, rgba(body.accent, 0.45 * settings.bloom));
  glow.addColorStop(0.34, rgba(body.color, 0.14 * settings.bloom));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * (3.4 + settings.bloom * 0.85), 0, TAU);
  ctx.fill();

  const planet = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.45,
    radius * 0.12,
    x,
    y,
    radius * 1.25,
  );
  planet.addColorStop(0, rgba("#ffffff", 1));
  planet.addColorStop(0.18, body.accent);
  planet.addColorStop(0.62, body.color);
  planet.addColorStop(1, rgba("#111827", 0.62));

  ctx.fillStyle = planet;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = rgba("#ffffff", 0.24 + settings.intensity * 0.12);
  ctx.lineWidth = Math.max(1, radius * 0.035);
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.02, 0, TAU);
  ctx.stroke();

  const bandCount = 2 + Math.round(settings.complexity * 3);
  for (let band = 0; band < bandCount; band += 1) {
    const bandY = y + Math.sin(phase * (band + 1) + band) * radius * 0.34;
    ctx.strokeStyle = rgba(palette.colors[(band + 1) % palette.colors.length], 0.14 + settings.intensity * 0.08);
    ctx.lineWidth = Math.max(1.5, radius * 0.045);
    ctx.beginPath();
    ctx.ellipse(x, bandY, radius * 0.86, radius * 0.16, 0, 0, TAU);
    ctx.stroke();
  }
}

function drawMoons(ctx, planetX, planetY, planetRadius, body, palette, phase, settings) {
  for (let moon = 0; moon < body.moons; moon += 1) {
    const moonPhase = phase * (2.4 + moon * 0.75) * Math.sign(body.speed || 1) + body.phase + moon * 1.7;
    const orbit = planetRadius * (1.95 + moon * 0.58);
    const moonX = planetX + Math.cos(moonPhase) * orbit;
    const moonY = planetY + Math.sin(moonPhase) * orbit * 0.48;
    const moonRadius = planetRadius * (0.16 + moon * 0.035) * (0.8 + settings.depth * 0.35);
    const color = palette.colors[(moon + 2) % palette.colors.length];

    ctx.strokeStyle = rgba(color, 0.07 + settings.intensity * 0.04);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, orbit, orbit * 0.48, 0, 0, TAU);
    ctx.stroke();

    const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 5);
    glow.addColorStop(0, rgba(color, 0.42 * settings.bloom));
    glow.addColorStop(0.32, rgba(color, 0.14 * settings.bloom));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = rgba("#ffffff", 0.86);
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, TAU);
    ctx.fill();
  }
}

function drawRingedPlanet(ctx, x, y, radius, body, settings) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.22);
  ctx.strokeStyle = rgba(body.accent, 0.34 + settings.intensity * 0.18);
  ctx.lineWidth = Math.max(2, radius * 0.085);
  ctx.shadowColor = body.accent;
  ctx.shadowBlur = 10 * settings.bloom;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.85, radius * 0.42, 0, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = rgba("#ffffff", 0.2);
  ctx.lineWidth = Math.max(1.2, radius * 0.032);
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 2.25, radius * 0.55, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawSolarSystem(ctx, w, h, palette, phase, settings) {
  const cx = w / 2 + Math.sin(phase * 0.7) * w * 0.035 * settings.drift;
  const cy = h / 2 + Math.cos(phase * 0.9) * h * 0.035 * settings.drift;
  const scale = Math.min(w, h);
  const orbitSquash = 0.52 + settings.depth * 0.08;
  const sunRadius = scale * (0.055 + settings.intensity * 0.018);
  const nebula = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * 0.82);
  const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * (5.2 + settings.bloom));

  ctx.globalCompositeOperation = "lighter";

  nebula.addColorStop(0, rgba(palette.colors[0], 0.18 + settings.backgroundGlow * 0.09));
  nebula.addColorStop(0.34, rgba(palette.colors[2], 0.09 + settings.backgroundGlow * 0.05));
  nebula.addColorStop(0.68, rgba(palette.colors[3], 0.035 + settings.backgroundGlow * 0.025));
  nebula.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);

  sunGlow.addColorStop(0, rgba("#ffffff", 1));
  sunGlow.addColorStop(0.14, rgba("#fef3c7", 0.75 * settings.bloom));
  sunGlow.addColorStop(0.42, rgba("#fbbf24", 0.2 * settings.bloom));
  sunGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, sunRadius * (5.2 + settings.bloom), 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 16 * settings.bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, sunRadius, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;

  SOLAR_BODIES.forEach((body, index) => {
    const rx = scale * body.orbit * (0.98 + settings.drift * 0.08);
    const ry = rx * orbitSquash;
    const orbitColor = palette.colors[index % palette.colors.length];
    const bodyPhase = phase * settings.cycles * body.speed + body.phase;
    const wobble = Math.sin(phase * 2 + index) * scale * 0.008 * settings.drift;
    const x = cx + Math.cos(bodyPhase) * rx;
    const y = cy + Math.sin(bodyPhase) * ry + wobble;
    const radius = scale * body.size * (0.7 + settings.depth * 0.45);

    drawOrbitPath(ctx, cx, cy, rx, ry, orbitColor, 0.1 + settings.intensity * 0.075, Math.max(1.2, scale * 0.0018));
    drawPlanet(ctx, x, y, radius, body, palette, settings, phase + index);
    if (index === SOLAR_BODIES.length - 1) {
      drawRingedPlanet(ctx, x, y, radius, body, settings);
    }
    drawMoons(ctx, x, y, radius, body, palette, phase + index * 0.7, settings);
  });

  const asteroidCount = Math.min(ASTEROIDS.length, Math.round(45 + settings.particles * 0.45));
  for (let i = 0; i < asteroidCount; i += 1) {
    const asteroid = ASTEROIDS[i];
    const a = asteroid.angle + phase * settings.cycles * asteroid.speed;
    const beltWobble = Math.sin(phase * 1.3 + asteroid.wobble) * scale * 0.014 * settings.complexity;
    const rx = scale * asteroid.radius;
    const ry = rx * (0.47 + settings.depth * 0.07);
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry + beltWobble;
    const radius = asteroid.size * (0.9 + settings.depth * 0.35);

    ctx.fillStyle = rgba(asteroid.color, 0.28 + settings.intensity * 0.2);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
  }
}

export function renderAmbientPattern(ctx, width, height, timeSeconds, settings) {
  const palette = getPalette(settings.palette);
  const loopSeconds = Math.max(5, settings.loopSeconds || 60);
  const loopPhase = ((timeSeconds % loopSeconds) / loopSeconds) * TAU;
  const cycles = Math.max(1, Math.round(settings.speed || 1));
  const normalized = {
    pattern: settings.pattern || "kaleidoscope",
    symmetry: clamp(settings.symmetry || 8, 3, 24),
    intensity: clamp(settings.intensity || 1, 0, 2),
    bloom: clamp(settings.bloom || 1, 0, 3),
    depth: clamp(settings.depth || 1, 0, 2),
    complexity: clamp(settings.complexity || 0.7, 0, 1),
    rotation: clamp(settings.rotation || 0.4, -2, 2),
    drift: clamp(settings.drift || 0.5, 0, 1.5),
    particles: settings.particles || 120,
    backgroundGlow: clamp(settings.backgroundGlow || 0.8, 0, 2),
    cycles,
  };

  drawBackground(ctx, width, height, palette, loopPhase, normalized);

  const heavySelfIlluminatedPattern =
    normalized.pattern === "flow-field" ||
    normalized.pattern === "lissajous" ||
    normalized.pattern === "metaballs";

  if (normalized.pattern === "solar-system") {
    drawSharpStarField(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern !== "particles" && !heavySelfIlluminatedPattern) {
    drawSoftParticles(ctx, width, height, palette, loopPhase, {
      ...normalized,
      particles: Math.min(normalized.particles, 90),
    });
  }

  if (normalized.pattern === "tunnel") {
    drawTunnel(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "mandala") {
    drawMandala(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "aurora") {
    drawAurora(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "flow-field") {
    drawFlowField(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "lissajous") {
    drawLissajous(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "metaballs") {
    drawMetaballs(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "particles") {
    drawConstellation(ctx, width, height, palette, loopPhase, normalized);
  } else if (normalized.pattern === "solar-system") {
    drawSolarSystem(ctx, width, height, palette, loopPhase, normalized);
  } else {
    drawKaleidoscope(ctx, width, height, palette, loopPhase, normalized);
  }

  drawVignette(ctx, width, height, normalized.pattern === "solar-system" ? 0.42 : 0.8);
}
