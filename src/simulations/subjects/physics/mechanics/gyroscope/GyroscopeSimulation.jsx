// src/simulations/subjects/physics/mechanics/gyroscope/GyroscopeSimulation.jsx

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SimulationShell from "@/system/SimulationShell";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import Controls from "./Controls";
import Charts from "./Charts";

import { DEFAULT_PARAMS, DEFAULT_CHART_CONFIG } from "./schema";
import { pushCapped, formatNumber } from "./constants";

// Reusable vectors to prevent Garbage Collection stutter
const _vec3 = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _origin = new THREE.Vector3();

export default function GyroscopeSimulation() {
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(DEFAULT_PARAMS);

  const [physicsState, setPhysicsState] = useState({
    t: 0, tilt: 0, omega: 0, L: 0, tau: 0, Omega: 0, I: 0, r_weight: 0
  });

  const chartCfg = useMemo(() => DEFAULT_CHART_CONFIG, []);
  const samplesRef = useRef([]);
  const [chartData, setChartData] = useState([]);

  const tRef = useRef(0);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { paramsRef.current = params; }, [params]);

  const onReset = useCallback(() => {
    setRunning(false);
    runningRef.current = false;
    tRef.current = 0;
    samplesRef.current = [];
    setChartData([]);
    setParams(DEFAULT_PARAMS);
    setPhysicsState(s => ({ ...s, t: 0, tilt: DEFAULT_PARAMS.tilt, omega: 0, Omega: 0 }));
  }, []);

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
      panelTop={
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStartStop}
            className={`py-3 rounded-xl font-black tracking-wide border transition-all ${
              running 
                ? "bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30" 
                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30"
            }`}
          >
            {running ? "STOP" : "START"}
          </button>
          <button
            onClick={onReset}
            className="py-3 rounded-xl font-black bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
          >
            RESET
          </button>
        </div>
      }
      panel={
        <div className="space-y-4">
          <Controls params={params} setParam={setParam} />
          <Charts data={chartData} />
        </div>
      }
    >
      <div className="relative w-full h-full bg-slate-950 overflow-hidden">
        
        {/* --- LEFT GLASS OVERLAY --- */}
        <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100%-2rem)] flex flex-col gap-4 pointer-events-none">
          <GlassPanel title="Live Data">
            <DataRow label="Time" value={physicsState.t} unit="s" />
            <DataRow label="Tilt Angle (θ)" value={physicsState.tilt} unit="°" color="#22d3ee" />
            <DataRow label="Spin Speed (ω)" value={physicsState.omega} unit="rad/s" />
            <DataRow label="Precession (Ω)" value={physicsState.Omega} unit="rad/s" color="#fbbf24" />
          </GlassPanel>

          <GlassPanel title="Physics Blackboard">
            <div className="space-y-4 text-sm font-mono text-white/80">
              {/* Angular Momentum */}
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-1">1. Angular Momentum</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-400">L = I · ω</span>
                  <span>{formatNumber(physicsState.L)} <span className="text-white/30 text-xs">kg·m²/s</span></span>
                </div>
              </div>

              {/* Torque */}
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-1">2. Gravitational Torque</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-400">τ = M·g·r·cos(θ)</span>
                  <span>{formatNumber(physicsState.tau)} <span className="text-white/30 text-xs">N·m</span></span>
                </div>
                <div className="text-[10px] text-white/30 pl-2 border-l-2 border-white/10 italic">
                  *Assumes unbalanced inner ring mass
                </div>
              </div>

              {/* Precession */}
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-1">3. Precession Rate</div>
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                  <span className="text-amber-400 font-bold">Ω = τ / L</span>
                  <span className="text-lg font-bold text-white">{formatNumber(physicsState.Omega, 3)} <span className="text-white/30 text-xs font-normal">rad/s</span></span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* --- 3D SCENE --- */}
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [2.5, 2.5, 3.5], fov: 35 }}>
          <GyroScene
            runningRef={runningRef}
            paramsRef={paramsRef}
            tRef={tRef}
            chartCfg={chartCfg}
            samplesRef={samplesRef}
            setPhysicsState={setPhysicsState}
            setChartData={setChartData}
          />
          <OrbitControls makeDefault target={[0, 1, 0]} />
        </Canvas>
      </div>
    </SimulationShell>
  );
}

