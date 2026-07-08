import { useEffect, useMemo, useRef } from "react";
import {
  IMAGE_MOTION_FORMATS,
  IMAGE_MOTION_PRESETS,
} from "./imageMotionPresets";

const PARTICLE_COUNT = 130;
const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function buildParticles() {
  const particles = [];
  let seed = 83729;

  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    particles.push({
      x: rand(),
      y: rand(),
      radius: 0.4 + rand() * 2.8,
      phase: rand() * TAU,
      speed: 0.2 + rand() * 0.9,
      alpha: 0.08 + rand() * 0.22,
      color: rand() > 0.72 ? "#67e8f9" : "#ffffff",
    });
  }

  return particles;
}

const PARTICLES = buildParticles();

function drawCoverImage(ctx, image, canvasWidth, canvasHeight, scale, panX, panY) {
  const imageRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight * scale;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = canvasWidth * scale;
    drawHeight = drawWidth / imageRatio;
  }

  const maxPanX = Math.max(0, (drawWidth - canvasWidth) / 2);
  const maxPanY = Math.max(0, (drawHeight - canvasHeight) / 2);
  const x = (canvasWidth - drawWidth) / 2 + maxPanX * panX * 2;
  const y = (canvasHeight - drawHeight) / 2 + maxPanY * panY * 2;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawSlide(ctx, slide, image, width, height, progress, alpha, preset) {
  if (!image) return;

  const eased = easeInOut(progress);
  const motion = slide.motion || preset;
  const scale = motion.startScale + (motion.endScale - motion.startScale) * eased;
  const panX = (eased - 0.5) * motion.panX * 2;
  const panY = (eased - 0.5) * motion.panY * 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  drawCoverImage(ctx, image, width, height, scale, panX, panY);
  ctx.restore();
}

