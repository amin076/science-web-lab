import React from "react";
import { HUD_SCHEMA } from "./schema";
import { formatNumber } from "./constants";

export default function HUD({ hud }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-black tracking-wide">HUD</div>
        <div className="text-xs text-white/40 font-mono">Live Data</div>
      </div>

      {/* Dynamic Note/Status */}
      {hud?.note ? (
        <div
          className={`text-sm mb-3 px-3 py-2 rounded-lg border ${
            hud.note.includes("COLLISION")
              ? "bg-red-500/20 text-red-200 border-red-500/30 font-bold"
              : "bg-white/5 text-white/60 border-white/5"
          }`}
        >
          {hud.note}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 text-sm">
        {HUD_SCHEMA.map((it) => (
          <Item
            key={it.key}
            label={it.label}
            unit={it.unit}
            value={hud?.[it.key]}
            precision={it.precision}
          />
        ))}
      </div>
    </div>
  );
}

function Item({ label, unit, value, precision = 3 }) {
  let v = "—";

  if (value === Infinity) v = "∞";
  else if (Number.isFinite(value)) v = formatNumber(value, precision);

  return (
    <div className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
      <div className="text-white/55 text-xs font-bold">
        {label}
        {unit ? <span className="text-white/35"> ({unit})</span> : null}
      </div>
      <div className="text-white/80 text-xs font-mono">{v}</div>
    </div>
  );
}
