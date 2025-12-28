// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalControls.jsx
import React from "react";
import { MAX_OBJ_HEIGHT } from "./OpticalConstants";

const ToggleBtn = ({ label, active, onClick, colorClass = "cyan" }) => {
  const colors = {
    cyan: active
      ? "bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
      : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white",
    teal: active
      ? "bg-teal-500/30 text-teal-200 border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
      : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white",
    purple: active
      ? "bg-violet-500/30 text-violet-200 border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
      : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white",
    emerald: active
      ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-1 text-[9px] font-bold rounded-lg transition-all duration-300 relative overflow-hidden group border ${
        colors[colorClass] || colors.cyan
      }`}
    >
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

function Slider({ label, min, max, value, onChange, unit }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6 group">
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
        <span className="group-hover:text-cyan-200 transition-colors">
          {label}
        </span>
        <span className="text-cyan-300 font-mono bg-cyan-950/60 px-2 rounded border border-cyan-500/30 backdrop-blur-sm">
          {value} {unit}
        </span>
      </div>
      <div className="relative h-1.5 w-full mt-1">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 rounded-full border border-white/5"></div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
        />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full z-10 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-1/2 -mt-2 h-4 w-4 bg-cyan-950 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20 pointer-events-none transition-transform group-active:scale-110"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  );
}

export default function OpticalControls({
  lensType,
  setLensType,
  objDistance,
  setObjDistance,
  focalLength,
  setFocalLength,
  objHeight,
  setObjHeight,
  objType,
  setObjType,
  objSide,
  setObjSide,
  onReset,
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pr-1">
        {/* LENS TYPE */}
        <div className="mb-6">
          <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mb-2 ml-1">
            Optical Element
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-black/20 rounded-xl border border-white/5">
            <ToggleBtn
              label="Convex Lens"
              active={lensType === "convex-lens"}
              onClick={() => setLensType("convex-lens")}
              colorClass="teal"
            />
            <ToggleBtn
              label="Concave Lens"
              active={lensType === "concave-lens"}
              onClick={() => setLensType("concave-lens")}
              colorClass="cyan"
            />
            <ToggleBtn
              label="Concave Mirror"
              active={lensType === "concave-mirror"}
              onClick={() => setLensType("concave-mirror")}
              colorClass="purple"
            />
            <ToggleBtn
              label="Convex Mirror"
              active={lensType === "convex-mirror"}
              onClick={() => setLensType("convex-mirror")}
              colorClass="purple"
            />
          </div>
        </div>

        {/* VISUALIZATION */}
        <div className="mb-4">
          <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mb-2 ml-1">
            Visualization
          </div>
          <div className="flex gap-2">
            <ToggleBtn
              label="Arrow"
              active={objType === "arrow"}
              onClick={() => setObjType("arrow")}
            />
            <ToggleBtn
              label="Tree"
              active={objType === "tree"}
              onClick={() => setObjType("tree")}
            />
          </div>
        </div>

        {/* POSITION */}
        <div className="mb-6">
          <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mb-2 ml-1">
            Light Source
          </div>
          <div className="flex gap-2">
            <ToggleBtn
              label="Left"
              active={objSide === "left"}
              onClick={() => setObjSide("left")}
              colorClass="emerald"
            />
            <ToggleBtn
              label="Right"
              active={objSide === "right"}
              onClick={() => setObjSide("right")}
              colorClass="emerald"
            />
          </div>
        </div>

        {/* SLIDERS */}
        <div className="space-y-1">
          <Slider
            label="Object Distance"
            min={50}
            max={450}
            value={objDistance}
            onChange={setObjDistance}
            unit="cm"
          />
          <Slider
            label="Focal Length"
            min={50}
            max={300}
            value={focalLength}
            onChange={setFocalLength}
            unit="cm"
          />
          <Slider
            label="Object Height"
            min={20}
            max={MAX_OBJ_HEIGHT}
            value={objHeight}
            onChange={setObjHeight}
            unit="cm"
          />
        </div>

        <button
          onClick={onReset}
          className="w-full mt-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white shadow-lg active:scale-[0.98] transition-all backdrop-blur-sm"
        >
          RESET SIMULATION
        </button>
      </div>
    </div>
  );
}
