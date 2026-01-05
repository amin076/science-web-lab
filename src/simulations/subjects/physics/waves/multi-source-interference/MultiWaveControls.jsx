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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Slider = ({ label, value, min, max, step, onChange, unit = "" }) => (
  <div className="mb-3">
    <div className="mb-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/50">
      <span>{label}</span>
      <span className="text-cyan-400">
        {value.toFixed(1)}
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
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 hover:bg-white/20"
    />
  </div>
);

const SourceCard = ({ source, index, updateSource, removeSource }) => {
  // Convert internal (0..1) to Cartesian (-100..+100)
  // X: 0.5 -> 0
  // Y: 0.5 -> 0 (Invert Y so Up is Positive)
  const cartX = (source.x - 0.5) * 200;
  const cartY = -(source.y - 0.5) * 200;

  const handlePosChange = (axis, val) => {
    // Convert Cartesian (-100..+100) back to internal (0..1)
    if (axis === "x") {
      updateSource(source.id, { x: val / 200 + 0.5 });
    } else {
      updateSource(source.id, { y: -(val / 200) + 0.5 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-2 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10"
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
          onClick={() => removeSource(source.id)}
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
            onChange={(v) => updateSource(source.id, { frequency: v })}
          />
          <Slider
            label="Amp"
            value={source.amplitude}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => updateSource(source.id, { amplitude: v })}
          />
        </div>

        {/* Position Params */}
        <div className="rounded-lg bg-black/20 p-2">
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
  isSimulating,
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
      },
    ]);
  };

  const updateSource = (id, patch) => {
    setSources(sources.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSource = (id) => {
    if (sources.length <= 1) return;
    setSources(sources.filter((s) => s.id !== id));
  };

  return (
    <div className="flex h-full flex-col bg-black/20 backdrop-blur-xl border-l border-white/10 w-[300px]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
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
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all ${
              isSimulating
                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            {isSimulating ? "Pause" : "Run"}
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-xs font-bold uppercase tracking-wide text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Medium Settings */}
      <div className="p-4 border-b border-white/10 flex-none">
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
      <div
        className="
        flex-1 
        overflow-y-auto 
        p-4 
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-white/30
        transition-colors
      "
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white/80">
            Active Sources
          </span>
          <button
            onClick={addSource}
            className="p-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} />
          </button>
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
