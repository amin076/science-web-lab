import React from "react";
import SimulationCharts from "./SimulationCharts";

export default function ControlPanel({
  viewConfig,
  setViewConfig,
  params,
  setParams,
  history,
}) {
  const toggleView = (key) =>
    setViewConfig((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-10 space-y-4">
      {/* Visual Toggles */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 shrink-0">
        <div className="font-bold mb-2 text-white text-xs uppercase tracking-wider">
          Display Options
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["showVectors", "Vectors"],
            ["showComponents", "Components"],
            ["showProjections", "Projections"],
            ["showAngle", "Angle Arc"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleView(key)}
              className={`text-[10px] py-2 rounded border transition-all ${
                viewConfig[key]
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                  : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters Sliders */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0">
        <div className="font-bold mb-3 text-white text-sm">Parameters</div>
        {[
          ["radius", "Radius (m)", 10, 200, 1],
          ["omega0", "Initial ω (rad/s)", -5, 5, 0.1],
          ["alpha", "Ang. Accel (rad/s²)", -2, 2, 0.1],
          ["mass", "Mass (kg)", 0.1, 10, 0.1],
        ].map(([key, label, min, max, step]) => (
          <div key={key} className="mb-2">
            <div className="flex justify-between text-[10px] text-white/70 mb-1">
              <span>{label}</span>
              <span className="font-mono text-cyan-400">{params[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={params[key]}
              onChange={(e) =>
                setParams({ ...params, [key]: parseFloat(e.target.value) })
              }
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <SimulationCharts history={history} />
    </div>
  );
}