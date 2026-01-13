import React, { useEffect, useMemo, useRef, useState } from "react";
import SimulationShell from "@/system/SimulationShell";
import Controls from "./Controls";
import HUD from "./HUD";
import { DEFAULT_PARAMS } from "./schema";
import {
  clamp,
  MAX_DT,
  PX_PER_METER,
  resizeCanvasToParentDPR,
} from "./constants";
import { useSimLoop } from "./useSimLoop";
import {
  computeForces,
  statusFrom,
  configLabel,
  getGeometry,
  getRopeSystem,
  configToMA,
} from "./physics";
import { renderScene } from "./render";

const TABLE_HEIGHT_FROM_BOTTOM = 140;
const LOAD_BLOCK_HEIGHT = 60;
const BEAM_HEIGHT = 40;

export default function PulleySystemSimulation() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const [hud, setHud] = useState(() => ({ t: 0, note: "Ready" }));
  const hudAccRef = useRef(0);

  const simRef = useRef({
    t: 0,
    y: 4.0,
    v: 0.0,
    a: 0.0,
    yMin: 1.8,
    yMax: 6.0,
    ropeOffset: 0,
  });

  const updateBoundsFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cssH } = resizeCanvasToParentDPR(canvas);

    const surfaceYPx = cssH - TABLE_HEIGHT_FROM_BOTTOM;

    // Check Config to determine Hook Offset
    const p = paramsRef.current;
    const isFixed = p.config === "fixed";

    // For Fixed: Offset = 0.5m
    // For Standard Block/Tackle: Offset = radius(0.45) + 0.2 = 0.65m
    const hookOffsetMeters = isFixed ? 0.5 : 0.65;

    const availableHeightPx =
      surfaceYPx -
      BEAM_HEIGHT -
      hookOffsetMeters * PX_PER_METER -
      LOAD_BLOCK_HEIGHT;
    const yMaxMeters = Math.max(2, availableHeightPx / PX_PER_METER);

    const s = simRef.current;
    s.yMin = 1.8;
    s.yMax = yMaxMeters;

    if (s.y > s.yMax) {
      s.y = s.yMax;
      s.v = 0;
    }
  };

  useEffect(() => {
    updateBoundsFromCanvas();
    const ro = new ResizeObserver(() => updateBoundsFromCanvas());
    if (canvasRef.current?.parentElement)
      ro.observe(canvasRef.current.parentElement);
    return () => ro.disconnect();
  }, [params.config]);

  const initSim = () => {
    const s = simRef.current;
    updateBoundsFromCanvas();
    s.t = 0;
    s.v = 0;
    s.a = 0;
    s.y = s.yMax; // Start resting on the table
    s.ropeOffset = 0;
    setHud({ t: 0, note: "Reset. Ready." });
  };

  const step = (dt) => {
    const s = simRef.current;
    const p = paramsRef.current;
    s.t += dt;
    const forces = computeForces(s, p);
    s.a = forces.a;
    s.v += s.a * dt;
    s.y += s.v * dt;

    if (s.y <= s.yMin) {
      s.y = s.yMin;
      if (s.v < 0) s.v = 0;
    }

    if (s.y >= s.yMax) {
      s.y = s.yMax;
      if (s.v > 0) s.v = 0;
    }

    s.ropeOffset += s.v * forces.MA * dt * PX_PER_METER;

    return {
      ...forces,
      t: s.t,
      y: s.y,
      v: s.v,
      a: s.a,
      status: statusFrom(s, forces),
      configLabel: configLabel(p.config),
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx, cssW, cssH } = resizeCanvasToParentDPR(canvas);
    if (!ctx) return;
    const p = paramsRef.current;
    const s = simRef.current;
    const forces = computeForces(s, p);
    const geom = getGeometry(cssW, s.y);
    const system = getRopeSystem(p, geom);

    renderScene(
      ctx,
      cssW,
      cssH,
      p,
      s,
      forces,
      geom,
      system,
      s.ropeOffset,
      TABLE_HEIGHT_FROM_BOTTOM
    );
  };

  const { resetClock } = useSimLoop({
    running,
    maxDt: MAX_DT,
    step,
    draw,
    onFrame: (out, dt, didStep) => {
      if (!didStep || !out) return;
      hudAccRef.current += dt;
      if (hudAccRef.current >= 1 / 15) {
        hudAccRef.current = 0;
        setHud(out);
      }
    },
  });

  const onStartStop = () => {
    setRunning((s) => !s);
    resetClock();
  };
  const onReset = () => {
    setRunning(false);
    resetClock();
    setParams(DEFAULT_PARAMS);
    initSim();
    draw();
  };

  useEffect(() => {
    initSim();
    draw();
  }, []);
  useEffect(() => {
    if (!running) draw();
  }, [params, running]);

  return (
    <SimulationShell
      title="Block and Tackle"
      subtitle="Rope and Pulley system"
      panelTop={
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStartStop}
            className={`py-3 rounded-xl font-black ${
              running
                ? "bg-red-500/20 text-red-300"
                : "bg-emerald-500/20 text-emerald-200"
            }`}
          >
            {running ? "STOP" : "START"}
          </button>
          <button
            onClick={onReset}
            className="py-3 rounded-xl font-black bg-white/10 text-white"
          >
            RESET
          </button>
        </div>
      }
      panel={
        <div className="space-y-4">
          <Controls
            params={params}
            setParam={(k, v) => setParams((p) => ({ ...p, [k]: v }))}
          />
          <HUD hud={hud} />
        </div>
      }
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </SimulationShell>
  );
}
