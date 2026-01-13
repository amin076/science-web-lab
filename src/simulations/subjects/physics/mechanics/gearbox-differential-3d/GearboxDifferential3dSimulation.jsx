import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SimulationShell from "@/system/SimulationShell";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Edges } from "@react-three/drei";
import * as THREE from "three";

import Controls from "./Controls";
import HUD from "./HUD";
import Charts from "./Charts";

import { DEFAULT_PARAMS, DEFAULT_CHART_CONFIG } from "./schema";
import { clamp, MAX_DT, pushCapped, formatNumber } from "./constants";

/**
 * Gearbox & Differential (3D) — Readable Educational Cutaway
 * - Glass-like shells PER module (gearbox / final / diff)
 * - Labels moved to a HUD overlay (no covering the model)
 * - Quiet floor (no screaming grid)
 * - Solid gears + shafts (not ghost)
 *
 * Kinematic teaching model (not CAD/torque/inertia):
 * - Reverse shows idler gear
 * - Gear ratio reduces gearbox output
 * - Final drive shown as ring + pinion (visual)
 * - Diff splits wheel speeds when turning (open), locked keeps equal
 */

export default function GearboxDifferential3dSimulation() {
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(DEFAULT_PARAMS);

  const chartCfg = useMemo(() => DEFAULT_CHART_CONFIG, []);
  const samplesRef = useRef([]);
  const [chartData, setChartData] = useState([]);

  const tRef = useRef(0);

  const [hud, setHud] = useState(() => ({
    t: 0,
    note: "Readable cutaway model (glass housings + overlay labels).",
  }));

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

    setParams(DEFAULT_PARAMS);

    setHud({ t: 0, note: "Reset done." });
  }, []);

  const onStartStop = useCallback(() => setRunning((s) => !s), []);

  const setParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SimulationShell
      title="Gearbox & Differential (3D)"
      subtitle="Speed ratio • Torque • Direction"
      topOffset="5px"
      panelTop={
        <div className="w-full">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onStartStop}
              className={`w-full py-3 rounded-xl font-black tracking-wide transition-all border ${
                running
                  ? "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/20"
                  : "bg-emerald-500/15 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/20"
              }`}
            >
              {running ? "STOP" : "START"}
            </button>

            <button
              onClick={onReset}
              className="w-full py-3 rounded-xl font-black tracking-wide bg-white/8 text-white border border-white/12 hover:bg-white/12 transition-all"
            >
              RESET
            </button>
          </div>
        </div>
      }
      panel={
        <div className="space-y-4">
          <Controls params={params} setParam={setParam} />
          <HUD hud={hud} />
          <Charts data={chartData} />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/60 text-sm">
            <div className="font-bold text-white/80 mb-2">Notes</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Glass housings are separate modules, not one giant slab.</li>
              <li>Labels moved to a corner overlay (no blocking the mechanism).</li>
              <li>Reverse shows an idler gear, so direction flip is obvious.</li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="w-full h-full">
        <Canvas
          className="w-full h-full"
          dpr={[1, 2]}
          camera={{ position: [7.2, 3.6, 7.9], fov: 45 }}
          gl={{ powerPreference: "high-performance", antialias: true }}
        >
          <color attach="background" args={["#050712"]} />
          <Environment preset="city" />

          <OrbitControls
            makeDefault
            target={[0.2, 0.3, 0]}
            minDistance={3}
            maxDistance={16}
          />

          <ReadableDrivetrainScene
            runningRef={runningRef}
            paramsRef={paramsRef}
            tRef={tRef}
            chartCfg={chartCfg}
            samplesRef={samplesRef}
            setHud={setHud}
            setChartData={setChartData}
          />
        </Canvas>
      </div>
    </SimulationShell>
  );
}

function rpmToRadPerSec(rpm) {
  return (rpm * 2 * Math.PI) / 60;
}

