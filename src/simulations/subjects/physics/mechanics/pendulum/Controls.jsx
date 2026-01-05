// src/simulations/subjects/physics/mechanics/pendulum/Controls.jsx
import React from "react";
import { Slider } from "@mui/material";
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Settings2,
  MousePointer2,
  Eye,
  EyeOff,
  MoveUpRight,
} from "lucide-react";

const ModernSlider = (props) => (
  <Slider
    {...props}
    sx={{
      color: "#22d3ee",
      height: 4,
      padding: "13px 0",
      "& .MuiSlider-thumb": {
        height: 14,
        width: 14,
        backgroundColor: "#0f172a",
        border: "2px solid currentColor",
        "&:hover": { boxShadow: "0 0 0 6px rgba(34, 211, 238, 0.1)" },
      },
      "& .MuiSlider-track": {
        border: "none",
        background: "linear-gradient(90deg, #22d3ee, #6366f1)",
      },
      "& .MuiSlider-rail": { opacity: 0.3, backgroundColor: "#475569" },
    }}
  />
);

const ControlGroup = ({ label, value, unit, children }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-end">
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <span className="text-cyan-400 font-mono text-xs bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
        {typeof value === "number"
          ? value.toFixed(unit === "kg" ? 1 : 2)
          : value}
        {unit}
      </span>
    </div>
    {children}
  </div>
);

const ToggleButton = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all w-full
      ${
        active
          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          : "bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent"
      }`}
  >
    <Icon size={14} />
    {label}
    <div
      className={`ml-auto w-2 h-2 rounded-full ${
        active ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-slate-600"
      }`}
    />
  </button>
);

export default function Controls({
  running,
  toggleRun,
  onReset,
  lengthM,
  setLengthM,
  massKg,
  setMassKg,
  entryAngle,
  setEntryAngle,
  elasticity,
  setElasticity,
  pxPerMeter,
  setPxPerMeter,
  bobRadius,
  setBobRadius,
  trailLen,
  setTrailLen,
  showVectors,
  setShowVectors,
  showTrail,
  setShowTrail,
}) {
  return (
    <div className="w-[360px] flex flex-col h-full bg-[#0f172a]/90 backdrop-blur-xl border-r border-white/10 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
          <Activity className="text-cyan-400 w-5 h-5" />
          Pendulum Lab
        </h2>
        <p className="text-slate-400 text-xs mt-1">Harmonic Motion & Energy</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4 text-cyan-200 text-xs font-bold uppercase tracking-widest">
            <Settings2 className="w-3.5 h-3.5" /> Physics Constants
          </div>
          <div className="space-y-6">
            <ControlGroup label="Length" value={lengthM} unit="m">
              <ModernSlider
                value={lengthM}
                min={0.5}
                max={3.0}
                step={0.1}
                onChange={(_, v) => setLengthM(v)}
              />
            </ControlGroup>
            <ControlGroup label="Mass" value={massKg} unit="kg">
              <ModernSlider
                value={massKg}
                min={0.1}
                max={10.0}
                step={0.1}
                onChange={(_, v) => setMassKg(v)}
              />
            </ControlGroup>
            <ControlGroup label="Start Angle" value={entryAngle} unit="°">
              <ModernSlider
                value={entryAngle}
                min={-170}
                max={170}
                step={1}
                disabled={running}
                onChange={(_, v) => setEntryAngle(v)}
              />
            </ControlGroup>
            <ControlGroup label="Elasticity" value={elasticity} unit="μ">
              <ModernSlider
                value={elasticity}
                min={0.98}
                max={1.0}
                step={0.001}
                onChange={(_, v) => setElasticity(v)}
              />
            </ControlGroup>
          </div>
        </section>

        <div className="h-px bg-white/10" />

        <section>
          <div className="flex items-center gap-2 mb-4 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <MousePointer2 className="w-3.5 h-3.5" /> Visualization
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              <ToggleButton
                label="Vectors"
                active={showVectors}
                onClick={() => setShowVectors(!showVectors)}
                icon={MoveUpRight}
              />
              <ToggleButton
                label="Trail"
                active={showTrail}
                onClick={() => setShowTrail(!showTrail)}
                icon={showTrail ? Eye : EyeOff}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ControlGroup label="Zoom" value={pxPerMeter} unit="">
              <ModernSlider
                value={pxPerMeter}
                min={100}
                max={250}
                onChange={(_, v) => setPxPerMeter(v)}
              />
            </ControlGroup>
            <ControlGroup label="Bob" value={bobRadius} unit="">
              <ModernSlider
                value={bobRadius}
                min={10}
                max={50}
                onChange={(_, v) => setBobRadius(v)}
              />
            </ControlGroup>
            <ControlGroup label="Trail Length" value={trailLen} unit="">
              <ModernSlider
                value={trailLen}
                min={0}
                max={400}
                onChange={(_, v) => setTrailLen(v)}
              />
            </ControlGroup>
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-white/10 bg-[#0f172a]/95 grid grid-cols-2 gap-3">
        <button
          onClick={toggleRun}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all shadow-lg border ${
            running
              ? "bg-amber-500/10 text-amber-400 border-amber-500/50"
              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/50"
          }`}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "PAUSE" : "SIMULATE"}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-800 text-slate-300 border border-white/10 font-bold text-sm transition-all"
        >
          <RotateCcw size={16} /> RESET
        </button>
      </div>
    </div>
  );
}
