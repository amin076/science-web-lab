// src/components/features/circuits/CircuitSimulator/hooks/useSimulationLoop.js
import { useEffect, useRef } from "react";
import { CircuitEngine } from "../../CircuitUtils";

export function useSimulationLoop({ state, dispatch }) {
  const engineRef = useRef(new CircuitEngine());
  const rafRef = useRef(null);

  // 1. Solve the Circuit automatically whenever the circuit changes
  // This ensures V/I/R values update instantly when you drag/add/change things.
  useEffect(() => {
    if (state.isSimulating) {
      const results = engineRef.current.solve(
        state.components,
        state.connections
      );
      dispatch({ type: "SET_RESULTS", results });
    }
  }, [state.components, state.connections, state.isSimulating, dispatch]);

  // 2. Handle the Animation Loop (The flowing dots)
  // This runs at 60FPS but DOES NOT do heavy math, just updates the visual offset.
  useEffect(() => {
    if (!state.isSimulating) return;

    const loop = () => {
      // Speed of electron flow
      dispatch({ type: "TICK_ANIM", delta: 0.8 });
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.isSimulating, dispatch]);

  const reset = () => {
    dispatch({ type: "RESET_SIM" });
  };

  return { reset };
}
