import React from "react";
import ImpactReport from "./ImpactReport";
import {
  smartFormat,
  calculateRadius,
  calculateStats,
  calculateSystem,
} from "./physicsUtils";

const ControlPanel = ({
  uiState,
  setUiState,
  physicsState,
  wallReport,
  collisionReport,
  onReset,
}) => {
  const updateParticle = (id, field, val) => {
    // Allow clearing the input to type
    if (val === "" || val === "-" || val === "+") return;

    const v = parseFloat(val);
    if (isNaN(v)) return;

    physicsState.current[id][field] = v;
    if (field === "mass") physicsState.current[id].radius = calculateRadius(v);

    setUiState((s) => ({
      ...s,
      p1: calculateStats(physicsState.current.p1),
      p2: calculateStats(physicsState.current.p2),
      system: calculateSystem(physicsState.current.p1, physicsState.current.p2),
    }));
  };

  const Toggle = ({ label, prop }) => (
    <button
      onClick={() => {
        physicsState.current[prop] = !physicsState.current[prop];
        setUiState((s) => ({ ...s, [prop]: physicsState.current[prop] }));
      }}
      className={`px-2 py-2 rounded-lg text-[8px] font-bold border transition-all ${
        uiState[prop]
          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
          : "bg-white/5 border-white/10 text-white/30"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-[400px] h-full flex flex-col gap-3 overflow-hidden">
      <style>{`.custom-scroll::-webkit-scrollbar { width: 3px; } .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }`}</style>

      <div className="flex gap-2">
        <button
          onClick={() => {
            physicsState.current.isRunning = !physicsState.current.isRunning;
            setUiState((s) => ({
              ...s,
              isRunning: physicsState.current.isRunning,
            }));
          }}
          className={`flex-1 py-3 rounded-xl font-black text-[9px] border tracking-widest ${
            uiState.isRunning
              ? "bg-red-500/10 text-red-500 border-red-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {uiState.isRunning ? "PAUSE" : "START"}
        </button>
        <button
          onClick={onReset}
          className="px-5 bg-white/5 rounded-xl border border-white/10 text-[9px] font-bold hover:bg-white/10"
        >
          RESET
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-3">
        {/* Controls */}
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-2">
          <div className="flex gap-1 mb-2">
            <Toggle label="VECTORS" prop="showVectors" />
            <Toggle label="COMPONENTS" prop="showComponents" />
            <Toggle label="LINES" prop="showImpactLine" />
          </div>
          <Slider
            label="Elasticity"
            min={0}
            max={1}
            step={0.01}
            value={uiState.restitution}
            onChange={(v) => {
              physicsState.current.restitution = v;
              setUiState((s) => ({ ...s, restitution: v }));
            }}
          />
          <Slider
            label="Speed"
            min={0}
            max={5}
            step={0.1}
            value={uiState.timeScale}
            onChange={(v) => {
              physicsState.current.timeScale = v;
              setUiState((s) => ({ ...s, timeScale: v }));
            }}
          />
        </div>

        {/* BOX 1: WALL REPORT */}
        <ImpactReport
          title="Box 1: Last Wall Impact"
          colorClass="bg-orange-500/5 border-orange-500/20 text-orange-400"
          report={wallReport}
        />

        {/* BOX 2: COLLISION REPORT */}
        <ImpactReport
          title="Box 2: Last Body Collision"
          colorClass="bg-cyan-500/5 border-cyan-500/20 text-cyan-400"
          report={collisionReport}
        />

        {/* INPUTS */}
        <div className="space-y-2">
          <InputCard
            id="p1"
            data={uiState.p1}
            label="Input Alpha"
            color="#4ECDC4"
            onInput={updateParticle}
          />
          <InputCard
            id="p2"
            data={uiState.p2}
            label="Input Beta"
            color="#FF6B6B"
            onInput={updateParticle}
          />
        </div>
      </div>
    </div>
  );
};

const Slider = ({ label, value, onChange, min, max, step }) => (
  <div className="flex justify-between items-center gap-2 text-[9px] font-mono text-white/40">
    <span>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="flex-1 accent-cyan-500 h-1"
    />
    <span className="text-white w-6 text-right">{value.toFixed(2)}</span>
  </div>
);

const InputCard = ({ id, data, label, color, onInput }) => (
  <div
    className="bg-white/5 border-l-2 p-3 rounded-r-xl"
    style={{ borderColor: color }}
  >
    <div className="text-[9px] font-bold mb-2 uppercase opacity-70">
      {label}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {["mass", "vx", "vy"].map((f) => (
        <div key={f} className="relative group">
          <span className="absolute -top-2 left-1 text-[8px] bg-[#1a1a1a] px-1 text-white/40 uppercase">
            {f}
          </span>
          <input
            type="number"
            step="any"
            // FIX: Force formatting on the value so it never shows long decimals
            value={smartFormat(data[f])}
            onChange={(e) => onInput(id, f, e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded text-[10px] p-2 text-white font-mono focus:border-white/50 outline-none"
          />
        </div>
      ))}
    </div>
  </div>
);

export default ControlPanel;
