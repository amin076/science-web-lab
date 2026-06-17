import { useEffect, useMemo, useRef, useState } from "react";

import {
  FOOTBALL_WORLDS,
  SHOT_CONFIG,
  VIDEO_CONFIG,
  SCENES,
} from "./footballGravity.constants";

import {
  createInitialShots,
  getSortedByRange,
  shotPositionAt,
  shotTrailAt,
} from "./footballGravity.physics";

import {
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  getPhysicsTime,
  getSceneAtTime,
  lerp,
  sceneProgress,
} from "./footballGravity.timeline";

import { startCanvasRecording } from "./footballGravity.recorder";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawText(ctx, text, x, y, size, options = {}) {
  const {
    align = "center",
    color = "#fff",
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
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.34)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
  }
  ctx.fillStyle = color;
  if (maxWidth) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
  ctx.restore();
}

function drawFootball(ctx, x, y, radius, rotation = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = radius * 0.42;
  ctx.shadowOffsetY = radius * 0.14;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f9fafb";
  ctx.fill();

  ctx.shadowBlur = 0;

  const gradient = ctx.createRadialGradient(
    -radius * 0.36,
    -radius * 0.42,
    radius * 0.08,
    0,
    0,
    radius,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.56, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = gradient;
  ctx.fill();

  const black = "#111827";
  const seam = radius * 0.048;

  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const px = Math.cos(a) * radius * 0.32;
    const py = Math.sin(a) * radius * 0.32;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = black;
  ctx.fill();

  ctx.strokeStyle = black;
  ctx.lineWidth = seam;
  ctx.lineCap = "round";

  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.32, Math.sin(a) * radius * 0.32);
    ctx.lineTo(Math.cos(a) * radius * 0.82, Math.sin(a) * radius * 0.82);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      Math.cos(a) * radius * 0.83,
      Math.sin(a) * radius * 0.83,
      radius * 0.12,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = black;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.36)";
  ctx.lineWidth = radius * 0.034;
  ctx.stroke();

  ctx.restore();
}

function drawBackground(ctx, w, h) {
  // Fixed bright sky. It no longer moves with the camera, so the scene never becomes dark.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1f6fa4");
  sky.addColorStop(0.46, "#67c7ee");
  sky.addColorStop(1, "#c8f3ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.78;
  const sunY = h * 0.23;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 270);
  sun.addColorStop(0, "rgba(255,250,190,0.85)");
  sun.addColorStop(0.22, "rgba(255,226,122,0.28)");
  sun.addColorStop(1, "rgba(255,226,122,0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 270, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 6; i += 1) {
    const x = 80 + i * 185;
    const y = 285 + Math.sin(i * 1.9) * 65;
    ctx.beginPath();
    ctx.ellipse(x, y, 75, 21, 0.05, 0, Math.PI * 2);
    ctx.ellipse(x + 50, y - 8, 45, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 44, y + 5, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawField(ctx, w, h, groundY, project) {
  const ground = project(0, 0).y;
  if (ground > h + 80) return;

  ctx.save();
  const grass = ctx.createLinearGradient(0, ground, 0, h);
  grass.addColorStop(0, "#278a3b");
  grass.addColorStop(1, "#126027");
  ctx.fillStyle = grass;
  ctx.fillRect(0, ground, w, h - ground);

  const stripeW = 118;
  for (let i = -1; i < Math.ceil(w / stripeW) + 1; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.055)";
    ctx.fillRect(i * stripeW, ground, stripeW, h - ground);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.54)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, ground + 118);
  ctx.lineTo(w, ground + 118);
  ctx.stroke();

  // Subtle goal; small enough not to steal attention.
  ctx.strokeStyle = "rgba(255,255,255,0.56)";
  ctx.lineWidth = 7;
  ctx.strokeRect(48, ground - 145, 220, 145);
  ctx.lineWidth = 3;
  for (let x = 78; x < 258; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, ground - 142);
    ctx.lineTo(x, ground - 4);
    ctx.stroke();
  }
  for (let y = ground - 118; y < ground - 18; y += 30) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(263, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrail(ctx, points, project, shot, alpha = 1, emphasis = 1) {
  if (points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([10, 13]);

  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point.x, point.y);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = shot.world.glow;
  ctx.lineWidth = Math.max(2.1, SHOT_CONFIG.trailGlowWidth * emphasis);
  ctx.shadowColor = shot.world.glow;
  ctx.shadowBlur = 4;
  ctx.stroke();

  ctx.beginPath();
  points.forEach((point, index) => {
    const p = project(point.x, point.y);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = shot.world.color;
  ctx.lineWidth = Math.max(1.15, SHOT_CONFIG.trailWidth * emphasis);
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

function drawTinyTopInfo(ctx, w, scene) {
  if (scene === SCENES.RESULTS) return;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(w / 2 - 190, 34, 380, 52, 26);
  ctx.fillStyle = "rgba(8,28,50,0.36)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawText(ctx, "⚽ 130 km/h • 35°", w / 2, 61, 27, {
    color: "rgba(255,255,255,0.94)",
    shadow: false,
  });
}

function drawIntro(ctx, w, h, groundY, videoTime) {
  const p = easeOutCubic(sceneProgress(videoTime, 0.15, 1.25));
  const ballY = groundY - 142;

  drawFootball(ctx, w / 2, ballY, 96, videoTime * 0.35, p);
  drawText(ctx, "Same Shot", w / 2, 250, 84, {
    alpha: p,
    maxWidth: w - 96,
  });
  drawText(ctx, "Different Gravity", w / 2, 328, 46, {
    alpha: p,
    color: "#fff1a6",
    maxWidth: w - 96,
  });

  ctx.save();
  ctx.globalAlpha = p;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 205, groundY - 56, 410, 62, 31);
  ctx.fillStyle = "rgba(5,26,36,0.42)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawText(ctx, "Who goes farther?", w / 2, groundY - 25, 34, {
    alpha: p,
    shadow: false,
  });
}

