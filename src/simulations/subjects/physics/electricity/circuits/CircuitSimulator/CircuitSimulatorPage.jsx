import React, { useRef } from "react";
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

  const { onPointerDown, onPointerMove, onPointerUp, isTerminalConnected } =
    useCircuitInteraction({ state, dispatch, canvasRef });

  const { reset } = useSimulationLoop({ state, dispatch });

  useCircuitRenderer({ state, canvasRef, isTerminalConnected });

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] text-white font-sans overflow-hidden">
      <CircuitHeader />

      {state.lab && (
        <LabsOverlay
          lab={state.lab}
          onClose={() => dispatch({ type: "CLOSE_LAB" })}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSimulating={state.isSimulating}
          onAdd={(compType) => {
            const canvas = canvasRef.current;
            const cx = canvas ? canvas.width / 2 : 400;
            const cy = canvas ? canvas.height / 2 : 300;
            dispatch({ type: "ADD_COMPONENT", compType, x: cx, y: cy });
          }}
          onToggleSim={() =>
            dispatch({ type: "SET_SIMULATING", value: !state.isSimulating })
          }
          onReset={reset}
          onClear={() => dispatch({ type: "CLEAR_ALL" })}
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
