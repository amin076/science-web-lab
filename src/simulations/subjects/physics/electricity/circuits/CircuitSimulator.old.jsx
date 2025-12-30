import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CircuitEngine,
  renderCircuit,
  COMPONENT_TYPES,
  DEFAULT_VALUES,
  generateId,
  getTerminalPositions,
  isNearTerminal,
} from "./CircuitUtils";
import CapacitorLab from "./CapacitorLab";
import ResistorLab from "./ResistorLab";
import InductorLab from "./InductorLab";

// --- SIDEBAR (Left Panel) ---
const Sidebar = ({
  onAdd,
  onSimulate,
  onReset,
  onClear,
  isSimulating,
  onOpenCapLab,
  onOpenResLab,
  onOpenIndLab,
}) => (
  <aside className="w-64 bg-[#16213e] p-4 flex flex-col border-r-2 border-[#0f3460] overflow-y-auto z-10">
    <div className="mb-6">
      <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
        Components
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries({
          [COMPONENT_TYPES.BATTERY]: { icon: "🔋", label: "Battery" },
          [COMPONENT_TYPES.RESISTOR]: { icon: "⚡", label: "Resistor" },
          [COMPONENT_TYPES.CAPACITOR]: { icon: "||", label: "Capacitor" },
          [COMPONENT_TYPES.INDUCTOR]: { icon: "🌀", label: "Inductor" },
          [COMPONENT_TYPES.SWITCH]: { icon: "🔌", label: "Switch" },
          [COMPONENT_TYPES.GROUND]: { icon: "⏚", label: "Ground" },
        }).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex flex-col items-center justify-center p-3 bg-[#0f3460] hover:bg-[#2a2a4e] text-gray-200 rounded text-sm transition-colors border border-transparent hover:border-[#e94560]"
          >
            <span className="text-2xl mb-1">{meta.icon}</span>
            <span className="text-xs">{meta.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="mb-6 mt-auto">
      <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
        Simulation
      </h3>
      <div className="space-y-2">
        <button
          onClick={onSimulate}
          className={`w-full py-3 rounded text-white font-medium transition-colors flex items-center justify-center gap-2 ${
            isSimulating
              ? "bg-[#f39c12] hover:bg-[#d35400]"
              : "bg-[#e94560] hover:bg-[#c0392b]"
          }`}
        >
          {isSimulating ? "⏸ Stop" : "▶ Start Live"}
        </button>
        {/* NEW BUTTON FOR CAPACITOR LAB */}
        <button
          onClick={onOpenCapLab}
          className="w-full py-2 bg-[#2a2a4e] border border-[#4ecca3] text-[#4ecca3] hover:bg-[#4ecca3] hover:text-[#1a1a2e] rounded text-sm transition-all mb-2"
        >
          🧮 Design Capacitor
        </button>
        <button
          onClick={onOpenResLab}
          className="w-full py-2 bg-[#2a2a4e] border border-orange-400
             text-orange-400 hover:bg-orange-400 hover:text-black
             rounded text-sm transition-all"
        >
          🔥 Design Resistor
        </button>

        <button
          onClick={onOpenIndLab}
          className="w-full py-2 bg-[#2a2a4e] border border-purple-400
             text-purple-400 hover:bg-purple-400 hover:text-black
             rounded text-sm transition-all"
        >
          🌀 Design Inductor
        </button>
        <button
          onClick={onReset}
          className="w-full py-2 bg-[#17a2b8] hover:bg-[#138496] rounded text-white text-sm"
        >
          🔄 Reset Values
        </button>
        <button
          onClick={onClear}
          className="w-full py-2 bg-[#dc3545] hover:bg-[#c82333] rounded text-white text-sm"
        >
          🗑 Clear Board
        </button>
      </div>
    </div>
  </aside>
);

// --- PROPERTIES PANEL (Right Panel) ---
const PropertiesPanel = ({
  selected,
  components,
  connections,
  onSelect,
  onUpdate,
  onDeleteComponent,
  onDeleteConnection,
}) => {
  return (
    <aside className="w-80 bg-[#16213e] p-4 border-l-2 border-[#0f3460] overflow-y-auto flex flex-col h-full z-10">
      <div className="mb-6">
        <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
          Properties
        </h3>
        {selected ? (
          <div className="bg-[#0f3460] p-4 rounded-lg border border-[#2a2a4e]">
            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2 flex justify-between">
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
                    value={selected.props.voltage || 0}
                    onChange={(e) =>
                      onUpdate(selected.id, {
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
                    value={selected.props.resistance || 0}
                    onChange={(e) =>
                      onUpdate(selected.id, {
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
                      onUpdate(selected.id, { closed: e.target.checked })
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
                onClick={() => onUpdate(selected.id, {}, "rotate")}
                className="bg-[#3498db] hover:bg-[#2980b9] text-white py-2 rounded text-sm transition-colors"
              >
                🔄 Rotate
              </button>
              <button
                onClick={() => onDeleteComponent(selected.id)}
                className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-2 rounded text-sm transition-colors"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic p-4 text-center border border-dashed border-gray-700 rounded">
            Select a component to edit
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-xs font-bold mb-3 text-[#e94560] tracking-wider uppercase">
          Connections
        </h3>
        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {connections.length === 0 && (
            <p className="text-gray-500 text-xs">No wires connected.</p>
          )}
          {connections.map((conn) => {
            const fromComp = components.find(
              (c) => c.id === conn.fromComponent
            );
            const toComp = components.find((c) => c.id === conn.toComponent);
            if (!fromComp || !toComp) return null;

            return (
              <div
                key={conn.id}
                className="flex justify-between items-center bg-[#0f3460] p-2 rounded text-xs text-gray-300 border border-[#1a1a2e]"
              >
                <span className="truncate mr-2">
                  {fromComp.type} → {toComp.type}
                </span>
                <button
                  onClick={() => onDeleteConnection(conn.id)}
                  className="text-[#e74c3c] hover:text-white font-bold"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

// --- MAIN COMPONENT ---
const CircuitSimulator = () => {
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [isCapLabOpen, setIsCapLabOpen] = useState(false); // <--- NEW STATE
  const [isResLabOpen, setIsResLabOpen] = useState(false); // <--- NEW STATE
  const [isIndLabOpen, setIsIndLabOpen] = useState(false); // <--- NEW STATE
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [hoveredTerminal, setHoveredTerminal] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animOffset, setAnimOffset] = useState(0);

  // Tooltip State
  const [tooltip, setTooltip] = useState(null);

  const canvasRef = useRef(null);
  const engineRef = useRef(new CircuitEngine());
  const animFrameRef = useRef(null);

  // Check if a terminal has any wire attached
  const isTerminalConnected = useCallback(
    (compId, terminal) => {
      return connections.some(
        (c) =>
          (c.fromComponent === compId && c.fromTerminal === terminal) ||
          (c.toComponent === compId && c.toTerminal === terminal)
      );
    },
    [connections]
  );

  const findTerminal = (x, y) => {
    for (const comp of components) {
      const t = getTerminalPositions(comp);
      if (isNearTerminal(x, y, t.left))
        return { componentId: comp.id, terminal: "left", position: t.left };
      if (comp.type !== COMPONENT_TYPES.GROUND && isNearTerminal(x, y, t.right))
        return { componentId: comp.id, terminal: "right", position: t.right };
    }
    return null;
  };

  const handleAdd = (type) => {
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : 400;
    const cy = canvas ? canvas.height / 2 : 300;
    const newComp = {
      id: generateId(),
      type,
      x: cx + (Math.random() - 0.5) * 50,
      y: cy + (Math.random() - 0.5) * 50,
      rotation: 0,
      props: { ...DEFAULT_VALUES[type] },
    };
    setComponents((prev) => [...prev, newComp]);
    setSelectedId(newComp.id);
  };

  const handleUpdate = (id, newProps, action) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (action === "rotate")
          return { ...c, rotation: (c.rotation + 90) % 360 };
        return { ...c, props: { ...c.props, ...newProps } };
      })
    );
  };

  const handleDeleteComponent = (id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.fromComponent !== id && c.toComponent !== id)
    );
    if (selectedId === id) setSelectedId(null);
  };

  const handleDeleteConnection = (id) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    engineRef.current.reset();
    setResults(null);
    setAnimOffset(0);
  };

  const handleClear = () => {
    setComponents([]);
    setConnections([]);
    handleReset();
    setIsSimulating(false);
    setSelectedId(null);
  };

  // Canvas Interactions
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Check Terminal Click
    const terminal = findTerminal(x, y);
    if (terminal) {
      if (connectingFrom) {
        // Finish Connection
        if (connectingFrom.componentId !== terminal.componentId) {
          setConnections((prev) => [
            ...prev,
            {
              id: generateId(),
              fromComponent: connectingFrom.componentId,
              fromTerminal: connectingFrom.terminal,
              toComponent: terminal.componentId,
              toTerminal: terminal.terminal,
            },
          ]);
        }
        setConnectingFrom(null);
      } else {
        // Start Connection
        setConnectingFrom(terminal);
      }
      return;
    }

    // Cancel connection if clicked elsewhere
    if (connectingFrom) {
      setConnectingFrom(null);
      return;
    }

    // 2. Check Component Click
    const clickedComp = components.find(
      (c) => Math.abs(c.x - x) < 30 && Math.abs(c.y - y) < 20
    );
    if (clickedComp) {
      setSelectedId(clickedComp.id);
      setDragState({
        id: clickedComp.id,
        offsetX: x - clickedComp.x,
        offsetY: y - clickedComp.y,
      });
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Dragging
    if (dragState) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === dragState.id
            ? { ...c, x: x - dragState.offsetX, y: y - dragState.offsetY }
            : c
        )
      );
      return;
    }

    // Hover Terminal
    const t = findTerminal(x, y);
    setHoveredTerminal(
      t ? { componentId: t.componentId, terminal: t.terminal } : null
    );

    // Hover Component (for Tooltip)
    if (results && results.isComplete) {
      const hoveredComp = components.find(
        (c) => Math.abs(c.x - x) < 30 && Math.abs(c.y - y) < 20
      );

      if (hoveredComp) {
        const data = results.components[hoveredComp.id];
        if (data) {
          setTooltip({
            x: x + 20,
            y: y - 20,
            label: hoveredComp.type.toUpperCase(),
            val1: `I: ${(Math.abs(data.current) * 1000).toFixed(2)} mA`,
            val2: `ΔV: ${Math.abs(data.voltageDrop).toFixed(2)} V`,
          });
          return;
        }
      }
    }
    setTooltip(null);
  };

  const handleMouseUp = () => setDragState(null);

  // Simulation Loop
  useEffect(() => {
    // We run the solver on every frame if 'isSimulating' is true
    // This allows real-time updates when dragging components or changing props
    if (isSimulating) {
      const loop = () => {
        const res = engineRef.current.solve(components, connections);
        setResults(res);
        setAnimOffset((prev) => prev + 0.1);
        animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      setResults(null); // Clear results when stopped
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSimulating, components, connections]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Auto-resize
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const ctx = canvas.getContext("2d");

    renderCircuit(ctx, canvas.width, canvas.height, {
      components,
      connections,
      selectedId,
      hoveredTerminal,
      simulationResults: results,
      connectingFrom,
      mousePos,
      animationOffset: animOffset,
      isTerminalConnected,
    });
  }, [
    components,
    connections,
    selectedId,
    hoveredTerminal,
    results,
    connectingFrom,
    mousePos,
    animOffset,
    isTerminalConnected,
  ]);

  const selectedComp = components.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] text-white font-sans overflow-hidden">
      {/* RENDER THE LAB OVERLAY IF OPEN */}
      {isCapLabOpen && <CapacitorLab onClose={() => setIsCapLabOpen(false)} />}
      {isResLabOpen && <ResistorLab onClose={() => setIsResLabOpen(false)} />}
      {isIndLabOpen && <InductorLab onClose={() => setIsIndLabOpen(false)} />}
      {/* HEADER */}
      <header className="px-5 py-3 bg-[#16213e] border-b-2 border-[#0f3460] flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[#e94560] tracking-wide flex items-center gap-2">
            ⚡ Circuit Lab
          </h1>
        </div>
        <div className="text-xs text-gray-400 bg-[#0f3460] px-3 py-1 rounded-full">
          Build Circuit → Add Ground → Press Start
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onAdd={handleAdd}
          onSimulate={() => setIsSimulating(!isSimulating)}
          onReset={handleReset}
          onClear={handleClear}
          isSimulating={isSimulating}
          onOpenCapLab={() => setIsCapLabOpen(true)}
          onOpenResLab={() => setIsResLabOpen(true)}
          onOpenIndLab={() => setIsIndLabOpen(true)}
        />

        <div className="flex-1 relative cursor-crosshair bg-[#1a1a2e] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block touch-none w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Messages */}
          {connectingFrom && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#e94560] px-4 py-2 rounded shadow-lg text-sm text-white font-bold animate-pulse pointer-events-none">
              Select target terminal...
            </div>
          )}

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-black/80 backdrop-blur border border-[#4ecca3] p-2 rounded shadow-xl text-xs z-50"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="font-bold text-[#4ecca3] mb-1">
                {tooltip.label}
              </div>
              <div className="text-white">{tooltip.val1}</div>
              <div className="text-gray-300">{tooltip.val2}</div>
            </div>
          )}
        </div>

        <PropertiesPanel
          selected={selectedComp}
          components={components}
          connections={connections}
          onSelect={setSelectedId}
          onUpdate={handleUpdate}
          onDeleteComponent={handleDeleteComponent}
          onDeleteConnection={handleDeleteConnection}
        />
      </div>
    </div>
  );
};

export default CircuitSimulator;
