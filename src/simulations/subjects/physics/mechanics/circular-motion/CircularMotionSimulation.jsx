import React, { useEffect, useRef, useState } from "react";
import SimulationShell from "@/system/SimulationShell";
import SimulationCanvas from "./SimulationCanvas";
import SimulationHUD from "./SimulationHUD";
import ControlPanel from "./ControlPanel";
import { integratePhysics, getInitialState } from "./physics";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { useAgentSimulationTools } from "@/webmcp/useAgentSimulationTools.js";
import AgentCanvasRecorder from "@/components/shared/video/AgentCanvasRecorder.jsx";

const CIRCULAR_AGENT_PROPERTIES = Object.freeze({
  radius: { type: "number", minimum: 10, maximum: 200 },
  theta0: { type: "number", minimum: -6.283185307, maximum: 6.283185307 },
  omega0: { type: "number", minimum: -5, maximum: 5 },
  alpha: { type: "number", minimum: -2, maximum: 2 },
  mass: { type: "number", minimum: 0.1, maximum: 10 },
  showVectors: { type: "boolean" },
  showProjections: { type: "boolean" },
  showAngle: { type: "boolean" },
  showComponents: { type: "boolean" },
});

export default function CircularMotionSimulation() {
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const containerRef = useRef(null);
  const initialMcpRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "physics.mechanics.circular-motion",
      {
        radius: 140,
        omega0: 1.5,
        alpha: 0,
        mass: 1,
      },
    );
  }

  const initialMcp = initialMcpRef.current;
  const [running, setRunning] = useState(false);
  const [viewConfig, setViewConfig] = useState({
    showVectors: true,
    showProjections: true,
    showAngle: true,
    showComponents: true,
  });

  const [params, setParams] = useState({
    radius: initialMcp.values.radius,
    theta0: 0,
    omega0: initialMcp.values.omega0,
    alpha: initialMcp.values.alpha,
    mass: initialMcp.values.mass,
  });

  const physicsRef = useRef(getInitialState(params));
  const [uiState, setUiState] = useState(getInitialState(params));
  const [history, setHistory] = useState([]);

  const lastTimeRef = useRef(0);
  const videoRef = useRef(null);
  const agentStateRef = useRef({});
  agentStateRef.current = { running, ...params, ...viewConfig };

  const rafRef = useRef(0);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims((prev) => prev.w === width && prev.h === height ? prev : { w: width, h: height });
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

  const webMcpStatus = useAgentSimulationTools({
    simulationId: "physics.mechanics.circular-motion",
    prefix: "esbiko_circular_motion",
    properties: CIRCULAR_AGENT_PROPERTIES,
    actions: {
      getState: () => ({ simulationId: "physics.mechanics.circular-motion", ...agentStateRef.current,
        physics: physicsRef.current, recording: videoRef.current?.getVideoStatus() || null }),
      configure: (values) => {
        if (agentStateRef.current.running && Object.keys(values).some((key) => key in params)) {
          throw new Error("Pause circular motion before changing physics parameters.");
        }
        const physics = Object.fromEntries(Object.entries(values).filter(([key]) => key in params));
        const display = Object.fromEntries(Object.entries(values).filter(([key]) => key in viewConfig));
        if (Object.keys(physics).length) {
          const next = { ...params, ...physics };
          setParams(next);
          const initial = getInitialState(next);
          physicsRef.current = initial;
          setUiState(initial);
          setHistory([]);
        }
        if (Object.keys(display).length) setViewConfig((prev) => ({ ...prev, ...display }));
        return { accepted: values };
      },
      setPlayback: ({ running: shouldRun }) => {
        if (shouldRun) lastTimeRef.current = performance.now();
        setRunning(shouldRun);
        return { running: shouldRun };
      },
      reset: () => { handleReset(); return { running: false, reset: true }; },
      startVideo: ({ mode } = {}) => videoRef.current?.startVideo({ mode }),
      getVideoStatus: () => videoRef.current?.getVideoStatus(),
      stopVideo: () => videoRef.current?.stopVideo(),
      downloadVideo: () => videoRef.current?.downloadVideo(),
    },
  });

  return (
    <SimulationShell
      title="Circular Motion"
      subtitle="Projections & Vectors"
      topOffset="0px"
      mobileStack
      panelTop={
        <div className="space-y-2">
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
        <AgentCanvasRecorder ref={videoRef} canvasSelector=".circular-record-canvas" filePrefix="esbiko-circular-motion" />
        <p className="text-xs text-cyan-200" aria-live="polite">WebMCP: {webMcpStatus}</p>
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
        className="w-full h-full relative overflow-hidden bg-[#050510] flex flex-col"
      >
        {initialMcp.embeddedMcpApp && (
          <div className="absolute left-4 top-4 z-30 rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-xs text-cyan-200 backdrop-blur">
            MCP configured · r={params.radius}m · ω₀={params.omega0} rad/s · α={params.alpha} rad/s² · m={params.mass}kg
          </div>
        )}
        <div className="relative z-10 shrink-0 p-2"><SimulationHUD live={uiState} /></div>
        <div className="min-h-0 flex-1 relative">
        <SimulationCanvas
          width={dims.w}
          height={dims.h}
          state={uiState}
          radius={params.radius}
          config={viewConfig}
        />
        </div>
      </div>
    </SimulationShell>
  );
}