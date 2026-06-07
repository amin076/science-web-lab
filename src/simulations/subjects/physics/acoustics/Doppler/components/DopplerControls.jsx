//src/simulations/subjects/physics/acoustics/Doppler/components/DopplerControls.jsx
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  Ear,
  Activity,
  Music,
  Car,
  FlaskConical,
} from "lucide-react";

import { INSTRUMENTS } from "../SoundEngine";
import { MAX_DISTANCE, SOURCE_PRESETS } from "../constants";

const DopplerControls = ({
  mode,
  isRunning,
  masterVolume,
  observer,
  sources,
  onModeChange,
  onTogglePlay,
  onReset,
  onAddSource,
  onAddCarPreset,
  onRemoveSource,
  onUpdateSourceVal,
  onSetObserver,
  onSetMasterVolume,
  masterGainRef,
}) => {
  return (
    <aside className="w-96 h-full bg-slate-950/80 border-l border-white/10 backdrop-blur-md flex flex-col shadow-2xl z-50">
        <div className="p-6 border-b border-white/10 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Activity className="text-blue-500" /> Doppler Lab
          </h2>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() =>  onModeChange("scientific")}
              className={`py-2 rounded border text-xs font-bold flex items-center justify-center gap-2 ${
                mode === "scientific"
                  ? "bg-blue-500/20 border-blue-400 text-blue-300"
                  : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <FlaskConical size={14} /> Scientific
            </button>

            <button
              onClick={() =>  onModeChange("car")}
              className={`py-2 rounded border text-xs font-bold flex items-center justify-center gap-2 ${
                mode === "car"
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                  : "bg-slate-900 border-white/10 text-slate-400"
              }`}
            >
              <Car size={14} /> Car Mode
            </button>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onTogglePlay}
              className={`flex-1 py-2 rounded font-bold flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                  : "bg-emerald-500 text-slate-900"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={18} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} /> Run Simulation
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="px-3 rounded bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {mode === "car" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
                <Car size={14} /> Car Presets
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(SOURCE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() =>  onAddCarPreset(key)}
                    className="text-[11px] rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 py-2"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
              <Ear size={14} /> The Observer
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/20 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Position (x)</span>
                  <span className="font-mono">{Math.round(observer.x)} m</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={MAX_DISTANCE}
                  step="1"
                  value={observer.x}
                  onChange={(e) =>
                    onSetObserver((p) => ({
                      ...p,
                      x: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Velocity (v)</span>
                  <span className="font-mono text-blue-400">
                    {observer.v} m/s
                  </span>
                </div>

                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={observer.v}
                  onChange={(e) =>
                    onSetObserver((p) => ({
                      ...p,
                      v: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
                <Volume2 size={14} />{" "}
                {mode === "car" ? "Car Source" : "Sound Sources"}
              </div>

              {mode !== "car" && (
                <button
                  onClick={onAddSource}
                  className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded hover:bg-emerald-500/20 flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              )}
            </div>

            {sources.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                No sources active.
              </div>
            )}

            {sources.map((source, idx) => (
              <div
                key={source.id}
                className="bg-slate-900/80 p-4 rounded-lg border-l-2 space-y-3 relative group"
                style={{ borderLeftColor: source.color }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-slate-300">
                    {mode === "car" ? "Car" : `Source #${idx + 1}`}
                  </div>

                  {mode !== "car" && (
                    <button
                      onClick={() => onRemoveSource(source.id)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {mode !== "car" && (
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-white/5">
                    <Music size={14} className="text-slate-500" />

                    <select
                      value={source.instrument}
                      onChange={(e) =>
                        onUpdateSourceVal(source.id, "instrument", e.target.value)
                      }
                      className="bg-transparent text-xs text-white w-full outline-none cursor-pointer"
                    >
                      {Object.values(INSTRUMENTS).map((inst) => (
                        <option
                          key={inst.id}
                          value={inst.id}
                          className="bg-slate-900"
                        >
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>Position</span>
                    <span>{Math.round(source.x)}m</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={MAX_DISTANCE}
                    value={source.x}
                    onChange={(e) =>
                      onUpdateSourceVal(
                        source.id,
                        "x",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>Velocity</span>
                    <span
                      className={
                        source.v === 0 ? "text-slate-500" : "text-white"
                      }
                    >
                      {source.v} m/s
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={source.v}
                    onChange={(e) =>
                      onUpdateSourceVal(
                        source.id,
                        "v",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>{mode === "car" ? "Engine Freq" : "Base Freq"}</span>
                    <span>{source.baseFreq} Hz</span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="1000"
                    value={source.baseFreq}
                    onChange={(e) =>
                      onUpdateSourceVal(
                        source.id,
                        "baseFreq",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>

                <div className="mt-3 rounded-lg bg-slate-950/70 border border-white/10 p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emitted</span>
                    <span className="font-mono text-slate-200">
                      {Math.round(source.baseFreq)} Hz
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Observed</span>
                    <span className="font-mono text-emerald-300">
                      {Math.round(source.currentFreq)} Hz
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Shift</span>
                    <span
                      className={`font-mono ${
                        source.currentFreq > source.baseFreq
                          ? "text-emerald-300"
                          : source.currentFreq < source.baseFreq
                            ? "text-amber-300"
                            : "text-slate-300"
                      }`}
                    >
                      {source.shiftPercent > 0 ? "+" : ""}
                      {Math.round(source.shiftPercent || 0)}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-center font-bold">
                    {source.motionStatus || "No shift"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/50 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={14} /> Master Volume
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onSetMasterVolume(v);

              if (masterGainRef.current) {
                masterGainRef.current.gain.value = v;
              }
            }}
            className="w-full h-1 bg-slate-700 rounded accent-slate-400 cursor-pointer"
          />
        </div>
      </aside>
  );
};

export default DopplerControls;