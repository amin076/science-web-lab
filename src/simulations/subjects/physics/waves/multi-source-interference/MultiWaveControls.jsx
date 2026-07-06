import React from "react";
import {
  Waves,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Move,
  Sparkles,
  Orbit,
  Video,
  Monitor,
  Smartphone,
  Square,
  Frame,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SOURCE_MOTION_PRESETS,
  sourceWithMotionDefaults,
} from "./MultiWavePhysics";
import {
  CAUSTIC_STYLE_PRESETS,
  WATER_ART_PRESETS,
} from "./MultiWaveWaterRender";

const Slider = ({ label, value, min, max, step, onChange, unit = "" }) => (
  <div className="mb-3">
    <div className="mb-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/50">
      <span>{label}</span>
      <span className="text-cyan-400">
        {value.toFixed(step < 0.1 ? 2 : 1)}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300 transition-colors hover:bg-white/20"
    />
  </div>
);

const SelectField = ({ label, value, options, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/50">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs font-medium text-white outline-none transition-colors hover:border-cyan-300/40 focus:border-cyan-300/70"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-950">
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const SourceCard = ({ source, index, updateSource, removeSource }) => {
  const safeSource = sourceWithMotionDefaults(source);
  // Convert internal (0..1) to Cartesian (-100..+100)
  // X: 0.5 -> 0
  // Y: 0.5 -> 0 (Invert Y so Up is Positive)
  const cartX = (safeSource.x - 0.5) * 200;
  const cartY = -(safeSource.y - 0.5) * 200;

  const handlePosChange = (axis, val) => {
    // Convert Cartesian (-100..+100) back to internal (0..1)
    if (axis === "x") {
      updateSource(safeSource.id, { x: val / 200 + 0.5 });
    } else {
      updateSource(safeSource.id, { y: -(val / 200) + 0.5 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-colors hover:border-white/15 hover:bg-white/[0.09]"
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: `hsl(${index * 60 + 180}, 70%, 60%)` }}
          />
          <span className="text-xs font-bold text-white">
            Source {index + 1}
          </span>
        </div>
        <button
          onClick={() => removeSource(safeSource.id)}
          className="text-white/30 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Wave Params */}
        <div className="grid grid-cols-2 gap-x-4">
          <Slider
            label="Freq"
            value={source.frequency}
            min={0.5}
            max={4.0}
            step={0.1}
            unit="Hz"
            onChange={(v) => updateSource(safeSource.id, { frequency: v })}
          />
          <Slider
            label="Amp"
            value={source.amplitude}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => updateSource(safeSource.id, { amplitude: v })}
          />
        </div>

        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            <Orbit size={10} /> Source Motion
          </div>
          <div className="mb-3">
            <SelectField
              label="Motion"
              value={safeSource.motion}
              options={SOURCE_MOTION_PRESETS}
              onChange={(motionName) =>
                updateSource(safeSource.id, { motion: motionName })
              }
            />
          </div>
          <div
            className={`grid grid-cols-2 gap-x-4 transition-opacity ${
              safeSource.motion === "static"
                ? "pointer-events-none opacity-35"
                : "opacity-100"
            }`}
          >
            <Slider
              label="Speed"
              value={safeSource.motionSpeed}
              min={0.02}
              max={0.8}
              step={0.01}
              unit="x"
              onChange={(v) =>
                updateSource(safeSource.id, { motionSpeed: v })
              }
            />
            <Slider
              label="Size"
              value={safeSource.motionRadius}
              min={0.02}
              max={0.32}
              step={0.01}
              onChange={(v) =>
                updateSource(safeSource.id, { motionRadius: v })
              }
            />
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Visual Source
          </div>
          <Slider
            label="Size"
            value={safeSource.sourceSize}
            min={0.05}
            max={1.5}
            step={0.05}
            onChange={(v) => updateSource(safeSource.id, { sourceSize: v })}
          />
        </div>

        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <label className="mb-3 flex cursor-pointer items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Pulse visibility
            </span>
            <input
              type="checkbox"
              checked={safeSource.pulseEnabled}
              onChange={(event) =>
                updateSource(safeSource.id, {
                  pulseEnabled: event.target.checked,
                })
              }
              className="h-4 w-4 cursor-pointer accent-cyan-400"
            />
          </label>
          <div
            className={`grid grid-cols-2 gap-x-4 transition-opacity ${
              safeSource.pulseEnabled
                ? "opacity-100"
                : "pointer-events-none opacity-35"
            }`}
          >
            <Slider
              label="On"
              value={safeSource.pulseOnTime}
              min={0.02}
              max={1}
              step={0.01}
              unit="s"
              onChange={(v) =>
                updateSource(safeSource.id, { pulseOnTime: v })
              }
            />
            <Slider
              label="Off"
              value={safeSource.pulseOffTime}
              min={0}
              max={3}
              step={0.01}
              unit="s"
              onChange={(v) =>
                updateSource(safeSource.id, { pulseOffTime: v })
              }
            />
          </div>
        </div>

        {/* Position Params */}
        <div className="rounded-lg border border-white/5 bg-black/20 p-2">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
            <Move size={10} /> Position (Cartesian)
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Slider
              label="X"
              value={cartX}
              min={-100}
              max={100}
              step={1}
              onChange={(v) => handlePosChange("x", v)}
            />
            <Slider
              label="Y"
              value={cartY}
              min={-100}
              max={100}
              step={1}
              onChange={(v) => handlePosChange("y", v)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MultiWaveControls({
  sources,
  setSources,
  medium,
  setMedium,
  renderMode,
  setRenderMode,
  waterStyle,
  setWaterStyle,
  isSimulating,
  isRecording,
  recordingSeconds,
  setRecordingSeconds,
  recordingFps,
  setRecordingFps,
  recordingDirectoryName,
  onChooseRecordingFolder,
  captureGuide,
  setCaptureGuide,
  onRecordLandscape,
  onRecordShorts,
  onStopRecording,
  onToggle,
  onReset,
}) {
  const addSource = () => {
    const newId = Math.max(0, ...sources.map((s) => s.id)) + 1;
    setSources([
      ...sources,
      {
        id: newId,
        x: 0.5 + (Math.random() - 0.5) * 0.2,
        y: 0.5 + (Math.random() - 0.5) * 0.2,
        frequency: 2.0,
        amplitude: 2.0,
        active: true,
        motion: "static",
        motionSpeed: 0.22,
        motionRadius: 0.14,
        sourceSize: 0.25,
        pulseEnabled: false,
        pulseOnTime: 0.1,
        pulseOffTime: 0.5,
        motionPhase: Math.random() * Math.PI * 2,
      },
    ]);
  };

  const addArtSourceSet = () => {
    const startId = Math.max(0, ...sources.map((s) => s.id)) + 1;
    const motions = ["circle", "ellipse", "figure-eight", "random-drift"];
    const baseFrequency = 0.85 + Math.random() * 0.35;
    const additions = Array.from({ length: 5 }, (_, index) => {
      const angle = (index / 5) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 0.12 + Math.random() * 0.18;

      return sourceWithMotionDefaults({
        id: startId + index,
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius * 0.72,
        frequency: baseFrequency + index * 0.17,
        amplitude: 0.8 + Math.random() * 1.4,
        active: true,
        motion: motions[index % motions.length],
        motionSpeed: 0.05 + Math.random() * 0.16,
        motionRadius: 0.05 + Math.random() * 0.13,
        sourceSize: 0.06 + Math.random() * 0.18,
        pulseEnabled: index % 2 === 0,
        pulseOnTime: 0.06 + Math.random() * 0.16,
        pulseOffTime: 0.28 + Math.random() * 0.72,
        motionPhase: Math.random() * Math.PI * 2,
        phase: index * 0.72,
      });
    });

    setSources([...sources, ...additions]);
  };

  const updateSource = (id, patch) => {
    setSources(sources.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSource = (id) => {
    if (sources.length <= 1) return;
    setSources(sources.filter((s) => s.id !== id));
  };

  const updateWaterStyle = (patch) => {
    setWaterStyle({ ...waterStyle, ...patch });
  };

  return (
    <div
      className="
        h-full w-[360px] overflow-y-auto border-l border-white/10
        bg-slate-950/50 text-white shadow-[-24px_0_70px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-white/15
        hover:[&::-webkit-scrollbar-thumb]:bg-white/35
      "
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg border border-cyan-300/15 bg-cyan-300/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <Waves size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Multi-Source</h2>
            <p className="text-[10px] text-white/50">
              Interference Pattern Lab
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggle}
            className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-xs font-bold uppercase tracking-wide shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition-all ${
              isSimulating
                ? "border-amber-300/10 bg-amber-400/12 text-amber-300 hover:bg-amber-400/20"
                : "border-emerald-300/10 bg-emerald-400/12 text-emerald-300 hover:bg-emerald-400/20"
            }`}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            {isSimulating ? "Pause" : "Run"}
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] py-2 text-xs font-bold uppercase tracking-wide text-white/70 shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.07] p-2 shadow-[0_14px_42px_rgba(8,47,73,0.2)]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200/70">
            <Sparkles size={12} />
            Render Pattern
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRenderMode("pattern")}
              className={`rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                renderMode === "pattern"
                  ? "bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                  : "bg-black/25 text-white/45 hover:bg-white/10 hover:text-white/75"
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setRenderMode("water")}
              className={`rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                renderMode === "water"
                  ? "bg-cyan-300/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
                  : "bg-black/25 text-cyan-200/55 hover:bg-cyan-300/10 hover:text-cyan-100"
              }`}
            >
              Water Engine
            </button>
          </div>
        </div>

        <div
          className={`mt-3 rounded-lg border border-fuchsia-300/15 bg-fuchsia-300/[0.065] p-2 shadow-[0_14px_42px_rgba(112,26,117,0.18)] transition-opacity ${
            renderMode === "water" ? "opacity-100" : "opacity-60"
          }`}
        >
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-fuchsia-100/70">
            <Sparkles size={12} />
            Cinematic Art
          </div>
          <div className="mb-3">
            <SelectField
              label="Mood"
              value={waterStyle.preset}
              options={WATER_ART_PRESETS}
              onChange={(preset) => updateWaterStyle({ preset })}
            />
          </div>
          <div className="mb-3">
            <SelectField
              label="Caustic Style"
              value={waterStyle.causticStyle}
              options={CAUSTIC_STYLE_PRESETS}
              onChange={(causticStyle) => updateWaterStyle({ causticStyle })}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Slider
              label="Bloom"
              value={waterStyle.bloom}
              min={0.2}
              max={3}
              step={0.05}
              onChange={(v) => updateWaterStyle({ bloom: v })}
            />
            <Slider
              label="Depth"
              value={waterStyle.depth}
              min={0.2}
              max={2.4}
              step={0.05}
              onChange={(v) => updateWaterStyle({ depth: v })}
            />
            <Slider
              label="Contrast"
              value={waterStyle.contrast}
              min={0.5}
              max={2.6}
              step={0.05}
              onChange={(v) => updateWaterStyle({ contrast: v })}
            />
            <Slider
              label="Caustics"
              value={waterStyle.caustics}
              min={0}
              max={1.1}
              step={0.05}
              onChange={(v) => updateWaterStyle({ caustics: v })}
            />
            <Slider
              label="Color"
              value={waterStyle.colorShift}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateWaterStyle({ colorShift: v })}
            />
            <Slider
              label="Orb Glow"
              value={waterStyle.orbGlow}
              min={0.1}
              max={3}
              step={0.05}
              onChange={(v) => updateWaterStyle({ orbGlow: v })}
            />
            <Slider
              label="Softness"
              value={waterStyle.highlightSoftness}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateWaterStyle({ highlightSoftness: v })}
            />
            <Slider
              label="Detail"
              value={waterStyle.surfaceDetail}
              min={0}
              max={1.4}
              step={0.05}
              onChange={(v) => updateWaterStyle({ surfaceDetail: v })}
            />
            <Slider
              label="Light"
              value={waterStyle.lightAngle}
              min={-1}
              max={1}
              step={0.05}
              onChange={(v) => updateWaterStyle({ lightAngle: v })}
            />
            <Slider
              label="Atmosphere"
              value={waterStyle.backgroundGlow}
              min={0}
              max={1.4}
              step={0.05}
              onChange={(v) => updateWaterStyle({ backgroundGlow: v })}
            />
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.07] p-2 shadow-[0_14px_42px_rgba(6,78,59,0.2)]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
            <Video size={12} />
            Video Recording
          </div>
          <p className="mb-3 rounded border border-white/5 bg-black/20 px-2 py-1.5 text-[10px] leading-relaxed text-white/45">
            Long captures save as 60s numbered parts to avoid browser memory
            crashes.
          </p>
          <div className="mb-3 rounded-lg border border-white/5 bg-black/20 p-2">
            <button
              type="button"
              onClick={onChooseRecordingFolder}
              disabled={isRecording}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FolderOpen size={12} />
              Choose Save Folder
            </button>
            <div className="mt-2 truncate text-[10px] text-white/45">
              {recordingDirectoryName
                ? `Saving to: ${recordingDirectoryName}`
                : "No folder selected. Browser Downloads fallback."}
            </div>
          </div>
          <Slider
            label="Duration"
            value={recordingSeconds}
            min={0}
            max={600}
            step={5}
            unit="s"
            onChange={setRecordingSeconds}
          />
          <div className="mb-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/45">
              Recording FPS
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 30, label: "30 FPS" },
                { value: 60, label: "60 FPS" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRecordingFps(option.value)}
                  disabled={isRecording}
                  className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                    recordingFps === option.value
                      ? "bg-emerald-300/20 text-emerald-50"
                      : "bg-black/25 text-emerald-100/55 hover:bg-emerald-300/10 hover:text-emerald-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/45">
              <Frame size={11} />
              Capture Guide
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "landscape", label: "16:9" },
                { value: "shorts", label: "9:16" },
                { value: "none", label: "Off" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCaptureGuide(option.value)}
                  className={`rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    captureGuide === option.value
                      ? "bg-emerald-300/20 text-emerald-50"
                      : "bg-black/25 text-emerald-100/55 hover:bg-emerald-300/10 hover:text-emerald-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {isRecording ? (
            <button
              onClick={onStopRecording}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300/15 bg-red-500/20 py-2 text-[11px] font-bold uppercase tracking-wide text-red-100 transition-colors hover:bg-red-500/30"
            >
              <Square size={12} />
              Stop Recording
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onRecordLandscape}
                className="flex items-center justify-center gap-1 rounded-lg border border-white/5 bg-black/25 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-100/80 transition-colors hover:bg-emerald-300/15 hover:text-emerald-50"
              >
                <Monitor size={12} />
                16:9
              </button>
              <button
                onClick={onRecordShorts}
                className="flex items-center justify-center gap-1 rounded-lg border border-white/5 bg-black/25 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-100/80 transition-colors hover:bg-emerald-300/15 hover:text-emerald-50"
              >
                <Smartphone size={12} />
                9:16
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Medium Settings */}
      <div className="border-y border-white/10 bg-black/15 p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-white/80">
          <Activity size={14} />
          <span>Medium Properties</span>
        </div>
        <Slider
          label="Wave Speed"
          value={medium.waveSpeed}
          min={10}
          max={30}
          step={1}
          onChange={(v) => setMedium({ ...medium, waveSpeed: v })}
        />
        <Slider
          label="Damping"
          value={medium.damping}
          min={0}
          max={0.1}
          step={0.001}
          onChange={(v) => setMedium({ ...medium, damping: v })}
        />
      </div>

      {/* Source List with Glass Scrollbar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white/80">
            Active Sources
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={addArtSourceSet}
              className="rounded-lg border border-fuchsia-300/15 bg-fuchsia-300/15 p-1.5 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.12)] transition-colors hover:bg-fuchsia-300/25"
              title="Add ambient art source set"
            >
              <Sparkles size={16} />
            </button>
            <button
              onClick={addSource}
              className="rounded-lg border border-cyan-300/15 bg-cyan-300/15 p-1.5 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-colors hover:bg-cyan-300/25"
              title="Add source"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {sources.map((source, idx) => (
            <SourceCard
              key={source.id}
              index={idx}
              source={source}
              updateSource={updateSource}
              removeSource={removeSource}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
