// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonVideoScene.jsx

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
  introSeconds: 2.2,
  endHoldSeconds: 10,
};

const WORLD_IDS = ["jupiter", "earth", "mars", "moon"];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function ease(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function kmhToMs(kmh) {
  return kmh / 3.6;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 0,
  }).format(value);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect?.(x, y, w, h, r);
  if (!ctx.roundRect) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

function createShots() {
  const speed = kmhToMs(SHOT.speedKmh);
  const angle = degToRad(SHOT.angleDeg);
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);

  const emojis = {
    jupiter: "🟠",
    earth: "🌍",
    mars: "🔴",
    moon: "🌙",
  };

  const glows = {
    jupiter: "rgba(255,152,0,0.44)",
    earth: "rgba(76,175,80,0.44)",
    mars: "rgba(255,87,34,0.44)",
    moon: "rgba(255,255,255,0.52)",
  };

  return WORLD_IDS.map((id) => {
    const world = GRAVITY_WORLDS.find((item) => item.id === id);
    const flightTime = (2 * vy) / world.gravity;
    const range = vx * flightTime;
    const maxHeight = (vy * vy) / (2 * world.gravity);

    return {
      ...world,
      emoji: emojis[id],
      glow: glows[id],
      vx,
      vy,
      flightTime,
      range,
      maxHeight,
    };
  });
}

function positionAt(shot, t) {
  const time = clamp(t, 0, shot.flightTime);

  return {
    x: shot.vx * time,
    y: Math.max(0, shot.vy * time - 0.5 * shot.gravity * time * time),
  };
}

function trailPoints(shot, t, full = false) {
  const end = full ? shot.flightTime : clamp(t, 0, shot.flightTime);
  const count = full ? 170 : 110;

  return Array.from({ length: count }, (_, i) =>
    positionAt(shot, (end * i) / (count - 1)),
  );
}

function getLeader(shots) {
  return [...shots].sort((a, b) => b.flightTime - a.flightTime)[0];
}

function getDuration(shots) {
  return SHOT.introSeconds + getLeader(shots).flightTime + SHOT.endHoldSeconds;
}

function getScene(time, shots) {
  const leader = getLeader(shots);
  const launchTime = SHOT.introSeconds;
  const landTime = launchTime + leader.flightTime;

  if (time < launchTime) return "intro";
  if (time < launchTime + 2.1) return "launch";
  if (time < landTime - 2.8) return "follow";
  if (time < landTime + 1.2) return "landing";
  if (time < landTime + 4.2) return "reveal";
  return "results";
}

function getPhysicsTime(time) {
  return Math.max(0, time - SHOT.introSeconds);
}

function finalCamera(shots) {
  const maxRange = Math.max(...shots.map((s) => s.range));
  const maxHeight = Math.max(...shots.map((s) => s.maxHeight));

  return {
    x: maxRange * 0.5,
    y: maxHeight * 0.32,
    zoom: clamp(
      Math.min((VIDEO.width * 0.76) / maxRange, (VIDEO.height * 0.42) / maxHeight),
      0.55,
      1.1,
    ),
  };
}

function targetCamera(time, shots) {
  const scene = getScene(time, shots);
  const physicsTime = getPhysicsTime(time);
  const leader = getLeader(shots);
  const pos = positionAt(leader, physicsTime);
  const final = finalCamera(shots);
  const landTime = SHOT.introSeconds + leader.flightTime;

  if (scene === "intro") {
    const p = ease(time / SHOT.introSeconds);
    return {
      x: lerp(-12, 18, p),
      y: lerp(0, 5, p),
      zoom: lerp(4.2, 3.1, p),
    };
  }

  if (scene === "launch") {
    const p = ease((time - SHOT.introSeconds) / 2.1);
    return {
      x: lerp(0, pos.x * 0.25, p),
      y: lerp(0, 10, p),
      zoom: lerp(3.1, 1.55, p),
    };
  }

  if (scene === "follow") {
    return {
      x: pos.x - 95,
      y: pos.y * 0.16,
      zoom: clamp(1.03 - pos.y * 0.002, 0.72, 1.03),
    };
  }

  if (scene === "landing") {
    return {
      x: leader.range * 0.78,
      y: 6,
      zoom: 0.9,
    };
  }

  if (scene === "reveal") {
    const p = ease((time - (landTime + 1.2)) / 3);
    return {
      x: lerp(leader.range * 0.78, final.x, p),
      y: lerp(6, final.y, p),
      zoom: lerp(0.9, final.zoom, p),
    };
  }

  return final;
}

