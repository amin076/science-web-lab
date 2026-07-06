// src/simulations/subjects/physics/waves/multi-source-interference/MultiWaveSimulation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";
import MultiWaveControls from "./MultiWaveControls";

// Import physics core from previous simulation
import {
  createWaveState,
  clearWave,
  stepWave,
  buildDampingMap,
} from "../surface-waves-double-slit/surfaceWaves.physics";
import { renderWaveToImageData } from "../surface-waves-double-slit/waveRender";
import {
  applyMultiSources,
  getAnimatedSources,
  sourceWithMotionDefaults,
} from "./MultiWavePhysics";
import {
  drawWaterSurfaceOverlays,
  renderWaterSurfaceToImageData,
} from "./MultiWaveWaterRender";

const SIM_W = 800;
const SIM_H = 450;
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const SIMULATION_DT = 1 / 60;
const MAX_ACCUMULATED_DT = 0.1;

const CAPTURE_GUIDES = {
  landscape: {
    label: "16:9 YouTube",
    crop: { x: 0, y: 0, width: 1, height: 1 },
  },
  shorts: {
    label: "9:16 Shorts",
    crop: { x: 0.33125, y: 0, width: 0.3375, height: 1 },
  },
};

function CaptureGuide({ mode, bounds, isRecording }) {
  const guide = CAPTURE_GUIDES[mode];

  if (!guide || !bounds) return null;

  const style = {
    left: bounds.left + guide.crop.x * bounds.width,
    top: bounds.top + guide.crop.y * bounds.height,
    width: guide.crop.width * bounds.width,
    height: guide.crop.height * bounds.height,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        style={style}
        className="absolute border border-cyan-200/80 shadow-[0_0_24px_rgba(34,211,238,0.28),inset_0_0_24px_rgba(34,211,238,0.08)]"
      >
        <div className="absolute left-12 top-2 rounded bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100 backdrop-blur-md">
          {isRecording ? "Recording" : "Capture Area"} {guide.label}
        </div>
      </div>
    </div>
  );
}

