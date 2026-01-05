// src/simulations/subjects/physics/mechanics/pendulum/Pendulum.jsx

import React, { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

import Controls from "./Controls";
import SimulationCanvas from "./SimulationCanvas";
import Telemetry from "./Telemetry";
import GraphPanel from "./GraphPanel";
import { degToRad } from "./utils";

export default function Pendulum() {
  const [running, setRunning] = useState(false);

  const [lengthM, setLengthM] = useState(2.1);
  const [massKg, setMassKg] = useState(2.0);
  const [entryAngle, setEntryAngle] = useState(38);
  const [elasticity, setElasticity] = useState(1.0);

  const [pxPerMeter, setPxPerMeter] = useState(160);
  const [bobRadius, setBobRadius] = useState(22);
  const [trailLen, setTrailLen] = useState(200);

  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showGraph, setShowGraph] = useState(false);

  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const graphRef = useRef(null);
  const rafRef = useRef(0);

  const engine = useRef({
    theta: degToRad(entryAngle),
    omega: 0,
    alpha: 0,
    lastT: 0,

    // ✅ stable sim clock (seconds)
    tSec: 0,

    trail: [],
    history: [],

    lastTheta: degToRad(entryAngle),
    flashIntensity: 0,
  });

  const drawFrame = (s = engine.current, physics = null) => {
    if (!physics)
      physics = { ke: 0, pe: 0, total: 0, speed: 0, posX: 0, posY: 0 };
    canvasRef.current?.draw(s, showVectors, showTrail);
    hudRef.current?.update(s, physics);
    if (showGraph) graphRef.current?.update(s.history);
  };

  const resetPhysics = () => {
    const s = engine.current;
    s.theta = degToRad(entryAngle);
    s.lastTheta = s.theta;
    s.omega = 0;
    s.alpha = 0;
    s.tSec = 0; // ✅ reset time
    s.trail = [];
    s.history = [];
    s.flashIntensity = 0;
    drawFrame(s);
  };

  useEffect(() => {
    if (!running) resetPhysics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryAngle]);

  useEffect(() => {
    if (running) {
      engine.current.lastT = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const loop = (tNow) => {
    rafRef.current = requestAnimationFrame(loop);

    const s = engine.current;
    let dt = (tNow - s.lastT) / 1000;
    s.lastT = tNow;
    if (dt <= 0 || dt > 0.05) dt = 0.016;

    // ✅ accumulate seconds
    s.tSec += dt;

    const g = 9.81;
    const L = Math.max(0.1, lengthM);

    // physics
    s.alpha = -(g / L) * Math.sin(s.theta);
    s.omega += s.alpha * dt;
    s.omega *= Math.pow(elasticity, dt * 60);
    s.theta += s.omega * dt;

    // flash
    if (
      Math.sign(s.lastTheta) !== Math.sign(s.theta) &&
      Math.abs(s.omega) > 0.05
    ) {
      s.flashIntensity = 1;
    }
    s.lastTheta = s.theta;
    s.flashIntensity = Math.max(0, s.flashIntensity - 3 * dt);

    // derived
    const px = L * Math.sin(s.theta);
    const py = L * Math.cos(s.theta);

    const vx = L * s.omega * Math.cos(s.theta);
    const vy = -L * s.omega * Math.sin(s.theta);
    const speed = Math.abs(L * s.omega);

    const h = L - L * Math.cos(s.theta);
    const pe = massKg * g * h;
    const ke = 0.5 * massKg * speed * speed;
    const total = ke + pe;

    // ✅ history uses seconds now
    s.history.push({
      t: s.tSec,
      angle: s.theta,
      omega: s.omega,
      alpha: s.alpha,
      posX: px,
      posY: py,
      velX: vx,
      velY: vy,
      speed,
      ke,
      pe,
      total,
    });
    if (s.history.length > 900) s.history.shift();

    drawFrame(s, {
      ke,
      pe,
      total,
      speed,
      posX: px * pxPerMeter,
      posY: py * pxPerMeter,
    });
  };
  useEffect(() => {
    if (!running) {
      drawFrame(engine.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    running,
    lengthM,
    pxPerMeter,
    bobRadius,
    showVectors,
    showTrail,
    trailLen,
  ]);

  // ✅ initial draw (still kept)
  useEffect(() => {
    drawFrame(engine.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(34,211,238,.6), rgba(99,102,241,.6));
          border-radius: 999px;
        }
      `}</style>

      <Controls
        running={running}
        toggleRun={() => setRunning((v) => !v)}
        onReset={() => {
          setRunning(false);
          resetPhysics();
        }}
        lengthM={lengthM}
        setLengthM={setLengthM}
        massKg={massKg}
        setMassKg={setMassKg}
        entryAngle={entryAngle}
        setEntryAngle={setEntryAngle}
        elasticity={elasticity}
        setElasticity={setElasticity}
        pxPerMeter={pxPerMeter}
        setPxPerMeter={setPxPerMeter}
        bobRadius={bobRadius}
        setBobRadius={setBobRadius}
        trailLen={trailLen}
        setTrailLen={setTrailLen}
        showVectors={showVectors}
        setShowVectors={setShowVectors}
        showTrail={showTrail}
        setShowTrail={setShowTrail}
      />

      <div className="flex-1 relative">
        <SimulationCanvas
          ref={canvasRef}
          lengthM={lengthM}
          pxPerMeter={pxPerMeter}
          bobRadius={bobRadius}
          trailLen={trailLen} // ✅ IMPORTANT: now Trail Length slider works
          onReady={() => drawFrame(engine.current)} // ✅ fixes "invisible until change something"
        />

        <Telemetry ref={hudRef} />

        {showGraph ? (
          <GraphPanel ref={graphRef} onClose={() => setShowGraph(false)} />
        ) : (
          <button
            onClick={() => setShowGraph(true)}
            className="absolute bottom-6 right-6 bg-slate-900/70 p-3 rounded-full border border-white/20 text-cyan-400 hover:bg-slate-800"
          >
            <TrendingUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
