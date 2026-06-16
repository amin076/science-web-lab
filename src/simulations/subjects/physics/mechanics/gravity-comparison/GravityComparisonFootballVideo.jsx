// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonFootballVideo.jsx
// Standalone 9:16 canvas recorder for Shorts: same football shot on different worlds.
// Shows launch from the ground, follows the longest flight, zooms out, then displays range/height results.

import { useEffect, useMemo, useRef, useState } from "react";

const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 60,
  filename: "esbiko-football-gravity-comparison.webm",
};

const SHOT = {
  speedKmh: 130,
  angleDeg: 35,
  startDelay: 1.35,
  endingHold: 6.8,
};

const WORLDS = [
  {
    id: "jupiter",
    name: "Jupiter",
    emoji: "🟠",
    gravity: 24.79,
    color: "#ff9f1c",
    glow: "rgba(255,159,28,0.34)",
  },
  {
    id: "earth",
    name: "Earth",
    emoji: "🌍",
    gravity: 9.81,
    color: "#51d36a",
    glow: "rgba(81,211,106,0.34)",
  },
  {
    id: "mars",
    name: "Mars",
    emoji: "🔴",
    gravity: 3.71,
    color: "#ff5b45",
    glow: "rgba(255,91,69,0.34)",
  },
  {
    id: "moon",
    name: "Moon",
    emoji: "🌙",
    gravity: 1.62,
    color: "#f4f4ef",
    glow: "rgba(255,255,255,0.44)",
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function easeInOutCubic(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function kmhToMs(kmh) {
  return kmh / 3.6;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 }).format(value);
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }

  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function createShots() {
  const speed = kmhToMs(SHOT.speedKmh);
  const angle = degToRad(SHOT.angleDeg);
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);

  return WORLDS.map((world) => {
    const flightTime = (2 * vy) / world.gravity;
    const range = vx * flightTime;
    const maxHeight = (vy * vy) / (2 * world.gravity);

    return {
      ...world,
      vx,
      vy,
      flightTime,
      range,
      maxHeight,
    };
  });
}

function positionAt(shot, physicsTime) {
  const t = clamp(physicsTime, 0, shot.flightTime);
  return {
    x: shot.vx * t,
    y: Math.max(0, shot.vy * t - 0.5 * shot.gravity * t * t),
    landed: physicsTime >= shot.flightTime,
  };
}

function sampleTrail(shot, physicsTime, samples = 96) {
  const endTime = clamp(physicsTime, 0, shot.flightTime);
  const points = [];

  for (let i = 0; i <= samples; i += 1) {
    points.push(positionAt(shot, (endTime * i) / samples));
  }

  return points;
}

function fullTrail(shot, samples = 150) {
  const points = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(positionAt(shot, (shot.flightTime * i) / samples));
  }
  return points;
}

function getPhysicsTime(videoTime) {
  return Math.max(0, videoTime - SHOT.startDelay);
}

function getLeader(shots) {
  return [...shots].sort((a, b) => b.flightTime - a.flightTime)[0];
}

function getTotalDuration(shots) {
  return SHOT.startDelay + getLeader(shots).flightTime + SHOT.endingHold;
}

function getScene(videoTime, shots) {
  const leader = getLeader(shots);
  const leaderLandTime = SHOT.startDelay + leader.flightTime;

  if (videoTime < SHOT.startDelay) return "intro";
 if (videoTime < 6.0) return "launch";
  if (videoTime < leaderLandTime - 3.2) return "followLeader";
  if (videoTime < leaderLandTime + 1.0) return "lastLanding";
  if (videoTime < leaderLandTime + 3.9) return "wideReveal";
  return "results";
}

function getFinalCamera(shots) {
  const maxRange = Math.max(...shots.map((shot) => shot.range));
  const maxHeight = Math.max(...shots.map((shot) => shot.maxHeight));
  const safeWidth = VIDEO.width * 0.82;
  const safeHeight = VIDEO.height * 0.50;
  const zoom = clamp(Math.min(safeWidth / maxRange, safeHeight / maxHeight), 0.58, 1.25);

  return {
    x: maxRange / 2,
    y: maxHeight * 0.45,
    zoom,
  };
}

