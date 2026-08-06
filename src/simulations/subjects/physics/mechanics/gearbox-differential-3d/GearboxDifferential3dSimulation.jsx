import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { useFrame } from "@react-three/fiber";
import { Edges, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

import Controls from "./Controls";
import HUD from "./HUD";
import Charts from "./Charts";
import { DEFAULT_CHART_CONFIG, DEFAULT_PARAMS } from "./schema";
import { clamp, formatNumber, MAX_DT, pushCapped } from "./constants";
import {
  SimulationButton,
  SimulationPanel,
  SimulationStandardWorkspace,
  SimulationThreeViewport,
  SimulationToolbar,
} from "@/components/simulation-ui";

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
    ...computeOutputs(DEFAULT_PARAMS),
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
    setHud({ t: 0, ...computeOutputs(DEFAULT_PARAMS) });
  }, []);

  const onStartStop = useCallback(() => setRunning((value) => !value), []);
  const setParam = useCallback((key, value) => {
    setParams((previous) => ({ ...previous, [key]: value }));
  }, []);

  return (
    <SimulationStandardWorkspace
      title="Gearbox & Differential"
      subtitle="3D drivetrain cutaway - speed ratio, direction, and open differential split"
      simulationType="3d"
      domain="physics"
      viewportLabel="Gearbox and differential 3D simulation"
      viewport={
        <SimulationThreeViewport
          quality="high"
          background="#030712"
          showDefaultLights={false}
          showStars={false}
          camera={{ position: [8.8, 4.2, 10.2], fov: 38, near: 0.05, far: 100 }}
          controls={{
            target: [0.15, 0.05, 0],
            minDistance: 6,
            maxDistance: 18,
            enablePan: false,
          }}
        >
          <color attach="background" args={["#030712"]} />
          <fog attach="fog" args={["#030712", 9, 22]} />
          <Environment preset="city" />
          <ReadableDrivetrainScene
            runningRef={runningRef}
            paramsRef={paramsRef}
            tRef={tRef}
            chartCfg={chartCfg}
            samplesRef={samplesRef}
            setHud={setHud}
            setChartData={setChartData}
          />
        </SimulationThreeViewport>
      }
      hud={<HUD hud={hud} running={running} />}
      hudPosition="top-left"
      hudSx={{
        top: { xs: 88, md: 92 },
        maxWidth: { xs: "calc(100% - 20px)", sm: 330 },
      }}
      toolbar={
        <SimulationToolbar
          domain="physics"
          justifyContent="flex-end"
          sx={{ borderRadius: 2, background: "rgba(2,6,23,0.58)" }}
        >
          <SimulationButton
            domain="physics"
            simulationVariant={running ? "danger" : "primary"}
            startIcon={running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={onStartStop}
          >
            {running ? "Pause" : "Start"}
          </SimulationButton>
          <SimulationButton
            domain="physics"
            simulationVariant="subtle"
            startIcon={<RestartAltRoundedIcon />}
            onClick={onReset}
          >
            Reset
          </SimulationButton>
        </SimulationToolbar>
      }
      controls={
        <>
          <Controls params={params} setParam={setParam} />
          <Charts data={chartData} />
          <TheoryPanel />
        </>
      }
    />
  );
}

