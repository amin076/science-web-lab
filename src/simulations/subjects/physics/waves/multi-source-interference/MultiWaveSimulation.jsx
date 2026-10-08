// src/simulations/subjects/physics/waves/multi-source-interference/MultiWaveSimulation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";
import MultiWaveControls from "./MultiWaveControls";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { useMultiWaveWebMcp } from "./hooks/useMultiWaveWebMcp.js";
import { sourceWithMotionDefaults as makeSource } from "./MultiWavePhysics.js";

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
  const recordingStartRef = useRef(0);
  const recordingModeRef = useRef("landscape");
  const recordingDurationRef = useRef(60);
  const lastClipRef = useRef(null);
  const videoStatusRef = useRef({ state: "idle", downloadReady: false, elapsedSeconds: 0 });
  const [videoStatus, setVideoStatus] = useState(videoStatusRef.current);
  const setLiveVideoStatus = (patch) => {
    const next = { ...videoStatusRef.current, ...patch };
    videoStatusRef.current = next;
    setVideoStatus(next);
  };
  const embeddedRef = useRef(null);
  if (!embeddedRef.current) {
    embeddedRef.current = readEmbeddedMcpParameters("physics.waves.multi-source-interference", {
      renderMode: "pattern", waveSpeed: 15, damping: 0.015,
      durationSeconds: 60, fps: 30,
    });
  }
  const embedded = embeddedRef.current;

  // --- State ---
  const [isSimulating, setIsSimulating] = useState(true);
  const [renderMode, setRenderMode] = useState(embedded.values.renderMode);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(embedded.values.durationSeconds);
  const [recordingFps, setRecordingFps] = useState(embedded.values.fps);
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
    ...Object.fromEntries(Object.entries(embedded.values).filter(([key]) => ["preset", "causticStyle", "bloom", "depth", "contrast", "caustics", "colorShift", "orbGlow", "highlightSoftness", "surfaceDetail", "lightAngle", "backgroundGlow"].includes(key))),
  });

  // Medium Properties (Shared)
  const [medium, setMedium] = useState({
    waveSpeed: embedded.values.waveSpeed,
    damping: embedded.values.damping,
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
    const mode = recordingModeRef.current;
    const recorder = mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
    if (!recorder?.isRecording?.()) return false;
    clearRecordingTimer();
    setLiveVideoStatus({ state: "finalizing" });
    return recorder.stopRecording();
  }, [clearRecordingTimer]);

  const startRecording = useCallback((mode, durationSeconds = recordingSeconds) => {
    const recorder = mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
    if (!recorder) throw Object.assign(new Error("Recorder not available."), { code: "RECORDER_NOT_READY" });
    if (landscapeRecorderRef.current?.isRecording?.() || shortsRecorderRef.current?.isRecording?.()) {
      throw Object.assign(new Error("A video recording is already active."), { code: "RECORDING_ACTIVE" });
    }
    if (typeof MediaRecorder === "undefined" || !canvasRef.current?.captureStream) {
      throw Object.assign(new Error("This browser cannot capture WebM video."), { code: "RECORDING_UNSUPPORTED" });
    }
    recordingModeRef.current = mode;
    recordingDurationRef.current = durationSeconds;
    setCaptureGuide(mode);
    try {
      if (!recorder.startRecording()) throw new Error("Could not start browser recording.");
    } catch (error) {
      setLiveVideoStatus({ state: "error", error: { code: error.code || "RECORDING_START_FAILED", message: error.message } });
      throw error;
    }
    recordingStartRef.current = performance.now();
    lastClipRef.current = null;
    setLiveVideoStatus({ state: "recording", mode, durationSeconds, elapsedSeconds: 0,
      fps: recordingFps, downloadReady: false, error: null, fileName: null, bytes: 0 });
    clearRecordingTimer();
    recordingTimeoutRef.current = window.setTimeout(() => {
      stopRecording();
    }, durationSeconds * 1000);
    return { state: "recording", mode, durationSeconds, fps: recordingFps, audioIncluded: false };
  }, [clearRecordingTimer, recordingSeconds, recordingFps, stopRecording]);

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

  const getVideoStatus = () => {
    const value = videoStatusRef.current;
    const active = ["recording", "finalizing"].includes(value.state);
    const elapsedSeconds = value.state === "recording"
      ? Math.min(recordingDurationRef.current, (performance.now() - recordingStartRef.current) / 1000)
      : value.elapsedSeconds || 0;
    return { ...value, elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
      progressPercent: active ? Math.round(100 * elapsedSeconds / Math.max(1, recordingDurationRef.current)) :
        value.state === "ready" ? 100 : 0,
      downloadReady: Boolean(lastClipRef.current) && !active };
  };

  const onClipReady = (mode, clip) => {
    lastClipRef.current = { mode, fileName: clip.fileName, bytes: clip.blob.size, part: clip.part };
    const segmentActive = (mode === "shorts" ? shortsRecorderRef : landscapeRecorderRef).current?.isRecording?.();
    setLiveVideoStatus({ state: segmentActive ? "recording" : "ready", mode, fileName: clip.fileName,
      bytes: clip.blob.size, part: clip.part, downloadReady: true,
      elapsedSeconds: Math.min(recordingDurationRef.current, (performance.now() - recordingStartRef.current) / 1000),
      error: null });
  };
  const onVideoError = (error) => setLiveVideoStatus({ state: "error", error, downloadReady: false });
  const configureVideo = (input) => {
    if (input.durationSeconds !== undefined) setRecordingSeconds(input.durationSeconds);
    if (input.fps !== undefined) setRecordingFps(input.fps);
    if (input.aspectRatio) setCaptureGuide(input.aspectRatio === "9:16" ? "shorts" : "landscape");
    return { configured: input };
  };
  const startVideo = async (input = {}) => {
    configureVideo(input);
    const mode = input.aspectRatio === "9:16" ? "shorts" :
      input.aspectRatio === "16:9" ? "landscape" :
        captureGuide === "shorts" ? "shorts" : "landscape";
    // The recorder receives the newly selected FPS on the next React commit.
    if (input.fps !== undefined) {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    return startRecording(mode, input.durationSeconds ?? recordingSeconds);
  };
  const multiWaveMcpStatus = useMultiWaveWebMcp({
    enabled: !embedded.embeddedMcpApp,
    getState: () => ({ simulationId: "physics.waves.multi-source-interference",
      running: isSimulating, elapsedSeconds: elapsedRef.current, renderMode,
      medium: { ...medium }, sources: sources.map((source) => ({ ...source })),
      waterStyle: { ...waterStyle }, captureGuide, video: getVideoStatus() }),
    configure: (input) => {
      const { renderMode: nextRender, waveSpeed, damping, ...visual } = input;
      if (nextRender !== undefined) setRenderMode(nextRender);
      if (waveSpeed !== undefined || damping !== undefined) {
        setMedium((old) => ({ ...old, ...(waveSpeed === undefined ? {} : { waveSpeed }),
          ...(damping === undefined ? {} : { damping }) }));
      }
      if (Object.keys(visual).length) setWaterStyle((old) => ({ ...old, ...visual }));
      return { applied: input };
    },
    playback: (action) => {
      if (action === "reset") handleReset();
      else setIsSimulating(action === "run");
      return { action };
    },
    addSource: (patch) => {
      if (sources.length >= 24) throw Object.assign(new Error("Maximum 24 sources to protect frame rate."), { code: "SOURCE_LIMIT" });
      const id = Math.max(0, ...sources.map((source) => source.id)) + 1;
      const source = makeSource({ id, x: 0.5, y: 0.5, frequency: 2, amplitude: 2, active: true, ...patch });
      setSources((previous) => [...previous, source]);
      return { source };
    },
    updateSource: (id, patch) => {
      if (!sources.some((source) => source.id === id)) throw Object.assign(new Error("Source ID not found."), { code: "SOURCE_NOT_FOUND" });
      setSources((previous) => previous.map((source) => source.id === id ? { ...source, ...patch } : source));
      return { sourceId: id, applied: patch };
    },
    removeSource: (id) => {
      if (!sources.some((source) => source.id === id)) throw Object.assign(new Error("Source ID not found."), { code: "SOURCE_NOT_FOUND" });
      if (sources.length < 2) throw Object.assign(new Error("At least one wave source is required."), { code: "MINIMUM_SOURCES" });
      setSources((previous) => previous.filter((source) => source.id !== id));
      return { sourceId: id, removed: true };
    },
    configureVideo, startVideo, getVideoStatus,
    stopVideo: () => {
      if (!stopRecording()) throw Object.assign(new Error("No active recording."), { code: "RECORDING_NOT_ACTIVE" });
      return { state: "finalizing" };
    },
    downloadVideo: () => {
      const mode = lastClipRef.current?.mode;
      const recorder = mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
      const result = mode && recorder?.downloadLastRecording?.();
      if (!result) throw Object.assign(new Error("No completed video to download."), { code: "VIDEO_NOT_READY" });
      return result;
    },
  });

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
    const hitRadiusPx = e.pointerType === "touch" ? 38 : 26;
    const animatedSources = getAnimatedSources(sources, elapsedRef.current);

    const hit = animatedSources.find((s) => {
      const dx = s.x - x;
      const dy = s.y - y; // aspect ratio correction omitted for simplicity interaction
      return (dx * rect.width) ** 2 + (dy * rect.height) ** 2 < hitRadiusPx ** 2;
    });

    if (hit) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
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
    <div data-agent-surface="multi-source-root" className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-black text-white lg:flex-row lg:overflow-hidden">
      {/* Canvas Area */}
      <div
        ref={containerRef}
        data-agent-surface="multi-source-stage"
        className="relative aspect-video min-h-[210px] w-full shrink-0 cursor-crosshair bg-[#050505] touch-none sm:min-h-[300px] lg:aspect-auto lg:min-h-0 lg:min-w-0 lg:flex-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
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
          videoBitsPerSecond={12000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
          onRecordingReady={(clip) => onClipReady("landscape", clip)}
          onRecordingError={onVideoError}
        />
        <VideoRecorderControls
          ref={shortsRecorderRef}
          canvasSelector="#multi-wave-recording-canvas"
          outputMode="shorts"
          fileName={`esbiko-water-engine-shorts-${Date.now()}.webm`}
          fps={recordingFps}
          videoBitsPerSecond={10000000}
          codecMode="realtime-quality"
          segmentDurationSeconds={60}
          saveDirectoryHandle={recordingDirectory}
          showButton={false}
          onRecordingChange={setIsRecording}
          onRecordingReady={(clip) => onClipReady("shorts", clip)}
          onRecordingError={onVideoError}
        />

        <div aria-live="polite" data-agent-video-status={videoStatus.state} className="pointer-events-none absolute bottom-2 left-2 z-20 rounded bg-black/70 px-2 py-1 text-[10px] text-white/80">
          {videoStatus.state === "recording" ? "Recording WebM…" :
            videoStatus.state === "finalizing" ? "Finishing WebM…" :
            videoStatus.state === "ready" ? "Video ready to download" :
            videoStatus.state === "error" ? videoStatus.error?.message : multiWaveMcpStatus === "ready" ? "WebMCP ready" : "Multi-source lab"}
        </div>
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
        videoStatus={videoStatus}
        webMcpStatus={multiWaveMcpStatus}
        onDownloadVideo={() => {
          const recorder = lastClipRef.current?.mode === "shorts" ? shortsRecorderRef.current : landscapeRecorderRef.current;
          recorder?.downloadLastRecording?.();
        }}
        onRecordLandscape={() => startRecording("landscape")}
        onRecordShorts={() => startRecording("shorts")}
        onStopRecording={stopRecording}
        onToggle={() => setIsSimulating(!isSimulating)}
        onReset={handleReset}
      />
    </div>
  );
}
