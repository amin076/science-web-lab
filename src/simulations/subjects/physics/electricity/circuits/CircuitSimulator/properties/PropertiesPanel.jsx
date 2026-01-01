// src/components/features/circuits/CircuitSimulator/properties/PropertiesPanel.jsx
import React, { useState } from "react";
import { COMPONENT_TYPES } from "../../CircuitUtils";
import ScopeOverlay from "../Scope/ScopeOverlay";

export default function PropertiesPanel({
  components,
  connections,
  selectedId,
  scopeSamples,
  onClearScope,
  onSelect,
  onRotate,
  onUpdateProps,
  onDeleteComponent,
  onDeleteConnection,
}) {
  const selected = components.find((c) => c.id === selectedId);
  const shortId = selectedId ? selectedId.slice(-5) : "";
  const scopeTitle = selected
    ? `Scope • ${selected.type.toUpperCase()} (${shortId})`
    : "Scope";
  // Collapsible Scope panel (keeps UI clean)
  const [showScope, setShowScope] = useState(true);

  const canShowScope =
    !!selectedId && Array.isArray(scopeSamples) && scopeSamples.length > 5;

  return (
    <aside className="w-[320px] bg-[#16213e] text-white p-3 flex flex-col gap-4 border-l border-[#0f3460] h-full min-h-0 overflow-y-auto">
      {/* PROPERTIES */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0">
        <h3 className="text-sm font-bold tracking-wide text-red-300 mb-3">
          Properties
        </h3>

        {selected ? (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-gray-200">
              {selected.type.toUpperCase()}
            </h4>

            {selected.type === COMPONENT_TYPES.BATTERY && (
              <div>
                <label className="text-xs text-gray-300">Voltage (V)</label>
                <input
                  type="number"
                  value={selected.props.voltage}
                  onChange={(e) =>
                    onUpdateProps(selected.id, {
                      voltage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-[#16213e] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
            )}

            {selected.type === COMPONENT_TYPES.AC_SOURCE && (
              <>
                <div>
                  <label className="text-xs text-gray-300">
                    Peak Voltage (Vpk)
                  </label>
                  <input
                    type="number"
                    value={selected.props.voltage}
                    onChange={(e) =>
                      onUpdateProps(selected.id, {
                        voltage: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#16213e] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300">
                    Frequency (Hz)
                  </label>
                  <input
                    type="number"
                    value={selected.props.frequency}
                    onChange={(e) =>
                      onUpdateProps(selected.id, {
                        frequency: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-[#16213e] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                </div>
              </>
            )}

            {selected.type === COMPONENT_TYPES.RESISTOR && (
              <div>
                <label className="text-xs text-gray-300">Resistance (Ω)</label>
                <input
                  type="number"
                  value={selected.props.resistance}
                  onChange={(e) =>
                    onUpdateProps(selected.id, {
                      resistance: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-[#16213e] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
            )}

            {selected.type === COMPONENT_TYPES.DIODE && (
              <div>
                <label className="text-xs text-gray-300">
                  Forward Voltage (Vf)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={selected.props.forwardVoltage ?? 0.7}
                  onChange={(e) =>
                    onUpdateProps(selected.id, {
                      forwardVoltage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-[#16213e] text-white border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
            )}

            {selected.type === COMPONENT_TYPES.SWITCH && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selected.props.closed}
                  onChange={(e) =>
                    onUpdateProps(selected.id, { closed: e.target.checked })
                  }
                />
                <span
                  className={`text-sm ${
                    selected.props.closed
                      ? "text-[#4ecca3] font-bold"
                      : "text-gray-300"
                  }`}
                >
                  {selected.props.closed ? "Switch CLOSED" : "Switch OPEN"}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onRotate(selected.id)}
                className="flex-1 py-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] rounded transition text-sm"
              >
                🔄 Rotate
              </button>
              <button
                onClick={() => onDeleteComponent(selected.id)}
                className="flex-1 py-2 bg-[#c0392b] hover:bg-[#e74c3c] rounded transition text-sm"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-300">
            Select a component to view and edit its properties
          </div>
        )}
      </div>

      {/* SCOPE (DOCKED) */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold tracking-wide text-emerald-200">
            Scope
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScope((s) => !s)}
              className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/40"
              title="Show/Hide Scope"
            >
              {showScope ? "Hide" : "Show"}
            </button>

            <button
              type="button"
              onClick={onClearScope}
              className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/40"
              title="Clear scope samples"
            >
              Clear
            </button>
          </div>
        </div>

        {showScope ? (
          canShowScope ? (
            <ScopeOverlay
              samples={scopeSamples}
              title={scopeTitle}
              windowSeconds={6}
            />
          ) : (
            <div className="text-xs text-gray-300">
              Select a component and start the simulation to see the waveform.
            </div>
          )
        ) : (
          <div className="text-xs text-gray-400">Scope is hidden.</div>
        )}
      </div>

      {/* COMPONENTS LIST */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0 flex flex-col min-h-0">
        <h3 className="text-sm font-bold tracking-wide text-cyan-300 mb-3">
          Components ({components.length})
        </h3>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-1">
          {components.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={`cursor-pointer px-2 py-2 rounded flex items-center justify-between transition shrink-0 ${
                selectedId === comp.id
                  ? "bg-[#e94560] text-white"
                  : "bg-[#1a1a2e] text-gray-200 hover:bg-[#2a2a4e]"
              }`}
            >
              <span className="text-xs">
                {comp.type} ({comp.id.slice(-4)})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(comp.id);
                }}
                className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/40"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CONNECTIONS LIST */}
      <div className="bg-[#0f3460] rounded-lg p-3 shrink-0 flex flex-col min-h-0">
        <h3 className="text-sm font-bold tracking-wide text-purple-300 mb-3">
          Connections ({connections.length})
        </h3>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] pr-1">
          {connections.map((conn) => {
            const fromComp = components.find(
              (c) => c.id === conn.fromComponent
            );
            const toComp = components.find((c) => c.id === conn.toComponent);
            const label = `${fromComp?.type ?? "?"} → ${toComp?.type ?? "?"}`;

            return (
              <div
                key={conn.id}
                className="px-2 py-2 rounded flex items-center justify-between bg-[#1a1a2e] shrink-0"
              >
                <span className="text-[11px] text-gray-200">{label}</span>
                <button
                  onClick={() => onDeleteConnection(conn.id)}
                  className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/40"
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
