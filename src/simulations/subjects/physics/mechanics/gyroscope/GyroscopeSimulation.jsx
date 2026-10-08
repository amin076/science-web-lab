// src/simulations/subjects/physics/mechanics/gyroscope/GyroscopeSimulation.jsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { ChevronDown, ChevronUp } from "lucide-react";

import Controls from "./Controls";
import Charts from "./Charts";
import GyroModel from "./GyroModel";

import { DEFAULT_CHART_CONFIG, DEFAULT_PARAMS } from "./schema";
import { formatNumber, pushCapped } from "./constants";
import { readEmbeddedMcpParameters } from "@/platform/agent";

export default function GyroscopeSimulation() {
  const initialMcpRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "physics.mechanics.gyroscope",
      DEFAULT_PARAMS,
    );
  }

  const initialMcp = initialMcpRef.current;
  const configuredInitialParams = {
    ...DEFAULT_PARAMS,
    ...initialMcp.values,
  };

  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [params, setParams] = useState(configuredInitialParams);
  const paramsRef = useRef(configuredInitialParams);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [physicsState, setPhysicsState] = useState({
    t: 0,
    tilt: configuredInitialParams.tilt,
    omega: configuredInitialParams.spinSpeed,
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
    setPhysicsState((state) => ({
      ...state,
      t: 0,
      tilt: params.tilt,
      omega: params.spinSpeed,
      Omega: 0,
    }));
  }, [params.spinSpeed, params.tilt]);

  const onStartStop = useCallback(() => {
    setRunning((state) => !state);
  }, []);

  const setParam = useCallback((key, value) => {
    setParams((previous) => ({ ...previous, [key]: value }));
  }, []);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[radial-gradient(circle_at_50%_18%,#17213b_0%,#070b17_36%,#03050b_76%)] text-slate-100 lg:overflow-hidden"
      data-gyroscope-layout="v2"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[1800px] flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:h-full lg:min-h-0 lg:px-5 lg:pb-5">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 pl-14 sm:pl-16">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-xl">
              Scientific Gyroscope
            </h1>
            <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
              Spin, torque and precession in an interactive 3D lab
            </p>
          </div>

          {initialMcp.embeddedMcpApp && (
            <div className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold text-cyan-200 backdrop-blur-xl">
              MCP configured
            </div>
          )}
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <section
            className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-black/20 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:min-h-[390px] lg:min-h-0"
            data-agent-surface="gyroscope-stage"
          >
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [1.72, 1.28, 2.05], fov: 31 }}
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

              <OrbitControls
                makeDefault
                target={[0, 0.53, 0]}
                minDistance={1.25}
                maxDistance={4.5}
                enablePan={false}
              />

              <Environment preset="warehouse" />
              <ambientLight intensity={0.65} />
              <directionalLight
                position={[4, 7, 5]}
                intensity={1.55}
                castShadow
                shadow-bias={-0.0001}
              />
              <pointLight position={[-3, 2, 2]} intensity={0.45} color="#67e8f9" />
            </Canvas>

            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-4 sm:left-4">
              <PhysicsHud state={physicsState} />
            </div>

            <div className="pointer-events-none absolute right-3 top-3 z-20 hidden sm:block">
              <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white/60 backdrop-blur-xl">
                Drag to orbit · Scroll to zoom
              </div>
            </div>
          </section>

          <aside
            className="min-h-0 rounded-[24px] border border-white/10 bg-white/[0.035] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-4"
            data-gyroscope-controls="true"
          >
            <Controls
              params={params}
              setParam={setParam}
              running={running}
              onStartStop={onStartStop}
              onReset={onReset}
              t={physicsState.t}
            />

            <div className="mt-3 border-t border-white/10 pt-3">
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                aria-expanded={showAnalysis}
                onClick={() => setShowAnalysis((value) => !value)}
              >
                <span>Physical analysis</span>
                {showAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showAnalysis && (
                <div className="mt-3">
                  <Charts data={chartData} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const PhysicsHud = React.memo(({ state }) => (
  <div
    className="pointer-events-auto grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-slate-950/35 p-2 shadow-xl backdrop-blur-2xl sm:min-w-[400px] sm:gap-2 sm:p-2.5"
    data-gyroscope-hud="true"
  >
    <Metric label="Spin ω" value={state.omega} unit="rad/s" />
    <Metric label="Momentum L" value={state.L} unit="kg·m²/s" accent="text-sky-300" />
    <Metric label="Torque τ" value={state.tau} unit="N·m" accent="text-rose-300" />
    <Metric label="Tilt θ" value={state.tilt} unit="°" accent="text-cyan-300" />
    <Metric label="Precession Ω" value={state.Omega} unit="rad/s" accent="text-amber-300" />
    <Metric label="Time" value={state.t} unit="s" />
  </div>
));

function Metric({ label, value, unit, accent = "text-white" }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.035] px-2 py-2 sm:px-2.5">
      <div className="truncate text-[9px] font-bold uppercase tracking-[0.11em] text-white/40 sm:text-[10px]">
        {label}
      </div>
      <div className={`mt-0.5 truncate font-mono text-[12px] font-bold sm:text-sm ${accent}`}>
        {formatNumber(value)}
        <span className="ml-1 text-[9px] font-medium text-white/35 sm:text-[10px]">
          {unit}
        </span>
      </div>
    </div>
  );
}

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
    const rWeight = R + 0.15;
    const weightMass = 0.2;
    const I = 0.5 * M * R ** 2;
    const ITrans = 0.25 * M * R ** 2 + (M * 0.05 ** 2) / 12;
    const nutationFreq = (I / ITrans) * p.spinSpeed;
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
    const tau = weightMass * g * rWeight * Math.cos(currentTilt);
    const Omega = L > 0.0001 ? tau / L : 0;
    const KE = 0.5 * I * p.spinSpeed ** 2;
    const PE = weightMass * g * rWeight * Math.sin(currentTilt);

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
          chartCfg.maxPoints,
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
          r_weight: rWeight,
        });
        setChartData([...samplesRef.current]);
      }
    } else {
      if (outerRef.current) outerRef.current.rotation.y = angles.current.prec;
      setPhysicsState((previous) => ({
        ...previous,
        tilt: p.tilt,
        omega: p.spinSpeed,
        L,
        tau,
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
