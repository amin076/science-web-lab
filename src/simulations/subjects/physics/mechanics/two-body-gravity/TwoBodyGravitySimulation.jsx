import React, { useEffect, useMemo, useRef, useState } from "react";
import SimulationShell from "@/system/SimulationShell";
import Controls from "./Controls";
import HUD from "./HUD";
import Charts from "./Charts";
import { DEFAULT_PARAMS, DEFAULT_CHART_CONFIG } from "./schema";
import {
  MAX_DT,
  PX_PER_METER,
  GRID_STEP,
  pushCapped,
  resizeCanvasToParentDPR,
  degreesToRad,
  TRAIL_LENGTH,
} from "./constants";
import { useSimLoop } from "./useSimLoop";

/**
 * Two-Body Gravity Simulation
 * Fixes:
 * - Throttle HUD + chart React state updates (prevents UI freeze / tab crash)
 * - Remove setTimeout(draw,0) spam (slider drag could enqueue many tasks)
 * - Safe rounded-rect fallback (ctx.roundRect not always supported)
 * - Wrap draw with try/catch to avoid loop-breaking exceptions
 */
export default function TwoBodyGravitySimulation() {
  const canvasRef = useRef(null);

  // Simulation running state
  const [running, setRunning] = useState(false);

  // User Parameters
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // HUD State
  const [hud, setHud] = useState({ t: 0, note: "Ready" });

  // Camera state (world coords in meters, zoom multiplier)
  const camRef = useRef({ x: 0, y: 0, zoom: 1 });

  // Panning refs
  const panRef = useRef({
    active: false,
    startClientX: 0,
    startClientY: 0,
    startCamX: 0,
    startCamY: 0,
  });

  // Physics State
  const physRef = useRef({
    t: 0,
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    v1: { x: 0, y: 0 },
    v2: { x: 0, y: 0 },
    m1: 1,
    m2: 1,
    G: 1,
    crashed: false,
    cm: { x: 0, y: 0 },
    trail1: [],
    trail2: [],
    trailCM: [],
  });

  // Chart Data
  const chartCfg = useMemo(() => DEFAULT_CHART_CONFIG, []);
  const samplesRef = useRef([]);
  const [chartData, setChartData] = useState([]);
  const sampleAccRef = useRef(0);

  // ---- Throttling (prevent React overload) ----
  const HUD_HZ = 15;
  const CHART_UI_HZ = 10; // how often we push chartData into React state
  const hudAccRef = useRef(0);
  const chartUiAccRef = useRef(0);
  const lastOutRef = useRef(null);

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const getRatioNote = (m1, m2) => {
    const ratio = Math.max(m1, m2) / Math.min(m1, m2);
    if (ratio > 1000) return "Mass Ratio > 1000: Approx. Keplerian Orbit";
    return "Mass Ratio < 1000: Two-Body Dynamics";
  };

  const computeCM = (s) => {
    const totalM = s.m1 + s.m2;
    if (!Number.isFinite(totalM) || totalM <= 0) return { x: 0, y: 0 };
    return {
      x: (s.m1 * s.p1.x + s.m2 * s.p2.x) / totalM,
      y: (s.m1 * s.p1.y + s.m2 * s.p2.y) / totalM,
    };
  };

  const resetCameraToCM = () => {
    const s = physRef.current;
    const cm = s.cm ?? computeCM(s);
    camRef.current.x = cm.x;
    camRef.current.y = cm.y;
    camRef.current.zoom = 1;
  };

  // --- Initialization ---
  const initSimulation = () => {
    const s = physRef.current;

    // Position
    s.p1 = { x: paramsRef.current.x1, y: 0 };
    s.p2 = { x: paramsRef.current.x2, y: 0 };

    // Velocity
    const rad1 = degreesToRad(paramsRef.current.ang1);
    const rad2 = degreesToRad(paramsRef.current.ang2);
    s.v1 = {
      x: paramsRef.current.v1 * Math.cos(rad1),
      y: paramsRef.current.v1 * Math.sin(rad1),
    };
    s.v2 = {
      x: paramsRef.current.v2 * Math.cos(rad2),
      y: paramsRef.current.v2 * Math.sin(rad2),
    };

    // Mass & G
    s.m1 = paramsRef.current.m1;
    s.m2 = paramsRef.current.m2;
    s.G = paramsRef.current.G;

    s.t = 0;
    s.crashed = false;

    // CM
    s.cm = computeCM(s);

    // Clear trails
    s.trail1 = [];
    s.trail2 = [];
    s.trailCM = [];

    // Seed trails for immediate visibility
    if (paramsRef.current.showTrail) {
      s.trail1.push({ x: s.p1.x, y: s.p1.y });
      s.trail2.push({ x: s.p2.x, y: s.p2.y });
      s.trailCM.push({ x: s.cm.x, y: s.cm.y });
    }

    // Clear charts
    samplesRef.current = [];
    setChartData([]);
    sampleAccRef.current = 0;

    // Reset throttle accumulators
    hudAccRef.current = 0;
    chartUiAccRef.current = 0;
    lastOutRef.current = null;

    // Camera: start centered on CM
    resetCameraToCM();

    setHud({
      t: 0,
      note:
        `${getRatioNote(s.m1, s.m2)} · Drag to pan, Wheel to zoom` +
        (paramsRef.current.followCM ? " · Following CM" : ""),
    });
  };

  // --- Physics Step ---
  const step = (dt) => {
    const s = physRef.current;
    if (s.crashed) return null;

    s.t += dt;

    // Distance
    const dx = s.p2.x - s.p1.x;
    const dy = s.p2.y - s.p1.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    // Collision check
    if (dist < 0.5) {
      s.crashed = true;
      return { t: s.t, dist, note: "COLLISION DETECTED" };
    }

    // Force
    const forceMag = (s.G * s.m1 * s.m2) / (distSq + 0.001);
    const fx = forceMag * (dx / dist);
    const fy = forceMag * (dy / dist);

    // Acceleration
    const a1x = fx / s.m1;
    const a1y = fy / s.m1;
    const a2x = -fx / s.m2;
    const a2y = -fy / s.m2;

    // Integrate (semi-implicit Euler)
    s.v1.x += a1x * dt;
    s.v1.y += a1y * dt;
    s.v2.x += a2x * dt;
    s.v2.y += a2y * dt;

    s.p1.x += s.v1.x * dt;
    s.p1.y += s.v1.y * dt;
    s.p2.x += s.v2.x * dt;
    s.p2.y += s.v2.y * dt;

    // Derived
    const v1Mag = Math.sqrt(s.v1.x * s.v1.x + s.v1.y * s.v1.y);
    const v2Mag = Math.sqrt(s.v2.x * s.v2.x + s.v2.y * s.v2.y);
    const ke = 0.5 * s.m1 * v1Mag * v1Mag + 0.5 * s.m2 * v2Mag * v2Mag;

    // Momentum
    const p1Mag = s.m1 * v1Mag;
    const p2Mag = s.m2 * v2Mag;
    const pSysX = s.m1 * s.v1.x + s.m2 * s.v2.x;
    const pSysY = s.m1 * s.v1.y + s.m2 * s.v2.y;
    const pSysMag = Math.sqrt(pSysX * pSysX + pSysY * pSysY);

    // CM
    s.cm = computeCM(s);

    // Follow CM camera
    if (paramsRef.current.followCM) {
      camRef.current.x = s.cm.x;
      camRef.current.y = s.cm.y;
    }

    // Trails
    if (paramsRef.current.showTrail) {
      s.trail1.push({ x: s.p1.x, y: s.p1.y });
      s.trail2.push({ x: s.p2.x, y: s.p2.y });
      s.trailCM.push({ x: s.cm.x, y: s.cm.y });

      while (
        s.trail1.length > TRAIL_LENGTH ||
        s.trail2.length > TRAIL_LENGTH ||
        s.trailCM.length > TRAIL_LENGTH
      ) {
        if (s.trail1.length > TRAIL_LENGTH) s.trail1.shift();
        if (s.trail2.length > TRAIL_LENGTH) s.trail2.shift();
        if (s.trailCM.length > TRAIL_LENGTH) s.trailCM.shift();
      }
    }

    return {
      t: s.t,
      dist,
      v1: v1Mag,
      v2: v2Mag,
      p1: p1Mag,
      p2: p2Mag,
      pSys: pSysMag,
      ke,
      note:
        `${getRatioNote(s.m1, s.m2)} · Drag to pan, Wheel to zoom` +
        (paramsRef.current.followCM ? " · Following CM" : ""),
    };
  };

  // Helpers: world<->screen
  const worldToScreen = (wx, wy, cssW, cssH) => {
    const cam = camRef.current;
    const scale = PX_PER_METER * cam.zoom;
    const sx = cssW / 2 + (wx - cam.x) * scale;
    const sy = cssH / 2 - (wy - cam.y) * scale;
    return { x: sx, y: sy, scale };
  };

  const screenToWorld = (sx, sy, cssW, cssH) => {
    const cam = camRef.current;
    const scale = PX_PER_METER * cam.zoom;
    const wx = cam.x + (sx - cssW / 2) / scale;
    const wy = cam.y - (sy - cssH / 2) / scale;
    return { x: wx, y: wy, scale };
  };

  // Canvas rounded-rect fallback
  const roundRectPath = (ctx, x, y, w, h, r) => {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, rr);
      return;
    }
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  // --- Rendering ---
  const draw = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { ctx, cssW, cssH } = resizeCanvasToParentDPR(canvas);
      if (!ctx) return;

      const s = physRef.current;

      // If follow enabled and paused, still keep camera centered on CM
      if (paramsRef.current.followCM) {
        camRef.current.x = s.cm?.x ?? 0;
        camRef.current.y = s.cm?.y ?? 0;
      }

      // Background
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, cssW, cssH);

      // Grid aligned to world coordinates
      {
        const cam = camRef.current;
        const scale = PX_PER_METER * cam.zoom;

        const stepMeters = GRID_STEP / PX_PER_METER;
        const stepPx = stepMeters * scale;

        // Safety: avoid pathological small steps (too many lines)
        const safeStepPx = Math.max(6, stepPx);

        const originX = cssW / 2 + (0 - cam.x) * scale;
        const originY = cssH / 2 - (0 - cam.y) * scale;

        const mod = (a, n) => ((a % n) + n) % n;
        const startX = mod(originX, safeStepPx);
        const startY = mod(originY, safeStepPx);

        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = startX; x < cssW; x += safeStepPx) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cssH);
        }
        for (let y = startY; y < cssH; y += safeStepPx) {
          ctx.moveTo(0, y);
          ctx.lineTo(cssW, y);
        }
        ctx.stroke();

        // axes
        ctx.strokeStyle = "rgba(255,255,255,0.09)";
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, cssH);
        ctx.moveTo(0, originY);
        ctx.lineTo(cssW, originY);
        ctx.stroke();
      }

      // Trails
      if (paramsRef.current.showTrail) {
        ctx.lineWidth = 2;

        ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
        ctx.beginPath();
        s.trail1.forEach((pt, i) => {
          const p = worldToScreen(pt.x, pt.y, cssW, cssH);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        ctx.strokeStyle = "rgba(248, 113, 113, 0.35)";
        ctx.beginPath();
        s.trail2.forEach((pt, i) => {
          const p = worldToScreen(pt.x, pt.y, cssW, cssH);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        if (paramsRef.current.showCM) {
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "rgba(52, 211, 153, 0.90)";
          ctx.beginPath();
          s.trailCM.forEach((pt, i) => {
            const p = worldToScreen(pt.x, pt.y, cssW, cssH);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        }
      }

      // Bodies
      const drawBody = (pos, mass, color, label) => {
        const zoom = camRef.current.zoom;
        const p = worldToScreen(pos.x, pos.y, cssW, cssH);

        const base = Math.max(3, Math.min(40, Math.pow(mass, 0.4) * 2));
        const r = Math.max(2, base * zoom);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(label, p.x, p.y - r - 6);

        return { x: p.x, y: p.y, r };
      };

      const b1 = drawBody(s.p1, s.m1, "#22d3ee", "M1");
      const b2 = drawBody(s.p2, s.m2, "#f87171", "M2");

      // CM marker
      if (paramsRef.current.showCM) {
        const cm = s.cm ?? { x: 0, y: 0 };
        const p = worldToScreen(cm.x, cm.y, cssW, cssH);

        ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();

        ctx.save();
        ctx.translate(p.x, p.y);

        ctx.strokeStyle = "rgba(52, 211, 153, 0.98)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(52, 211, 153, 0.98)";
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(14, 0);
        ctx.moveTo(0, -14);
        ctx.lineTo(0, 14);
        ctx.stroke();

        ctx.font = "bold 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const text = "CM";
        const tx = 18;
        const ty = -18;

        const padX = 6;
        const textW = ctx.measureText(text).width;
        const boxW = textW + padX * 2;
        const boxH = 16;

        ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
        ctx.strokeStyle = "rgba(52, 211, 153, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRectPath(ctx, tx - padX, ty - boxH / 2, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(52, 211, 153, 1)";
        ctx.fillText(text, tx, ty);

        ctx.restore();
      }

      // Velocity vectors
      if (paramsRef.current.showVectors) {
        const vecPxPerMS = 8;
        const v1End = {
          x: b1.x + s.v1.x * vecPxPerMS,
          y: b1.y - s.v1.y * vecPxPerMS,
        };
        const v2End = {
          x: b2.x + s.v2.x * vecPxPerMS,
          y: b2.y - s.v2.y * vecPxPerMS,
        };

        ctx.lineWidth = 1.25;
        ctx.strokeStyle = "rgba(255,255,255,0.85)";

        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(v1End.x, v1End.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b2.x, b2.y);
        ctx.lineTo(v2End.x, v2End.y);
        ctx.stroke();
      }

      if (s.crashed) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("COLLISION", cssW / 2, 20);
      }
    } catch (err) {
      // اگر draw خطا بدهد (مثلاً roundRect یا موارد دیگر)، اجازه نمی‌دهیم کل صفحه از کار بیفتد
      // (لاگ فقط برای توسعه)
       
      console.error("Canvas draw error:", err);
    }
  };

  // --- Canvas Interaction: pan + zoom ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.touchAction = "none";

    const onPointerDown = (e) => {
      if (e.button != null && e.button !== 0) return;

      // اگر کاربر شروع به پان کرد، follow را خاموش کنیم تا کنترل دست کاربر باشد
      if (paramsRef.current.followCM) {
        setParams((prev) => ({ ...prev, followCM: false }));
      }

      panRef.current.active = true;
      panRef.current.startClientX = e.clientX;
      panRef.current.startClientY = e.clientY;
      panRef.current.startCamX = camRef.current.x;
      panRef.current.startCamY = camRef.current.y;

      try {
        canvas.setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove = (e) => {
      if (!panRef.current.active) return;

      const { cssW, cssH } = resizeCanvasToParentDPR(canvas);
      const scale = PX_PER_METER * camRef.current.zoom;

      const dx = e.clientX - panRef.current.startClientX;
      const dy = e.clientY - panRef.current.startClientY;

      camRef.current.x = panRef.current.startCamX - dx / scale;
      camRef.current.y = panRef.current.startCamY + dy / scale;

      // draw مستقیم (بدون setTimeout) تا صف ایجاد نشود
      draw();
    };

    const endPan = () => {
      panRef.current.active = false;
    };

    const onWheel = (e) => {
      e.preventDefault();

      const { cssW, cssH } = resizeCanvasToParentDPR(canvas);

      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      const cam = camRef.current;
      const oldZoom = cam.zoom;

      const zoomFactor = Math.exp(-e.deltaY * 0.001);
      const newZoom = clamp(oldZoom * zoomFactor, 0.15, 8);
      if (newZoom === oldZoom) return;

      const worldBefore = screenToWorld(sx, sy, cssW, cssH);
      cam.zoom = newZoom;
      const scaleNew = PX_PER_METER * cam.zoom;

      cam.x = worldBefore.x - (sx - cssW / 2) / scaleNew;
      cam.y = worldBefore.y + (sy - cssH / 2) / scaleNew;

      draw();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endPan);
    window.addEventListener("pointercancel", endPan);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPan);
      window.removeEventListener("pointercancel", endPan);
      canvas.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Loop Hook ---
  const { resetClock } = useSimLoop({
    running,
    maxDt: MAX_DT,
    step,
    draw,
    onFrame: (out, dt, didStep) => {
      if (!didStep || !out) return;

      // نگه‌داشتن آخرین خروجی برای HUD (بدون setState هر فریم)
      lastOutRef.current = out;

      // --- Chart sampling (physics-rate) ---
      const sampleEvery = 1 / chartCfg.sampleRate;
      sampleAccRef.current += dt;

      let pushed = false;
      while (sampleAccRef.current >= sampleEvery) {
        sampleAccRef.current -= sampleEvery;
        pushCapped(
          samplesRef.current,
          {
            t: out.t,
            v1: out.v1,
            v2: out.v2,
            dist: out.dist,
            ke: out.ke,
          },
          chartCfg.maxPoints
        );
        pushed = true;
      }

      // --- Throttle HUD updates ---
      hudAccRef.current += dt;
      const hudEvery = 1 / HUD_HZ;
      if (hudAccRef.current >= hudEvery) {
        hudAccRef.current = 0;
        const o = lastOutRef.current;
        if (o) {
          setHud({
            t: o.t,
            dist: o.dist,
            v1: o.v1,
            v2: o.v2,
            p1: o.p1,
            p2: o.p2,
            pSys: o.pSys,
            ke: o.ke,
            note: o.note,
          });
        }
      }

      // --- Throttle chart React state updates (avoid heavy re-render) ---
      chartUiAccRef.current += dt;
      const chartUiEvery = 1 / CHART_UI_HZ;
      if (pushed && chartUiAccRef.current >= chartUiEvery) {
        chartUiAccRef.current = 0;
        setChartData([...samplesRef.current]);
      }
    },
  });

  const onStartStop = () => {
    if (!running && physRef.current.crashed) {
      initSimulation();
      resetClock();
    }
    setRunning((r) => !r);
    resetClock();
  };

  const onReset = () => {
    setRunning(false);
    initSimulation();
    resetClock();
    draw(); // بدون setTimeout
  };

  const setParam = (k, v) => {
    setParams((prev) => ({ ...prev, [k]: v }));
  };

  // Re-init when params change (only when paused) to show immediate updates
  useEffect(() => {
    if (!running) {
      initSimulation();
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, running]);

  useEffect(() => {
    initSimulation();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SimulationShell
      title="Two-Body Gravity"
      subtitle="Newtonian Mechanics"
      topOffset="5px"
      panelTop={
        <div className="w-full">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onStartStop}
              className={`w-full py-3 rounded-xl font-black tracking-wide transition-all border ${
                running
                  ? "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/20"
                  : "bg-emerald-500/15 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/20"
              }`}
            >
              {running ? "STOP" : "START"}
            </button>

            <button
              onClick={onReset}
              className="w-full py-3 rounded-xl font-black tracking-wide bg-white/8 text-white border border-white/12 hover:bg-white/12 transition-all"
            >
              RESET
            </button>
          </div>
        </div>
      }
      panel={
        <div className="space-y-4">
          <Controls params={params} setParam={setParam} />
          <HUD hud={hud} />
          <Charts data={chartData} />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/60 text-sm">
            <div className="font-bold text-white/80 mb-2">راهنما</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>روی Canvas با Drag پان کنید و با Wheel زوم کنید.</li>
              <li>برای دنبال کردن سیستم، گزینه Follow CM را روشن کنید.</li>
              <li>
                اگر باز هم لگ دیدید، Trail را خاموش کنید (Trail رندر را سنگین‌تر
                می‌کند).
              </li>
            </ul>
          </div>
        </div>
      }
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </SimulationShell>
  );
}
