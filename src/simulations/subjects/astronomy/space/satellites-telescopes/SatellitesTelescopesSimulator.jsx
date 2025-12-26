import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import SatellitesTelescopesControlPanel from "./SatellitesTelescopesControlPanel.jsx";
import {
  EARTH,
  groundTelescopeECI,
  isVisibleFromGround,
  makeCircularOrbit,
  rk4Step,
} from "./satellites.physics.js";

/* ======================================================
   ISS MODEL (screen-space, non-spherical)
====================================================== */
function drawISS(ctx, x, y, vel) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(vel.y, vel.x));

  // screen-space size (always readable)
  const S = 1;

  ctx.scale(S, S);

  // solar arrays
  ctx.fillStyle = "#0b3d91";
  ctx.fillRect(-28, -10, 18, 5);
  ctx.fillRect(-28, 5, 18, 5);
  ctx.fillRect(10, -10, 18, 5);
  ctx.fillRect(10, 5, 18, 5);

  // truss
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(-10, -2, 20, 4);

  // modules
  ctx.fillStyle = "#eeeeee";
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(7, 0, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // antenna
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-3, -3);
  ctx.lineTo(-8, -10);
  ctx.stroke();

  ctx.restore();
}

/* ======================================================
   Resize Hook
====================================================== */
function useResizeObserver(ref) {
  const [size, setSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({
        w: Math.max(1, e.contentRect.width),
        h: Math.max(1, e.contentRect.height),
      });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

/* ======================================================
   MAIN COMPONENT (REWRITE)
====================================================== */
export default function SatellitesTelescopesSimulator() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const { w: stageW, h: stageH } = useResizeObserver(stageRef);

  /* ---------- UI state ---------- */
  const [running, setRunning] = useState(true);
  const [uiTime, setUiTime] = useState(0);

  const [settings, setSettings] = useState({
    timeScale: 200,
    dt: 1,
    showTrails: true,
    showVectors: true,
    showLOS: true,
  });

  /* ---------- Simulation state (NO React rerenders) ---------- */
  const sim = useRef({
    t: 0,
    objects: [],
  });

  const accRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef(null);

  /* ---------- init ---------- */
  useEffect(() => {
    sim.current.objects = [
      {
        id: "ISS",
        type: "ISS",
        name: "International Space Station",
        color: "#ffffff",
        state: makeCircularOrbit(408, 0),
        trail: [],
      },
    ];
  }, []);

  /* ---------- view ---------- */
  const view = useMemo(() => {
    const min = Math.min(stageW, stageH);
    const earthPx = min * 0.28;
    return {
      cx: stageW / 2,
      cy: stageH / 2,
      earthPx,
      kmToPx: earthPx / EARTH.radiusKm,
    };
  }, [stageW, stageH]);

  /* ---------- RESET (bulletproof) ---------- */
  const reset = () => {
    setRunning(false);

    sim.current.t = 0;
    sim.current.objects.length = 0;
    accRef.current = 0;
    lastRef.current = performance.now();

    sim.current.objects.push({
      id: "ISS",
      type: "ISS",
      name: "International Space Station",
      color: "#ffffff",
      state: makeCircularOrbit(408, 0),
      trail: [],
    });

    setUiTime(0);
    requestAnimationFrame(() => setRunning(true));
  };

  /* ---------- Presets ---------- */
  const addPreset = (preset) => {
    if (preset === "ISS") {
      sim.current.objects.push({
        id: "ISS-" + Math.random(),
        type: "ISS",
        name: "ISS",
        color: "#ffffff",
        state: makeCircularOrbit(408, Math.random() * 360),
        trail: [],
      });
    }
  };

  /* ======================================================
     Animation Loop
  ===================================================== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = () => {
      canvas.width = stageW;
      canvas.height = stageH;

      // background
      ctx.fillStyle = "#070812";
      ctx.fillRect(0, 0, stageW, stageH);

      // Earth
      ctx.beginPath();
      ctx.arc(view.cx, view.cy, view.earthPx, 0, Math.PI * 2);
      ctx.fillStyle = "#0b2a5a";
      ctx.fill();

      // ground station
      const site = groundTelescopeECI(sim.current.t, 0);
      const sitePx = {
        x: view.cx + site.pos.x * view.kmToPx,
        y: view.cy + site.pos.y * view.kmToPx,
      };

      ctx.fillStyle = "#ffeb3b";
      ctx.beginPath();
      ctx.arc(sitePx.x, sitePx.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // objects
      sim.current.objects.forEach((o) => {
        const px = {
          x: view.cx + o.state.pos.x * view.kmToPx,
          y: view.cy + o.state.pos.y * view.kmToPx,
        };

        // trails
        if (settings.showTrails && o.trail.length > 1) {
          ctx.strokeStyle = o.color;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          o.trail.forEach((p, i) => {
            const tx = view.cx + p.x * view.kmToPx;
            const ty = view.cy + p.y * view.kmToPx;
            i === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
          });
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // ISS render
        if (o.type === "ISS") {
          drawISS(ctx, px.x, px.y, o.state.vel);
        }

        // LOS
        if (settings.showLOS) {
          ctx.strokeStyle = isVisibleFromGround(site, o.state.pos)
            ? "rgba(0,255,120,0.4)"
            : "rgba(255,60,60,0.25)";
          ctx.beginPath();
          ctx.moveTo(sitePx.x, sitePx.y);
          ctx.lineTo(px.x, px.y);
          ctx.stroke();
        }
      });
    };

    const tick = (now) => {
      const dtReal = (now - lastRef.current) / 1000;
      lastRef.current = now;

      if (running) {
        accRef.current += dtReal * settings.timeScale;
        while (accRef.current >= settings.dt) {
          accRef.current -= settings.dt;
          sim.current.t += settings.dt;

          sim.current.objects.forEach((o) => {
            const ns = rk4Step(o.state, settings.dt);
            if (settings.showTrails) {
              o.trail.push({ x: ns.pos.x, y: ns.pos.y });
              if (o.trail.length > 2000) o.trail.shift();
            } else {
              o.trail.length = 0;
            }
            o.state = ns;
          });
        }
        setUiTime(sim.current.t);
      }

      render();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, settings, stageW, stageH, view]);

  /* ======================================================
     UI
  ===================================================== */
  return (
    <Box sx={{ position: "absolute", inset: 0, display: "flex", gap: 2, p: 2 }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Button onClick={reset} variant="contained" color="error">
            Reset
          </Button>
          <Chip sx={{ ml: 2 }} label={running ? "Running" : "Paused"} />
          <Typography sx={{ ml: 2, display: "inline" }}>
            t = {uiTime.toFixed(1)} s
          </Typography>
        </Paper>

        <Box ref={stageRef} sx={{ flex: 1 }}>
          <canvas ref={canvasRef} />
        </Box>
      </Box>

      <Box sx={{ width: 380 }}>
        <SatellitesTelescopesControlPanel
          settings={settings}
          setSettings={setSettings}
          onAddPreset={addPreset}
        />
      </Box>
    </Box>
  );
}