function drawWorldLabels(ctx, shots, project, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  shots.forEach((shot, index) => {
    const p = project(0, 0);
    const x = p.x + 30 + index * 180;
    const y = p.y + 105;
    ctx.beginPath();
    ctx.roundRect(x - 74, y - 25, 148, 50, 25);
    ctx.fillStyle = "rgba(7,28,40,0.42)";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.font = "900 22px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = shot.world.color;
    ctx.fillText(`${shot.world.emoji} ${shot.world.name}`, x, y + 1);
  });
  ctx.restore();
}

function drawResultBoard(ctx, w, h, shots) {
  const sorted = getSortedByRange(shots);
  const x = 86;
  const y = 365;
  const width = w - 172;
  const height = 705;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 34);
  ctx.fillStyle = "rgba(7,22,36,0.70)";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 26;
  ctx.fill();
  ctx.stroke();

  drawText(ctx, "FINAL RANGE", w / 2, y + 76, 34, {
    color: "rgba(255,255,255,0.82)",
    shadow: false,
  });

  sorted.forEach((shot, index) => {
    const rowY = y + 164 + index * 104;
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.moveTo(x + 48, rowY + 50);
    ctx.lineTo(x + width - 48, rowY + 50);
    ctx.stroke();

    ctx.font = "900 34px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = shot.world.color;
    ctx.fillText(`${shot.world.emoji} ${shot.world.name}`, x + 58, rowY);

    ctx.font = "900 54px Inter, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = index === 0 ? "#fff" : shot.world.color;
    ctx.fillText(`${Math.round(shot.range)} m`, x + width - 58, rowY);
  });

  drawText(ctx, "🏆 The Moon wins", w / 2, y + height - 110, 46, {
    color: "#ffe27a",
  });
  drawText(ctx, "Lower gravity → longer flight", w / 2, y + height - 54, 28, {
    color: "rgba(255,255,255,0.78)",
    shadow: false,
  });
  ctx.restore();

  drawText(ctx, "Follow for daily science simulations", w / 2, h - 178, 31, {
    color: "rgba(255,255,255,0.92)",
    maxWidth: w - 120,
  });
  drawText(ctx, "esbiko", w / 2, h - 110, 62, { color: "#ffffff" });
}

