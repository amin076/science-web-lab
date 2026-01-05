import { Lock, Thermometer, Activity, Gauge, Box } from "lucide-react";

export default function ControlPanel({
  volume,
  temperature,
  pressure,
  lockedParam,
  setLockedParam,
  onUpdate,
}) {
  return (
    <div className="flex flex-col h-1/2 relative">
      <style>{`
        .modern-scrollbar::-webkit-scrollbar { width: 6px; }
        .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modern-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
      `}</style>

      <div className="p-5 border-b border-slate-800 bg-slate-900 shrink-0">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-blue-500" /> Experiment Controls
        </h2>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto modern-scrollbar flex-1">
        {/* Lock Selection */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock size={12} /> Hold Constant Variable
          </div>
          <div className="grid grid-cols-3 gap-2">
            <LockBtn
              label="Temp (T)"
              active={lockedParam === "T"}
              onClick={() => setLockedParam("T")}
              color="red"
            />
            <LockBtn
              label="Volume (V)"
              active={lockedParam === "V"}
              onClick={() => setLockedParam("V")}
              color="blue"
            />
            <LockBtn
              label="Pressure (P)"
              active={lockedParam === "P"}
              onClick={() => setLockedParam("P")}
              color="orange"
            />
          </div>
        </div>

        {/* 1. TEMPERATURE */}
        <SliderControl
          label="Temperature"
          val={temperature}
          unit="K"
          min={100}
          max={1000}
          step={10}
          color="red"
          icon={<Thermometer size={16} />}
          isLocked={lockedParam === "T"}
          onChange={(v) => onUpdate("T", v)}
        />

        {/* 2. VOLUME (Updated Max to 85L based on P=1atm calc) */}
        <SliderControl
          label="Volume"
          val={volume}
          unit="L"
          min={5}
          max={85}
          step={0.5}
          color="blue"
          icon={<Box size={16} />}
          isLocked={lockedParam === "V"}
          onChange={(v) => onUpdate("V", v)}
        />

        {/* 3. PRESSURE (Updated Min to 1.0 atm) */}
        <SliderControl
          label="Pressure"
          val={pressure}
          unit="atm"
          min={1.0}
          max={20.0}
          step={0.1}
          color="orange"
          icon={<Gauge size={16} />}
          isLocked={lockedParam === "P"}
          onChange={(v) => onUpdate("P", v)}
        />

        <div className="h-4"></div>
      </div>
    </div>
  );
}

// Helpers (Same as before)
const LockBtn = ({ label, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
      active
        ? `bg-${color}-500/20 border-${color}-500 text-${color}-400 shadow-[0_0_10px_rgba(0,0,0,0.5)]`
        : "bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600"
    }`}
  >
    {label}
  </button>
);
const SliderControl = ({
  label,
  val,
  unit,
  min,
  max,
  step,
  color,
  icon,
  isLocked,
  onChange,
}) => (
  <div
    className={`transition-all duration-300 ${
      isLocked ? "opacity-40 grayscale pointer-events-none" : "opacity-100"
    }`}
  >
    <div className="flex justify-between items-end mb-2">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
        <span className={`text-${color}-400`}>{icon}</span> {label}
      </div>
      <div className="flex items-center gap-2">
        {isLocked && <Lock size={12} className="text-slate-500" />}
        <span
          className={`font-mono text-sm ${
            isLocked ? "text-slate-500" : `text-${color}-400`
          }`}
        >
          {val.toFixed(1)} {unit}
        </span>
      </div>
    </div>
    <div className="relative h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-3 shadow-inner group hover:border-slate-700 transition-colors">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        disabled={isLocked}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-colors ${
          isLocked ? "bg-slate-700" : `bg-slate-700 accent-${color}-500`
        }`}
      />
    </div>
  </div>
);
