import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
import "./styles.css";
import KeplerCanvas from "./KeplerCanvas";
import KeplerControlPanel from "./KeplerControlPanel";
import { KeplerEngine } from "./physics";
import { PHYSICS } from "./constants";

const KeplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const initialMcp = useMemo(() => readEmbeddedMcpParameters("astronomy.kepler-lab", {
    launchDistance: 240, launchVelocity: 55, launchAngle: -90, showSweeps: true,
  }), []);
  const [params, setParams] = useState(initialMcp.values);

  const [telemetry, setTelemetry] = useState({ v: 0, r: 0, t: 0 });
  const [status, setStatus] = useState("READY");
  const [logs, setLogs] = useState([]);

  const physicsRef = useRef(new KeplerEngine());
  const requestRef = useRef(null);

  const handleReset = useCallback(
    (currentParams = params) => {
      setIsRunning(false);
      physicsRef.current.reset(
        currentParams.launchDistance,
        currentParams.launchVelocity,
        currentParams.launchAngle
      );
      // Initial State update
      const stats = physicsRef.current.getStats();
      setTelemetry({ v: stats.v, r: stats.r, t: 0 });
      setStatus(stats.status);
      setLogs([]);
    },
    [params]
  );

  useEffect(() => {
    handleReset(params);
  }, []);

  const liveRef = useRef({});
  liveRef.current = { isRunning, params, telemetry, status };
  const actionsRef = useRef({});
  actionsRef.current = { setIsRunning, setParams, handleReset };

  useEffect(() => {
    const controller = new AbortController();
    const rules = {
      launchDistance: { type: "number", minimum: 100, maximum: 1000 },
      launchVelocity: { type: "number", minimum: 10, maximum: 120 },
      launchAngle: { type: "number", minimum: -180, maximum: 180 },
      showSweeps: { type: "boolean" },
    };
    const empty = { type: "object", properties: {}, additionalProperties: false };
    const tools = [
      {
        name: "esbiko_kepler_get_state",
        description: "Read the actual Kepler orbital engine controls, telemetry and status.",
        inputSchema: empty,
        annotations: { readOnlyHint: true },
        execute: createSafeToolExecutor("kepler_get_state", async () => ({
          simulationId: "astronomy.kepler-lab",
          running: liveRef.current.isRunning, params: liveRef.current.params,
          telemetry: liveRef.current.telemetry, status: liveRef.current.status,
        })),
      },
      {
        name: "esbiko_kepler_configure",
        description: "Change the actual Kepler launch distance, velocity, angle, or orbital sweep visibility.",
        inputSchema: { type: "object", properties: rules, additionalProperties: false },
        execute: createSafeToolExecutor("kepler_configure", async (values) => {
          if (!values || typeof values !== "object" || Array.isArray(values)) throw new Error("Expected Kepler settings object.");
          for (const [key, value] of Object.entries(values)) {
            const rule = rules[key];
            if (!rule || typeof value !== rule.type ||
                (rule.type === "number" && (!Number.isFinite(value) || value < rule.minimum || value > rule.maximum))) {
              throw new Error("Invalid Kepler setting: " + key);
            }
          }
          const next = { ...liveRef.current.params, ...values };
          actionsRef.current.setParams(next);
          actionsRef.current.handleReset(next);
          return { accepted: values, params: next };
        }),
      },
      {
        name: "esbiko_kepler_set_playback",
        description: "Start or pause the orbital simulation; a crashed object must be reset first.",
        inputSchema: { type: "object", properties: { running: { type: "boolean" } },
          required: ["running"], additionalProperties: false },
        execute: createSafeToolExecutor("kepler_set_playback", async ({ running }) => {
          if (typeof running !== "boolean") throw new Error("running must be boolean");
          if (running && liveRef.current.status === "CRASHED") throw new Error("Reset before restarting a crashed orbit.");
          actionsRef.current.setIsRunning(running);
          return { running };
        }),
      },
      {
        name: "esbiko_kepler_reset",
        description: "Reset orbital state with the current configured launch conditions.",
        inputSchema: empty,
        execute: createSafeToolExecutor("kepler_reset", async () => {
          actionsRef.current.handleReset(liveRef.current.params);
          return { reset: true, running: false };
        }),
      },
    ];
    registerWebMcpTools({ modelContext: getDocumentModelContext(), tools, signal: controller.signal })
      .catch((error) => { if (!controller.signal.aborted) console.warn("Kepler WebMCP:", error); });
    return () => controller.abort();
  }, []);

  const animate = useCallback(() => {
    if (!isRunning) return;

    const engine = physicsRef.current;
    const stats = engine.update(PHYSICS.DT, params);

    // Update status if it changes (e.g. from Stable to Crashed)
    if (stats.status !== status) {
      setStatus(stats.status);
    }

    if (stats.crashed) {
      setIsRunning(false);
    }

    // Throttle UI Updates
    if (Math.floor(engine.t * 60) % 6 === 0) {
      setTelemetry({ t: engine.t, v: stats.v, r: stats.r });
      setLogs((prev) => {
        const newLog = [...prev, { t: engine.t, v: stats.v }];
        if (newLog.length > 60) newLog.shift();
        return newLog;
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isRunning, params, status]);

  useEffect(() => {
    if (isRunning) requestRef.current = requestAnimationFrame(animate);
    else cancelAnimationFrame(requestRef.current);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, animate]);

  return (
    <div className="kepler-workspace w-full bg-slate-950">
      {/* Unified rounded container */}
      <div className="kepler-layout w-full flex flex-col xl:flex-row gap-4 px-3 md:px-4 pb-4">
        {/* ===== LEFT: CANVAS ===== */}
        <div className="kepler-stage flex-1 min-w-0">
          <div className="kepler-stage-frame w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden relative">
            <KeplerCanvas physicsRef={physicsRef} renderTrigger={isRunning} />

            {hudVisible ? <div className="kepler-hud" aria-label="Orbital model information">
              <button type="button" className="kepler-hud-close" aria-label="Hide orbital information HUD" title="Hide HUD" onClick={() => setHudVisible(false)}>×</button>
              <strong>Scaled two-body model</strong>
              <span>Central body: fixed star · M = {PHYSICS.STAR_MASS} model mass units</span>
              <span>Orbiter: test particle · negligible mass</span>
              <span>GM = {PHYSICS.G * PHYSICS.STAR_MASS} scaled units · not Sun–Earth scale</span>
              <span>Distance: {telemetry.r.toFixed(0)} model units · Speed: {telemetry.v.toFixed(1)} units/time</span>
              <span>Orbit: {status === "ESCAPE" ? "unbound trajectory" : status === "CRASHED" ? "collision" : "bound (unless collision)"}</span>
            </div> : <button type="button" className="kepler-hud-show" onClick={() => setHudVisible(true)} aria-label="Show orbital information HUD">HUD</button>}
            {/* Canvas Overlay Title */}
            <div className="absolute top-6 left-6 pointer-events-none opacity-60">
              <h1 className="text-3xl font-black text-white tracking-widest">
                ORBIT LAB
              </h1>
              <p className="text-xs text-sky-400 font-mono mt-1">
                INTERACTIVE PHYSICS ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: CONTROL PANEL ===== */}
        <div className="kepler-controls w-full xl:w-[420px] min-w-0">
          <div className="kepler-controls-frame rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <KeplerControlPanel
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              onReset={handleReset}
              params={params}
              setParams={setParams}
              telemetry={telemetry}
              logs={logs}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeplerSimulator;