function getCamera(videoTime, shots) {
  const scene = getScene(videoTime, shots);
  const physicsTime = getPhysicsTime(videoTime);
  const leader = getLeader(shots);
  const leaderPos = positionAt(leader, physicsTime);
  const finalCamera = getFinalCamera(shots);

  if (scene === "intro") {
    const p = smoothstep(videoTime / SHOT.startDelay);
    return {
      x: lerp(5, 22, p),
      y: lerp(0, 8, p),
      zoom: lerp(7.0, 5.4, p),
    };
  }

  if (scene === "launch") {
    const p = easeInOutCubic((videoTime - SHOT.startDelay) / 3.0);
    const targetY = clamp(leaderPos.y * 0.35 + 8, 18, 72);
    const targetZoom = clamp(700 / (leaderPos.y + 145), 2.1, 5.4);

    return {
      x: lerp(0, leaderPos.x * 0.15, p),
y: lerp(0, targetY * 0.5, p),
zoom: lerp(2.2, 1.3, p),
    };
  }

  if (scene === "followLeader") {
   const zoom = clamp(
  520 / (leaderPos.y + 450),
  0.7,
  1.25
);
    return {
      x: leaderPos.x * 0.62,
      y: leaderPos.y * 0.43 + 8,
      zoom,
    };
  }

  if (scene === "lastLanding") {
    return {
      x: leader.range * 0.72,
      y: 28,
      zoom: 1.04,
    };
  }

  if (scene === "wideReveal") {
    const leaderLandTime = SHOT.startDelay + leader.flightTime;
    const p = easeInOutCubic((videoTime - (leaderLandTime + 1.0)) / 2.9);
    const from = {
      x: leader.range * 0.72,
      y: 28,
      zoom: 1.04,
    };

    return {
      x: lerp(from.x, finalCamera.x, p),
      y: lerp(from.y, finalCamera.y, p),
      zoom: lerp(from.zoom, finalCamera.zoom, p),
    };
  }

  return finalCamera;
}

function drawText(ctx, text, x, y, size, options = {}) {
  const {
    color = "#ffffff",
    align = "center",
    weight = 900,
    alpha = 1,
    maxWidth,
    shadow = true,
  } = options;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;

  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
  }

  if (maxWidth) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
  ctx.restore();
}

