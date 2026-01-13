import React from "react";
import { CONTROL_SCHEMA } from "./schema";
import { clamp, formatNumber } from "./constants";

export default function Controls({ params, setParam }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-black tracking-wide">Controls</div>
        <div className="text-xs text-white/40 font-mono">
          {CONTROL_SCHEMA.length} inputs
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONTROL_SCHEMA.map((c) => {
          // ---- Toggle ----
          if (c.type === "toggle") {
            const checked = !!params[c.key];

            return (
              <label
                key={c.key}
                className="sm:col-span-2 flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-3 py-2"
              >
                <div className="pr-3">
                  <div className="text-white/80 text-sm font-bold">
                    {c.label}
                  </div>
                  {c.help ? (
                    <div className="text-white/35 text-xs mt-0.5">
                      {c.help}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-pressed={checked}
                  onClick={() => setParam(c.key, !checked)}
                  className={`relative w-12 h-7 rounded-full border transition-all ${
                    checked
                      ? "bg-emerald-500/25 border-emerald-500/40"
                      : "bg-white/5 border-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 block w-5 h-5 rounded-full bg-white transition-all ${
                      checked ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            );
          }

          // ---- Select (optional) ----
          if (c.type === "select") {
            const value = params[c.key] ?? c.defaultValue ?? "";

            return (
              <div
                key={c.key}
                className="bg-black/20 border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white/70 text-xs font-bold">
                    {c.label}
                  </div>
                  <div className="text-white/50 text-xs font-mono">
                    {String(value)}
                  </div>
                </div>

                <select
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-white/80 outline-none"
                  value={value}
                  onChange={(e) => setParam(c.key, e.target.value)}
                >
                  {(c.options || []).map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label ?? String(opt.value)}
                    </option>
                  ))}
                </select>

                {c.help ? (
                  <div className="text-white/35 text-xs mt-1">{c.help}</div>
                ) : null}
              </div>
            );
          }

          // ---- Number (range slider) ----
          const raw = params[c.key];
          const display = Number.isFinite(raw) ? raw : c.defaultValue;

          return (
            <div
              key={c.key}
              className="bg-black/20 border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-xs font-bold">
                  {c.label}
                  {c.unit ? (
                    <span className="text-white/35"> ({c.unit})</span>
                  ) : null}
                </div>
                <div className="text-white/50 text-xs font-mono">
                  {formatNumber(display, 3)}
                </div>
              </div>

              <div className="mt-2">
                <input
                  aria-label={c.label}
                  className="w-full accent-cyan-300"
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={display}
                  onChange={(e) => {
                    const num = parseFloat(e.target.value);
                    const v = clamp(
                      Number.isFinite(num) ? num : c.defaultValue,
                      c.min,
                      c.max
                    );
                    setParam(c.key, v);
                  }}
                />
              </div>

              {c.help ? (
                <div className="text-white/35 text-xs mt-1">{c.help}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
