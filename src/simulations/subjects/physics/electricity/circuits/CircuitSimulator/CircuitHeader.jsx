import React from "react";

export default function CircuitHeader() {
  return (
    <header className="px-5 py-3 bg-[#16213e] border-b-2 border-[#0f3460] flex items-center justify-between z-20 shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-[#0f3460] hover:bg-[#2a2a4e] px-3 py-1 rounded text-sm text-gray-300 border border-[#2a2a4e]"
        >
          ← Back to Lab
        </button>
        <h1 className="text-xl font-bold text-[#e94560] tracking-wide">
          Circuit Simulator
        </h1>
      </div>
      <div className="text-xs text-gray-400">
        Click terminals to connect • Drag to move
      </div>
    </header>
  );
}
