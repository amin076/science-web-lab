import React from "react";
import { COMPONENT_TYPES } from "../../CircuitUtils";

export default function PropertiesPanel({
  components,
  connections,
  selectedId,
  onSelect,
  onRotate,
  onUpdateProps,
  onDeleteComponent,
  onDeleteConnection,
}) {
  const selected = components.find((c) => c.id === selectedId);

  return (
    <aside className="w-80 bg-[#16213e] p-4 border-l-2 border-[#0f3460] overflow-y-auto flex flex-col h-full z-10">
      {/* PROPERTIES */}
      <div className="mb-6">
        <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
          Properties
        </h3>

        {selected ? (
          <div className="bg-[#0f3460] p-4 rounded-lg border border-[#2a2a4e]">
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">
              {selected.type.toUpperCase()}
            </h4>

            <div className="space-y-4 mb-4">
              {selected.type === COMPONENT_TYPES.BATTERY && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Voltage (V)
                  </label>
                  <input
                    type="number"
                    value={selected.props.voltage ?? 0}
                    onChange={(e) =>
                      onUpdateProps(selected.id, {
                        voltage: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#1a1a2e] border border-[#4ecca3] rounded px-2 py-2 text-white outline-none"
                  />
                </div>
              )}

              {selected.type === COMPONENT_TYPES.RESISTOR && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Resistance (Ω)
                  </label>
                  <input
                    type="number"
                    value={selected.props.resistance ?? 0}
                    onChange={(e) =>
                      onUpdateProps(selected.id, {
                        resistance: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#1a1a2e] border border-[#4ecca3] rounded px-2 py-2 text-white outline-none"
                  />
                </div>
              )}

              {selected.type === COMPONENT_TYPES.SWITCH && (
                <div className="flex items-center p-2 bg-[#1a1a2e] rounded border border-[#2a2a4e]">
                  <input
                    type="checkbox"
                    checked={selected.props.closed || false}
                    onChange={(e) =>
                      onUpdateProps(selected.id, { closed: e.target.checked })
                    }
                    className="w-5 h-5 mr-3 accent-[#4ecca3]"
                  />
                  <span
                    className={
                      selected.props.closed
                        ? "text-[#4ecca3] font-bold"
                        : "text-gray-400"
                    }
                  >
                    {selected.props.closed ? "Switch CLOSED" : "Switch OPEN"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onRotate(selected.id)}
                className="bg-[#e94560] hover:bg-[#c0392b] text-white py-2 rounded text-sm transition-colors"
              >
                🔄 Rotate
              </button>

              <button
                onClick={() => onDeleteComponent(selected.id)}
                className="bg-[#dc3545] hover:bg-[#a71d2a] text-white py-2 rounded text-sm transition-colors"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic p-4 text-center border border-dashed border-gray-700 rounded">
            Select a component to view and edit its properties
          </div>
        )}
      </div>

      {/* COMPONENTS LIST */}
      <div className="mb-6">
        <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
          Components ({components.length})
        </h3>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {components.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={`flex justify-between items-center p-2 rounded cursor-pointer text-xs transition-colors ${
                selectedId === comp.id
                  ? "bg-[#e94560] text-white"
                  : "bg-[#0f3460] text-gray-300 hover:bg-[#2a2a4e]"
              }`}
            >
              <span className="font-medium">{comp.type.toUpperCase()}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(comp.id);
                }}
                className="text-white/70 hover:text-white px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CONNECTIONS LIST */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
          Connections ({connections.length})
        </h3>

        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {connections.map((conn) => {
            const fromComp = components.find(
              (c) => c.id === conn.fromComponent
            );
            const toComp = components.find((c) => c.id === conn.toComponent);
            const label = `${fromComp?.type ?? "?"}(${
              conn.fromTerminal[0]
            }) → ${toComp?.type ?? "?"}(${conn.toTerminal[0]})`;

            return (
              <div
                key={conn.id}
                className="flex justify-between items-center bg-[#0f3460] p-2 rounded text-xs text-gray-300 border border-[#1a1a2e]"
              >
                <span className="truncate mr-2">{label}</span>
                <button
                  onClick={() => onDeleteConnection(conn.id)}
                  className="text-[#e94560] hover:text-white"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
