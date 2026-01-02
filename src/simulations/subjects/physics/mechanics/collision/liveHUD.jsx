import React from "react";
import { smartFormat } from "./physicsUtils";

const LiveHUD = ({ data }) => {
  const { p1, p2, system } = data;

  const Cell = ({ label, val, unit = "", color = "text-white" }) => (
    <div className="flex justify-between items-baseline gap-4 text-[10px] font-mono border-b border-white/5 pb-1 last:border-0">
      <span className="text-white/40 uppercase tracking-tight">{label}</span>
      <span className={`font-bold ${color}`}>
        {smartFormat(val, 2)}
        {unit}
      </span>
    </div>
  );

  return (
    // UPDATED: Much clearer background (bg-black/10) and lighter blur for visibility
    <div className="absolute top-4 right-4 w-60 bg-black/10 backdrop-blur-[2px] border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-none">
      {/* HEADER WITH GLOWING DOT */}
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">
          Live Telemetry
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">
            REC
          </span>
          {/* GLOWING PULSING DOT */}
          <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_2px_rgba(220,38,38,0.8)] animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {/* BODY 1 */}
        <div>
          <div className="text-[9px] font-bold text-[#4ECDC4] mb-1 opacity-80">
            BODY ALPHA
          </div>
          <Cell label="Px" val={p1.px} />
          <Cell label="Py" val={p1.py} />
          <Cell label="KE" val={p1.ke} unit="J" />
        </div>

        {/* BODY 2 */}
        <div>
          <div className="text-[9px] font-bold text-[#FF6B6B] mb-1 opacity-80">
            BODY BETA
          </div>
          <Cell label="Px" val={p2.px} />
          <Cell label="Py" val={p2.py} />
          <Cell label="KE" val={p2.ke} unit="J" />
        </div>

        {/* SYSTEM */}
        <div className="bg-black/20 -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-white/5">
          <div className="text-[9px] font-bold text-emerald-400 mb-1 opacity-90">
            SYSTEM TOTALS
          </div>
          <Cell
            label="Total Px"
            val={system.momentumX}
            color="text-emerald-400"
          />
          <Cell
            label="Total Py"
            val={system.momentumY}
            color="text-emerald-400"
          />
          <Cell
            label="Total Energy"
            val={system.ke}
            unit="J"
            color="text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};

export default LiveHUD;
