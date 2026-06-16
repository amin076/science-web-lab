// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonVideoScene.jsx
// 9:16 football-style cinematic recorder for the existing Gravity Comparison Lab.
// This is canvas-based because automatic video recording needs canvas.captureStream().

import { useEffect, useMemo, useRef, useState } from "react";

import { GRAVITY_WORLDS } from "./constants";

const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 60,
  filename: "esbiko-football-gravity-comparison.webm",
};

const SHOT = {
  speedKmh: 130,
  angleDeg: 35,
  introSeconds: 2,
  endHoldSeconds: 5.5,
};

const WORLD_IDS = ["jupiter", "earth", "mars", "moon"];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function easeInOut(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOut(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function kmhToMs(kmh) {
  return kmh / 3.6;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function createFootballWorlds() {
  const base = GRAVITY_WORLDS.filter((world) => WORLD_IDS.includes(world.id));

  const glowById = {
    jupiter: "rgba(255,152,0,0.78)",
    earth: "rgba(76,175,80,0.78)",
    mars: "rgba(255,87,34,0.78)",
    moon: "rgba(255,255,255,0.82)",
  };

  const emojiById = {
    jupiter: "🟠",
    earth: "🌍",
    mars: "🔴",
    moon: "🌙",
  };

  return WORLD_IDS.map((id) => {
    const world = base.find((item) => item.id === id);
    return {
      ...world,
      emoji: emojiById[id],
      glow: glowById[id],
    };
  });
}

function createShot(world) {
  const speed = kmhToMs(SHOT.speedKmh);
  const angle = degToRad(SHOT.angleDeg);
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  const flightTime = (2 * vy) / world.gravity;
  const range = vx * flightTime;
  const maxHeight = (vy * vy) / (2 * world.gravity);

  return { id: world.id, world, vx, vy, flightTime, range, maxHeight };
}

function shotPositionAt(shot, t) {
  const time = clamp(t, 0, shot.flightTime);
  return {
    x: shot.vx * time,
    y: Math.max(0, shot.vy * time - 0.5 * shot.world.gravity * time * time),
  };
}

function buildTrail(shot, t, samples = 120) {
  const end = clamp(t, 0, shot.flightTime);
  if (end <= 0) return [{ x: 0, y: 0 }];

  return Array.from({ length: samples }, (_, index) =>
    shotPositionAt(shot, (end * index) / (samples - 1)),
  );
}

function drawText(ctx, text, x, y, size, options = {}) {
  const {
    color = "#fff",
    align = "center",
    weight = 900,
    alpha = 1,
    shadow = true,
    maxWidth,
  } = options;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;

  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
  }

  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawFootball(ctx, x, y, radius, rotation = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = radius * 0.5;
  ctx.shadowOffsetY = radius * 0.14;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();

  ctx.shadowBlur = 0;

  const shade = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.38,
    radius * 0.1,
    0,
    0,
    radius,
  );
  shade.addColorStop(0, "rgba(255,255,255,0.98)");
  shade.addColorStop(0.5, "rgba(255,255,255,0.08)");
  shade.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = shade;
  ctx.fill();

  const black = "#111827";
  ctx.fillStyle = black;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const px = Math.cos(a) * radius * 0.33;
    const py = Math.sin(a) * radius * 0.33;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = black;
  ctx.lineWidth = radius * 0.045;
  ctx.lineCap = "round";

  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35);
    ctx.lineTo(Math.cos(a) * radius * 0.82, Math.sin(a) * radius * 0.82);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      Math.cos(a) * radius * 0.84,
      Math.sin(a) * radius * 0.84,
      radius * 0.13,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = radius * 0.035;
  ctx.stroke();

  ctx.restore();
}

function drawFootballField(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#3ab9f4");
  sky.addColorStop(0.42, "#8fdcf7");
  sky.addColorStop(0.66, "#dff7ff");
  sky.addColorStop(1, "#f8fdff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.8;
  const sunY = h * 0.27;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 260);
  sun.addColorStop(0, "rgba(255,249,192,0.95)");
  sun.addColorStop(0.22, "rgba(255,219,116,0.35)");
  sun.addColorStop(1, "rgba(255,219,116,0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 6; i += 1) {
    const x = 80 + i * 180;
    const y = 190 + Math.sin(i * 1.9) * 50;
    ctx.beginPath();
    ctx.ellipse(x, y, 78, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 55, y - 10, 48, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 48, y + 8, 52, 17, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const groundY = h * 0.72;

  const grass = ctx.createLinearGradient(0, groundY, 0, h);
  grass.addColorStop(0, "#2f9f46");
  grass.addColorStop(1, "#126226");
  ctx.fillStyle = grass;
  ctx.fillRect(0, groundY, w, h - groundY);

  const stripeWidth = 92;
  for (let x = -stripeWidth; x < w + stripeWidth; x += stripeWidth) {
    const stripeIndex = Math.floor(x / stripeWidth);
    ctx.fillStyle =
      stripeIndex % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.055)";
    ctx.fillRect(x, groundY, stripeWidth, h - groundY);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 160);
  ctx.lineTo(w, groundY + 160);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, groundY + 290, 150, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(w / 2 - 170, groundY + 112, 340, 170);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 8;
  ctx.strokeRect(w / 2 - 92, groundY + 35, 184, 105);
  ctx.lineWidth = 3;
  ctx.strokeRect(w / 2 - 78, groundY + 48, 156, 92);
}

function getSceneInfo(videoTime, moonLandingTime) {
  if (videoTime < 2) return "intro";
  if (videoTime < 4.2) return "launch";
  if (videoTime < moonLandingTime - 4) return "followMoon";
  if (videoTime < moonLandingTime + 1.1) return "moonLanding";
  if (videoTime < moonLandingTime + 4.6) return "wideReveal";
  return "results";
}

function getCamera({ shots, physicsTime, videoTime, scene, moonLandingTime }) {
  const moon = shots.find((shot) => shot.id === "moon");
  const moonPos = shotPositionAt(moon, physicsTime);
  const maxRange = Math.max(...shots.map((shot) => shot.range));
  const maxHeight = Math.max(...shots.map((shot) => shot.maxHeight));

  if (scene === "intro") {
    const p = easeInOut(videoTime / 2);
    return { centerX: lerp(8, 20, p), centerY: 0, zoom: lerp(7.5, 5.8, p) };
  }

  if (scene === "launch") {
    const p = easeInOut((videoTime - 2) / 2.2);
    return {
      centerX: lerp(20, moonPos.x * 0.34, p),
      centerY: lerp(0, moonPos.y * 0.2, p),
      zoom: lerp(5.8, 2.7, p),
    };
  }

  if (scene === "followMoon") {
    const visibleNeed = Math.max(220, moonPos.y + 180);
    const targetZoom = clamp(880 / visibleNeed, 1.15, 2.7);
    return { centerX: moonPos.x * 0.72, centerY: moonPos.y * 0.42, zoom: targetZoom };
  }

  if (scene === "moonLanding") {
    return { centerX: moonPos.x * 0.78, centerY: moonPos.y * 0.32, zoom: 1.12 };
  }

  if (scene === "wideReveal" || scene === "results") {
    const p = scene === "wideReveal"
      ? easeInOut((videoTime - moonLandingTime - 1.1) / 3.5)
      : 1;

    const finalZoomX = (VIDEO.width * 0.78) / Math.max(maxRange, 1);
    const finalZoomY = (VIDEO.height * 0.48) / Math.max(maxHeight, 1);
    const finalZoom = clamp(Math.min(finalZoomX, finalZoomY), 0.52, 0.95);

    return {
      centerX: lerp(moonPos.x * 0.78, maxRange * 0.48, p),
      centerY: lerp(moonPos.y * 0.32, maxHeight * 0.42, p),
      zoom: lerp(1.12, finalZoom, p),
    };
  }

  return { centerX: 0, centerY: 0, zoom: 1 };
}

function drawTrail(ctx, shot, project, physicsTime, scene) {
  const isFinal = scene === "wideReveal" || scene === "results";
  const points = buildTrail(shot, isFinal ? shot.flightTime : physicsTime, isFinal ? 180 : 110);
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([10, 12]);

  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point.x, point.y);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.strokeStyle = shot.world.glow;
  ctx.lineWidth = isFinal ? 2.4 : 2;
  ctx.shadowColor = shot.world.glow;
  ctx.shadowBlur = isFinal ? 8 : 6;
  ctx.globalAlpha = shot.id === "moon" ? 0.92 : 0.78;
  ctx.stroke();
  ctx.restore();
}

function drawWorldLabel(ctx, shot, x, y, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const width = 150;
  const height = 42;
  const px = clamp(x - width / 2, 24, VIDEO.width - width - 24);
  const py = clamp(y - 78, 170, VIDEO.height - 240);

  ctx.beginPath();
  ctx.roundRect(px, py, width, height, 21);
  ctx.fillStyle = "rgba(8, 20, 36, 0.62)";
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();

  ctx.font = "900 22px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${shot.world.emoji} ${shot.world.name}`, px + width / 2, py + height / 2 + 1);
  ctx.restore();
}

function drawResults(ctx, shots, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const sorted = [...shots].sort((a, b) => b.range - a.range);
  const x = 96;
  const y = 1245;
  const w = VIDEO.width - 192;
  const h = 440;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 32);
  ctx.fillStyle = "rgba(4, 15, 28, 0.72)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  drawText(ctx, "FINAL RANGE", VIDEO.width / 2, y + 55, 28, {
    color: "rgba(255,255,255,0.78)",
    shadow: false,
  });

  sorted.forEach((shot, index) => {
    const rowY = y + 115 + index * 68;
    ctx.font = "900 29px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = shot.world.color;
    ctx.fillText(`${shot.world.emoji} ${shot.world.name}`, x + 46, rowY);

    ctx.font = "900 40px Inter, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = index === 0 ? "#fff" : shot.world.color;
    ctx.fillText(`${Math.round(shot.range)} m`, x + w - 46, rowY);

    if (index < sorted.length - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.moveTo(x + 42, rowY + 34);
      ctx.lineTo(x + w - 42, rowY + 34);
      ctx.stroke();
    }
  });

  drawText(ctx, "Same kick. Different gravity.", VIDEO.width / 2, y + h - 50, 30, {
    color: "#ffe27a",
  });

  ctx.restore();
}

