// src/simulations/subjects/physics/mechanics/gyroscope/Controls.jsx
import React from "react";
import { Play, Pause, RotateCcw, Eye, Activity } from "lucide-react";
import { CONTROL_SCHEMA } from "./schema";
import { clamp, formatNumber } from "./constants";

export default function Controls({
  params,
  setParam,
  running,
  onStartStop,
  onReset,
  t,
}) {
  // Separate schema into categories for better layout
  const toggles = CONTROL_SCHEMA.filter((c) => c.type === "toggle");
  const sliders = CONTROL_SCHEMA.filter((c) => c.type === "number");

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100">
      {/* --- TOP DASHBOARD (Timer & Actions) --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
        <div className="text-center mb-4">
          <div className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">
            Elapsed Time
          </div>
          <div className="text-4xl font-mono font-black text-cyan-400 tabular-nums">
            {t.toFixed(2)}
            <span className="text-lg text-slate-500 ml-1">s</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onStartStop}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black tracking-wide shadow-md transition-all active:scale-[0.98] ${
              running
                ? "bg-red-500 hover:bg-red-400 text-white"
                : "bg-emerald-500 hover:bg-emerald-400 text-white"
            }`}
          >
            {running ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
            {running ? "PAUSE" : "START"}
          </button>

          <button
            onClick={onReset}
            className="w-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* --- VISUAL OPTIONS (Toggles) --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          View Options
        </div>
        <div className="flex gap-2">
          {toggles.map((c) => {
            const active = params[c.key];
            // Custom Icons logic (optional)
            const Icon = c.key === "showVectors" ? Eye : Activity;

            return (
              <button
                key={c.key}
                onClick={() => setParam(c.key, !active)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                  active
                    ? "bg-cyan-950 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                }`}
              >
                <Icon size={16} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- INITIAL CONDITIONS (Sliders) --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Initial Conditions
          </div>
          {/* Decorative chevron could go here if collapsible */}
        </div>

        <div className="space-y-6">
          {sliders.map((c) => (
            <ModernSlider
              key={c.key}
              label={c.label}
              value={params[c.key]}
              unit={c.unit}
              min={c.min}
              max={c.max}
              step={c.step}
              onChange={(v) => setParam(c.key, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function ModernSlider({ label, value, unit, min, max, step, onChange }) {
  const displayValue = Number.isFinite(value) ? value : min;

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
          {label}
        </label>
        <div className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs font-mono text-cyan-400 min-w-[3rem] text-right">
          {formatNumber(displayValue, step < 0.1 ? 2 : 1)}
          {unit && <span className="text-slate-500 ml-0.5">{unit}</span>}
        </div>
      </div>

      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            onChange(clamp(num, min, max));
          }}
          className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>
    </div>
  );
}