// src/simulations/subjects/physics/waves/surface-waves-double-slit/SurfaceWavesDoubleSlit.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Box, Paper, Typography } from "@mui/material";
import SimulationControls from "@/components/shared/SimulationControls.jsx";
import {
  createWaveState,
  clearWave,
  buildDoubleSlitObstacle,
  zeroInsideObstacles,
  injectPulse,
  stepWave,
} from "./surfaceWaves.physics";
import { renderWaveToImageData } from "./waveRender";

function ControlPanel({ params, setParams }) {
  // Minimal panel (you can replace with your nicer accordion panel)
  const update = (patch) => setParams((p) => ({ ...p, ...patch }));

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 4,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        color: "white",
        height: "100%",
        overflow: "auto",
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Surface Waves + Double-Slit
      </Typography>

      <Box sx={{ opacity: 0.9, fontSize: 13, mb: 1 }}>
        <b>Wave Source</b>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <button
          onClick={() => update({ sourceMode: "continuous" })}
          style={chip(params.sourceMode === "continuous")}
        >
          Continuous
        </button>
        <button
          onClick={() => update({ sourceMode: "click" })}
          style={chip(params.sourceMode === "click")}
        >
          Click Pulse
        </button>
        <button
          onClick={() => update({ sourceShape: "point" })}
          style={chip(params.sourceShape === "point")}
        >
          Point
        </button>
        <button
          onClick={() => update({ sourceShape: "plane" })}
          style={chip(params.sourceShape === "plane")}
        >
          Plane
        </button>
      </Box>

      <SliderRow
        label="Amplitude"
        value={params.amplitude}
        min={0.1}
        max={5}
        step={0.05}
        onChange={(v) => update({ amplitude: v })}
      />
      <SliderRow
        label="Frequency (Hz)"
        value={params.frequency}
        min={0.2}
        max={5}
        step={0.05}
        onChange={(v) => update({ frequency: v })}
      />
      <SliderRow
        label="Wave speed"
        value={params.waveSpeed}
        min={2}
        max={25}
        step={0.5}
        onChange={(v) => update({ waveSpeed: v })}
      />
      <SliderRow
        label="Damping"
        value={params.damping}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => update({ damping: v })}
      />

      <Box sx={{ mt: 3, opacity: 0.9, fontSize: 13, mb: 1 }}>
        <b>Double-Slit Barrier</b>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <button
          onClick={() => update({ barrierEnabled: !params.barrierEnabled })}
          style={chip(params.barrierEnabled)}
        >
          {params.barrierEnabled ? "Enabled" : "Disabled"}
        </button>
      </Box>

      <SliderRow
        label="Wall X"
        value={params.wallX}
        min={40}
        max={260}
        step={1}
        onChange={(v) => update({ wallX: v })}
      />
      <SliderRow
        label="Thickness"
        value={params.thickness}
        min={1}
        max={6}
        step={1}
        onChange={(v) => update({ thickness: v })}
      />
      <SliderRow
        label="Slit size"
        value={params.slitSize}
        min={4}
        max={30}
        step={1}
        onChange={(v) => update({ slitSize: v })}
      />
      <SliderRow
        label="Slit separation"
        value={params.slitSeparation}
        min={6}
        max={60}
        step={1}
        onChange={(v) => update({ slitSeparation: v })}
      />

      <Box sx={{ mt: 2, opacity: 0.7, fontSize: 12, lineHeight: 1.5 }}>
        Tip: In <b>Plane</b> mode you get parallel wavefronts (like a ripple
        tank wave generator). In <b>Click Pulse</b> mode, click on the canvas to
        inject a pulse.
      </Box>
    </Paper>
  );
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <Box sx={{ mb: 1.6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.7 }}>
        <span style={{ opacity: 0.85 }}>{label}</span>
        <span style={{ opacity: 0.9, fontFamily: "monospace" }}>
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
      </Box>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </Box>
  );
}

function chip(active) {
  return {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(78,205,196,0.25)" : "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
  };
}