// --- GLASS UI COMPONENTS ---
const GlassPanel = React.memo(({ title, children }) => (
  <div className="pointer-events-auto backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
    <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
      <div className="text-white font-bold tracking-wide text-sm">{title}</div>
    </div>
    <div className="p-4 space-y-2">
      {children}
    </div>
  </div>
));

function DataRow({ label, value, unit, color }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/50 font-medium">{label}</span>
      <span className="font-mono font-bold" style={{ color: color || 'white' }}>
        {formatNumber(value)} <span className="text-white/30 text-xs ml-0.5">{unit}</span>
      </span>
    </div>
  );
}


/* ---------------- 3D SCENE ---------------- */

function GyroScene({
  runningRef,
  paramsRef,
  tRef,
  chartCfg,
  samplesRef,
  setPhysicsState,
  setChartData,
}) {
  const outerGimbalRef = useRef(); 
  const innerGimbalRef = useRef(); 
  const rotorRef = useRef();

  const angles = useRef({ spin: 0, prec: 0 });
  const uiAcc = useRef(0);
  const sampleAcc = useRef(0);

  useFrame((state, delta) => {
    const p = paramsRef.current;
    const dt = runningRef.current ? Math.min(delta, 0.05) : 0;
    
    // Physics
    const g = 9.81;
    const M = p.mass;
    const R = p.diskRadius;
    const r_weight = R + 0.15; 
    const weightMass = 0.2; // Virtual mass causing the torque

    const I = 0.5 * M * (R ** 2);
    const I_trans = 0.25 * M * (R ** 2);

    const nutationFreq = (I / I_trans) * p.spinSpeed;
    const nutationAmp = runningRef.current ? 0.05 * Math.exp(-0.1 * tRef.current) : 0;
    
    const baseTiltRad = (p.tilt * Math.PI) / 180;
    const currentTilt = baseTiltRad + (runningRef.current ? nutationAmp * Math.sin(nutationFreq * tRef.current) : 0);

    const L = I * p.spinSpeed;
    const tau = weightMass * g * r_weight * Math.cos(currentTilt);
    const Omega = L > 0.0001 ? tau / L : 0;

    // Apply Static/Dynamic Tilt
    if (innerGimbalRef.current) {
      innerGimbalRef.current.rotation.z = currentTilt;
    }

    if (runningRef.current) {
      tRef.current += dt;
      angles.current.spin += p.spinSpeed * dt;
      angles.current.prec += Omega * dt;

      if (rotorRef.current) rotorRef.current.rotation.x = angles.current.spin;
      if (outerGimbalRef.current) outerGimbalRef.current.rotation.y = angles.current.prec;

      // Chart Sampling
      sampleAcc.current += dt;
      if (sampleAcc.current > 1 / chartCfg.sampleRate) {
        sampleAcc.current = 0;
        pushCapped(samplesRef.current, {
          t: tRef.current,
          tilt: currentTilt * (180/Math.PI),
          L,
          tau,
          Omega
        }, chartCfg.maxPoints);
      }

      // UI Update
      uiAcc.current += dt;
      if (uiAcc.current > 0.1) { 
        uiAcc.current = 0;
        setPhysicsState({
          t: tRef.current,
          tilt: currentTilt * (180/Math.PI),
          omega: p.spinSpeed,
          L,
          tau,
          Omega,
          I,
          r_weight
        });
        setChartData([...samplesRef.current]);
      }
    } else {
      if (outerGimbalRef.current) outerGimbalRef.current.rotation.y = angles.current.prec;
      setPhysicsState(prev => ({
         ...prev,
         tilt: p.tilt,
         omega: p.spinSpeed,
         L: I * p.spinSpeed,
         tau: weightMass * g * r_weight * Math.cos(baseTiltRad),
         Omega
      }));
    }
  });

  const p = paramsRef.current;
  const R_rotor = p.diskRadius;
  const R_inner = R_rotor + 0.05;
  const R_outer = R_inner + 0.08;
  const pivotHeight = 1.2;

  const materials = useMemo(() => ({
    brass: new THREE.MeshStandardMaterial({ color: "#f59e0b", metalness: 1, roughness: 0.15 }),
    silver: new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.9, roughness: 0.2 }),
    rotor: new THREE.MeshStandardMaterial({ color: "#334155", metalness: 0.6, roughness: 0.4 }),
    stand: new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 0.5, roughness: 0.5 }),
    bolt: new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 1, roughness: 0.1 })
  }), []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.5} />
      <gridHelper args={[20, 20, 0x333333, 0x111111]} />

      {/* Stand */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.03, 0]} receiveShadow material={materials.stand}>
          <cylinderGeometry args={[0.6, 0.7, 0.06, 64]} />
        </mesh>
        <mesh position={[0, pivotHeight / 2, 0]} castShadow material={materials.silver}>
          <cylinderGeometry args={[0.04, 0.04, pivotHeight, 32]} />
        </mesh>
        <mesh position={[0, pivotHeight, 0]} material={materials.brass}>
          <cylinderGeometry args={[0.06, 0.02, 0.05, 32]} />
        </mesh>
      </group>

      {/* Outer Gimbal */}
      <group ref={outerGimbalRef} position={[0, pivotHeight + 0.02, 0]}>
         <mesh rotation={[0, Math.PI/2, 0]} material={materials.brass}>
            <torusGeometry args={[R_outer, 0.04, 32, 100]} />
         </mesh>
         <mesh position={[0, -R_outer, 0]} material={materials.brass}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
         </mesh>
         <mesh position={[0, 0, R_outer]} rotation={[Math.PI/2, 0, 0]} material={materials.brass}>
             <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
         </mesh>
         <mesh position={[0, 0, -R_outer]} rotation={[Math.PI/2, 0, 0]} material={materials.brass}>
             <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
         </mesh>

         {/* Inner Gimbal */}
         <group ref={innerGimbalRef}>
            <mesh rotation={[Math.PI/2, 0, 0]} material={materials.silver}>
                <torusGeometry args={[R_inner, 0.04, 32, 100]} />
            </mesh>
            
            {/* ROTOR GROUP */}
            <group ref={rotorRef}>
               {/* Axle */}
               <mesh rotation={[0, 0, Math.PI/2]} material={materials.silver}>
                  <cylinderGeometry args={[0.025, 0.025, R_inner * 2.05, 16]} />
               </mesh>
               
               {/* Main Flywheel */}
               <mesh rotation={[0, 0, Math.PI/2]} material={materials.rotor}>
                  <cylinderGeometry args={[R_rotor, R_rotor, 0.25, 64]} />
               </mesh>
               
               {/* Hub */}
               <mesh rotation={[0, 0, Math.PI/2]} material={materials.silver}>
                  <cylinderGeometry args={[0.1, 0.1, 0.26, 32]} />
               </mesh>

               {/* VISUAL BOLTS (To show spin naturally) */}
               {/* 6 Silver bolts arranged in a circle on the rotor face */}
               {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <group key={i} rotation={[deg * Math.PI / 180, 0, 0]}>
                    <mesh position={[0.13, R_rotor * 0.65, 0]} rotation={[0, 0, Math.PI/2]} material={materials.bolt}>
                      <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
                    </mesh>
                    <mesh position={[-0.13, R_rotor * 0.65, 0]} rotation={[0, 0, Math.PI/2]} material={materials.bolt}>
                      <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
                    </mesh>
                  </group>
               ))}

            </group>
         </group>
      </group>

      {p.showVectors && <LiveVectors targetRef={rotorRef} />}
    </>
  );
}

function LiveVectors({ targetRef }) {
  const arrowL = useRef();
  
  useFrame(() => {
    if (!targetRef.current || !arrowL.current) return;
    
    // Position
    _origin.set(0,0,0).applyMatrix4(targetRef.current.matrixWorld);
    arrowL.current.position.copy(_origin);
    
    // Direction
    _dir.set(1,0,0).transformDirection(targetRef.current.matrixWorld);
    arrowL.current.setDirection(_dir);
  });

  return <arrowHelper ref={arrowL} args={[new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 2.5, 0xff0000, 0.4, 0.2]} />;
}