// src/components/features/circuits/CircuitSimulator/hooks/useSimulationLoop.js
import { useEffect, useRef } from "react";
import { CircuitEngine } from "../../CircuitUtils";

export function useSimulationLoop({ state, dispatch }) {
  const engineRef = useRef(new CircuitEngine());
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTsRef = useRef(null);

  /**
   * While simulating:
   * - Solve every frame (supports time-varying AC sources).
   * - Use dt (seconds) for transient elements (C/L).
   * - Tick the visual animation offset.
   */
  useEffect(() => {
    if (!state.isSimulating) {
      startTimeRef.current = null;
      prevTsRef.current = null;
      engineRef.current.reset(); // Reset transient states when stopping
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const loop = (ts) => {
      if (startTimeRef.current == null) startTimeRef.current = ts;

      // dt in seconds (clamped for stability)
      const prev = prevTsRef.current ?? ts;
      let dt = (ts - prev) / 1000;
      prevTsRef.current = ts;

      // Clamp dt to avoid numerical explosions on tab-switch / lag spikes
      if (!Number.isFinite(dt) || dt <= 0) dt = 1 / 60;
      dt = Math.min(dt, 0.05); // max 50ms

      const timeSec = (ts - startTimeRef.current) / 1000;

      const results = engineRef.current.solve(
        state.components,
        state.connections,
        timeSec,
        dt
      );

      dispatch({ type: "SET_RESULTS", results });
      dispatch({ type: "TICK_ANIM", delta: 0.8 });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
      prevTsRef.current = null;
      engineRef.current.reset();
    };
  }, [state.isSimulating, state.components, state.connections, dispatch]);

  const reset = () => {
    engineRef.current.reset(); // Reset transient memory
    dispatch({ type: "RESET_SIM" });
  };

  return { reset };
}