function TheoryPanel() {
  const rows = [
    ["Gearbox", "Input speed is divided by the selected gear ratio."],
    ["Final drive", "The final ratio reduces speed again and reverse flips sign."],
    ["Open diff", "When turning, wheel RPMs split around the carrier speed."],
  ];

  return (
    <SimulationPanel title="Model Notes" subtitle="Kinematic teaching model" domain="physics" compact>
      <Stack spacing={1}>
        {rows.map(([label, text]) => (
          <Box
            key={label}
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: "1px solid rgba(148,163,184,0.14)",
              background: "rgba(15,23,42,0.42)",
            }}
          >
            <Typography sx={{ color: "rgba(248,250,252,0.9)", fontSize: 13, fontWeight: 850 }}>
              {label}
            </Typography>
            <Typography sx={{ mt: 0.35, color: "rgba(203,213,225,0.58)", fontSize: 12, lineHeight: 1.5 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </SimulationPanel>
  );
}

function rpmToRadPerSec(rpm) {
  return (rpm * 2 * Math.PI) / 60;
}

function computeOutputs(params) {
  const inputRPM = clamp(Number(params.inputRPM) || 0, 0, 1e9);
  const gearRatio = clamp(Number(params.gearRatio) || 1, 0.0001, 1e9);
  const finalDriveRatio = clamp(Number(params.finalDriveRatio) || 1, 0.0001, 1e9);
  const reverse = Boolean(params.reverse);
  const turning = Boolean(params.turning);
  const diffLocked = Boolean(params.diffLocked);
  const turnFactor = clamp(Number(params.turnFactor) || 0, 0, 0.95);
  const gearboxOutRPM = inputRPM / gearRatio;
  const finalOutRPM = (gearboxOutRPM / finalDriveRatio) * (reverse ? -1 : 1);
  const leftWheelRPM = turning && !diffLocked ? finalOutRPM * (1 - turnFactor) : finalOutRPM;
  const rightWheelRPM = turning && !diffLocked ? finalOutRPM * (1 + turnFactor) : finalOutRPM;

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
    direction: finalOutRPM >= 0 ? "CW" : "CCW",
    mode: `${turning ? "turning" : "straight"} / ${diffLocked ? "locked" : "open"}`,
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

  const scale = 1.06;
  const gearboxX = -2.85;
  const finalX = 0.38;
  const diffX = 2.95;
  const yIn = 0.85;
  const yCounter = 0.18;
  const yOut = -0.58;
  const gearRatio = clamp(Number(paramsRef.current?.gearRatio) || 2.5, 0.5, 6);
  const rIn = 0.28;
  const rCounterIn = clamp(rIn * 1.45, 0.25, 0.7);
  const reduction1 = rIn / rCounterIn;
  const k = clamp(1 / (gearRatio * reduction1), 0.2, 4);
  const sumCO = 0.85;
  const rOut = clamp(sumCO / (1 + k), 0.2, 0.7);
  const rCounterOut = clamp(sumCO - rOut, 0.2, 0.95);
  const finalDriveRatio = clamp(Number(paramsRef.current?.finalDriveRatio) || 3.2, 1, 6);
  const rPinion = 0.2;
  const rRing = clamp(rPinion * finalDriveRatio, 0.65, 1.35);

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const out = computeOutputs(paramsRef.current);

    if (runningRef.current) {
      tRef.current += dt;
      const omegaIn = rpmToRadPerSec(out.inputRPM);
      const omegaCounter = -omegaIn * (rIn / rCounterIn);
      const omegaOut = (out.reverse ? 1 : -1) * omegaCounter * (rCounterOut / rOut);
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
      spinX(ringRef, r.thetaRing);
      spinX(axleLRef, r.thetaLeft);
      spinX(axleRRef, r.thetaRight);
      spinX(wheelLRef, r.thetaLeft);
      spinX(wheelRRef, r.thetaRight);

      if (gIdlerRef.current) {
        gIdlerRef.current.visible = out.reverse;
        spinX(gIdlerRef, r.thetaCounter * 0.9);
      }
      if (pinionRef.current) pinionRef.current.rotation.set(0, r.thetaPinion, 0);
      if (carrierRef.current) carrierRef.current.rotation.set(r.thetaCarrier, 0, 0);
      spinX(sideLRef, r.thetaLeft - r.thetaCarrier);
      spinX(sideRRef, r.thetaRight - r.thetaCarrier);
      if (spiderARef.current) spiderARef.current.rotation.set(r.thetaCarrier, r.thetaSpider, 0);
      if (spiderBRef.current) spiderBRef.current.rotation.set(r.thetaCarrier, -r.thetaSpider, 0);

      sampleAccRef.current += dt;
      const sampleEvery = 1 / chartCfg.sampleRate;
      if (sampleAccRef.current >= sampleEvery) {
        sampleAccRef.current = 0;
        pushCapped(
          samplesRef.current,
          {
            t: tRef.current,
            inputRPM: out.inputRPM,
            gearboxOutRPM: out.gearboxOutRPM,
            finalOutRPM: out.finalOutRPM,
            leftWheelRPM: out.leftWheelRPM,
            rightWheelRPM: out.rightWheelRPM,
          },
          chartCfg.maxPoints,
        );
      }
    }

    uiAccRef.current += dt;
    if (uiAccRef.current >= 1 / 12) {
      uiAccRef.current = 0;
      setHud({ t: tRef.current, ...out });
      setChartData([...samplesRef.current]);
    }
  });

  const current = computeOutputs(paramsRef.current);

  return (
    <>
      <hemisphereLight intensity={0.72} groundColor="#020617" />
      <directionalLight position={[7, 8, 6]} intensity={1.45} castShadow />
      <pointLight position={[-4, 3, 4]} intensity={0.65} color="#67e8f9" />
      <pointLight position={[4, 2.4, -3]} intensity={0.5} color="#a78bfa" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[18, 11]} />
        <meshStandardMaterial color="#050816" roughness={0.92} metalness={0.04} />
      </mesh>
      <gridHelper args={[14, 14, "#164e63", "#0f172a"]} position={[0, -1.18, 0]} />

      <group scale={scale} position={[0, 0.05, 0]}>
        <group position={[gearboxX, 0, 0]}>
          <GlassBox size={[4.9, 2.15, 2.2]} position={[0, 0.1, 0]} />
          <ModuleBase size={[4.5, 0.08, 1.9]} position={[0, -1.02, 0]} />
          <Shaft ref={inShaftRef} position={[0, yIn, 0]} length={4.25} radius={0.075} />
          <Shaft ref={counterShaftRef} position={[0, yCounter, 0]} length={4.25} radius={0.075} />
          <Shaft ref={outShaftRef} position={[0, yOut, 0]} length={4.25} radius={0.085} />
          <SpurGear ref={gInRef} position={[-1.1, yIn, 0]} radius={rIn} thickness={0.24} teeth={30} color="#b77946" />
          <SpurGear ref={gCounterInRef} position={[-1.1, yCounter, 0]} radius={rCounterIn} thickness={0.24} teeth={36} color="#38bdf8" />
          <SpurGear ref={gCounterOutRef} position={[1.05, yCounter, 0]} radius={rCounterOut} thickness={0.26} teeth={42} color="#38bdf8" />
          <SpurGear ref={gOutRef} position={[1.05, yOut, 0]} radius={rOut} thickness={0.26} teeth={28} color="#b77946" />
          <SpurGear ref={gIdlerRef} position={[1.05, (yCounter + yOut) / 2, 0]} radius={0.25} thickness={0.2} teeth={24} color="#cbd5e1" />
        </group>

        <group position={[finalX, 0, 0]}>
          <GlassBox size={[2.7, 2.0, 2.1]} position={[0.05, -0.03, 0]} />
          <ModuleBase size={[2.3, 0.08, 1.8]} position={[0.05, -1.02, 0]} />
          <Shaft position={[-1.25, yOut, 0]} length={1.75} radius={0.085} />
          <BevelPinion ref={pinionRef} position={[-0.45, yOut, 0]} radius={rPinion} length={0.52} color="#22c55e" />
          <SpurGear ref={ringRef} position={[-0.45, 0.28, 0]} radius={rRing} thickness={0.28} teeth={64} color="#60a5fa" />
        </group>

        <group position={[diffX, 0, 0]}>
          <GlassCylinder radius={1.0} height={1.28} position={[0, -0.04, 0]} />
          <ModuleBase size={[2.1, 0.08, 1.8]} position={[0, -1.02, 0]} />
          <group ref={carrierRef} position={[0, -0.04, 0]}>
            <SpurGear ref={sideLRef} position={[-0.48, 0, 0]} radius={0.34} thickness={0.19} teeth={26} color="#b77946" />
            <SpurGear ref={sideRRef} position={[0.48, 0, 0]} radius={0.34} thickness={0.19} teeth={26} color="#b77946" />
            <SpurGear ref={spiderARef} position={[0, 0.28, 0]} radius={0.22} thickness={0.15} teeth={18} color="#cbd5e1" />
            <SpurGear ref={spiderBRef} position={[0, -0.28, 0]} radius={0.22} thickness={0.15} teeth={18} color="#cbd5e1" />
          </group>
          <Shaft ref={axleLRef} position={[1.45, -0.04, 0]} length={2.45} radius={0.09} />
          <Shaft ref={axleRRef} position={[-1.45, -0.04, 0]} length={2.45} radius={0.09} />
          <Wheel ref={wheelLRef} position={[2.6, -0.04, 0]} radius={0.6} width={0.36} />
          <Wheel ref={wheelRRef} position={[-2.6, -0.04, 0]} radius={0.6} width={0.36} />
        </group>

        {paramsRef.current.showLabels && <SceneLabels out={current} />}
      </group>
    </>
  );
}