export default function SurfaceWavesDoubleSlit() {
  // Simulation grid resolution (smaller grid -> faster + pixelated look)
  const SIM_W = 300;
  const SIM_H = 180;

  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  const [isSimulating, setIsSimulating] = useState(true);

  const [params, setParams] = useState({
    // source
    sourceMode: "continuous", // "continuous" | "click"
    sourceShape: "plane", // "plane" | "point"
    sourceX: 10,
    sourceY: Math.floor(SIM_H / 2),

    amplitude: 2.0,
    frequency: 1.2,
    waveSpeed: 12.0,
    damping: 0.15,

    // barrier
    barrierEnabled: true,
    wallX: Math.floor(SIM_W / 2),
    thickness: 2,
    slitSize: 10,
    slitSeparation: 26,

    // render
    colorScale: 6.0,
  });

  const stateRef = useRef(null);

  // init engine + offscreen
  useEffect(() => {
    stateRef.current = createWaveState(SIM_W, SIM_H);

    const off = document.createElement("canvas");
    off.width = SIM_W;
    off.height = SIM_H;
    offscreenRef.current = off;

    const offCtx = off.getContext("2d", { alpha: false });
    imgRef.current = offCtx.createImageData(SIM_W, SIM_H);

    // build initial obstacles
    buildDoubleSlitObstacle(stateRef.current.obstacles, SIM_W, SIM_H, {
      enabled: params.barrierEnabled,
      wallX: params.wallX,
      thickness: params.thickness,
      slitSize: params.slitSize,
      slitSeparation: params.slitSeparation,
    });
    zeroInsideObstacles(stateRef.current);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply barrier changes LIVE (no reset required)
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;

    buildDoubleSlitObstacle(st.obstacles, SIM_W, SIM_H, {
      enabled: params.barrierEnabled,
      wallX: params.wallX,
      thickness: params.thickness,
      slitSize: params.slitSize,
      slitSeparation: params.slitSeparation,
    });
    zeroInsideObstacles(st);
    // Optional: clear field when geometry changes (cleaner visuals)
    clearWave(st);
  }, [
    params.barrierEnabled,
    params.wallX,
    params.thickness,
    params.slitSize,
    params.slitSeparation,
  ]);

  const handleStart = () => {
    setIsSimulating(true);
    lastRef.current = performance.now();
  };
  const handlePause = () => setIsSimulating(false);

  const handleReset = () => {
    const st = stateRef.current;
    if (!st) return;
    clearWave(st);
    lastRef.current = performance.now();
    setIsSimulating(true);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const off = offscreenRef.current;
    const img = imgRef.current;
    const st = stateRef.current;
    if (!canvas || !off || !img || !st) return;

    const ctx = canvas.getContext("2d");
    const offCtx = off.getContext("2d", { alpha: false });

    // physics step
    const now = performance.now();
    const dt = Math.min((now - (lastRef.current || now)) / 1000, 1 / 30);
    lastRef.current = now;

    if (isSimulating) {
      stepWave(st, { ...params, dx: 1 }, dt);
    }

    // render to offscreen image
    renderWaveToImageData(st, img, { colorScale: params.colorScale });
    offCtx.putImageData(img, 0, 0);

    // draw scaled to visible canvas
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

    // overlay (source marker)
    const sx = params.sourceShape === "plane" ? params.sourceX : params.sourceX;
    const sy = params.sourceY;
    const x = (sx / SIM_W) * canvas.width;
    const y = (sy / SIM_H) * canvas.height;

    ctx.fillStyle = "rgba(255,80,80,0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [isSimulating, params]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const onCanvasClick = (e) => {
    if (params.sourceMode !== "click") return;

    const canvas = canvasRef.current;
    const st = stateRef.current;
    if (!canvas || !st) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = Math.floor((px / rect.width) * SIM_W);
    const y = Math.floor((py / rect.height) * SIM_H);

    injectPulse(st, x, y, params.amplitude * 10, 10);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
        {/* Left */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <SimulationControls
            isSimulating={isSimulating}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
          />

          <Paper
            sx={{
              flex: 1,
              borderRadius: 4,
              overflow: "hidden",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <canvas
              ref={canvasRef}
              width={980}
              height={520}
              onClick={onCanvasClick}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                cursor: params.sourceMode === "click" ? "crosshair" : "default",
              }}
            />
          </Paper>

          <Box sx={{ opacity: 0.7, fontSize: 12, pl: 1 }}>
            Tip: Use <b>Plane</b> source + enable barrier to see diffraction and
            interference fringes.
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ width: 360, minWidth: 320 }}>
          <ControlPanel params={params} setParams={setParams} />
        </Box>
      </Box>
    </Box>
  );
}