function drawRecIndicator(ctx, w, status) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.roundRect(32, 32, 130, 42, 21);
  ctx.fill();
  ctx.fillStyle = "#ff3333";
  ctx.beginPath();
  ctx.arc(58, 53, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "900 21px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("REC", 78, 53);

  ctx.textAlign = "right";
  ctx.fillText("9:16", w - 36, 53);

  if (status && !status.toLowerCase().includes("recording")) {
    ctx.textAlign = "center";
    ctx.font = "800 18px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.76)";
    ctx.fillText(status, w / 2, 53);
  }
  ctx.restore();
}

function getCamera(shots, videoTime, physicsTime, scene) {
  const moon = shots.find((shot) => shot.id === "moon");
  const moonPos = shotPositionAt(moon, physicsTime);

  if (scene === SCENES.INTRO) {
    const p = easeInOutSine(sceneProgress(videoTime, 0, 2.2));
    return {
      centerX: lerp(0, 12, p),
      centerY: 0,
      zoom: lerp(2.75, 2.28, p),
    };
  }

  if (scene === SCENES.LAUNCH) {
    const p = easeInOutCubic(sceneProgress(videoTime, 2.2, 5.4));
    return {
      centerX: lerp(12, moonPos.x * 0.38, p),
      centerY: lerp(0, moonPos.y * 0.30, p),
      zoom: lerp(2.28, 1.65, p),
    };
  }

  if (scene === SCENES.FOLLOW_MOON) {
    const pullBack = easeInOutSine(sceneProgress(videoTime, 7.5, 27.6));
    return {
      centerX: moonPos.x * lerp(0.44, 0.67, pullBack),
      centerY: moonPos.y * lerp(0.36, 0.22, pullBack),
      zoom: lerp(1.65, 1.14, pullBack),
    };
  }

  if (scene === SCENES.WIDE_REVEAL) {
    const p = easeInOutCubic(sceneProgress(videoTime, 28.0, 32.8));
    return {
      centerX: lerp(moonPos.x * 0.67, moon.range * 0.5, p),
      centerY: lerp(moonPos.y * 0.22, 42, p),
      zoom: lerp(1.14, 1.04, p),
    };
  }

  return {
    centerX: moon.range * 0.5,
    centerY: 42,
    zoom: 1.04,
  };
}

function renderFrame(ctx, canvas, shots, videoTime, recordingStatus) {
  const w = VIDEO_CONFIG.width;
  const h = VIDEO_CONFIG.height;
  const scene = getSceneAtTime(videoTime);
  const physicsTime = getPhysicsTime(videoTime);
  const groundY = h * 0.74;
  const launchScreenX = 170;

  ctx.clearRect(0, 0, w, h);

  const { centerX, centerY, zoom } = getCamera(shots, videoTime, physicsTime, scene);

  const project = (x, y) => ({
    x: launchScreenX + (x - centerX) * zoom,
    y: groundY - (y - centerY) * zoom,
  });

  drawBackground(ctx, w, h);
  drawField(ctx, w, h, groundY, project);

  if (scene === SCENES.INTRO) {
    drawIntro(ctx, w, h, groundY, videoTime);
    drawRecIndicator(ctx, w, recordingStatus);
    return;
  }

  const isResults = scene === SCENES.RESULTS;
  const samples = scene === SCENES.WIDE_REVEAL || isResults ? 230 : 140;

  shots.forEach((shot) => {
    const points = shotTrailAt(shot, physicsTime, samples);
    const isMoon = shot.id === "moon";
    let alpha = isMoon ? 0.9 : 0.56;
    let emphasis = isMoon ? 1.0 : 0.82;

    if (scene === SCENES.FOLLOW_MOON && !isMoon) {
      alpha = 0.26;
      emphasis = 0.72;
    }

    if (isResults) {
      alpha = isMoon ? 0.42 : 0.28;
      emphasis = 0.82;
    }

    drawTrail(ctx, points, project, shot, alpha, emphasis);
  });

  shots.forEach((shot) => {
    const pos = shotPositionAt(shot, physicsTime);
    const p = project(pos.x, pos.y);
    const isMoon = shot.id === "moon";
    let alpha = isMoon ? 1 : 0.66;
    if (scene === SCENES.FOLLOW_MOON && !isMoon) alpha = 0.28;
    if (isResults) alpha = isMoon ? 0.34 : 0.22;

    if (p.x > -120 && p.x < w + 120 && p.y > -120 && p.y < h + 120) {
      const radius = isMoon ? SHOT_CONFIG.focusBallRadius : SHOT_CONFIG.ballRadius;
      const rotation = pos.x * 0.012 + physicsTime * 0.18;
      drawFootball(ctx, p.x, p.y, radius, rotation, alpha);
    }
  });

  drawTinyTopInfo(ctx, w, scene);

  if (scene === SCENES.LAUNCH) {
    const p = easeOutCubic(sceneProgress(videoTime, 2.25, 4.4));
    drawWorldLabels(ctx, shots, project, p);
    drawText(ctx, "Same kick on four worlds", w / 2, 176, 43, {
      alpha: p,
      maxWidth: w - 100,
    });
  }

  if (scene === SCENES.FOLLOW_MOON) {
    const p = easeOutCubic(sceneProgress(videoTime, 5.6, 6.5));
    drawText(ctx, "The Moon keeps flying…", w / 2, 166, 41, {
      alpha: p,
      color: "#ffffff",
      maxWidth: w - 100,
    });
  }

  if (scene === SCENES.WIDE_REVEAL) {
    const p = easeOutCubic(sceneProgress(videoTime, 15.7, 17.0));
    drawText(ctx, "Moon has landed…", w / 2, 158, 39, {
      alpha: p,
      maxWidth: w - 100,
    });
    drawText(ctx, "Now see the full range", w / 2, 214, 44, {
      alpha: p,
      color: "#fff1a6",
      maxWidth: w - 100,
    });
  }

  if (isResults) {
    drawResultBoard(ctx, w, h, shots);
  }

  drawRecIndicator(ctx, w, recordingStatus);
}

