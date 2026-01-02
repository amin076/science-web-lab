import React from "react";
import { smartFormat } from "./physicsUtils";

const ImpactReport = ({ report }) => {
  if (!report)
    return (
      <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-white/20 text-[10px] uppercase tracking-widest font-bold">
        Awaiting Data...
      </div>
    );

  const { pre, post, timestamp, type } = report;
  const isWall = type === "WALL IMPACT";

  // Helper for rendering a data row
  const DataRow = ({
    label,
    preVal,
    postVal,
    unit = "",
    highlight = false,
    showSign = false,
  }) => {
    const delta = postVal - preVal;
    const isZero = Math.abs(delta) < 0.01;

    // For vector components, negative numbers are important.
    // For Scalars (Energy), we just show the value.
    const format = (v) => smartFormat(v, 2);

    return (
      <>
        <div
          className={`text-left ${
            highlight ? "text-white/70 font-bold" : "text-white/40"
          }`}
        >
          {label}
        </div>
        <div className="text-center opacity-80 font-mono">
          {format(preVal)}
          {unit}
        </div>
        <div
          className={`text-center font-mono font-bold ${
            highlight ? "text-cyan-400" : "text-white"
          }`}
        >
          {format(postVal)}
          {unit}
        </div>
        <div
          className={`text-right font-mono ${
            isZero
              ? "text-white/20"
              : delta > 0
              ? "text-emerald-400"
              : "text-rose-400"
          }`}
        >
          {isZero ? "-" : (delta > 0 ? "+" : "") + format(delta)}
        </div>
      </>
    );
  };

  return (
    <div
      className={`border rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isWall
          ? "bg-orange-500/5 border-orange-500/20"
          : "bg-cyan-500/5 border-cyan-500/20"
      }`}
    >
      <div className="flex justify-between items-end">
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${
            isWall ? "text-orange-400" : "text-cyan-500"
          }`}
        >
          {type || "COLLISION"}
        </span>
        <span className="text-[9px] font-mono text-white/30">{timestamp}</span>
      </div>

      <div className="grid grid-cols-4 gap-y-2 text-[9px] font-mono border-t border-white/5 pt-3">
        {/* HEADERS */}
        <div className="opacity-20 uppercase font-bold text-[8px]">Metric</div>
        <div className="text-center opacity-20 uppercase font-bold text-[8px]">
          Pre
        </div>
        <div className="text-center opacity-20 uppercase font-bold text-[8px]">
          Post
        </div>
        <div className="text-right opacity-20 uppercase font-bold text-[8px]">
          Delta
        </div>

        {/* --- BODY ALPHA --- */}
        <div className="col-span-4 h-px bg-white/5 my-1" />
        <div className="col-span-4 text-[8px] font-bold text-[#4ECDC4] uppercase mb-1">
          Body Alpha
        </div>

        {/* Splitting Momentum into X and Y to make the math transparent */}
        <DataRow label="Momentum X" preVal={pre.p1.px} postVal={post.p1.px} />
        <DataRow label="Momentum Y" preVal={pre.p1.py} postVal={post.p1.py} />
        <DataRow
          label="Kinetic Energy"
          preVal={pre.p1.ke}
          postVal={post.p1.ke}
          unit="J"
        />

        {/* --- BODY BETA --- */}
        <div className="col-span-4 h-px bg-white/5 my-1" />
        <div className="col-span-4 text-[8px] font-bold text-[#FF6B6B] uppercase mb-1">
          Body Beta
        </div>

        <DataRow label="Momentum X" preVal={pre.p2.px} postVal={post.p2.px} />
        <DataRow label="Momentum Y" preVal={pre.p2.py} postVal={post.p2.py} />
        <DataRow
          label="Kinetic Energy"
          preVal={pre.p2.ke}
          postVal={post.p2.ke}
          unit="J"
        />

        {/* --- SYSTEM TOTALS --- */}
        <div className="col-span-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

        {/* Showing Total X and Total Y separately proves conservation */}
        <DataRow
          label="SYS MOMENTUM X"
          preVal={pre.sys.momentumX}
          postVal={post.sys.momentumX}
          highlight={true}
        />
        <DataRow
          label="SYS MOMENTUM Y"
          preVal={pre.sys.momentumY}
          postVal={post.sys.momentumY}
          highlight={true}
        />
        <DataRow
          label="TOTAL ENERGY"
          preVal={pre.sys.ke}
          postVal={post.sys.ke}
          unit="J"
          highlight={true}
        />
      </div>
    </div>
  );
};

export default ImpactReport;
