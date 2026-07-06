import { clamp } from "../surface-waves-double-slit/surfaceWaves.math.js";

const TAU = Math.PI * 2;

function mix(a, b, t) {
  return a + (b - a) * t;
}

function smooth01(value) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

const PALETTE = {
  deep: [2, 8, 24],
  water: [8, 72, 106],
  shallow: [42, 176, 218],
  crest: [208, 250, 255],
  cyan: [96, 238, 255],
  violet: [184, 96, 255],
};

export const WATER_ART_PRESETS = [
  {
    value: "deep-cinema",
    label: "Deep Cinema",
    palette: {
      deep: [1, 7, 18],
      water: [5, 55, 85],
      shallow: [31, 151, 192],
      crest: [218, 252, 255],
      warm: [255, 198, 106],
      cool: [86, 230, 255],
    },
  },
  {
    value: "aurora",
    label: "Aurora",
    palette: {
      deep: [3, 7, 28],
      water: [8, 64, 104],
      shallow: [42, 218, 178],
      crest: [226, 255, 244],
      warm: [226, 105, 255],
      cool: [77, 255, 211],
    },
  },
  {
    value: "violet-neon",
    label: "Violet Neon",
    palette: {
      deep: [9, 5, 28],
      water: [42, 25, 106],
      shallow: [103, 84, 230],
      crest: [244, 231, 255],
      warm: [255, 93, 205],
      cool: [95, 225, 255],
    },
  },
  {
    value: "solar-gold",
    label: "Solar Gold",
    palette: {
      deep: [9, 12, 18],
      water: [34, 63, 70],
      shallow: [70, 171, 169],
      crest: [255, 244, 208],
      warm: [255, 178, 61],
      cool: [91, 232, 255],
    },
  },
  {
    value: "moon-pool",
    label: "Moon Pool",
    palette: {
      deep: [3, 10, 24],
      water: [12, 50, 83],
      shallow: [82, 136, 174],
      crest: [231, 241, 255],
      warm: [155, 181, 255],
      cool: [163, 237, 255],
    },
  },
];

export const CAUSTIC_STYLE_PRESETS = [
  { value: "silk", label: "Silk Lines" },
  { value: "ribbons", label: "Soft Ribbons" },
  { value: "prism", label: "Prism Lace" },
  { value: "glow", label: "Subtle Glow" },
  { value: "off", label: "Off" },
];

const DEFAULT_ART_STYLE = {
  preset: "deep-cinema",
  bloom: 1.2,
  depth: 1,
  contrast: 1.1,
  caustics: 0.35,
  causticStyle: "silk",
  colorShift: 0.25,
  orbGlow: 1.1,
  highlightSoftness: 0.55,
  surfaceDetail: 0.5,
  lightAngle: 0.4,
  backgroundGlow: 0.3,
};

function resolveArtStyle(style = {}) {
  const merged = { ...DEFAULT_ART_STYLE, ...style };
  const preset =
    WATER_ART_PRESETS.find((item) => item.value === merged.preset) ??
    WATER_ART_PRESETS[0];

  return {
    ...merged,
    palette: preset.palette,
  };
}

let rippleCache = null;