function drawBackground(ctx) {
  const { width: w, height: h } = VIDEO;
  const fieldY = 1580;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#72cdf6");
  sky.addColorStop(0.48, "#b9ecff");
  sky.addColorStop(0.72, "#d8f7ff");
  sky.addColorStop(1, "#fef3c7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.80;
  const sunY = h * 0.15;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 185);
  sun.addColorStop(0, "rgba(255,246,165,0.96)");
  sun.addColorStop(0.34, "rgba(255,232,120,0.42)");
  sun.addColorStop(1, "rgba(255,232,120,0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 185, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.44)";
  [
    [145, 210, 120, 31],
    [420, 330, 132, 34],
    [735, 245, 118, 30],
  ].forEach(([x, y, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, -0.08, 0, Math.PI * 2);
    ctx.ellipse(x + rx * 0.35, y - 8, rx * 0.48, ry * 0.9, 0, 0, Math.PI * 2);
    ctx.ellipse(x - rx * 0.45, y + 4, rx * 0.42, ry * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(60,100,120,0.22)";
  ctx.beginPath();
  ctx.moveTo(0, fieldY - 150);
  for (let x = 0; x <= w; x += 60) {
    const y = fieldY - 205 + Math.sin(x * 0.008) * 32 + Math.sin(x * 0.017) * 17;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, fieldY + 16);
  ctx.lineTo(0, fieldY + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#18a954";
  ctx.fillRect(0, fieldY, w, h - fieldY);

  const stripeW = 95;
  for (let i = 0; i < Math.ceil(w / stripeW) + 2; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.045)";
    ctx.beginPath();
    ctx.moveTo(i * stripeW - 35, fieldY);
    ctx.lineTo(i * stripeW + stripeW * 0.55, h);
    ctx.lineTo(i * stripeW + stripeW * 1.55, h);
    ctx.lineTo(i * stripeW + stripeW, fieldY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, fieldY + 96);
  ctx.lineTo(w, fieldY + 96);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(w / 2, h + 54, 300, 120, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = "#eaf8ff";
  ctx.lineWidth = 8;
  const gx = 40;
const gy = fieldY - 260;
const gw = 320;
const gh = 260;
  ctx.strokeRect(gx, gy, gw, gh);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(234,248,255,0.45)";
  for (let x = gx + 24; x < gx + gw; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy + gh);
    ctx.stroke();
  }
  for (let y = gy + 24; y < gy + gh; y += 24) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx + gw, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFootball(ctx, x, y, radius, rotation = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = radius * 0.35;
  ctx.shadowOffsetY = radius * 0.10;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();

  ctx.shadowBlur = 0;
  const shade = ctx.createRadialGradient(-radius * 0.34, -radius * 0.40, radius * 0.1, 0, 0, radius);
  shade.addColorStop(0, "rgba(255,255,255,0.94)");
  shade.addColorStop(0.6, "rgba(255,255,255,0.03)");
  shade.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = shade;
  ctx.fill();

  ctx.fillStyle = "#111827";
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

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = radius * 0.05;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.33, Math.sin(a) * radius * 0.33);
    ctx.lineTo(Math.cos(a) * radius * 0.82, Math.sin(a) * radius * 0.82);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(Math.cos(a) * radius * 0.84, Math.sin(a) * radius * 0.84, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.38)";
  ctx.lineWidth = radius * 0.035;
  ctx.stroke();
  ctx.restore();
}

function drawTrail(ctx, points, project, shot, finalMode = false) {
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(finalMode ? [10, 12] : [7, 10]);

  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point.x, point.y);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = shot.glow;
  ctx.lineWidth = finalMode ? 5 : 4;
  ctx.globalAlpha = finalMode ? 0.44 : 0.34;
  ctx.shadowColor = shot.glow;
  ctx.shadowBlur = 9;
  ctx.stroke();

  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point.x, point.y);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = shot.color;
  ctx.lineWidth = finalMode ? 2.2 : 1.8;
  ctx.globalAlpha = finalMode ? 0.88 : 0.78;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

function drawWorldLabels(ctx, shots, project, finalMode) {
  ctx.save();
  shots.forEach((shot) => {
    const p = project(shot.range, 0);
    if (p.x < -120 || p.x > VIDEO.width + 120) return;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${finalMode ? 900 : 800} ${finalMode ? 24 : 20}px Inter, Arial, sans-serif`;
    ctx.fillStyle = shot.color;
    ctx.shadowColor = "rgba(0,0,0,0.46)";
    ctx.shadowBlur = 10;
    ctx.fillText(`${shot.emoji} ${shot.name}`, p.x, p.y + 52);
  });
  ctx.restore();
}

function drawOpeningText(ctx, videoTime) {
  const p = smoothstep(videoTime / 0.85);
  drawText(ctx, "Same Shot", VIDEO.width / 2, 214, 86, { alpha: p, maxWidth: VIDEO.width - 110 });
  drawText(ctx, "Different Gravity", VIDEO.width / 2, 298, 48, {
    color: "#fff2a8",
    alpha: p,
    maxWidth: VIDEO.width - 110,
  });

  ctx.save();
  ctx.globalAlpha = p;
  roundRect(ctx, 56, VIDEO.height - 270, 332, 116, 28);
  ctx.fillStyle = "rgba(4,30,35,0.54)";
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.font = "900 27px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`⚽ ${SHOT.speedKmh} km/h shot`, 84, VIDEO.height - 228);
  ctx.fillText(`📐 ${SHOT.angleDeg}° launch angle`, 84, VIDEO.height - 181);
  ctx.restore();
}

function drawRec(ctx, status) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundRect(ctx, 34, 34, 146, 46, 23);
  ctx.fill();

  ctx.fillStyle = "#ff2d2d";
  ctx.beginPath();
  ctx.arc(63, 57, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "900 23px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
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

function drawResults(ctx, shots, alpha = 1) {
  const sorted = [...shots].sort((a, b) => b.range - a.range);
  const winner = sorted[0];

  ctx.save();
  ctx.globalAlpha = alpha;

  const x = 78;
  const y = 392;
  const w = VIDEO.width - 156;
  const h = 690;

  roundRect(ctx, x, y, w, h, 36);
  ctx.fillStyle = "rgba(5,17,32,0.80)";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.stroke();

  drawText(ctx, "FINAL RESULTS", VIDEO.width / 2, y + 58, 34, {
    color: "rgba(255,255,255,0.80)",
    shadow: false,
  });

  ctx.font = "900 23px Inter, Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.textAlign = "right";
  ctx.fillText("Range", x + w - 250, y + 112);
  ctx.fillText("Max height", x + w - 54, y + 112);

  sorted.forEach((shot, index) => {
    const rowY = y + 162 + index * 104;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(x + 42, rowY + 48);
    ctx.lineTo(x + w - 42, rowY + 48);
    ctx.stroke();

    ctx.font = "900 34px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = shot.color;
    ctx.fillText(`${shot.emoji} ${shot.name}`, x + 54, rowY);

    ctx.font = "900 38px Inter, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = index === 0 ? "#ffffff" : shot.color;
    ctx.fillText(`${formatNumber(shot.range)} m`, x + w - 250, rowY);

    ctx.font = "900 34px Inter, Arial, sans-serif";
    ctx.fillStyle = shot.color;
    ctx.fillText(`${formatNumber(shot.maxHeight)} m`, x + w - 54, rowY);
  });

  drawText(ctx, `🏆 ${winner.name} wins the longest flight`, VIDEO.width / 2, y + h - 72, 39, {
    color: "#ffe27a",
    maxWidth: VIDEO.width - 130,
  });

  drawText(ctx, "Lower gravity → higher arc → longer range", VIDEO.width / 2, 1140, 39, {
    alpha,
    maxWidth: VIDEO.width - 110,
  });

  drawText(ctx, "Follow for daily science simulations", VIDEO.width / 2, VIDEO.height - 166, 32, {
    alpha,
    color: "rgba(255,255,255,0.92)",
    maxWidth: VIDEO.width - 100,
  });

  drawText(ctx, "esbiko", VIDEO.width / 2, VIDEO.height - 100, 58, {
    alpha,
    color: "#ffffff",
  });

  ctx.restore();
}

function renderFrame(ctx, shots, videoTime, status) {
  const scene = getScene(videoTime, shots);
  const physicsTime = getPhysicsTime(videoTime);
  const camera = getCamera(videoTime, shots);
  const groundScreenY = 1580;

  const project = (x, y) => ({
    x: VIDEO.width / 2 + (x - camera.x) * camera.zoom,
    y: groundScreenY - (y - camera.y) * camera.zoom,
  });

  ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
  drawBackground(ctx);

  const finalMode = scene === "wideReveal" || scene === "results";

  shots.forEach((shot) => {
    const points = finalMode ? fullTrail(shot) : sampleTrail(shot, physicsTime);
    drawTrail(ctx, points, project, shot, finalMode);
  });

  drawWorldLabels(ctx, shots, project, finalMode);

  shots.forEach((shot) => {
    const pos = finalMode ? positionAt(shot, shot.flightTime) : positionAt(shot, physicsTime);
    const p = project(pos.x, pos.y);

    if (p.x < -90 || p.x > VIDEO.width + 90 || p.y < -90 || p.y > VIDEO.height + 90) {
      return;
    }

    const radius = clamp(
  18 + camera.zoom * 3.5,
  18,
  34
);
    const rotation = pos.x * 0.045;
    drawFootball(ctx, p.x, p.y - radius, radius, rotation, finalMode ? 0.96 : 1);
  });

  if (scene === "intro") {
    drawOpeningText(ctx, videoTime);
  } else if (scene === "launch") {
    drawText(ctx, "All balls start from the ground", VIDEO.width / 2, 205, 45, {
      maxWidth: VIDEO.width - 110,
    });
  } else if (scene === "followLeader") {
    drawText(ctx, "Following the longest flight…", VIDEO.width / 2, 205, 45, {
      maxWidth: VIDEO.width - 110,
    });
  } else if (scene === "lastLanding") {
    drawText(ctx, "Last ball finally lands", VIDEO.width / 2, 205, 45, {
      maxWidth: VIDEO.width - 110,
    });
  } else if (scene === "wideReveal") {
    drawText(ctx, "Now compare height and range", VIDEO.width / 2, 205, 43, {
      maxWidth: VIDEO.width - 110,
    });
  }

  if (scene === "results") {
    const total = getTotalDuration(shots);
    const alpha = smoothstep((videoTime - (total - SHOT.endingHold)) / 0.8);
    drawResults(ctx, shots, alpha);
  }

  drawRec(ctx, status);
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
    videoBitsPerSecond: 10_000_000,
  });

  recorder.ondataavailable = (event) => {
    if (event.data?.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    onStatus("Saving video…");
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

export default function GravityComparisonFootballVideo() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const recorderRef = useRef(null);
  const startTimeRef = useRef(null);
  const [status, setStatus] = useState("Preparing auto record…");
  const statusRef = useRef(status);
  const shots = useMemo(() => createShots(), []);

  function setRecordingStatus(nextStatus) {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }

  function restart() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    startTimeRef.current = performance.now();
    setRecordingStatus("Preparing auto record…");

    window.setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && recorderRef.current?.state !== "recording") {
        recorderRef.current = startRecording(canvas, setRecordingStatus);
      }
    }, 120);
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

    const totalDuration = getTotalDuration(shots);
    startTimeRef.current = performance.now();
    recorderRef.current = startRecording(canvas, setRecordingStatus);

    function animate(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const videoTime = Math.min(elapsed, totalDuration);
      renderFrame(ctx, shots, videoTime, statusRef.current);

      if (elapsed < totalDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        renderFrame(ctx, shots, totalDuration, "Saving video…");
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, [shots]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "grid",
        placeItems: "center",
        background: "#020617",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Football gravity comparison 9:16 auto recording video"
        style={{
          display: "block",
          background: "#020617",
          boxShadow: "0 0 44px rgba(0,0,0,0.5)",
        }}
      />

      <button
        type="button"
        onClick={restart}
        style={{
          position: "fixed",
          right: 18,
          top: 18,
          zIndex: 5,
          border: "1px solid rgba(255,255,255,0.24)",
          borderRadius: 999,
          padding: "9px 15px",
          background: "rgba(2,8,18,0.62)",
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
          color: "rgba(255,255,255,0.58)",
          fontSize: 12,
          fontWeight: 800,
          pointerEvents: "none",
        }}
      >
        {status}
      </span>
    </div>
  );
}

