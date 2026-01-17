import React, { useState } from "react";

const fmt = (num) => {
  if (num === undefined) return "--";
  if (!isFinite(num)) return "∞"; // Show infinity symbol
  return num.toFixed(5);
};

export default function SimulationHUD({ live }) {
  const [showFormulas, setShowFormulas] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 font-mono">
      <div className="bg-slate-900/90 border border-white/20 rounded-xl p-4 text-white shadow-2xl w-80 backdrop-blur-none">
        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
          <span className="font-bold text-cyan-400 text-sm">Live Telemetry</span>
          <span className="text-xs text-white/50">t = {fmt(live.t)} s</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
          {/* New Period Display */}
          <div className="flex justify-between"><span className="text-white/60">T (Period):</span> <span className="text-yellow-300 font-bold">{fmt(live.period)} s</span></div>
          <div className="flex justify-between"><span className="text-white/60">ω:</span> <span className="text-sky-300">{fmt(live.omega)}</span></div>

          <div className="flex justify-between"><span className="text-white/60">x:</span> <span className="text-purple-300">{fmt(live.x)}</span></div>
          <div className="flex justify-between"><span className="text-white/60">y:</span> <span className="text-purple-300">{fmt(live.y)}</span></div>
          
          <div className="flex justify-between"><span className="text-white/60">v:</span> <span className="text-green-300">{fmt(live.v)}</span></div>
          <div className="flex justify-between"><span className="text-white/60">|a|:</span> <span className="text-red-300">{fmt(live.a)}</span></div>
          
          <div className="col-span-2 border-t border-white/10 mt-1 pt-1 flex justify-between">
            <span className="text-white/60">F_net:</span> <span className="text-red-400 font-bold">{fmt(live.force)} N</span>
          </div>
        </div>
        <button onClick={() => setShowFormulas(!showFormulas)} className="w-full mt-3 text-[10px] bg-white/10 hover:bg-white/20 py-1 rounded text-white/60 transition-colors uppercase tracking-wider">
          {showFormulas ? "Hide Formulas" : "Show Formulas"}
        </button>
      </div>
      
      {showFormulas && (
        <div className="bg-slate-900/90 border border-white/20 rounded-xl p-4 text-white shadow-2xl w-80 text-[10px] opacity-95">
          <ul className="space-y-2 text-white/80">
            {/* New Period Formula */}
            <li className="flex justify-between border-b border-white/5 pb-1"><span>Period</span> <span className="text-yellow-300">T = 2π / |ω|</span></li>
            
            <li className="flex justify-between border-b border-white/5 pb-1"><span>Position</span> <span className="text-purple-300">x = r·cos(θ)</span></li>
            <li className="flex justify-between border-b border-white/5 pb-1"><span>Velocity</span> <span className="text-green-300">v = r·ω</span></li>
            <li className="flex justify-between border-b border-white/5 pb-1"><span>Acceleration</span> <span className="text-red-300">a = √(a_c² + a_t²)</span></li>
            <li className="flex justify-between"><span>Numerical Int.</span> <span className="text-cyan-300">θ += ω·dt</span></li>
          </ul>
        </div>
      )}
    </div>
  );
}