function getRippleCache(w, h) {
  if (rippleCache?.w === w && rippleCache?.h === h) return rippleCache;

  const x1Sin = new Float32Array(w);
  const x1Cos = new Float32Array(w);
  const x2Sin = new Float32Array(w);
  const x2Cos = new Float32Array(w);
  const y1Sin = new Float32Array(h);
  const y1Cos = new Float32Array(h);
  const y2Sin = new Float32Array(h);
  const y2Cos = new Float32Array(h);
  const xNorm = new Float32Array(w);
  const yNorm = new Float32Array(h);
  const vignette = new Float32Array(w * h);
  const causticASin = new Float32Array(w * h);
  const causticACos = new Float32Array(w * h);
  const causticBSin = new Float32Array(w * h);
  const causticBCos = new Float32Array(w * h);
  const causticCSin = new Float32Array(w * h);
  const causticCCos = new Float32Array(w * h);
  const invW = 1 / Math.max(1, w - 1);
  const invH = 1 / Math.max(1, h - 1);
  const cx = w * 0.5;
  const cy = h * 0.5;
  const maxR = Math.hypot(cx, cy);

  for (let x = 0; x < w; x++) {
    const nx = x * invW;
    const a1 = nx * 8.2 * TAU;
    const a2 = nx * -3.3 * TAU;

    xNorm[x] = nx;
    x1Sin[x] = Math.sin(a1);
    x1Cos[x] = Math.cos(a1);
    x2Sin[x] = Math.sin(a2);
    x2Cos[x] = Math.cos(a2);
  }

  for (let y = 0; y < h; y++) {
    const ny = y * invH;
    const a1 = ny * 2.4 * TAU;
    const a2 = ny * 7.4 * TAU;

    yNorm[y] = ny;
    y1Sin[y] = Math.sin(a1);
    y1Cos[y] = Math.cos(a1);
    y2Sin[y] = Math.sin(a2);
    y2Cos[y] = Math.cos(a2);

    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const nx = x * invW;
      const causticA = (nx * 14.6 + ny * 5.8) * TAU;
      const causticB = (nx * -7.8 + ny * 12.4) * TAU;
      const causticC = (nx * 4.4 + ny * -9.2) * TAU;

      vignette[i] =
        1 - Math.pow(Math.hypot(x - cx, y - cy) / maxR, 1.7) * 0.58;
      causticASin[i] = Math.sin(causticA);
      causticACos[i] = Math.cos(causticA);
      causticBSin[i] = Math.sin(causticB);
      causticBCos[i] = Math.cos(causticB);
      causticCSin[i] = Math.sin(causticC);
      causticCCos[i] = Math.cos(causticC);
    }
  }

  rippleCache = {
    w,
    h,
    x1Sin,
    x1Cos,
    x2Sin,
    x2Cos,
    y1Sin,
    y1Cos,
    y2Sin,
    y2Cos,
    xNorm,
    yNorm,
    vignette,
    causticASin,
    causticACos,
    causticBSin,
    causticBCos,
    causticCSin,
    causticCCos,
  };

  return rippleCache;
}

