import { useEffect } from "react";
import { renderCircuit } from "../../CircuitUtils";

/**
 * Owns canvas sizing + calling renderCircuit().
 * This keeps drawing out of your main component.
 */
export function useCircuitRenderer({ state, canvasRef, isTerminalConnected }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Resize canvas to fit parent container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const ctx = canvas.getContext("2d");

    // 2. Render the circuit frame
    renderCircuit(ctx, canvas.width, canvas.height, {
      components: state.components,
      connections: state.connections,
      selectedId: state.selectedId,
      hoveredTerminal: state.hoveredTerminal,
      simulationResults: state.results,
      connectingFrom: state.connectingFrom,
      mousePos: state.mousePos,
      animationOffset: state.animOffset,
      isTerminalConnected: isTerminalConnected,
    });
  }, [
    state.components,
    state.connections,
    state.selectedId,
    state.hoveredTerminal,
    state.results,
    state.connectingFrom,
    state.mousePos,
    state.animOffset,
    canvasRef,
    isTerminalConnected,
  ]);
}
