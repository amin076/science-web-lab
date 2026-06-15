// src/simulations/subjects/physics/acoustics/Doppler/components/SourceControlCard.jsx
import { Trash2, Music } from "lucide-react";
import { INSTRUMENTS } from "../SoundEngine";
import { MAX_DISTANCE, MODES } from "../constants";

const SourceControlCard = ({
  source,
  index,
  mode,
  onRemoveSource,
  onUpdateSourceVal,
}) => {
  const isCarMode = mode === MODES.CAR || mode === "car";
  const isHigher = source.currentFreq > source.baseFreq;
  const isLower = source.currentFreq < source.baseFreq;

  return (
    <div
      className="bg-slate-900/80 p-4 rounded-lg border-l-2 space-y-3 relative group"
      style={{ borderLeftColor: source.color }}
    >
      <div className="flex justify-between items-start">
        <div className="text-xs font-bold text-slate-300">
          {isCarMode ? "Car" : `Source #${index + 1}`}
        </div>

        {!isCarMode && (
          <button
            onClick={() => onRemoveSource(source.id)}
            className="text-slate-600 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {!isCarMode && (
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
              <option key={inst.id} value={inst.id} className="bg-slate-900">
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <SliderRow
        label="Position"
        value={source.x}
        suffix="m"
        min={0}
        max={MAX_DISTANCE}
        color={source.color}
        onChange={(value) => onUpdateSourceVal(source.id, "x", value)}
      />

      <SliderRow
        label="Velocity"
        value={source.v}
        suffix="m/s"
        min={-150}
        max={150}
        color={source.color}
        onChange={(value) => onUpdateSourceVal(source.id, "v", value)}
      />

      <SliderRow
        label={isCarMode ? "Engine Freq" : "Base Freq"}
        value={source.baseFreq}
        suffix="Hz"
        min={100}
        max={1000}
        color={source.color}
        onChange={(value) => onUpdateSourceVal(source.id, "baseFreq", value)}
      />

      <div className="mt-3 rounded-lg bg-slate-950/70 border border-white/10 p-3 text-xs space-y-2">
        <InfoRow label="Emitted" value={`${Math.round(source.baseFreq)} Hz`} />
        <InfoRow
          label="Observed"
          value={`${Math.round(source.currentFreq)} Hz`}
          valueClassName="text-emerald-300"
        />

        <div className="flex justify-between">
          <span className="text-slate-400">Shift</span>
          <span
            className={`font-mono ${
              isHigher
                ? "text-emerald-300"
                : isLower
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
  );
};

const SliderRow = ({
  label,
  value,
  suffix,
  min,
  max,
  color,
  onChange,
}) => (
  <div>
    <div className="flex justify-between text-[10px] mb-1 text-slate-400">
      <span>{label}</span>
      <span>
        {Math.round(value)}
        {suffix}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

const InfoRow = ({ label, value, valueClassName = "text-slate-200" }) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}</span>
    <span className={`font-mono ${valueClassName}`}>{value}</span>
  </div>
);

export default SourceControlCard;