export function renderWaterSurfaceToImageData(state, imgData, opts = {}) {
  const { w, h, u, obstacles, t } = state;
  const data = imgData.data;
  const scale = opts.heightScale ?? 1.35;
  const rippleStrength = opts.rippleStrength ?? 0.16;
  const art = resolveArtStyle(opts.artStyle);
  const palette = art.palette ?? PALETTE;
  const bloom = clamp(art.bloom ?? 1, 0.2, 3);
  const contrast = clamp(art.contrast ?? 1, 0.5, 2.6);
  const causticStrength = clamp(art.caustics ?? 0.4, 0, 1.4);
  const causticStyle = art.causticStyle ?? "silk";
  const depth = clamp(art.depth ?? 1, 0.2, 2.4);
  const colorShift = clamp(art.colorShift ?? 0, 0, 1);
  const highlightSoftness = clamp(art.highlightSoftness ?? 0.55, 0, 1);
  const surfaceDetail = clamp(art.surfaceDetail ?? 0.5, 0, 1.4);
  const lightAngle = clamp(art.lightAngle ?? 0.4, -1, 1);
  const backgroundGlow = clamp(art.backgroundGlow ?? 0.3, 0, 1.4);
  const cache = getRippleCache(w, h);
  const t1 = t * 0.17 * TAU;
  const t2 = t * 0.11 * TAU;
  const t1Sin = Math.sin(t1);
  const t1Cos = Math.cos(t1);
  const t2Sin = Math.sin(t2);
  const t2Cos = Math.cos(t2);
  const causticAT = t * 0.035 * TAU;
  const causticBT = -t * 0.027 * TAU;
  const causticCT = t * 0.022 * TAU;
  const causticATSin = Math.sin(causticAT);
  const causticATCos = Math.cos(causticAT);
  const causticBTSin = Math.sin(causticBT);
  const causticBTCos = Math.cos(causticBT);
  const causticCTSin = Math.sin(causticCT);
  const causticCTCos = Math.cos(causticCT);
  const specularPower = mix(15, 5.5, highlightSoftness);
  const lacePower = mix(9, 3.8, highlightSoftness);
  const ribbonPower = mix(4.8, 2.2, highlightSoftness);
  const lightX = 1.35 + lightAngle * 1.2;
  const lightY = -1.15 + lightAngle * 0.55;

  for (let y = 0; y < h; y++) {
    const ny = cache.yNorm[y];
    const row = y * w;
    const sampleY = y <= 1 ? 1 : y >= h - 2 ? h - 2 : y;
    const upRow = (sampleY <= 1 ? 1 : sampleY - 1) * w;
    const downRow = (sampleY >= h - 2 ? h - 2 : sampleY + 1) * w;

    for (let x = 0; x < w; x++) {
      const i = row + x;
      const p = i * 4;

      if (obstacles?.[i] === 1) {
        data[p] = 28;
        data[p + 1] = 32;
        data[p + 2] = 42;
        data[p + 3] = 255;
        continue;
      }

      const sampleX = x <= 1 ? 1 : x >= w - 2 ? w - 2 : x;
      const leftX = sampleX <= 1 ? 1 : sampleX - 1;
      const rightX = sampleX >= w - 2 ? w - 2 : sampleX + 1;
      const dx = u[sampleY * w + rightX] - u[sampleY * w + leftX];
      const dy = u[downRow + sampleX] - u[upRow + sampleX];
      const rippleBase1 =
        cache.x1Sin[x] * cache.y1Cos[y] + cache.x1Cos[x] * cache.y1Sin[y];
      const rippleBase1Cos =
        cache.x1Cos[x] * cache.y1Cos[y] - cache.x1Sin[x] * cache.y1Sin[y];
      const rippleBase2 =
        cache.x2Sin[x] * cache.y2Cos[y] + cache.x2Cos[x] * cache.y2Sin[y];
      const rippleBase2Cos =
        cache.x2Cos[x] * cache.y2Cos[y] - cache.x2Sin[x] * cache.y2Sin[y];
      const ripple =
        (rippleBase1 * t1Cos + rippleBase1Cos * t1Sin) * 0.07 +
        (rippleBase2 * t2Cos + rippleBase2Cos * t2Sin) * 0.05;
      const height = Math.tanh(u[i] * scale + ripple * rippleStrength);
      const slope = Math.min(1, Math.hypot(dx, dy) * 4.8);
      const energy = Math.min(1, Math.abs(height) * 0.46 + slope * 0.56);
      const interference = Math.pow(energy, 1 / contrast);
      const light = clamp(0.47 + dx * lightX + dy * lightY + height * 0.09, 0, 1);
      const veinA =
        cache.causticASin[i] * causticATCos +
        cache.causticACos[i] * causticATSin +
        height * 0.18;
      const veinB =
        cache.causticBSin[i] * causticBTCos +
        cache.causticBCos[i] * causticBTSin +
        height * 0.14;
      const veinC =
        cache.causticCSin[i] * causticCTCos +
        cache.causticCCos[i] * causticCTSin +
        ripple * 0.22;
      const lace = Math.pow(
        smooth01(1 - Math.abs(veinA * 0.55 + veinB * 0.35 + veinC * 0.18)),
        lacePower,
      );
      const ribbons = Math.pow(
        smooth01(1 - Math.abs(veinA * 0.72 + veinB * 0.22)),
        ribbonPower,
      );
      const glow = smooth01(0.55 + rippleBase1 * 0.22 + rippleBase2 * 0.18);
      let causticPattern = 0;

      if (causticStyle === "ribbons") {
        causticPattern = ribbons * 0.72 + lace * 0.22;
      } else if (causticStyle === "prism") {
        causticPattern = lace * 0.8 + ribbons * 0.22;
      } else if (causticStyle === "glow") {
        causticPattern = glow * 0.5 + ribbons * 0.14;
      } else if (causticStyle !== "off") {
        causticPattern = lace * 0.58 + ribbons * 0.28;
      }

      const caustic =
        causticPattern *
        causticStrength *
        (0.08 + slope * 0.58 + smooth01(interference) * 0.34);
      const specular =
        Math.pow(clamp(light * 0.72 + slope * 0.35, 0, 1), specularPower) *
        smooth01(interference) *
        bloom;
      const fresnel =
        Math.pow(Math.abs(ny - 0.52) * 1.2 + slope * 0.42, 2.2) * bloom;
      const vignette = mix(1, cache.vignette[i], depth);
      const horizontalGlow =
        smooth01(1 - Math.abs(cache.xNorm[x] - 0.5) * 1.3) *
        (colorShift * 0.12 + backgroundGlow * 0.16);

      const deepWaterMix = 0.52 + light * 0.22 + horizontalGlow + backgroundGlow * 0.08;
      let r = mix(palette.deep[0], palette.water[0], deepWaterMix);
      let g = mix(palette.deep[1], palette.water[1], deepWaterMix);
      let b = mix(palette.deep[2], palette.water[2], deepWaterMix);
      const shallowMix =
        interference * (0.24 + surfaceDetail * 0.16) + caustic * 0.18;
      r = mix(r, palette.shallow[0], shallowMix);
      g = mix(g, palette.shallow[1], shallowMix);
      b = mix(b, palette.shallow[2], shallowMix);

      const accent = height >= 0 ? palette.cool : palette.warm;
      const accentMix =
        Math.abs(height) * (0.09 + colorShift * 0.12 + surfaceDetail * 0.08) +
        caustic * 0.07;
      r = mix(r, accent[0], accentMix);
      g = mix(g, accent[1], accentMix);
      b = mix(b, accent[2], accentMix);

      const crestMix = specular * 0.42 + fresnel * 0.08 + caustic * 0.11;
      r = mix(r, palette.crest[0], crestMix);
      g = mix(g, palette.crest[1], crestMix);
      b = mix(b, palette.crest[2], crestMix);

      data[p] = clamp(r * vignette + specular * 28 + caustic * 18, 0, 255);
      data[p + 1] = clamp(g * vignette + specular * 34 + caustic * 22, 0, 255);
      data[p + 2] = clamp(b * vignette + specular * 42 + caustic * 28, 0, 255);
      data[p + 3] = 255;
    }
  }
}

