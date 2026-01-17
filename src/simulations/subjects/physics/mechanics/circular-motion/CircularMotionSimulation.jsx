import React, { useEffect, useRef, useState } from "react";
import SimulationShell from "@/system/SimulationShell";
import SimulationCanvas from "./SimulationCanvas";
import SimulationHUD from "./SimulationHUD";
import ControlPanel from "./ControlPanel";
import { integratePhysics, getInitialState } from "./physics";

export default function CircularMotionSimulation() {
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const containerRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [viewConfig, setViewConfig] = useState({
    showVectors: true,
    showProjections: true,
    showAngle: true,
    showComponents: true,
  });

  const [params, setParams] = useState({
    radius: 140,
    theta0: 0,
    omega0: 1.5,
    alpha: 0,
    mass: 1,
  });

  const physicsRef = useRef(getInitialState(params));
  const [uiState, setUiState] = useState(getInitialState(params));
  const [history, setHistory] = useState([]);

  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Animation Loop
  useEffect(() => {
    const loop = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (running) {
        const next = integratePhysics(physicsRef.current, params, dt);
        physicsRef.current = next;
        setUiState(next);

        if (Math.floor(next.t * 20) > Math.floor((next.t - dt) * 20)) {
          setHistory((h) => {
            const newH = [...h, next];
            return newH.length > 150 ? newH.slice(newH.length - 150) : newH;
          });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, params]);

  const handleReset = () => {
    setRunning(false);
    const init = getInitialState(params);
    physicsRef.current = init;
    setUiState(init);
    setHistory([]);
  };

  return (
    <SimulationShell
      title="Circular Motion"
      subtitle="Projections & Vectors"
      topOffset="0px"
      panelTop={
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (!running) lastTimeRef.current = performance.now();
              setRunning((r) => !r);
            }}
            className={`h-12 rounded-xl font-bold border transition-colors ${
              running
                ? "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
            }`}
          >
            {running ? "STOP" : "START"}
          </button>
          <button
            onClick={handleReset}
            className="h-12 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15"
          >
            RESET
          </button>
        </div>
      }
      panel={
        <ControlPanel
          viewConfig={viewConfig}
          setViewConfig={setViewConfig}
          params={params}
          setParams={setParams}
          history={history}
        />
      }
    >
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-[#050510]"
      >
        <SimulationHUD live={uiState} />
        <SimulationCanvas
          width={dims.w}
          height={dims.h}
          state={uiState}
          radius={params.radius}
          config={viewConfig}
        />
      </div>
    </SimulationShell>
  );
}