function drawCinematicOverlays(ctx, width, height, time, showCaptions, caption) {
  const base = Math.min(width, height);
  const glowX = width * (0.18 + Math.sin(time * 0.18) * 0.08);
  const glowY = height * (0.22 + Math.cos(time * 0.13) * 0.08);
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, base * 0.62);

  ctx.globalCompositeOperation = "lighter";
  glow.addColorStop(0, "rgba(34,211,238,0.16)");
  glow.addColorStop(0.36, "rgba(168,85,247,0.08)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  PARTICLES.forEach((particle, index) => {
    const drift = time * particle.speed * 0.018;
    const x = ((particle.x + drift) % 1) * width;
    const y =
      ((particle.y + Math.sin(time * 0.24 + particle.phase) * 0.015 + 1) % 1) *
      height;
    const pulse = 0.55 + Math.sin(time * (0.8 + particle.speed) + particle.phase) * 0.32;

    ctx.fillStyle =
      index % 7 === 0
        ? `rgba(103,232,249,${particle.alpha * pulse})`
        : `rgba(255,255,255,${particle.alpha * 0.8 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, particle.radius * (0.75 + pulse * 0.5), 0, TAU);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    base * 0.18,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.62, "rgba(0,0,0,0.16)");
  vignette.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  if (showCaptions && caption) {
    const fontSize = Math.max(30, width * 0.034);
    const captionY = height * 0.82;
    const maxTextWidth = width * 0.78;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.84)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fillText(caption, width / 2, captionY, maxTextWidth);
    ctx.restore();
  }
}

function drawEmptyState(ctx, width, height, time) {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.78,
  );

  gradient.addColorStop(0, "#17345f");
  gradient.addColorStop(0.42, "#080b1a");
  gradient.addColorStop(1, "#02030a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  drawCinematicOverlays(ctx, width, height, time, false, "");

  ctx.fillStyle = "rgba(226,242,255,0.82)";
  ctx.font = `800 ${Math.max(26, width * 0.035)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Upload images to build a cinematic motion scene", width / 2, height * 0.5);
}

function buildTimeline(slides, fallbackDuration) {
  const durations = slides.map((slide) => Math.max(1, slide.duration || fallbackDuration));
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  return { durations, total };
}

export default function ImageMotionCanvas({
  slides,
  format,
  presetKey,
  secondsPerImage,
  isPlaying,
  showCaptions,
  restartKey,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const imageMapRef = useRef(new Map());
  const output = IMAGE_MOTION_FORMATS[format] || IMAGE_MOTION_FORMATS.shorts;
  const preset = IMAGE_MOTION_PRESETS[presetKey] || IMAGE_MOTION_PRESETS.cosmicZoom;
  const timeline = useMemo(
    () => buildTimeline(slides, secondsPerImage),
    [slides, secondsPerImage],
  );

  useEffect(() => {
    const imageMap = new Map();
    let cancelled = false;

    slides.forEach((slide) => {
      const image = new Image();
      image.onload = () => {
        if (!cancelled) imageMapRef.current = new Map(imageMap);
      };
      image.src = slide.fileUrl;
      imageMap.set(slide.id, image);
    });

    imageMapRef.current = imageMap;

    return () => {
      cancelled = true;
    };
  }, [slides]);

  useEffect(() => {
    elapsedRef.current = 0;
    lastFrameRef.current = performance.now();
  }, [restartKey, format]);

  useEffect(() => {
    const draw = (now) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      const dt = Math.min(Math.max((now - (lastFrameRef.current || now)) / 1000, 0), 1 / 30);
      lastFrameRef.current = now;

      if (isPlaying) {
        elapsedRef.current += dt;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, output.width, output.height);

      if (!slides.length || timeline.total <= 0) {
        drawEmptyState(ctx, output.width, output.height, elapsedRef.current);
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const localTime = elapsedRef.current % timeline.total;
      let cursor = 0;
      let index = 0;

      for (let i = 0; i < timeline.durations.length; i += 1) {
        if (localTime < cursor + timeline.durations[i]) {
          index = i;
          break;
        }
        cursor += timeline.durations[i];
      }

      const slide = slides[index];
      const duration = timeline.durations[index] || secondsPerImage;
      const progress = clamp((localTime - cursor) / duration, 0, 1);
      const fadeWindow = 0.16;
      const fadeIn = clamp(progress / fadeWindow, 0, 1);
      const fadeOut = clamp((1 - progress) / fadeWindow, 0, 1);
      const alpha = Math.min(1, easeInOut(fadeIn), easeInOut(fadeOut));
      const nextIndex = (index + 1) % slides.length;
      const nextSlide = slides[nextIndex];
      const imageMap = imageMapRef.current;

      ctx.fillStyle = "#030711";
      ctx.fillRect(0, 0, output.width, output.height);
      drawSlide(
        ctx,
        slide,
        imageMap.get(slide.id),
        output.width,
        output.height,
        progress,
        alpha,
        preset,
      );

      if (progress > 1 - fadeWindow && slides.length > 1) {
        const nextAlpha = easeInOut(clamp((progress - (1 - fadeWindow)) / fadeWindow, 0, 1));
        drawSlide(
          ctx,
          nextSlide,
          imageMap.get(nextSlide.id),
          output.width,
          output.height,
          0,
          nextAlpha,
          preset,
        );
      }

      drawCinematicOverlays(
        ctx,
        output.width,
        output.height,
        elapsedRef.current,
        showCaptions,
        slide.caption,
      );

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [format, isPlaying, output.height, output.width, preset, secondsPerImage, showCaptions, slides, timeline]);

  return (
    <div id="image-motion-studio-root" className="h-full w-full">
      <canvas
        id="image-motion-recording-canvas"
        ref={canvasRef}
        width={output.width}
        height={output.height}
        className="image-motion-canvas block h-full w-full rounded-2xl bg-black object-contain shadow-[0_34px_120px_rgba(0,0,0,0.52)]"
      />
    </div>
  );
}