function drawRecordingOverlay(ctx, status) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.roundRect(32, 32, 132, 44, 22);
  ctx.fill();

  ctx.fillStyle = "#ff3333";
  ctx.beginPath();
  ctx.arc(60, 54, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "900 21px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("REC", 80, 54);

  ctx.textAlign = "right";
  ctx.fillText("9:16", VIDEO.width - 36, 54);

  if (status && !status.toLowerCase().includes("recording")) {
    ctx.textAlign = "center";
    ctx.fillText(status, VIDEO.width / 2, 54);
  }
  ctx.restore();
}

function renderFrame(ctx, shots, videoTime, status) {
  const moon = shots.find((shot) => shot.id === "moon");
  const moonLandingTime = moon.flightTime;
  const duration = moonLandingTime + SHOT.endHoldSeconds;
  const scene = getSceneInfo(videoTime, moonLandingTime);

  const physicsTime =
    scene === "results" || scene === "wideReveal"
      ? moonLandingTime
      : clamp(videoTime - SHOT.introSeconds, 0, moonLandingTime);

  const camera = getCamera({ shots, physicsTime, videoTime, scene, moonLandingTime });
  const groundScreenY = VIDEO.height * 0.72;
  const launchScreenX = VIDEO.width * 0.24;

  const project = (x, y) => ({
    x: launchScreenX + (x - camera.centerX) * camera.zoom,
    y: groundScreenY - (y - camera.centerY) * camera.zoom,
  });

  drawFootballField(ctx, VIDEO.width, VIDEO.height);

  if (scene === "intro") {
    const p = easeOut(videoTime / 1.4);
    drawText(ctx, "Same Shot", VIDEO.width / 2, 180, 74, {
      alpha: p,
      maxWidth: VIDEO.width - 100,
    });
    drawText(ctx, "Different Gravity", VIDEO.width / 2, 248, 42, {
      color: "#fff3a6",
      alpha: p,
      maxWidth: VIDEO.width - 100,
    });

    const ball = project(0, 0);
    drawFootball(ctx, ball.x, ball.y - 34, 54, videoTime * 0.45, p);
    drawText(ctx, "⚽ 130 km/h   •   35°", VIDEO.width / 2, VIDEO.height - 210, 31, {
      color: "rgba(255,255,255,0.92)",
      alpha: p,
    });

    drawRecordingOverlay(ctx, status);
    return duration;
  }

  shots.forEach((shot) => {
    drawTrail(ctx, shot, project, physicsTime, scene);
  });

  shots.forEach((shot) => {
    const finalMode = scene === "wideReveal" || scene === "results";
    const pos = shotPositionAt(shot, finalMode ? shot.flightTime : physicsTime);
    const p = project(pos.x, pos.y);
    if (p.x < -80 || p.x > VIDEO.width + 80 || p.y < -80 || p.y > VIDEO.height + 80) return;

    const isMoon = shot.id === "moon";
    const radius = isMoon && scene !== "results" ? 20 : 17;
    const rotation = pos.x * 0.018;

    drawFootball(ctx, p.x, p.y, radius, rotation, scene === "results" ? 0.85 : 1);
    if (finalMode || isMoon) drawWorldLabel(ctx, shot, p.x, p.y, finalMode ? 0.88 : 0.95);
  });

  if (scene === "launch") {
    const p = easeOut((videoTime - 2) / 1.4);
    drawText(ctx, "One kick. Four worlds.", VIDEO.width / 2, 165, 45, { alpha: p });
  }

  if (scene === "followMoon") {
    drawText(ctx, "The Moon keeps flying…", VIDEO.width / 2, 165, 42, { alpha: 0.95 });
  }

  if (scene === "moonLanding") {
    drawText(ctx, "Wait for the landing…", VIDEO.width / 2, 165, 40, { alpha: 0.92 });
  }

  if (scene === "wideReveal") {
    const p = easeOut((videoTime - moonLandingTime - 1.1) / 1.5);
    drawText(ctx, "Now compare the full paths", VIDEO.width / 2, 165, 39, { alpha: p });
  }

  if (scene === "results") {
    const p = easeOut((videoTime - moonLandingTime - 4.6) / 1.2);
    drawResults(ctx, shots, p);
  }

  drawRecordingOverlay(ctx, status);
  return duration;
}

