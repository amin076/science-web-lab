// src/simulations/subjects/creative/patterns/ambient-pattern-studio/AmbientPatternStudio.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FolderOpen,
  Frame,
  Monitor,
  Pause,
  Play,
  RefreshCcw,
  Shuffle,
  Smartphone,
  Sparkles,
  Video,
} from "lucide-react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";
import {
  PALETTE_PRESETS,
  PATTERN_PRESETS,
  renderAmbientPattern,
} from "./patternRenderer";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

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

const Slider = ({ label, value, min, max, step, onChange, unit = "" }) => (
  <label className="block">
    <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/55">
      <span>{label}</span>
      <span className="text-cyan-200">
        {Number(value).toFixed(step < 0.1 ? 2 : 1)}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(parseFloat(event.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300 transition-colors hover:bg-white/20"
    />
  </label>
);

const SelectField = ({ label, value, options, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/55">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-sm font-semibold text-white outline-none transition-colors hover:border-cyan-300/40 focus:border-cyan-300/70"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-950">
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

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
        <div className="absolute left-4 top-3 rounded bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100 backdrop-blur-md">
          {isRecording ? "Recording" : "Capture Area"} {guide.label}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan-100/85">
        <Icon size={14} />
        {title}
      </div>
      {children}
    </section>
  );
}

export default function AmbientPatternStudio() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const elapsedRef = useRef(0);
  const landscapeRecorderRef = useRef(null);
  const shortsRecorderRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [captureGuide, setCaptureGuide] = useState("landscape");
  const [canvasBounds, setCanvasBounds] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(60);
  const [recordingFps, setRecordingFps] = useState(30);
  const [recordingDirectory, setRecordingDirectory] = useState(null);
  const [recordingDirectoryName, setRecordingDirectoryName] = useState("");
  const [settings, setSettings] = useState({
    pattern: "kaleidoscope",
    palette: "aurora",
    speed: 2,
    loopSeconds: 60,
    symmetry: 10,
    intensity: 1.1,
    bloom: 1.2,
    depth: 1.05,
    complexity: 0.7,
    rotation: 0.5,
    drift: 0.55,
    particles: 130,
    backgroundGlow: 0.95,
  });

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

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

  const randomize = useCallback(() => {
    const pattern = PATTERN_PRESETS[Math.floor(Math.random() * PATTERN_PRESETS.length)];
    const palette = PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];

    setSettings((current) => ({
      ...current,
      pattern: pattern.value,
      palette: palette.value,
      speed: 1 + Math.floor(Math.random() * 4),
      symmetry: 5 + Math.floor(Math.random() * 12),
      intensity: 0.65 + Math.random() * 0.85,
      bloom: 0.65 + Math.random() * 1.25,
      depth: 0.45 + Math.random() * 1.25,
      complexity: 0.35 + Math.random() * 0.6,
      rotation: -0.9 + Math.random() * 1.8,
      drift: Math.random(),
      particles: 60 + Math.floor(Math.random() * 160),
      backgroundGlow: 0.35 + Math.random() * 1.15,
    }));
  }, []);

  const resetTime = useCallback(() => {
    elapsedRef.current = 0;
    lastRef.current = performance.now();
  }, []);

  useEffect(() => {
    const draw = (now) => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false });
      const dt = Math.min((now - (lastRef.current || now)) / 1000, 0.05);
      lastRef.current = now;

      if (isPlaying) elapsedRef.current += dt;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      renderAmbientPattern(ctx, canvas.width, canvas.height, elapsedRef.current, settings);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, settings]);

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

  useEffect(() => () => clearRecordingTimer(), [clearRecordingTimer]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-black text-white">
      <div ref={containerRef} className="relative flex-1 bg-black">
        <canvas
          id="ambient-pattern-recording-canvas"
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block h-full w-full object-contain"
        />

        <VideoRecorderControls
          ref={landscapeRecorderRef}
          canvasSelector="#ambient-pattern-recording-canvas"
          outputMode="landscape"
          fileName={`esbiko-ambient-pattern-landscape-${Date.now()}.webm`}
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
          canvasSelector="#ambient-pattern-recording-canvas"
          outputMode="shorts"
          fileName={`esbiko-ambient-pattern-shorts-${Date.now()}.webm`}
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

      <aside className="h-full w-[390px] shrink-0 overflow-y-auto border-l border-white/10 bg-slate-950/88 p-4 shadow-[-24px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
            <Sparkles size={23} />
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">Ambient Pattern</h2>
            <p className="text-xs text-white/55">Seamless video background studio</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsPlaying((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-lg border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-yellow-300 transition-colors hover:bg-yellow-400/15"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetTime}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm font-black uppercase tracking-wide text-white/80 transition-colors hover:bg-white/12"
          >
            <RefreshCcw size={15} />
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <Panel title="Pattern Design" icon={Sparkles}>
            <div className="space-y-3">
              <SelectField
                label="Pattern"
                value={settings.pattern}
                options={PATTERN_PRESETS}
                onChange={(value) => updateSetting("pattern", value)}
              />
              <SelectField
                label="Palette"
                value={settings.palette}
                options={PALETTE_PRESETS}
                onChange={(value) => updateSetting("palette", value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Speed"
                  value={settings.speed}
                  min={1}
                  max={6}
                  step={1}
                  unit="x"
                  onChange={(value) => updateSetting("speed", value)}
                />
                <Slider
                  label="Loop"
                  value={settings.loopSeconds}
                  min={15}
                  max={180}
                  step={15}
                  unit="s"
                  onChange={(value) => updateSetting("loopSeconds", value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Symmetry"
                  value={settings.symmetry}
                  min={3}
                  max={24}
                  step={1}
                  onChange={(value) => updateSetting("symmetry", value)}
                />
                <Slider
                  label="Complexity"
                  value={settings.complexity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(value) => updateSetting("complexity", value)}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Cinematic Finish" icon={Frame}>
            <div className="grid grid-cols-2 gap-4">
              <Slider
                label="Intensity"
                value={settings.intensity}
                min={0.1}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("intensity", value)}
              />
              <Slider
                label="Bloom"
                value={settings.bloom}
                min={0}
                max={3}
                step={0.05}
                onChange={(value) => updateSetting("bloom", value)}
              />
              <Slider
                label="Depth"
                value={settings.depth}
                min={0}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("depth", value)}
              />
              <Slider
                label="Drift"
                value={settings.drift}
                min={0}
                max={1.5}
                step={0.05}
                onChange={(value) => updateSetting("drift", value)}
              />
              <Slider
                label="Rotation"
                value={settings.rotation}
                min={-2}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("rotation", value)}
              />
              <Slider
                label="Atmosphere"
                value={settings.backgroundGlow}
                min={0}
                max={2}
                step={0.05}
                onChange={(value) => updateSetting("backgroundGlow", value)}
              />
            </div>
            <div className="mt-3">
              <Slider
                label="Particles"
                value={settings.particles}
                min={0}
                max={260}
                step={1}
                onChange={(value) => updateSetting("particles", value)}
              />
            </div>
            <button
              onClick={randomize}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-fuchsia-100 transition-colors hover:bg-fuchsia-300/15"
            >
              <Shuffle size={15} />
              Random Beautiful Pattern
            </button>
          </Panel>

          <Panel title="Video Recording" icon={Video}>
            <div className="mb-3 rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/55">
              Recordings use the shared canvas recorder and save 60s numbered parts
              when a folder is selected.
            </div>
            <button
              onClick={chooseRecordingFolder}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-300/15"
            >
              <FolderOpen size={15} />
              Choose Save Folder
            </button>
            <div className="mb-3 text-xs text-white/45">
              {recordingDirectoryName
                ? `Saving to ${recordingDirectoryName}`
                : "No folder selected. Browser downloads fallback."}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Slider
                label="Duration"
                value={recordingSeconds}
                min={15}
                max={600}
                step={15}
                unit="s"
                onChange={setRecordingSeconds}
              />
              <Slider
                label="FPS"
                value={recordingFps}
                min={30}
                max={60}
                step={30}
                onChange={setRecordingFps}
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCaptureGuide("landscape")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  captureGuide === "landscape"
                    ? "bg-cyan-300/18 text-cyan-100"
                    : "bg-black/30 text-white/55 hover:bg-white/8"
                }`}
              >
                <Monitor size={14} />
                16:9
              </button>
              <button
                onClick={() => setCaptureGuide("shorts")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  captureGuide === "shorts"
                    ? "bg-cyan-300/18 text-cyan-100"
                    : "bg-black/30 text-white/55 hover:bg-white/8"
                }`}
              >
                <Smartphone size={14} />
                9:16
              </button>
            </div>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300/25 bg-red-400/15 px-3 py-2 text-sm font-black uppercase tracking-wide text-red-100 transition-colors hover:bg-red-400/20"
              >
                <Pause size={15} />
                Stop Recording
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => startRecording("landscape")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/15"
                >
                  <Download size={14} />
                  Record 16:9
                </button>
                <button
                  onClick={() => startRecording("shorts")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-100 transition-colors hover:bg-cyan-300/15"
                >
                  <Download size={14} />
                  Record 9:16
                </button>
              </div>
            )}
          </Panel>
        </div>
      </aside>
    </div>
  );
}