export default function FootballGravityCanvas() {
  const visibleCanvasRef = useRef(null);
  const recorderRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const recordingStatusRef = useRef("Preparing auto record…");
  const [recordingStatusUI, setRecordingStatusUI] = useState("Preparing auto record…");
  const [isRecording, setIsRecording] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const shots = useMemo(() => createInitialShots(FOOTBALL_WORLDS), []);

  useEffect(() => {
    const canvas = visibleCanvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: false });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = VIDEO_CONFIG.width * dpr;
    canvas.height = VIDEO_CONFIG.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    canvas.style.width = "min(100vw, calc(100vh * 9 / 16))";
    canvas.style.height = "min(100vh, calc(100vw * 16 / 9))";

    startTimeRef.current = performance.now();

    const recorder = startCanvasRecording(canvas, (status) => {
      recordingStatusRef.current = status;
      setRecordingStatusUI(status);
      setIsRecording(status.toLowerCase().includes("recording"));
    });

    recorderRef.current = recorder;

    function animate(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      const videoTime = Math.min(elapsed, SHOT_CONFIG.duration);

      renderFrame(ctx, canvas, shots, videoTime, recordingStatusRef.current);

      if (elapsed < SHOT_CONFIG.duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        renderFrame(ctx, canvas, shots, SHOT_CONFIG.duration, "Saving video…");
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

  function replay() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    recordingStatusRef.current = "Preparing auto record…";
    setRecordingStatusUI("Preparing auto record…");
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
        ref={visibleCanvasRef}
        aria-label="Football gravity challenge auto recording canvas"
        style={{
          display: "block",
          background: "#020611",
          boxShadow: "0 0 44px rgba(0,0,0,0.55)",
        }}
      />

      <button
        type="button"
        onClick={replay}
        style={{
          position: "fixed",
          right: 18,
          top: 18,
          zIndex: 5,
          border: "1px solid rgba(255,255,255,0.24)",
          borderRadius: 999,
          padding: "9px 15px",
          background: "rgba(2, 8, 18, 0.54)",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        {isRecording ? "Recording…" : "Replay + Record"}
      </button>

      <span
        style={{
          position: "fixed",
          left: 16,
          bottom: 12,
          color: "rgba(255,255,255,0.48)",
          fontSize: 12,
          fontWeight: 700,
          pointerEvents: "none",
        }}
      >
        {recordingStatusUI}
      </span>
    </div>
  );
}