export default function MultiWaveSimulation() {
  // --- Refs ---
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const elapsedRef = useRef(0);
  const simAccumulatorRef = useRef(0);
  const stateRef = useRef(null);
  const containerRef = useRef(null);
  const landscapeRecorderRef = useRef(null);
  const shortsRecorderRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  // --- State ---
  const [isSimulating, setIsSimulating] = useState(true);
  const [renderMode, setRenderMode] = useState("pattern");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(60);
  const [recordingFps, setRecordingFps] = useState(30);
  const [recordingDirectory, setRecordingDirectory] = useState(null);
  const [recordingDirectoryName, setRecordingDirectoryName] = useState("");
  const [captureGuide, setCaptureGuide] = useState("landscape");
  const [canvasBounds, setCanvasBounds] = useState(null);
  const [waterStyle, setWaterStyle] = useState({
    preset: "deep-cinema",
    bloom: 1.2,
    depth: 1,
    contrast: 1.1,
    caustics: 0.35,
    causticStyle: "silk",
    colorShift: 0.25,
    orbGlow: 1.1,
    highlightSoftness: 0.55,
    surfaceDetail: 0.5,
    lightAngle: 0.4,
    backgroundGlow: 0.3,
  });

  // Medium Properties (Shared)
  const [medium, setMedium] = useState({
    waveSpeed: 15.0,
    damping: 0.015,
  });

  // Sources Array
  const [sources, setSources] = useState([
    sourceWithMotionDefaults({
      id: 1,
      x: 0.35,
      y: 0.5,
      frequency: 1.5,
      amplitude: 2.0,
      active: true,
      motion: "circle",
      motionSpeed: 0.14,
      motionRadius: 0.13,
    }),
    sourceWithMotionDefaults({
      id: 2,
      x: 0.65,
      y: 0.5,
      frequency: 1.5,
      amplitude: 2.0,
      active: true,
      motion: "ellipse",
      motionSpeed: 0.12,
      motionRadius: 0.13,
      phase: Math.PI,
    }),
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
    elapsedRef.current = 0;
    simAccumulatorRef.current = 0;
    setIsSimulating(true);
  };

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearRecordingTimer();
    landscapeRecorderRef.current?.stopRecording?.();
    shortsRecorderRef.current?.stopRecording?.();
  }, [clearRecordingTimer]);

  const startRecording = useCallback(
    (mode) => {
      if (isRecording) return;

      setCaptureGuide(mode);

      const recorder =
        mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
      const started = recorder?.startRecording?.();

      if (!started) return;

      const durationMs = Math.max(0, recordingSeconds) * 1000;
      if (durationMs > 0) {
        clearRecordingTimer();
        recordingTimeoutRef.current = window.setTimeout(() => {
          recorder?.stopRecording?.();
          recordingTimeoutRef.current = null;
        }, durationMs);
      }
    },
    [clearRecordingTimer, isRecording, recordingSeconds],
  );

  const chooseRecordingFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      alert(
        "This browser does not support direct folder saving. Files will download normally.",
      );
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
      const permission = await directoryHandle.requestPermission?.({
        mode: "readwrite",
      });

      if (permission && permission !== "granted") {
        alert("Folder write permission was not granted.");
        return;
      }

      setRecordingDirectory(directoryHandle);
      setRecordingDirectoryName(directoryHandle.name);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Could not choose recording folder.", error);
        alert("Could not choose recording folder. Files will download normally.");
      }
    }
  }, []);

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
    const dt = Math.min(
      (now - (lastRef.current || now)) / 1000,
      MAX_ACCUMULATED_DT,
    );
    lastRef.current = now;

    if (isSimulating) {
      simAccumulatorRef.current = Math.min(
        simAccumulatorRef.current + dt,
        MAX_ACCUMULATED_DT,
      );

      const maxStepsPerFrame = renderMode === "water" ? 2 : 6;
      let stepsThisFrame = 0;

      while (
        simAccumulatorRef.current >= SIMULATION_DT &&
        stepsThisFrame < maxStepsPerFrame
      ) {
        elapsedRef.current += SIMULATION_DT;
        const stepSources = getAnimatedSources(sources, elapsedRef.current);

        // We pass sourceMode: "none" to stepWave because sources are handled here.
        stepWave(st, { ...medium, sourceMode: "none" }, SIMULATION_DT);
        applyMultiSources(st, stepSources, SIMULATION_DT);

        simAccumulatorRef.current -= SIMULATION_DT;
        stepsThisFrame += 1;
      }

      if (renderMode === "water" && stepsThisFrame >= maxStepsPerFrame) {
        simAccumulatorRef.current = 0;
      }
    }

    const animatedSources = getAnimatedSources(sources, elapsedRef.current);

    // 3. Render Physics to Image
    if (renderMode === "water") {
      renderWaterSurfaceToImageData(st, img, {
        heightScale: 1.35,
        rippleStrength: 0.14,
        artStyle: waterStyle,
      });
    } else {
      renderWaveToImageData(st, img, { colorScale: 3.5 });
    }
    offCtx.putImageData(img, 0, 0);

    // 4. Draw Scaled to Screen
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (wave simulation)
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);

    // 5. Draw Overlays (Source Handles)
    // Center point (0,0) is visually the middle of the screen
    drawOverlays(ctx, canvas.width, canvas.height, animatedSources);

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [isSimulating, medium, renderMode, sources, draggingId, waterStyle]);

  // Helper to draw UI on top of canvas
  const drawOverlays = (ctx, w, h, visibleSources) => {
    if (renderMode === "water") {
      drawWaterSurfaceOverlays(
        ctx,
        w,
        h,
        visibleSources,
        draggingId,
        waterStyle,
      );
      return;
    }

    // Draw Source Handles
    visibleSources.forEach((source, i) => {
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

  useEffect(() => {
    return () => clearRecordingTimer();
  }, [clearRecordingTimer]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const sourceRatio = CANVAS_W / CANVAS_H;
      const containerRatio = rect.width / Math.max(1, rect.height);
      let width = rect.width;
      let height = rect.height;
      let left = 0;
      let top = 0;

      if (containerRatio > sourceRatio) {
        height = rect.height;
        width = height * sourceRatio;
        left = (rect.width - width) / 2;
      } else {
        width = rect.width;
        height = width / sourceRatio;
        top = (rect.height - height) / 2;
      }

      setCanvasBounds({ left, top, width, height });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // --- Interaction Handlers ---
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Check hit on existing sources
    // Hit radius approx 30px normalized
    const HIT_RADIUS = 30 / rect.width;
    const animatedSources = getAnimatedSources(sources, elapsedRef.current);

    const hit = animatedSources.find((s) => {
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
      prev.map((s) =>
        s.id === draggingId ? { ...s, x, y, motion: "static" } : s
      )
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
          id="multi-wave-recording-canvas"
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="h-full w-full object-contain block"
        />

        <VideoRecorderControls
          ref={landscapeRecorderRef}
          canvasSelector="#multi-wave-recording-canvas"
          outputMode="landscape"
          fileName={`esbiko-water-engine-landscape-${Date.now()}.webm`}
          fps={recordingFps}
          videoBitsPerSecond={90000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
        />
        <VideoRecorderControls
          ref={shortsRecorderRef}
          canvasSelector="#multi-wave-recording-canvas"
          outputMode="shorts"
          fileName={`esbiko-water-engine-shorts-${Date.now()}.webm`}
          fps={recordingFps}
          videoBitsPerSecond={75000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
        />

        <CaptureGuide
          mode={captureGuide}
          bounds={canvasBounds}
          isRecording={isRecording}
        />
      </div>

      {/* Sidebar Controls */}
      <MultiWaveControls
        sources={sources}
        setSources={setSources}
        medium={medium}
        setMedium={setMedium}
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        waterStyle={waterStyle}
        setWaterStyle={setWaterStyle}
        isSimulating={isSimulating}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        setRecordingSeconds={setRecordingSeconds}
        recordingFps={recordingFps}
        setRecordingFps={setRecordingFps}
        recordingDirectoryName={recordingDirectoryName}
        onChooseRecordingFolder={chooseRecordingFolder}
        captureGuide={captureGuide}
        setCaptureGuide={setCaptureGuide}
        onRecordLandscape={() => startRecording("landscape")}
        onRecordShorts={() => startRecording("shorts")}
        onStopRecording={stopRecording}
        onToggle={() => setIsSimulating(!isSimulating)}
        onReset={handleReset}
      />
    </div>
  );
}