function smoothCamera(cameraRef, target, scene) {
  if (!cameraRef.current || scene === "intro") {
    cameraRef.current = { ...target };
    return cameraRef.current;
  }

  const speed = scene === "results" ? 0.08 : 0.045;
  const zoomSpeed = scene === "results" ? 0.08 : 0.035;
  const c = cameraRef.current;

  c.x += (target.x - c.x) * speed;
  c.y += (target.y - c.y) * speed;
  c.zoom += (target.zoom - c.zoom) * zoomSpeed;

  return c;
}

function drawText(ctx, text, x, y, size, options = {}) {
  const {
    color = "#ffffff",
    align = "center",
    weight = 900,
    alpha = 1,
    maxWidth,
  } = options;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawBackground(ctx, camera) {
  const w = VIDEO.width;
  const h = VIDEO.height;
  const fieldY = 1235;
  const groundOffset = -(camera.x * camera.zoom * 0.56) % 220;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#47bff7");
  sky.addColorStop(0.45, "#a8e8ff");
  sky.addColorStop(0.64, "#e6fbff");
  sky.addColorStop(1, "#fef3c7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sun = ctx.createRadialGradient(w * 0.78, 245, 0, w * 0.78, 245, 230);
  sun.addColorStop(0, "rgba(255,246,174,0.96)");
  sun.addColorStop(0.36, "rgba(255,226,110,0.38)");
  sun.addColorStop(1, "rgba(255,226,110,0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(w * 0.78, 245, 230, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  for (let i = 0; i < 5; i += 1) {
    const x = 80 + i * 230;
    const y = 175 + Math.sin(i * 1.7) * 45;
    ctx.beginPath();
    ctx.ellipse(x, y, 100, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 52, y - 10, 58, 21, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 55, y + 6, 60, 19, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(20,32,45,0.34)";
  ctx.beginPath();
  ctx.ellipse(w / 2, fieldY - 96, 790, 185, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(w + 80, fieldY + 10);
  ctx.lineTo(-80, fieldY + 10);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 4; i += 1) {
    const x = 95 + i * 295;
    ctx.fillStyle = "rgba(18,25,36,0.48)";
    ctx.fillRect(x, fieldY - 420, 24, 340);

    const glow = ctx.createRadialGradient(x + 12, fieldY - 430, 0, x + 12, fieldY - 430, 88);
    glow.addColorStop(0, "rgba(255,255,220,0.52)");
    glow.addColorStop(1, "rgba(255,255,220,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + 12, fieldY - 430, 88, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(groundOffset, 0);

  const grass = ctx.createLinearGradient(0, fieldY, 0, h);
  grass.addColorStop(0, "#24b65c");
  grass.addColorStop(1, "#0f6f2e");
  ctx.fillStyle = grass;
  ctx.fillRect(-500, fieldY, w + 1000, h - fieldY);

  const stripeW = 110;
  for (let x = -700; x < w + 700; x += stripeW) {
    const i = Math.floor(x / stripeW);
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    ctx.beginPath();
    ctx.moveTo(x, fieldY);
    ctx.lineTo(x + stripeW * 0.55, h);
    ctx.lineTo(x + stripeW * 1.55, h);
    ctx.lineTo(x + stripeW, fieldY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.74)";
  ctx.lineWidth = 5;

  for (let x = -700; x < w + 900; x += 220) {
    ctx.beginPath();
    ctx.moveTo(x, fieldY + 125);
    ctx.lineTo(x + 115, h);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-500, fieldY + 132);
  ctx.lineTo(w + 500, fieldY + 132);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(w / 2, h + 45, 345, 130, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.52;
  ctx.strokeStyle = "#f8fbff";
  ctx.lineWidth = 6;
  ctx.strokeRect(58, fieldY - 205, 260, 205);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(248,251,255,0.45)";
  for (let x = 82; x < 318; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, fieldY - 205);
    ctx.lineTo(x, fieldY);
    ctx.stroke();
  }
  for (let y = fieldY - 181; y < fieldY; y += 24) {
    ctx.beginPath();
    ctx.moveTo(58, y);
    ctx.lineTo(318, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFootball(ctx, x, y, r, rotation, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = r * 0.35;
  ctx.shadowOffsetY = r * 0.12;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#111827";

  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const px = Math.cos(a) * r * 0.34;
    const py = Math.sin(a) * r * 0.34;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = r * 0.05;
  ctx.lineCap = "round";

  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36);
    ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.84, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = r * 0.035;
  ctx.stroke();

  ctx.restore();
}

function drawTrail(ctx, points, project, shot, finalMode) {
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(finalMode ? [12, 10] : [7, 10]);

  ctx.beginPath();
  points.forEach((point, i) => {
    const p = project(point.x, point.y);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.strokeStyle = shot.glow;
  ctx.lineWidth = finalMode ? 6 : 4;
  ctx.globalAlpha = finalMode ? 0.5 : 0.36;
  ctx.shadowColor = shot.glow;
  ctx.shadowBlur = 12;
  ctx.stroke();

  ctx.beginPath();
  points.forEach((point, i) => {
    const p = project(point.x, point.y);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.strokeStyle = shot.color;
  ctx.lineWidth = finalMode ? 2.4 : 1.8;
  ctx.globalAlpha = finalMode ? 0.92 : 0.82;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.restore();
}

function drawLabels(ctx, shots, project, finalMode) {
  ctx.save();
  shots.forEach((shot) => {
    const p = project(shot.range, 0);
    if (p.x < -130 || p.x > VIDEO.width + 130) return;

    ctx.font = `${finalMode ? 900 : 800} ${finalMode ? 25 : 20}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = shot.color;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 10;
    ctx.fillText(`${shot.emoji} ${shot.name}`, p.x, p.y + 48);
  });
  ctx.restore();
}

function drawResults(ctx, shots) {
  const sorted = [...shots].sort((a, b) => b.range - a.range);
  const winner = sorted[0];

  ctx.save();

  roundRect(ctx, 72, 345, VIDEO.width - 144, 650, 34);
  ctx.fillStyle = "rgba(3,14,28,0.82)";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 28;
  ctx.fill();
  ctx.stroke();

  drawText(ctx, "FINAL RESULTS", VIDEO.width / 2, 405, 34, {
    color: "rgba(255,255,255,0.82)",
  });

  ctx.font = "900 24px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.64)";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("Range", VIDEO.width - 318, 462);
  ctx.fillText("Max height", VIDEO.width - 116, 462);

  sorted.forEach((shot, index) => {
    const y = 525 + index * 102;

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(120, y + 45);
    ctx.lineTo(VIDEO.width - 120, y + 45);
    ctx.stroke();

    ctx.font = "900 34px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = shot.color;
    ctx.fillText(`${shot.emoji} ${shot.name}`, 125, y);

    ctx.textAlign = "right";
    ctx.fillStyle = index === 0 ? "#ffffff" : shot.color;
    ctx.fillText(`${formatNumber(shot.range)} m`, VIDEO.width - 318, y);
    ctx.fillText(`${formatNumber(shot.maxHeight)} m`, VIDEO.width - 116, y);
  });

  drawText(ctx, `🏆 ${winner.name} flies farthest`, VIDEO.width / 2, 930, 38, {
    color: "#ffe27a",
  });

  drawText(ctx, "Same speed. Same angle. Different gravity.", VIDEO.width / 2, 1090, 40, {
    maxWidth: VIDEO.width - 100,
  });

  drawText(ctx, "Follow for daily science simulations", VIDEO.width / 2, VIDEO.height - 160, 32);
  drawText(ctx, "esbiko", VIDEO.width / 2, VIDEO.height - 96, 58);

  ctx.restore();
}

function renderFrame(ctx, shots, time, status, cameraRef) {
  const scene = getScene(time, shots);
  const physicsTime = getPhysicsTime(time);
  const target = targetCamera(time, shots);
  const camera = smoothCamera(cameraRef, target, scene);
  const finalMode = scene === "reveal" || scene === "results";
  const groundScreenY = 1330;

  const project = (x, y) => ({
    x: VIDEO.width / 2 + (x - camera.x) * camera.zoom,
    y: groundScreenY - (y - camera.y) * camera.zoom,
  });

  ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
  drawBackground(ctx, camera);

  shots.forEach((shot) => {
    drawTrail(ctx, trailPoints(shot, physicsTime, finalMode), project, shot, finalMode);
  });

  drawLabels(ctx, shots, project, finalMode);

  shots.forEach((shot) => {
    const pos = finalMode ? positionAt(shot, shot.flightTime) : positionAt(shot, physicsTime);
    const p = project(pos.x, pos.y);

    if (p.x < -90 || p.x > VIDEO.width + 90 || p.y < -90 || p.y > VIDEO.height + 90) {
      return;
    }

    const radius = clamp(14 + camera.zoom * 2.2, 14, 24);
    drawFootball(ctx, p.x, p.y - radius, radius, pos.x * 0.05, finalMode ? 0.95 : 1);
  });

  if (scene === "intro") {
    drawText(ctx, "Same Shot", VIDEO.width / 2, 210, 84);
    drawText(ctx, "Different Gravity", VIDEO.width / 2, 296, 48, {
      color: "#fff2a8",
    });
    drawText(ctx, `⚽ ${SHOT.speedKmh} km/h   📐 ${SHOT.angleDeg}°`, VIDEO.width / 2, VIDEO.height - 235, 34);
  }

  if (scene === "launch") {
    drawText(ctx, "All balls launch from the ground", VIDEO.width / 2, 205, 43);
  }

  if (scene === "follow") {
    drawText(ctx, "Camera follows the longest flight", VIDEO.width / 2, 205, 42);
  }

  if (scene === "landing") {
    drawText(ctx, "The last ball finally lands", VIDEO.width / 2, 205, 42);
  }

  if (scene === "reveal") {
    drawText(ctx, "Zoom out: compare all trails", VIDEO.width / 2, 205, 42);
  }

  if (scene === "results") {
    drawResults(ctx, shots);
  }

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  roundRect(ctx, 34, 34, 146, 46, 23);
  ctx.fill();

  ctx.fillStyle = "#ff2d2d";
  ctx.beginPath();
  ctx.arc(63, 57, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "900 23px Inter, Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("REC", 83, 57);

  ctx.textAlign = "right";
  ctx.fillText("9:16", VIDEO.width - 38, 57);

  if (status && !status.toLowerCase().includes("recording")) {
    ctx.textAlign = "center";
    ctx.font = "800 19px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.84)";
    ctx.fillText(status, VIDEO.width / 2, 57);
  }

  ctx.restore();
}

function startRecording(canvas, onStatus) {
  if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
    onStatus("Recording not supported");
    return null;
  }

  const stream = canvas.captureStream(VIDEO.fps);
  const chunks = [];
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });

  recorder.ondataavailable = (event) => {
    if (event.data?.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    onStatus("Saving…");

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = VIDEO.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 4000);
    onStatus("Saved");
  };

  recorder.start();
  onStatus("Recording…");

  return recorder;
}

export default function GravityComparisonVideoScene({ onBack }) {
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const statusRef = useRef("Preparing…");
  const cameraRef = useRef(null);

  const [status, setStatus] = useState("Preparing…");
  const [replayKey, setReplayKey] = useState(0);
  const shots = useMemo(() => createShots(), []);

  function setRecordingStatus(next) {
    statusRef.current = next;
    setStatus(next);
  }

  function replay() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    cameraRef.current = null;
    setRecordingStatus("Preparing…");
    setReplayKey((key) => key + 1);
  }

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

    const duration = getDuration(shots);
    startTimeRef.current = performance.now();
    cameraRef.current = null;

    recorderRef.current = startRecording(canvas, setRecordingStatus);

    function animate(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const videoTime = Math.min(elapsed, duration);

      renderFrame(ctx, shots, videoTime, statusRef.current, cameraRef);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        renderFrame(ctx, shots, duration, "Saving…", cameraRef);
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.stop();
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);

      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, [replayKey, shots]);

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