function computeOutputs(p) {
  const inputRPM = clamp(Number(p.inputRPM) || 0, 0, 1e9);

  const gearRatio = clamp(Number(p.gearRatio) || 1, 0.0001, 1e9);
  const finalDriveRatio = clamp(Number(p.finalDriveRatio) || 1, 0.0001, 1e9);

  const reverse = !!p.reverse;
  const turning = !!p.turning;
  const diffLocked = !!p.diffLocked;
  const turnFactor = clamp(Number(p.turnFactor) || 0, 0, 0.95);

  const gearboxOutRPM = inputRPM / gearRatio;

  const dirSign = reverse ? -1 : 1;
  const finalOutRPM = (gearboxOutRPM / finalDriveRatio) * dirSign;

  let leftWheelRPM = finalOutRPM;
  let rightWheelRPM = finalOutRPM;

  if (turning && !diffLocked) {
    leftWheelRPM = finalOutRPM * (1 - turnFactor);
    rightWheelRPM = finalOutRPM * (1 + turnFactor);
  }

  const direction = finalOutRPM >= 0 ? "CW" : "CCW";
  const mode = `${turning ? "turning" : "straight"} • ${diffLocked ? "locked" : "open"}`;

  return {
    inputRPM,
    gearRatio,
    finalDriveRatio,
    reverse,
    turning,
    diffLocked,
    turnFactor,

    gearboxOutRPM,
    finalOutRPM,
    leftWheelRPM,
    rightWheelRPM,
    direction,
    mode,
  };
}

