// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalResults.jsx
import React from "react";
import { calculateOpticalElement } from "./OpticalPhysics";

export default function OpticalResults({
  type,
  focalLength,
  objDistance,
  objHeight,
}) {
  const r = calculateOpticalElement(type, focalLength, objDistance, objHeight);

  return (
    <div className="mt-6 pt-6 border-t border-white/10 pb-4">
      <h3 className="text-[10px] font-bold text-white/90 mb-4 uppercase tracking-wider flex justify-between">
        Analysis
        <span
          className={`px-2 py-0.5 rounded text-[9px] ${
            r.isReal
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-300"
          }`}
        >
          {r.isReal ? "REAL IMAGE" : "VIRTUAL IMAGE"}
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Image Dist (d<sub>i</sub>)
          </div>
          <div
            className={`font-mono font-bold text-lg ${
              r.isReal ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {r.di.toFixed(1)} <span className="text-xs opacity-60">cm</span>
          </div>
        </div>
        <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Magnification
          </div>
          <div className="text-white font-mono font-bold text-lg">
            {Math.abs(r.m).toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5 relative overflow-hidden">
        <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mb-3">
          Physics Logic
        </div>

        <div className="flex justify-center items-center py-2 mb-3 bg-black/20 rounded-lg">
          <div className="text-white font-serif italic text-sm">
            1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 leading-relaxed text-justify">
          {type === "convex-lens" && (
            <>
              Convex Lens (Converging): Real image opposite side if d
              <sub>o</sub> &gt; f.
            </>
          )}
          {type === "concave-lens" && (
            <>Concave Lens (Diverging): Always Virtual image on same side.</>
          )}
          {type === "concave-mirror" && (
            <>
              Concave Mirror (Converging): Real image same side if d<sub>o</sub>{" "}
              &gt; f. Virtual behind if d<sub>o</sub> &lt; f.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
