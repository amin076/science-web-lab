// src/components/features/circuits/CircuitSimulator/Sidebar/Sidebar.jsx
import React from "react";
import { COMPONENT_TYPES } from "../../CircuitUtils";

export default function Sidebar({
  onAdd,
  onToggleSim,
  onReset,
  onClear,
  onOpenLab,
  isSimulating,
}) {
  const items = {
    [COMPONENT_TYPES.BATTERY]: { icon: "🔋", label: "Battery" },
    [COMPONENT_TYPES.RESISTOR]: { icon: "⚡", label: "Resistor" },
    [COMPONENT_TYPES.CAPACITOR]: { icon: "||", label: "Capacitor" },
    [COMPONENT_TYPES.INDUCTOR]: { icon: "🌀", label: "Inductor" },
    [COMPONENT_TYPES.SWITCH]: { icon: "🔌", label: "Switch" },
    [COMPONENT_TYPES.LED]: { icon: "💡", label: "LED" },
    [COMPONENT_TYPES.NODE]: { icon: "⚫", label: "Wire Joint" }, // <--- NEW BUTTON
    [COMPONENT_TYPES.GROUND]: { icon: "⏚", label: "Ground" },
  };

  // ... rest of your Sidebar code (same as before)
  return (
    <aside className="w-64 bg-[#16213e] border-r border-[#0f3460] flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-[#e94560] font-bold mb-4 uppercase text-xs tracking-wider">
          Components
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-8">
          {Object.entries(items).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#1a1a2e] hover:bg-[#0f3460] border border-transparent hover:border-[#4ecca3] transition-all group"
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {meta.icon}
              </span>
              <span className="text-xs text-gray-400 group-hover:text-white">
                {meta.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Controls (Same as before) */}
      <div className="p-4 border-t border-[#0f3460] bg-[#1a1a2e]">
        {/* ... existing simulation buttons ... */}
        <h3 className="text-[#e94560] font-bold mb-4 uppercase text-xs tracking-wider">
          Simulation
        </h3>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onToggleSim()}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
              isSimulating
                ? "bg-[#f39c12] hover:bg-[#d35400]"
                : "bg-[#e94560] hover:bg-[#c0392b]"
            }`}
          >
            {isSimulating ? "⏸ Stop" : "▶ Start Live"}
          </button>

          <button
            onClick={() => onOpenLab("capacitor")}
            className="w-full py-2 bg-transparent border border-[#4ecca3] text-[#4ecca3] hover:bg-[#4ecca3] hover:text-[#1a1a2e] rounded text-sm transition-all"
          >
            🧮 Design Capacitor
          </button>
          <button
            onClick={() => onOpenLab("resistor")}
            className="w-full py-2 bg-transparent border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black rounded text-sm transition-all"
          >
            🔥 Design Resistor
          </button>
          <button
            onClick={() => onOpenLab("inductor")}
            className="w-full py-2 bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black rounded text-sm transition-all"
          >
            🌀 Design Inductor
          </button>
          <button
            onClick={() => onOpenLab("led")}
            className="w-full py-2 bg-transparent border border-red-400 text-red-400 hover:bg-red-400 hover:text-black rounded text-sm transition-all"
          >
            💡 Design LED
          </button>

          <button
            onClick={onReset}
            className="w-full py-2 bg-[#0f3460] text-cyan-400 hover:bg-[#1f4272] rounded text-sm transition-all mt-2"
          >
            🔄 Reset Values
          </button>

          <button
            onClick={onClear}
            className="w-full py-2 bg-[#c0392b] text-white hover:bg-[#e74c3c] rounded text-sm transition-all"
          >
            🗑 Clear Board
          </button>
        </div>
      </div>
    </aside>
  );
}