function startRecording(canvas, onStatus) {
  if (!canvas.captureStream || !window.MediaRecorder) {
    onStatus("Recording not supported");
    return null;
  }

  const stream = canvas.captureStream(VIDEO.fps);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });

  recorder.ondataavailable = (event) => {
    if (event.data?.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = VIDEO.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    onStatus("Saved");
  };

  recorder.start();
  onStatus("Recording…");
  return recorder;
}

export default function GravityComparisonVideoScene({ onBack } = {}) {
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const statusRef = useRef("Preparing…");

  const [status, setStatus] = useState("Preparing…");
  const [replayKey, setReplayKey] = useState(0);

  const shots = useMemo(() => createFootballWorlds().map((world) => createShot(world)), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: false });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = VIDEO.width * dpr;
    canvas.height = VIDEO.height * dpr;
    canvas.style.width = "min(100vw, calc(100vh * 9 / 16))";
    canvas.style.height = "min(100vh, calc(100vw * 16 / 9))";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const setRecordingStatus = (nextStatus) => {
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    };

    startTimeRef.current = performance.now();
    recorderRef.current = startRecording(canvas, setRecordingStatus);

    function animate(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const duration = renderFrame(ctx, shots, elapsed, statusRef.current);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        renderFrame(ctx, shots, duration, "Saving…");
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, [replayKey, shots]);

  function replay() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    statusRef.current = "Preparing…";
    setStatus("Preparing…");
    setReplayKey((key) => key + 1);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#020611",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Football gravity comparison auto recording video canvas"
        style={{
          display: "block",
          background: "#020611",
          boxShadow: "0 0 44px rgba(0,0,0,0.55)",
        }}
      />

      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            position: "fixed",
            left: 18,
            top: 18,
            zIndex: 5,
            border: "1px solid rgba(255,255,255,0.26)",
            borderRadius: 999,
            padding: "9px 15px",
            background: "rgba(2, 8, 18, 0.58)",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Back to Lab
        </button>
      ) : null}

      <button
        type="button"
        onClick={replay}
        style={{
          position: "fixed",
          right: 18,
          top: 18,
          zIndex: 5,
          border: "1px solid rgba(255,255,255,0.26)",
          borderRadius: 999,
          padding: "9px 15px",
          background: "rgba(2, 8, 18, 0.58)",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Replay + Record
      </button>

      <span
        style={{
          position: "fixed",
          left: 16,
          bottom: 12,
          color: "rgba(255,255,255,0.72)",
          fontSize: 13,
          fontWeight: 800,
          pointerEvents: "none",
          textShadow: "0 2px 10px rgba(0,0,0,0.75)",
        }}
      >
        {status} · file: {VIDEO.filename}
      </span>
    </div>
  );
}


