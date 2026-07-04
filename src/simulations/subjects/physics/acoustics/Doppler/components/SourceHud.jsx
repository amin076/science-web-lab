// src/simulations/subjects/physics/acoustics/Doppler/components/SourceHud.jsx
import { useState } from "react";
import { Activity, ChevronDown, ChevronUp, Radio } from "lucide-react";
import { INSTRUMENTS } from "../SoundEngine";

const EXACT_FREQUENCY_INSTRUMENTS = [
  "sine",
  "saw",
  "square",
  "organ",
  "brass",
  "drone",
];

const getInstrumentName = (id) =>
  Object.values(INSTRUMENTS).find((inst) => inst.id === id)?.name || "Sound";

const hasExactFrequency = (source) =>
  EXACT_FREQUENCY_INSTRUMENTS.includes(source.instrument);

const getRate = (source) => {
  const base = source.baseFreq || 1;
  return Math.max(0.01, source.currentFreq / base);
};

const SourceHud = ({ sources, mode }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="absolute left-1/2 top-4 z-40 w-[330px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/30 bg-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-[2px]">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="w-full px-4 py-2.5 border-b border-white/20 bg-white/[0.08] flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-300/15 border border-emerald-200/45 flex items-center justify-center">
            <Activity size={18} className="text-emerald-100" />
          </div>

          <div className="text-left">
            <div className="text-sm font-black text-white drop-shadow">
              Doppler Shift
            </div>
            <div className="text-[11px] text-white/80">
              {mode === "car" ? "moving car source" : "sound sources"}
            </div>
          </div>
        </div>

        <div className="text-white/90">
          {collapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
        </div>
      </button>

      {!collapsed && (
        <div className="p-2.5 space-y-2 max-h-[360px] overflow-y-auto">
          {sources.map((source, index) => {
            const rate = getRate(source);
            const shift = source.shiftPercent || 0;
            const higher = shift > 0;
            const lower = shift < 0;
            const exactFrequency = hasExactFrequency(source);

            const name =
              mode === "car"
                ? getInstrumentName(source.instrument)
                : `Source ${index + 1} · ${getInstrumentName(source.instrument)}`;

            return (
              <div
                key={source.id}
                className="rounded-xl bg-slate-950/35 border border-white/20 p-2.5 shadow-lg backdrop-blur-[2px]"
                style={{ borderLeft: `4px solid ${source.color}` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio size={14} style={{ color: source.color }} />
                    <div className="text-[11px] font-black text-white truncate drop-shadow">
                      {name}
                    </div>
                  </div>

                  <div
                    className={`text-xs font-black drop-shadow ${
                      higher
                        ? "text-emerald-200"
                        : lower
                          ? "text-amber-200"
                          : "text-white"
                    }`}
                  >
                    {shift > 0 ? "+" : ""}
                    {Math.round(shift)}%
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exactFrequency ? (
                    <>
                      <Metric
                        label="Emitted"
                        value={`${Math.round(source.baseFreq)} Hz`}
                      />
                      <Metric
                        label="Observed"
                        value={`${Math.round(source.currentFreq)} Hz`}
                        highlight
                      />
                    </>
                  ) : (
                    <>
                      <Metric label="Original" value="1.00×" />
                      <Metric
                        label="Doppler rate"
                        value={`${rate.toFixed(2)}×`}
                        highlight
                      />
                    </>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-white/75">Motion</span>
                  <span
                    className={`font-bold drop-shadow ${
                      higher
                        ? "text-emerald-200"
                        : lower
                          ? "text-amber-200"
                          : "text-white"
                    }`}
                  >
                    {source.motionStatus || "No shift"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value, highlight = false }) => (
  <div
    className={`rounded-lg px-2.5 py-2 border backdrop-blur-[8px] ${
      highlight
        ? "bg-emerald-300/14 border-emerald-200/45"
        : "bg-white/[0.08] border-white/20"
    }`}
  >
    <div className="text-[9px] text-white/70">{label}</div>
    <div
      className={`text-sm font-black font-mono drop-shadow ${
        highlight ? "text-emerald-100" : "text-white"
      }`}
    >
      {value}
    </div>
  </div>
);

export default SourceHud;
