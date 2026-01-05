// src/simulations/subjects/physics/waves/multi-source-interference/MultiWaveSimulation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import MultiWaveControls from "./MultiWaveControls";

// Import physics core from previous simulation
import {
  createWaveState,
  clearWave,
  stepWave,
  buildDampingMap,
} from "../surface-waves-double-slit/surfaceWaves.physics";
import { renderWaveToImageData } from "../surface-waves-double-slit/waveRender";
import { applyMultiSources } from "./MultiWavePhysics";

export default function MultiWaveSimulation() {
  // --- Constants ---
  const SIM_W = 400; // Physics resolution
  const SIM_H = 240;

  // --- Refs ---
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const stateRef = useRef(null);
  const containerRef = useRef(null);

  // --- State ---
  const [isSimulating, setIsSimulating] = useState(true);

  // Medium Properties (Shared)
  const [medium, setMedium] = useState({
    waveSpeed: 15.0,
    damping: 0.015,
  });

  // Sources Array
  const [sources, setSources] = useState([
    { id: 1, x: 0.35, y: 0.5, frequency: 1.5, amplitude: 2.0, active: true },
    { id: 2, x: 0.65, y: 0.5, frequency: 1.5, amplitude: 2.0, active: true },
  ]);

  // Dragging Logic
  const [draggingId, setDraggingId] = useState(null);

  // --- Initialization ---
  useEffect(() => {
    stateRef.current = createWaveState(SIM_W, SIM_H);
    // Add sponge layer to edges
    buildDampingMap(stateRef.current);

    // Setup offscreen canvas for rendering physics texture
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

  const handleReset = () => {
    const st = stateRef.current;
    if (st) clearWave(st);
    setIsSimulating(true);
  };

  // --- Main Loop ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const off = offscreenRef.current;
    const img = imgRef.current;
    const st = stateRef.current;

    if (!canvas || !off || !img || !st) return;

    const ctx = canvas.getContext("2d");
    const offCtx = off.getContext("2d", { alpha: false });

    // Time step
    const now = performance.now();
    const dt = Math.min((now - (lastRef.current || now)) / 1000, 0.05);
    lastRef.current = now;

    if (isSimulating) {
      // 1. Step Wave Equation (Environment)
      // We pass sourceMode: "none" to stepWave because we handle sources manually below
      stepWave(st, { ...medium, sourceMode: "none" }, dt);

      // 2. Inject Multiple Sources
      applyMultiSources(st, sources, dt);
    }

    // 3. Render Physics to Image
    renderWaveToImageData(st, img, { colorScale: 3.5 });
    offCtx.putImageData(img, 0, 0);

    // 4. Draw Scaled to Screen
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (wave simulation)
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

    // 5. Draw Overlays (Source Handles)
    // Center point (0,0) is visually the middle of the screen
    drawOverlays(ctx, canvas.width, canvas.height);

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [isSimulating, medium, sources]);

  // Helper to draw UI on top of canvas
  const drawOverlays = (ctx, w, h) => {
    // Coordinate System Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h); // Y-axis
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2); // X-axis
    ctx.stroke();

    // Draw Source Handles
    sources.forEach((source, i) => {
      const sx = source.x * w;
      const sy = source.y * h;
      const color = `hsl(${i * 60 + 180}, 70%, 60%)`;

      // Glow
      const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, 15);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 15, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ring if dragging
      if (source.id === draggingId) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // --- Interaction Handlers ---
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Check hit on existing sources
    // Hit radius approx 30px normalized
    const HIT_RADIUS = 30 / rect.width;

    const hit = sources.find((s) => {
      const dx = s.x - x;
      const dy = s.y - y; // aspect ratio correction omitted for simplicity interaction
      return dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS;
    });

    if (hit) {
      setDraggingId(hit.id);
    }
  };

  const handlePointerMove = (e) => {
    if (draggingId === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(
      0.05,
      Math.min(0.95, (e.clientX - rect.left) / rect.width)
    );
    const y = Math.max(
      0.05,
      Math.min(0.95, (e.clientY - rect.top) / rect.height)
    );

    setSources((prev) =>
      prev.map((s) => (s.id === draggingId ? { ...s, x, y } : s))
    );
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-black text-white">
      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-[#050505] cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={800} // High res render buffer
          height={480}
          className="h-full w-full object-contain block"
        />

        {/* Helper Text Overlay */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white/50 backdrop-blur-md">
          Drag dots to move sources • Center is (0,0)
        </div>
      </div>

      {/* Sidebar Controls */}
      <MultiWaveControls
        sources={sources}
        setSources={setSources}
        medium={medium}
        setMedium={setMedium}
        isSimulating={isSimulating}
        onToggle={() => setIsSimulating(!isSimulating)}
        onReset={handleReset}
      />
    </div>
  );
}