export function drawWaterSurfaceOverlays(
  ctx,
  width,
  height,
  sources,
  selectedId,
  artStyle = {},
) {
  const art = resolveArtStyle(artStyle);
  const glowScale = clamp(art.orbGlow ?? 1, 0.1, 3);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  sources.forEach((source, index) => {
    if (source.active === false) return;

    const sx = source.x * width;
    const sy = source.y * height;
    const hue = (index * 47 + 184 + (art.colorShift ?? 0) * 80) % 360;
    const orb = `hsl(${hue}, 95%, 66%)`;
    const sourceSize = Math.max(0.05, source.sourceSize ?? 0.32);
    const haloRadius = Math.max(
      2.5,
      (12 + Math.abs(source.amplitude ?? 1) * 2.5) * sourceSize * glowScale,
    );
    const coreRadius = Math.max(1.2, 4.2 * sourceSize);
    const ringRadius = Math.max(2.4, 16 * sourceSize * Math.sqrt(glowScale));
    const pulse = 0.82 + 0.18 * Math.sin((source.phase || 0) + performance.now() * 0.003 * (source.frequency || 1));

    const reflection = ctx.createRadialGradient(sx, sy + 12, 1, sx, sy + 12, haloRadius * 1.2);
    reflection.addColorStop(0, `hsla(${hue}, 95%, 70%, 0.26)`);
    reflection.addColorStop(0.45, `hsla(${hue}, 95%, 60%, 0.12)`);
    reflection.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.scale(1, 0.42);
    ctx.fillStyle = reflection;
    ctx.beginPath();
    ctx.arc(sx, (sy + 20) / 0.42, haloRadius * 1.15, 0, TAU);
    ctx.fill();
    ctx.restore();

    const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, haloRadius * pulse);
    glow.addColorStop(0, "rgba(255,255,255,0.95)");
    glow.addColorStop(0.2, orb);
    glow.addColorStop(0.58, `hsla(${hue}, 95%, 52%, 0.22)`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, haloRadius * pulse, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(sx, sy, coreRadius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = source.id === selectedId ? "rgba(255,255,255,0.92)" : `hsla(${hue}, 95%, 72%, 0.72)`;
    ctx.lineWidth = source.id === selectedId ? 2.5 : 1.4;
    ctx.beginPath();
    ctx.arc(sx, sy, source.id === selectedId ? ringRadius + 6 : ringRadius, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
  });

  ctx.restore();
}
