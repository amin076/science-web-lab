import React, { useEffect, useRef, useState, useCallback } from "react";

import SurfaceWavesControlPanel from "./SurfaceWavesDoubleSlitControlPanel";

import {
  createWaveState,
  clearWave,
  buildDoubleSlitObstacle,
  zeroInsideObstacles,
  injectPulse,
  stepWave,
  buildDampingMap,
} from "./surfaceWaves.physics";
import { renderWaveToImageData } from "./waveRender";

export default function SurfaceWavesDoubleSlit() {
  // Resolution
  const SIM_W = 400;
  const SIM_H = 240;

  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const stateRef = useRef(null);

  const [isSimulating, setIsSimulating] = useState(true);

  // --- State for Controls ---
  const [sourceMode, setSourceMode] = useState("continuous");
  const [amplitude, setAmplitude] = useState(1.5);
  const [frequency, setFrequency] = useState(1.5);
  const [waveSpeed, setWaveSpeed] = useState(12.0);
  const [damping, setDamping] = useState(0.015);

  const [barrierEnabled, setBarrierEnabled] = useState(true);
  const [barrierX01, setBarrierX01] = useState(0.5);
  const [barrierThickness, setBarrierThickness] = useState(3);
  const [slitGap, setSlitGap] = useState(30);
  const [slitWidth, setSlitWidth] = useState(8);

  const getPhysicsParams = useCallback(
    () => ({
      sourceMode,
      sourceShape: "plane",
      sourceX: 15,
      sourceY: SIM_H / 2,
      amplitude,
      frequency,
      waveSpeed,
      damping,
      wallX: Math.floor(barrierX01 * SIM_W),
      thickness: barrierThickness,
      slitSeparation: slitGap,
      slitSize: slitWidth,
      enabled: barrierEnabled,
    }),
    [
      sourceMode,
      amplitude,
      frequency,
      waveSpeed,
      damping,
      barrierEnabled,
      barrierX01,
      barrierThickness,
      slitGap,
      slitWidth,
    ]
  );

  // Init
  useEffect(() => {
    stateRef.current = createWaveState(SIM_W, SIM_H);
    buildDampingMap(stateRef.current);

    const off = document.createElement("canvas");
    off.width = SIM_W;
    off.height = SIM_H;
    offscreenRef.current = off;

    const offCtx = off.getContext("2d", { alpha: false });
    imgRef.current = offCtx.createImageData(SIM_W, SIM_H);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Update Geometry
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const p = getPhysicsParams();
    buildDoubleSlitObstacle(st.obstacles, SIM_W, SIM_H, {
      enabled: p.enabled,
      wallX: p.wallX,
      thickness: p.thickness,
      slitSize: p.slitSize,
      slitSeparation: p.slitSeparation,
    });
    zeroInsideObstacles(st);
  }, [getPhysicsParams]);

  const handleReset = () => {
    const st = stateRef.current;
    if (st) clearWave(st);
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

    const now = performance.now();
    const dt = Math.min((now - (lastRef.current || now)) / 1000, 0.05);
    lastRef.current = now;

    if (isSimulating) {
      stepWave(st, getPhysicsParams(), dt);
    }

    renderWaveToImageData(st, img, { colorScale: 3.5 });
    offCtx.putImageData(img, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [isSimulating, getPhysicsParams]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const onCanvasClick = (e) => {
    if (sourceMode !== "click") return;
    const canvas = canvasRef.current;
    const st = stateRef.current;
    if (!canvas || !st) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * SIM_W);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * SIM_H);
    injectPulse(st, x, y, amplitude * 5, 8);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-black text-white">
      {/* Simulation Viewport (Fills remaining space) */}
      <div className="relative flex-1 bg-[#050505] shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onClick={onCanvasClick}
          className={`h-full w-full object-contain ${
            sourceMode === "click" ? "cursor-crosshair" : "cursor-default"
          }`}
        />

        {/* Subtle grid info overlay */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-[10px] font-mono text-white/30 backdrop-blur-sm">
          {SIM_W}x{SIM_H} FDTD
        </div>
      </div>

      {/* Side Panel (Fixed Width) */}
      <div className="w-[320px] border-l border-white/10">
        <SurfaceWavesControlPanel
          // Pass playback props
          isSimulating={isSimulating}
          onToggle={() => setIsSimulating(!isSimulating)}
          onReset={handleReset}
          // Pass Settings props
          sourceMode={sourceMode}
          setSourceMode={setSourceMode}
          amplitude={amplitude}
          setAmplitude={setAmplitude}
          frequency={frequency}
          setFrequency={setFrequency}
          waveSpeed={waveSpeed}
          setWaveSpeed={setWaveSpeed}
          damping={damping}
          setDamping={setDamping}
          barrierEnabled={barrierEnabled}
          setBarrierEnabled={setBarrierEnabled}
          barrierX01={barrierX01}
          setBarrierX01={setBarrierX01}
          barrierThickness={barrierThickness}
          setBarrierThickness={setBarrierThickness}
          slitGap={slitGap}
          setSlitGap={setSlitGap}
          slitWidth={slitWidth}
          setSlitWidth={setSlitWidth}
        />
      </div>
    </div>
  );
}
