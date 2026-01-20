// src/simulations/subjects/physics/mechanics/gyroscope/GyroscopeSimulation.jsx

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SimulationShell from "@/system/SimulationShell";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

import Controls from "./Controls";
import Charts from "./Charts";
import GyroModel from "./GyroModel";

import { DEFAULT_PARAMS, DEFAULT_CHART_CONFIG } from "./schema";
import { pushCapped, formatNumber } from "./constants";

export default function GyroscopeSimulation() {
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(DEFAULT_PARAMS);

  const [physicsState, setPhysicsState] = useState({
    t: 0,
    tilt: 0,
    omega: 0,
    L: 0,
    tau: 0,
    Omega: 0,
    I: 0,
    r_weight: 0,
  });

  const chartCfg = useMemo(() => DEFAULT_CHART_CONFIG, []);
  const samplesRef = useRef([]);
  const [chartData, setChartData] = useState([]);

  const tRef = useRef(0);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const onReset = useCallback(() => {
    setRunning(false);
    runningRef.current = false;
    tRef.current = 0;
    samplesRef.current = [];
    setChartData([]);
    setPhysicsState((s) => ({
      ...s,
      t: 0,
      tilt: params.tilt,
      omega: 0,
      Omega: 0,
    }));
  }, [params.tilt]);

  const onStartStop = useCallback(() => {
    setRunning((s) => !s);
  }, []);

  const setParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SimulationShell
      title="Scientific Gyroscope"
      subtitle="Optimized Lab Model"
      // We removed panelTop. The controls are now integrated into the right panel.
      panel={
        <div className="space-y-6">
          <Controls
            params={params}
            setParam={setParam}
            running={running}
            onStartStop={onStartStop}
            onReset={onReset}
            t={physicsState.t}
          />
          <Charts data={chartData} />
        </div>
      }
    >
      <div className="relative w-full h-full bg-slate-950 overflow-hidden">
        {/* --- LEFT GLASS OVERLAY --- */}
        <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100%-2rem)] flex flex-col gap-4 pointer-events-none">
          {/* We moved Time to the main control panel, so we removed it from here to reduce clutter */}
          <GlassPanel title="Physics State">
            <DataRow
              label="Tilt Angle (θ)"
              value={physicsState.tilt}
              unit="°"
              color="#22d3ee"
            />
            <DataRow
              label="Spin Speed (ω)"
              value={physicsState.omega}
              unit="rad/s"
            />
            <DataRow
              label="Precession (Ω)"
              value={physicsState.Omega}
              unit="rad/s"
              color="#fbbf24"
            />
          </GlassPanel>

          <GlassPanel title="Calculated Forces">
            <div className="space-y-4 text-sm font-mono text-white/80">
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-1">
                  1. Angular Momentum
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-400">L = I · ω</span>
                  <span>
                    {formatNumber(physicsState.L)}{" "}
                    <span className="text-white/30 text-xs">kg·m²/s</span>
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-1">
                  2. Gravitational Torque
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-400">τ = M·g·r·cos(θ)</span>
                  <span>
                    {formatNumber(physicsState.tau)}{" "}
                    <span className="text-white/30 text-xs">N·m</span>
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* --- 3D SCENE --- */}
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [3, 2.5, 3.5], fov: 35 }}
        >
          <PhysicsController
            runningRef={runningRef}
            paramsRef={paramsRef}
            tRef={tRef}
            chartCfg={chartCfg}
            samplesRef={samplesRef}
            setPhysicsState={setPhysicsState}
            setChartData={setChartData}
            params={params}
          />
          <OrbitControls makeDefault target={[0, 1.3, 0]} />

          <Environment preset="warehouse" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-bias={-0.0001}
          />
        </Canvas>
      </div>
    </SimulationShell>
  );
}

// --- UI COMPONENTS ---
const GlassPanel = React.memo(({ title, children }) => (
  <div className="pointer-events-auto backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
    <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
      <div className="text-white font-bold tracking-wide text-sm">{title}</div>
    </div>
    <div className="p-4 space-y-2">{children}</div>
  </div>
));

function DataRow({ label, value, unit, color }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/50 font-medium">{label}</span>
      <span className="font-mono font-bold" style={{ color: color || "white" }}>
        {formatNumber(value)}{" "}
        <span className="text-white/30 text-xs ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

// --- LOGIC CONTROLLER (No Changes) ---
function PhysicsController({
  runningRef,
  paramsRef,
  tRef,
  chartCfg,
  samplesRef,
  setPhysicsState,
  setChartData,
  params,
}) {
  const outerRef = useRef();
  const innerRef = useRef();
  const rotorRef = useRef();
  const angles = useRef({ spin: 0, prec: 0 });
  const uiAcc = useRef(0);
  const sampleAcc = useRef(0);

  useFrame((state, delta) => {
    const p = paramsRef.current;
    const dt = runningRef.current ? Math.min(delta, 0.05) : 0;

    const g = 9.81;
    const M = p.mass;
    const R = p.diskRadius;
    const r_weight = R + 0.15;
    const weightMass = 0.2;
    const I = 0.5 * M * R ** 2;
    const I_trans = 0.25 * M * R ** 2 + (M * 0.05 ** 2) / 12;
    const nutationFreq = (I / I_trans) * p.spinSpeed;
    const nutationAmp = runningRef.current
      ? 0.05 * Math.exp(-0.2 * tRef.current)
      : 0;
    const baseTiltRad = (p.tilt * Math.PI) / 180;
    const currentTilt =
      baseTiltRad +
      (runningRef.current
        ? nutationAmp * Math.sin(nutationFreq * tRef.current)
        : 0);
    const L = I * p.spinSpeed;
    const tau = weightMass * g * r_weight * Math.cos(currentTilt);
    const Omega = L > 0.0001 ? tau / L : 0;
    const KE = 0.5 * I * p.spinSpeed ** 2;
    const PE = weightMass * g * r_weight * Math.sin(currentTilt);

    if (innerRef.current) innerRef.current.rotation.z = currentTilt;
    if (runningRef.current) {
      tRef.current += dt;
      angles.current.spin += p.spinSpeed * dt;
      angles.current.prec += Omega * dt;
      if (rotorRef.current) rotorRef.current.rotation.x = angles.current.spin;
      if (outerRef.current) outerRef.current.rotation.y = angles.current.prec;

      sampleAcc.current += dt;
      if (sampleAcc.current > 1 / chartCfg.sampleRate) {
        sampleAcc.current = 0;
        pushCapped(
          samplesRef.current,
          {
            t: tRef.current,
            tilt: currentTilt * (180 / Math.PI),
            L,
            tau,
            Omega,
            KE,
            PE,
          },
          chartCfg.maxPoints
        );
      }
      uiAcc.current += dt;
      if (uiAcc.current > 0.1) {
        uiAcc.current = 0;
        setPhysicsState({
          t: tRef.current,
          tilt: currentTilt * (180 / Math.PI),
          omega: p.spinSpeed,
          L,
          tau,
          Omega,
          I,
          r_weight,
        });
        setChartData([...samplesRef.current]);
      }
    } else {
      if (outerRef.current) outerRef.current.rotation.y = angles.current.prec;
      setPhysicsState((prev) => ({
        ...prev,
        tilt: p.tilt,
        omega: p.spinSpeed,
        L: I * p.spinSpeed,
        tau: weightMass * g * r_weight * Math.cos(baseTiltRad),
        Omega,
        KE,
        PE,
      }));
    }
  });

  return (
    <GyroModel
      outerRef={outerRef}
      innerRef={innerRef}
      rotorRef={rotorRef}
      params={params}
    />
  );
}