function spinX(ref, theta) {
  if (!ref?.current) return;
  ref.current.rotation.set(theta, 0, Math.PI / 2);
}

function SceneLabels({ out }) {
  const labels = [
    { position: [-2.85, 1.72, 0], title: "Gearbox", value: `${formatNumber(out.gearboxOutRPM, 1)} rpm` },
    { position: [0.38, 1.55, 0], title: "Final", value: `${formatNumber(out.finalOutRPM, 1)} rpm` },
    { position: [2.95, 1.42, 0], title: "Diff", value: out.mode },
  ];

  return labels.map((label) => (
    <Html key={label.title} position={label.position} center distanceFactor={8} occlude>
      <div
        style={{
          minWidth: 112,
          padding: "7px 9px",
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.28)",
          background: "rgba(2, 6, 23, 0.72)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          color: "#f8fafc",
          fontSize: 11,
          lineHeight: 1.25,
          pointerEvents: "none",
          backdropFilter: "blur(12px)",
        }}
      >
        <strong style={{ display: "block", color: "#67e8f9", marginBottom: 3 }}>{label.title}</strong>
        <span>{label.value}</span>
      </div>
    </Html>
  ));
}

function ModuleBase({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#111827" roughness={0.64} metalness={0.16} />
    </mesh>
  );
}

