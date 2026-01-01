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
    [COMPONENT_TYPES.AC_SOURCE]: { icon: "〰️", label: "AC Source" },
    [COMPONENT_TYPES.RESISTOR]: { icon: "⚡", label: "Resistor" },
    [COMPONENT_TYPES.CAPACITOR]: { icon: "||", label: "Capacitor" },
    [COMPONENT_TYPES.INDUCTOR]: { icon: "🌀", label: "Inductor" },
    [COMPONENT_TYPES.SWITCH]: { icon: "🔌", label: "Switch" },
    [COMPONENT_TYPES.DIODE]: { icon: "➡️", label: "Diode" },
    [COMPONENT_TYPES.LED]: { icon: "💡", label: "LED" },
    [COMPONENT_TYPES.NODE]: { icon: "⚫", label: "Wire Joint" },
    [COMPONENT_TYPES.GROUND]: { icon: "⏚", label: "Ground" },
  };

  return (
    <aside className="w-[260px] bg-[#16213e] text-white p-3 flex flex-col gap-4 border-r border-[#0f3460] h-full min-h-0 overflow-y-auto">
      {/* Components */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0">
        <h3 className="text-sm font-bold tracking-wide text-cyan-300 mb-3">
          Components
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(items).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="bg-[#1a1a2e] border border-[#2a2a4e] hover:border-cyan-500 hover:bg-[#20203a] rounded-lg p-2 flex flex-col items-center gap-1 transition"
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-[11px] text-gray-200">{meta.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0">
        <h3 className="text-sm font-bold tracking-wide text-red-300 mb-3">
          Simulation
        </h3>

        <div className="flex flex-col gap-2">
          <button
            onClick={onToggleSim}
            className={`w-full py-2 rounded font-semibold transition ${
              isSimulating
                ? "bg-[#f39c12] hover:bg-[#d35400]"
                : "bg-[#e94560] hover:bg-[#c0392b]"
            }`}
          >
            {isSimulating ? "⏸ Stop" : "▶ Start Live"}
          </button>

          <button
            onClick={() => onOpenLab("capacitor")}
            className="w-full py-2 border border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black rounded text-sm transition-all"
          >
            🧮 Design Capacitor
          </button>
          <button
            onClick={() => onOpenLab("resistor")}
            className="w-full py-2 border border-orange-400 text-orange-200 hover:bg-orange-400 hover:text-black rounded text-sm transition-all"
          >
            🔥 Design Resistor
          </button>
          <button
            onClick={() => onOpenLab("inductor")}
            className="w-full py-2 border border-purple-400 text-purple-200 hover:bg-purple-400 hover:text-black rounded text-sm transition-all"
          >
            🌀 Design Inductor
          </button>
          <button
            onClick={() => onOpenLab("led")}
            className="w-full py-2 border border-yellow-400 text-yellow-200 hover:bg-yellow-400 hover:text-black rounded text-sm transition-all"
          >
            💡 Design LED
          </button>

          <button
            onClick={onReset}
            className="w-full py-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] rounded transition"
          >
            🔄 Reset Values
          </button>

          <button
            onClick={onClear}
            className="w-full py-2 bg-[#c0392b] hover:bg-[#e74c3c] rounded transition"
          >
            🗑 Clear Board
          </button>
        </div>
      </div>
    </aside>
  );
}