function ReadableDrivetrainScene({
  runningRef,
  paramsRef,
  tRef,
  chartCfg,
  samplesRef,
  setHud,
  setChartData,
}) {
  const uiAccRef = useRef(0);
  const sampleAccRef = useRef(0);

  const rotRef = useRef({
    thetaIn: 0,
    thetaCounter: 0,
    thetaOut: 0,
    thetaPinion: 0,
    thetaRing: 0,
    thetaCarrier: 0,
    thetaLeft: 0,
    thetaRight: 0,
    thetaSpider: 0,
  });

  // refs
  const inShaftRef = useRef(null);
  const counterShaftRef = useRef(null);
  const outShaftRef = useRef(null);

  const gInRef = useRef(null);
  const gCounterInRef = useRef(null);
  const gCounterOutRef = useRef(null);
  const gOutRef = useRef(null);
  const gIdlerRef = useRef(null);

  const pinionRef = useRef(null);
  const ringRef = useRef(null);

  const carrierRef = useRef(null);
  const sideLRef = useRef(null);
  const sideRRef = useRef(null);
  const spiderARef = useRef(null);
  const spiderBRef = useRef(null);

  const axleLRef = useRef(null);
  const axleRRef = useRef(null);
  const wheelLRef = useRef(null);
  const wheelRRef = useRef(null);

  // layout
  const scale = 2.05;
  const gearboxX = -2.9;
  const finalX = 0.4;
  const diffX = 3.1;

  const yIn = 0.85;
  const yCounter = 0.18;
  const yOut = -0.58;

  // ratios -> readable sizes
  const gearRatio = clamp(Number(paramsRef.current?.gearRatio) || 2.5, 0.5, 6.0);

  const rIn = 0.28;
  const rCounterIn = clamp(rIn * 1.45, 0.25, 0.70);

  const reduction1 = rIn / rCounterIn;
  const k = clamp(1 / (gearRatio * reduction1), 0.2, 4.0);

  const sumCO = 0.85;
  const rOut = clamp(sumCO / (1 + k), 0.20, 0.70);
  const rCounterOut = clamp(sumCO - rOut, 0.20, 0.95);

  const rIdler = 0.26;

  const finalDriveRatio = clamp(Number(paramsRef.current?.finalDriveRatio) || 3.2, 1.0, 6.0);
  const rPinion = 0.20;
  const rRing = clamp(rPinion * finalDriveRatio, 0.65, 1.55);

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    if (!runningRef.current) return;

    tRef.current += dt;
    const t = tRef.current;

    const p = paramsRef.current;
    const out = computeOutputs(p);

    const omegaIn = rpmToRadPerSec(out.inputRPM);

    const omegaCounter = -omegaIn * (rIn / rCounterIn);
    const omegaOut = (out.reverse ? +1 : -1) * omegaCounter * (rCounterOut / rOut);

    const omegaPinion = omegaOut;
    const omegaRingVisual = -omegaPinion * (rPinion / rRing);

    const omegaCarrier = rpmToRadPerSec(out.finalOutRPM);
    const omegaLeft = rpmToRadPerSec(out.leftWheelRPM);
    const omegaRight = rpmToRadPerSec(out.rightWheelRPM);
    const omegaSpider = (omegaRight - omegaLeft) * 0.5;

    const r = rotRef.current;
    r.thetaIn += omegaIn * dt;
    r.thetaCounter += omegaCounter * dt;
    r.thetaOut += omegaOut * dt;

    r.thetaPinion += omegaPinion * dt;
    r.thetaRing += omegaRingVisual * dt;

    r.thetaCarrier += omegaCarrier * dt;
    r.thetaLeft += omegaLeft * dt;
    r.thetaRight += omegaRight * dt;
    r.thetaSpider += omegaSpider * dt;

    spinX(inShaftRef, r.thetaIn);
    spinX(counterShaftRef, r.thetaCounter);
    spinX(outShaftRef, r.thetaOut);

    spinX(gInRef, r.thetaIn);
    spinX(gCounterInRef, r.thetaCounter);
    spinX(gCounterOutRef, r.thetaCounter);
    spinX(gOutRef, r.thetaOut);

    if (gIdlerRef.current) {
      gIdlerRef.current.visible = !!out.reverse;
      if (gIdlerRef.current.visible) spinX(gIdlerRef, r.thetaCounter * 0.9);
    }

    if (pinionRef.current) pinionRef.current.rotation.set(0, r.thetaPinion, 0);
    spinX(ringRef, r.thetaRing);

    if (carrierRef.current) carrierRef.current.rotation.set(r.thetaCarrier, 0, 0);

    spinX(sideLRef, r.thetaLeft - r.thetaCarrier);
    spinX(sideRRef, r.thetaRight - r.thetaCarrier);

    if (spiderARef.current) spiderARef.current.rotation.set(r.thetaCarrier, r.thetaSpider, 0);
    if (spiderBRef.current) spiderBRef.current.rotation.set(r.thetaCarrier, -r.thetaSpider, 0);

    spinX(axleLRef, r.thetaLeft);
    spinX(axleRRef, r.thetaRight);

    spinX(wheelLRef, r.thetaLeft);
    spinX(wheelRRef, r.thetaRight);

    // charts
    sampleAccRef.current += dt;
    const sampleEvery = 1 / chartCfg.sampleRate;
    if (sampleAccRef.current >= sampleEvery) {
      sampleAccRef.current = 0;
      pushCapped(
        samplesRef.current,
        {
          t,
          finalOutRPM: out.finalOutRPM,
          leftWheelRPM: out.leftWheelRPM,
          rightWheelRPM: out.rightWheelRPM,
        },
        chartCfg.maxPoints
      );
    }

    // UI throttle
    uiAccRef.current += dt;
    const uiEvery = 1 / 12;
    if (uiAccRef.current >= uiEvery) {
      uiAccRef.current = 0;

      setHud({
        t,
        inputRPM: out.inputRPM,
        gearboxOutRPM: out.gearboxOutRPM,
        finalOutRPM: out.finalOutRPM,
        leftWheelRPM: out.leftWheelRPM,
        rightWheelRPM: out.rightWheelRPM,
        direction: out.direction,
        mode: out.mode,
      });

      setChartData([...samplesRef.current]);
    }
  });

  const p = paramsRef.current;
  const showLabels = !!p.showLabels;
  const outNow = computeOutputs(p);

  return (
    <>
      {/* lighting: bright enough to see internals through glass */}
      <hemisphereLight intensity={0.55} groundColor="#050712" />
      <directionalLight position={[8, 10, 5]} intensity={1.1} />
      <pointLight position={[0, 3.2, 3.0]} intensity={0.7} />

      {/* quiet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#070a16" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* overlay labels (doesn't block model) */}
      {showLabels ? <OverlayCards out={outNow} /> : null}

      <group scale={scale} position={[0, 0.1, 0]}>
        {/* -------- Gearbox module -------- */}
        <group position={[gearboxX, 0, 0]}>
          <GlassBox size={[5.2, 2.25, 2.35]} position={[0, 0.12, 0]} />

          <Shaft ref={inShaftRef} position={[0, yIn, 0]} length={4.6} radius={0.085} />
          <Shaft ref={counterShaftRef} position={[0, yCounter, 0]} length={4.6} radius={0.085} />
          <Shaft ref={outShaftRef} position={[0, yOut, 0]} length={4.6} radius={0.09} />

          <SpurGear ref={gInRef} position={[-1.2, yIn, 0]} radius={rIn} thickness={0.26} teeth={26} color="#ef4444" />
          <SpurGear ref={gCounterInRef} position={[-1.2, yCounter, 0]} radius={rCounterIn} thickness={0.26} teeth={36} color="#3b82f6" />

          <SpurGear ref={gCounterOutRef} position={[1.15, yCounter, 0]} radius={rCounterOut} thickness={0.28} teeth={42} color="#3b82f6" />
          <SpurGear ref={gOutRef} position={[1.15, yOut, 0]} radius={rOut} thickness={0.28} teeth={22} color="#ef4444" />

          <SpurGear
            ref={gIdlerRef}
            position={[1.15, (yCounter + yOut) / 2, 0]}
            radius={rIdler}
            thickness={0.22}
            teeth={24}
            color="#94a3b8"
          />
        </group>

        {/* -------- Final drive module -------- */}
        <group position={[finalX, 0, 0]}>
          <GlassBox size={[3.3, 2.1, 2.25]} position={[0.15, -0.05, 0]} />

          <Shaft position={[-1.6, yOut, 0]} length={2.1} radius={0.09} />

          <BevelPinion ref={pinionRef} position={[-0.55, yOut, 0]} radius={rPinion} length={0.55} color="#10b981" />
          <SpurGear ref={ringRef} position={[-0.55, 0.35, 0]} radius={rRing} thickness={0.32} teeth={72} color="#60a5fa" />
        </group>

        {/* -------- Differential module -------- */}
        <group position={[diffX, 0, 0]}>
          <GlassCylinder radius={1.08} height={1.45} position={[0, -0.05, 0]} />

          <group ref={carrierRef} position={[0, -0.05, 0]}>
            <SpurGear ref={sideLRef} position={[-0.55, 0, 0]} radius={0.40} thickness={0.22} teeth={28} color="#ef4444" />
            <SpurGear ref={sideRRef} position={[0.55, 0, 0]} radius={0.40} thickness={0.22} teeth={28} color="#ef4444" />
            <SpurGear ref={spiderARef} position={[0, 0.32, 0]} radius={0.26} thickness={0.18} teeth={18} color="#94a3b8" />
            <SpurGear ref={spiderBRef} position={[0, -0.32, 0]} radius={0.26} thickness={0.18} teeth={18} color="#94a3b8" />
          </group>

          <Shaft ref={axleLRef} position={[1.65, -0.05, 0]} length={2.8} radius={0.10} />
          <Shaft ref={axleRRef} position={[-1.65, -0.05, 0]} length={2.8} radius={0.10} />

          <Wheel ref={wheelLRef} position={[3.0, -0.05, 0]} radius={0.72} width={0.42} />
          <Wheel ref={wheelRRef} position={[-3.0, -0.05, 0]} radius={0.72} width={0.42} />
        </group>
      </group>
    </>
  );
}

