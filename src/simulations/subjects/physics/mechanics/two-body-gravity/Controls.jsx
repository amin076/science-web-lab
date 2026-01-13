import React from "react";
import { CONTROL_SCHEMA } from "./schema";
import { clamp, formatNumber } from "./constants";

export default function Controls({ params, setParam }) {
  // Helper to determine if a control belongs to a specific group for visual separation
  // (Optional refinement: we can just render them in order defined in schema)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-black tracking-wide">Parameters</div>
        <div className="text-xs text-white/40 font-mono">
          {CONTROL_SCHEMA.length} inputs
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONTROL_SCHEMA.map((c, i) => {
          // Render logic based on type

          // 1. Toggle
          if (c.type === "toggle") {
            const checked = !!params[c.key];
            return (
              <label
                key={c.key}
                className="col-span-1 sm:col-span-2 flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-black/30 transition-colors"
              >
                <div className="pr-3">
                  <div className="text-white/80 text-sm font-bold">
                    {c.label}
                  </div>
                  {c.help && (
                    <div className="text-white/35 text-xs mt-0.5">{c.help}</div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => setParam(c.key, e.target.checked)}
                  />
                  <div
                    className={`w-10 h-6 rounded-full border transition-all ${
                      checked
                        ? "bg-emerald-500/25 border-emerald-500/40"
                        : "bg-white/5 border-white/15"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                        checked ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label>
            );
          }

          // 2. Select
          if (c.type === "select") {
            const value = params[c.key] ?? c.defaultValue ?? "";
            return (
              <div
                key={c.key}
                className="bg-black/20 border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white/70 text-xs font-bold">
                    {c.label}
                  </div>
                </div>
                <select
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white/80 outline-none focus:border-white/30 transition-colors"
                  value={value}
                  onChange={(e) => setParam(c.key, e.target.value)}
                >
                  {(c.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label ?? opt.value}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // 3. Number (Range Slider)
          const raw = params[c.key];
          const val = Number.isFinite(raw) ? raw : c.defaultValue;

          return (
            <div
              key={c.key}
              className="bg-black/20 border border-white/10 rounded-xl p-3 group hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/70 text-xs font-bold">
                  {c.label}
                  {c.unit && (
                    <span className="text-white/35 ml-1">({c.unit})</span>
                  )}
                </div>
                <div className="text-white/90 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
                  {formatNumber(val, countDecimals(c.step))}
                </div>
              </div>

              <input
                type="range"
                className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                min={c.min}
                max={c.max}
                step={c.step}
                value={val}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  setParam(c.key, clamp(n, c.min, c.max));
                }}
              />

              {c.help && (
                <div className="text-white/30 text-[10px] mt-1 leading-tight">
                  {c.help}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to determine formatting precision based on step size
function countDecimals(value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1]?.length || 0;
}
