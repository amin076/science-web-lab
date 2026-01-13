import React, { useState, useRef, useEffect, useCallback } from "react";
import "./styles.css";
import KeplerCanvas from "./KeplerCanvas";
import KeplerControlPanel from "./KeplerControlPanel";
import { KeplerEngine } from "./physics";
import { PHYSICS } from "./constants";

const KeplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [params, setParams] = useState({
    launchDistance: 240,
    launchVelocity: 55,
    launchAngle: -90,
    showSweeps: true,
  });

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
    <div className="h-[calc(100dvh-100px)] w-full overflow-hidden bg-slate-950">
      {/* Unified rounded container */}
      <div className="h-full w-full flex flex-col xl:flex-row min-h-0 gap-0 px-4 pb-4">
        {/* ===== LEFT: CANVAS ===== */}
        <div className="flex-1 min-h-0">
          <div className="h-full w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden relative">
            <KeplerCanvas physicsRef={physicsRef} renderTrigger={isRunning} />

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
        <div className="w-full xl:w-[420px] min-h-0 xl:ml-4 mt-4 xl:mt-0">
          <div className="h-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
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