function spinX(ref, theta) {
  if (!ref?.current) return;
  ref.current.rotation.set(theta, 0, Math.PI / 2);
}

/* ---------------------------
   Overlays (no model blocking)
---------------------------- */

function OverlayCards({ out }) {
  return (
    <Html fullscreen>
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          maxWidth: 760,
          pointerEvents: "none",
        }}
      >
        <Card
          title="Gearbox"
          lines={[
            `Input: ${formatNumber(out.inputRPM, 0)} rpm`,
            `Gear ratio: ${formatNumber(out.gearRatio, 2)}:1`,
            `Gearbox out: ${formatNumber(out.gearboxOutRPM, 2)} rpm`,
            `Mode: ${out.reverse ? "Reverse (idler engaged)" : "Forward"}`,
          ]}
        />
        <Card
          title="Final Drive"
          lines={[
            `Final ratio: ${formatNumber(out.finalDriveRatio, 2)}:1`,
            `Final out: ${formatNumber(out.finalOutRPM, 2)} rpm (${out.direction})`,
          ]}
        />
        <Card title="Differential" lines={[out.mode]} />
        <Card title="Left Wheel" lines={[`RPM: ${formatNumber(out.leftWheelRPM, 2)}`]} />
        <Card title="Right Wheel" lines={[`RPM: ${formatNumber(out.rightWheelRPM, 2)}`]} />
      </div>
    </Html>
  );
}