function GlassBox({ position = [0, 0, 0], size = [4, 2, 2] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color="#67e8f9"
        roughness={0.12}
        metalness={0}
        transparent
        opacity={0.12}
        clearcoat={1}
        clearcoatRoughness={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
      <Edges color="rgba(226,232,240,0.34)" threshold={15} />
    </mesh>
  );
}

function GlassCylinder({ position = [0, 0, 0], radius = 1, height = 1.4 }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, height, 48]} />
      <meshPhysicalMaterial
        color="#67e8f9"
        roughness={0.12}
        metalness={0}
        transparent
        opacity={0.13}
        clearcoat={1}
        clearcoatRoughness={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
      <Edges color="rgba(226,232,240,0.30)" threshold={15} />
    </mesh>
  );
}

const Shaft = React.forwardRef(function Shaft({ position, length, radius }, ref) {
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshStandardMaterial color="#dbeafe" roughness={0.2} metalness={0.78} envMapIntensity={1.25} />
    </mesh>
  );
});

const SpurGear = React.forwardRef(function SpurGear(
  { position, radius, thickness, teeth = 32, color = "#60a5fa" },
  ref,
) {
  return (
    <group ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius * 0.84, radius * 0.84, thickness, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.34}
          metalness={0.34}
          envMapIntensity={1.2}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[radius * 0.73, Math.max(0.014, radius * 0.032), 10, 64]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.24} metalness={0.52} envMapIntensity={1.15} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.08, 28]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.28} metalness={0.56} envMapIntensity={1.2} />
      </mesh>
      <mesh>
        <torusGeometry args={[radius * 0.29, Math.max(0.012, radius * 0.026), 8, 48]} />
        <meshStandardMaterial color="#bfdbfe" roughness={0.2} metalness={0.62} envMapIntensity={1.2} />
      </mesh>
      <TeethRing
        radius={radius}
        teeth={teeth}
        toothW={Math.max(0.026, radius * 0.082)}
        toothH={Math.max(0.05, radius * 0.12)}
        toothD={Math.max(0.06, thickness * 0.72)}
        color={color}
      />
    </group>
  );
});

function TeethRing({ radius, teeth, toothW, toothH, toothD, color }) {
  const instRef = useRef(null);
  const toothGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const innerHalf = toothW * 0.42;
    const outerHalf = toothW * 0.25;
    shape.moveTo(-innerHalf, -toothH * 0.48);
    shape.lineTo(innerHalf, -toothH * 0.48);
    shape.lineTo(outerHalf, toothH * 0.48);
    shape.lineTo(-outerHalf, toothH * 0.48);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: toothD,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: Math.min(toothW, toothH) * 0.08,
      bevelThickness: Math.min(toothW, toothH) * 0.08,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, [toothD, toothH, toothW]);

  useEffect(() => {
    if (!instRef.current) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    const zAxis = new THREE.Vector3(0, 0, 1);

    for (let index = 0; index < teeth; index += 1) {
      const angle = (index / teeth) * Math.PI * 2;
      position.set(Math.cos(angle) * radius * 0.905, Math.sin(angle) * radius * 0.905, 0);
      rotation.setFromAxisAngle(zAxis, angle);
      matrix.compose(position, rotation, scale);
      instRef.current.setMatrixAt(index, matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [radius, teeth]);

  return (
    <instancedMesh ref={instRef} args={[toothGeometry, null, teeth]}>
      <meshStandardMaterial color={color} roughness={0.44} metalness={0.18} envMapIntensity={1.1} />
    </instancedMesh>
  );
}

const BevelPinion = React.forwardRef(function BevelPinion(
  { position, radius = 0.2, length = 0.5, color = "#22c55e" },
  ref,
) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[radius, length, 28]} />
        <meshStandardMaterial
          color={color}
          roughness={0.34}
          metalness={0.34}
          envMapIntensity={1.2}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, length * 0.9, 18]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.28} metalness={0.56} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
});

const Wheel = React.forwardRef(function Wheel({ position, radius = 0.7, width = 0.4 }, ref) {
  return (
    <group ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, width, 48]} />
        <meshStandardMaterial color="#101827" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, width * 1.05, 32]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.38} metalness={0.24} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
});
