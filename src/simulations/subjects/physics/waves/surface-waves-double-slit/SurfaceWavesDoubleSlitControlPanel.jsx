import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// --- Internal Components ---

const GlassSection = ({ title, icon: Icon, children, isOpen, onToggle }) => {
  return (
    <div className="group mb-3 overflow-hidden rounded-xl border border-white/5 bg-white/5 transition-colors hover:border-white/10 hover:bg-white/10">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-left outline-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cyan-400 transition-colors group-hover:bg-cyan-500/20 group-hover:text-cyan-300`}
          >
            <Icon size={16} />
          </div>
          <span className="text-sm font-medium text-white/90">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <div className="border-t border-white/5 px-3 pb-4 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
}) => (
  <div className="mb-4 last:mb-0">
    <div className="mb-1.5 flex items-center justify-between text-[11px]">
      <span className="font-medium text-white/60">{label}</span>
      <span className="font-mono text-cyan-300">
        {value.toFixed(step < 0.1 ? 2 : 1)}
        {unit}
      </span>
    </div>
    <div className="relative flex h-4 items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 outline-none transition-all hover:bg-white/20 focus:accent-cyan-300"
      />
    </div>
  </div>
);

const RadioGroup = ({ options, value, onChange }) => (
  <div className="flex w-full gap-1 rounded-lg bg-black/40 p-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 rounded py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
          value === opt.value
            ? "bg-white/10 text-white shadow-sm"
            : "text-white/40 hover:bg-white/5 hover:text-white/70"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between rounded-lg bg-black/20 p-2.5 transition-colors hover:bg-black/30">
    <span className="text-xs font-medium text-white/70">{label}</span>
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`h-4 w-7 rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-white/10"
        }`}
      ></div>
      <div
        className={`absolute left-0.5 top-0.5 h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-3" : "translate-x-0"
        }`}
      ></div>
    </div>
  </label>
);

// --- Main Panel ---

export default function SurfaceWavesControlPanel(props) {
  const [expanded, setExpanded] = useState("source");

  const toggleSection = (section) => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  return (
    <div className="flex h-full flex-col bg-black/20 backdrop-blur-xl">
      {/* --- Fixed Header with Controls --- */}
      <div className="flex-none border-b border-white/10 bg-white/5 p-4 pb-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-inner shadow-cyan-500/10">
            <Waves size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Wave Lab</h2>
            <p className="text-[10px] text-white/50">
              Finite-Difference Solver
            </p>
          </div>
        </div>

        {/* Playback Controls Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={props.onToggle}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all ${
              props.isSimulating
                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {props.isSimulating ? <Pause size={14} /> : <Play size={14} />}
            {props.isSimulating ? "Pause" : "Run"}
          </button>

          <button
            onClick={props.onReset}
            className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-xs font-bold uppercase tracking-wide text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* --- Scrollable Content Area --- */}
      {/* Custom Scrollbar CSS implemented via Tailwind arbitrary values */}
      <div
        className="flex-1 overflow-y-auto p-3 
        scrollbar-thin 
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-white/10
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
      >
        <GlassSection
          title="Wave Source"
          icon={Zap}
          isOpen={expanded === "source"}
          onToggle={() => toggleSection("source")}
        >
          <div className="mb-4">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/40">
              Mode
            </span>
            <RadioGroup
              value={props.sourceMode}
              onChange={props.setSourceMode}
              options={[
                { label: "Continuous", value: "continuous" },
                { label: "Click", value: "click" },
              ]}
            />
          </div>

          <CustomSlider
            label="Amplitude"
            value={props.amplitude}
            min={0.1}
            max={3.0}
            step={0.1}
            onChange={(e) => props.setAmplitude(parseFloat(e.target.value))}
          />
          <CustomSlider
            label="Frequency"
            value={props.frequency}
            min={0.2}
            max={5.0}
            step={0.1}
            unit=" Hz"
            onChange={(e) => props.setFrequency(parseFloat(e.target.value))}
          />
          <CustomSlider
            label="Wave Speed"
            value={props.waveSpeed}
            min={1}
            max={20}
            step={0.5}
            onChange={(e) => props.setWaveSpeed(parseFloat(e.target.value))}
          />
        </GlassSection>

        <GlassSection
          title="Medium"
          icon={Activity}
          isOpen={expanded === "medium"}
          onToggle={() => toggleSection("medium")}
        >
          <CustomSlider
            label="Damping"
            value={props.damping}
            min={0}
            max={0.1}
            step={0.001}
            onChange={(e) => props.setDamping(parseFloat(e.target.value))}
          />
        </GlassSection>

        <GlassSection
          title="Double Slit"
          icon={Layers}
          isOpen={expanded === "barrier"}
          onToggle={() => toggleSection("barrier")}
        >
          <div className="space-y-4">
            <ToggleSwitch
              label="Enable Barrier"
              checked={props.barrierEnabled}
              onChange={props.setBarrierEnabled}
            />

            <div
              className={`transition-opacity duration-300 ${
                props.barrierEnabled
                  ? "opacity-100"
                  : "pointer-events-none opacity-30"
              }`}
            >
              <CustomSlider
                label="Position X"
                value={props.barrierX01}
                min={0.1}
                max={0.9}
                step={0.01}
                onChange={(e) =>
                  props.setBarrierX01(parseFloat(e.target.value))
                }
              />
              <CustomSlider
                label="Thickness"
                value={props.barrierThickness}
                min={1}
                max={10}
                step={1}
                onChange={(e) =>
                  props.setBarrierThickness(parseFloat(e.target.value))
                }
              />
              <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <CustomSlider
                label="Slit Separation"
                value={props.slitGap}
                min={10}
                max={100}
                step={2}
                onChange={(e) => props.setSlitGap(parseFloat(e.target.value))}
              />
              <CustomSlider
                label="Slit Width"
                value={props.slitWidth}
                min={2}
                max={40}
                step={1}
                onChange={(e) => props.setSlitWidth(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </GlassSection>
      </div>
    </div>
  );
}
