// src/simulations/subjects/physics/mechanics/gyroscope/Controls.jsx
import React from "react";
import { Activity, Eye, Pause, Play, RotateCcw } from "lucide-react";
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
  const toggles = CONTROL_SCHEMA.filter((control) => control.type === "toggle");
  const sliders = CONTROL_SCHEMA.filter((control) => control.type === "number");

  return (
    <div className="flex flex-col gap-3 text-slate-100">
      <section className="rounded-2xl border border-white/10 bg-slate-950/30 p-3 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
              Experiment
            </div>
            <div className="mt-0.5 font-mono text-xl font-black tabular-nums text-cyan-300">
              {t.toFixed(2)}
              <span className="ml-1 text-xs font-semibold text-white/35">s</span>
            </div>
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
              running
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/[0.05] text-white/40"
            }`}
          >
            {running ? "Running" : "Ready"}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <button
            type="button"
            aria-label={running ? "Pause simulation" : "Play simulation"}
            data-agent-action={running ? "pause" : "play"}
            onClick={onStartStop}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border font-black tracking-wide transition active:scale-[0.985] ${
              running
                ? "border-rose-300/30 bg-rose-400/15 text-rose-100 hover:bg-rose-400/20"
                : "border-emerald-300/30 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/20"
            }`}
          >
            {running ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
            {running ? "Pause" : "Start"}
          </button>

          <button
            type="button"
            aria-label="Reset simulation"
            data-agent-action="reset"
            onClick={onReset}
            className="flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
            title="Reset simulation"
          >
            <RotateCcw size={19} />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/25 p-3 backdrop-blur-2xl">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
          Initial conditions
        </div>

        <div className="space-y-4">
          {sliders.map((control) => (
            <ModernSlider
              key={control.key}
              label={control.label}
              value={params[control.key]}
              unit={control.unit}
              min={control.min}
              max={control.max}
              step={control.step}
              paramKey={control.key}
              onChange={(value) => setParam(control.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/25 p-3 backdrop-blur-2xl">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
          View options
        </div>

        <div className="grid grid-cols-2 gap-2">
          {toggles.map((control) => {
            const active = params[control.key];
            const Icon = control.key === "showVectors" ? Eye : Activity;

            return (
              <button
                key={control.key}
                type="button"
                aria-label={control.label}
                aria-pressed={active}
                data-agent-param={control.key}
                onClick={() => setParam(control.key, !active)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition ${
                  active
                    ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/[0.035] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                <Icon size={15} />
                <span className="truncate">{control.label.replace("Show ", "")}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ModernSlider({
  label,
  value,
  unit,
  min,
  max,
  step,
  paramKey,
  onChange,
}) {
  const displayValue = Number.isFinite(value) ? value : min;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label
          htmlFor={`gyro-${paramKey}`}
          className="min-w-0 truncate text-xs font-semibold text-slate-300 transition group-hover:text-white"
        >
          {label}
        </label>

        <div className="shrink-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1 font-mono text-[11px] font-bold text-cyan-300">
          {formatNumber(displayValue, step < 0.1 ? 2 : 1)}
          {unit && <span className="ml-1 text-[9px] font-medium text-white/35">{unit}</span>}
        </div>
      </div>

      <input
        id={`gyro-${paramKey}`}
        type="range"
        aria-label={label}
        data-agent-param={paramKey}
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={(event) => {
          const next = Number.parseFloat(event.target.value);
          onChange(clamp(next, min, max));
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
      />
    </div>
  );
}
