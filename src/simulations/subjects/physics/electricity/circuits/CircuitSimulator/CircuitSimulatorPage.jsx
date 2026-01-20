import React, { useRef, useState, useEffect } from "react";
import CircuitHeader from "./CircuitHeader";
import Sidebar from "./Sidebar/Sidebar";
import PropertiesPanel from "./properties/PropertiesPanel";
import CircuitCanvas from "./Canvas/CircuitCanvas";
import LabsOverlay from "./Labs/LabsOverlay";
import "../CircuitStyles.css";
import { useCircuitReducer } from "./hooks/useCircuitReducer";
import { useCircuitInteraction } from "./hooks/useCircuitInteraction";
import { useSimulationLoop } from "./hooks/useSimulationLoop";
import { useCircuitRenderer } from "./hooks/useCircuitRenderer";

export default function CircuitSimulatorPage() {
  const [state, dispatch] = useCircuitReducer();
  const canvasRef = useRef(null);

  // Scope samples (Voltage/Current vs time) for the selected component.
  const [scopeSamples, setScopeSamples] = useState([]);

  // Step 3: Ground rule + educational message
  const [simWarning, setSimWarning] = useState("");
  const hasGround = state.components.some((c) => c.type === "ground");

  // Clear warning automatically once a Ground is added.
  useEffect(() => {
    if (hasGround && simWarning) setSimWarning("");
  }, [hasGround, simWarning]);

  const { onPointerDown, onPointerMove, onPointerUp, isTerminalConnected } =
    useCircuitInteraction({ state, dispatch, canvasRef });

  const { reset } = useSimulationLoop({ state, dispatch });

  useCircuitRenderer({ state, canvasRef, isTerminalConnected });

  // Clear scope when simulation stops or probe changes.
  useEffect(() => {
    if (!state.isSimulating) {
      setScopeSamples([]);
      return;
    }
    // When the user changes selected component (probe), clear the scope window.
    setScopeSamples([]);
  }, [state.isSimulating, state.selectedId]);

  useEffect(() => {
    // Collect scope samples from the selected component (probe).
    if (!state.isSimulating) return;
    if (!state.selectedId) return;

    const r = state.results?.components?.[state.selectedId];
    if (!r) return;

    setScopeSamples((prev) => {
      const next = [
        ...prev,
        {
          t: performance.now() / 1000,
          v: r.voltageDrop,
          i: r.current,
        },
      ];

      // Keep last ~900 samples (~15s at ~60fps)
      if (next.length > 900) next.splice(0, next.length - 900);
      return next;
    });
  }, [state.isSimulating, state.selectedId, state.results]);

  const handleToggleSim = () => {
    const goingToStart = !state.isSimulating;

    // Prevent starting without Ground (more educational, avoids floating circuits).
    if (goingToStart && !hasGround) {
      setSimWarning(
        "To start the simulation, please add a Ground component to the circuit."
      );
      return;
    }

    setSimWarning("");
    dispatch({ type: "SET_SIMULATING", value: goingToStart });
  };

  const handleAddComponent = (compType) => {
    const canvas = canvasRef.current;

    // DPR note:
    // canvas.width/height are device pixels after DPR scaling.
    // Use DOMRect (CSS pixels) for placing components visually.
    const rect = canvas?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;

    dispatch({ type: "ADD_COMPONENT", compType, x: cx, y: cy });
  };

  const handleReset = () => {
    setScopeSamples([]); // keep scope clean
    reset();
  };

  const handleClearAll = () => {
    setScopeSamples([]);
    dispatch({ type: "CLEAR_ALL" });
  };

  return (
    <div className="circuit-root relative flex flex-col h-screen bg-[#1a1a2e] text-white font-sans overflow-hidden">
      <CircuitHeader />

      {state.lab && (
        <LabsOverlay
          lab={state.lab}
          onClose={() => dispatch({ type: "CLOSE_LAB" })}
        />
      )}

      {/* Ground warning banner */}
      {simWarning && (
        <div className="mx-4 mt-2 mb-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-yellow-200 text-sm">
          ⚠️ {simWarning}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSimulating={state.isSimulating}
          onAdd={handleAddComponent}
          onToggleSim={handleToggleSim}
          onReset={handleReset}
          onClear={handleClearAll}
          onOpenLab={(lab) => dispatch({ type: "OPEN_LAB", lab })}
        />

        <CircuitCanvas
          canvasRef={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        <PropertiesPanel
          components={state.components}
          connections={state.connections}
          selectedId={state.selectedId}
          scopeSamples={scopeSamples}
          onClearScope={() => setScopeSamples([])}
          onSelect={(id) => dispatch({ type: "SELECT", id })}
          onRotate={(id) => dispatch({ type: "ROTATE_COMPONENT", id })}
          onUpdateProps={(id, propsPatch) =>
            dispatch({
              type: "UPDATE_COMPONENT",
              id,
              patch: { props: propsPatch },
            })
          }
          onDeleteComponent={(id) => dispatch({ type: "DELETE_COMPONENT", id })}
          onDeleteConnection={(id) =>
            dispatch({ type: "DELETE_CONNECTION", id })
          }
        />
      </div>
    </div>
  );
}