function Card({ title, lines }) {
  return (
    <div
      style={{
        background: "rgba(2,6,23,0.68)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "10px 12px",
        color: "rgba(255,255,255,0.9)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        minWidth: 200,
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ opacity: 0.9 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------
   Glass shells
---------------------------- */

function GlassBox({ position = [0, 0, 0], size = [4, 2, 2] }) {
  return (
    <group position={position}>
      <mesh renderOrder={10}>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color="#c7d2fe"
          transmission={0.92}
          thickness={0.25}
          ior={1.45}
          roughness={0.10}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.10}
          envMapIntensity={1.2}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>
      <Edges scale={1.001} color="rgba(255,255,255,0.25)" />
    </group>
  );
}

function GlassCylinder({ position = [0, 0, 0], radius = 1, height = 1.4 }) {
  return (
    <group position={position}>
      <mesh renderOrder={10}>
        <cylinderGeometry args={[radius, radius, height, 40]} />
        <meshPhysicalMaterial
          color="#c7d2fe"
          transmission={0.90}
          thickness={0.25}
          ior={1.45}
          roughness={0.12}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.12}
          envMapIntensity={1.2}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>
      <Edges scale={1.001} color="rgba(255,255,255,0.20)" />
    </group>
  );
}

/* ---------------------------
   Parts
---------------------------- */

const Shaft = React.forwardRef(function Shaft({ position, length, radius }, ref) {
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius, radius, length, 24]} />
      <meshStandardMaterial color="#e5e7eb" roughness={0.22} metalness={0.82} envMapIntensity={1.25} />
    </mesh>
  );
});

const SpurGear = React.forwardRef(function SpurGear(
  { position, radius, thickness, teeth = 32, color = "#60a5fa" },
  ref
) {
  const toothW = Math.max(0.03, radius * 0.075);
  const toothH = Math.max(0.05, radius * 0.11);
  const toothD = Math.max(0.04, thickness * 0.55);

  return (
    <group ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius * 0.88, radius * 0.88, thickness, 44]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.35}
          envMapIntensity={1.2}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.06}
        />
      </mesh>

      <mesh>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.06, 28]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.35} metalness={0.55} envMapIntensity={1.2} />
      </mesh>

      <TeethRing
        radius={radius}
        teeth={teeth}
        toothW={toothW}
        toothH={toothH}
        toothD={toothD}
        color={color}
      />
    </group>
  );
});

function TeethRing({ radius, teeth, toothW, toothH, toothD, color }) {
  const instRef = useRef(null);

  useEffect(() => {
    if (!instRef.current) return;

    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3(1, 1, 1);

    const zAxis = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const r = radius * 0.96;

      pos.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      quat.setFromAxisAngle(zAxis, a);

      m.compose(pos, quat, scl);
      instRef.current.setMatrixAt(i, m);
    }

    instRef.current.instanceMatrix.needsUpdate = true;
  }, [radius, teeth]);

  return (
    <instancedMesh ref={instRef} args={[null, null, teeth]}>
      <boxGeometry args={[toothW, toothH, toothD]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} envMapIntensity={1.1} />
    </instancedMesh>
  );
}

const BevelPinion = React.forwardRef(function BevelPinion(
  { position, radius = 0.2, length = 0.5, color = "#10b981" },
  ref
) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[radius, length, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.35}
          envMapIntensity={1.2}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, length * 0.9, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.35} metalness={0.55} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
});

const Wheel = React.forwardRef(function Wheel({ position, radius = 0.7, width = 0.4 }, ref) {
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius, radius, width, 36]} />
      <meshStandardMaterial color="#0b1020" roughness={0.9} metalness={0.05} />
    </mesh>
  );
});
