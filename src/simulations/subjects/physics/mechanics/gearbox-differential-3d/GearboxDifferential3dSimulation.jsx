import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { useFrame, useLoader } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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
      subtitle="Separate gearbox and differential modules - ratios, direction, and open differential split"
      simulationType="3d"
      domain="physics"
      viewportLabel="Gearbox and differential 3D simulation"
      viewport={
        <SimulationThreeViewport
          quality="high"
          background="#030712"
          showDefaultLights={false}
          showStars={false}
          camera={{ position: [7.2, 3.3, 9.4], fov: 39, near: 0.05, far: 100 }}
          controls={{
            target: [0.85, -0.22, 0],
            minDistance: 5.4,
            maxDistance: 24,
            enablePan: true,
            panSpeed: 0.85,
            screenSpacePanning: true,
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
        width: { xs: 300, sm: "auto" },
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
  const diffPinionRef = useRef(null);
  const diffRingRef = useRef(null);
  const sideLRef = useRef(null);
  const sideRRef = useRef(null);
  const spiderARef = useRef(null);
  const spiderBRef = useRef(null);
  const spiderShaftRef = useRef(null);
  const axleLRef = useRef(null);
  const axleRRef = useRef(null);
  const wheelLRef = useRef(null);
  const wheelRRef = useRef(null);

  const scale = 0.76;
  const gearboxX = -4.7;
  const finalX = 0.35;
  const diffX = 5.95;
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
      spinX(pinionRef, r.thetaPinion);
      if (carrierRef.current) carrierRef.current.rotation.set(r.thetaCarrier, 0, 0);
      spinZ(diffPinionRef, r.thetaPinion);
      spinX(diffRingRef, r.thetaCarrier);
      spinX(sideLRef, r.thetaLeft - r.thetaCarrier);
      spinX(sideRRef, r.thetaRight - r.thetaCarrier);
      spinY(spiderARef, r.thetaSpider);
      spinY(spiderBRef, -r.thetaSpider);

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
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial color="#050816" roughness={0.92} metalness={0.04} />
      </mesh>
      <gridHelper args={[18, 18, "#164e63", "#0f172a"]} position={[0, -1.18, 0]} />

      <group scale={scale} position={[0, 0.05, 0]}>
        <group position={[gearboxX, 0, 0]}>
          <ModuleBase size={[4.55, 0.08, 1.92]} position={[0, -1.02, 0]} />
          <Shaft ref={inShaftRef} position={[0, yIn, 0]} length={4.25} radius={0.075} />
          <Shaft ref={counterShaftRef} position={[0, yCounter, 0]} length={4.25} radius={0.075} />
          <Shaft ref={outShaftRef} position={[0, yOut, 0]} length={4.25} radius={0.085} />
          <SpurGear ref={gInRef} position={[-1.2, yIn, 0]} radius={rIn} thickness={0.3} teeth={30} color="#c9d2dc" helixSkew={0.46} />
          <SpurGear ref={gCounterInRef} position={[-1.2, yCounter, 0]} radius={rCounterIn} thickness={0.32} teeth={38} color="#8fa3b2" helixSkew={-0.46} />
          <SpurGear ref={gCounterOutRef} position={[1.08, yCounter, 0]} radius={rCounterOut} thickness={0.34} teeth={44} color="#8fa3b2" helixSkew={0.46} />
          <SpurGear ref={gOutRef} position={[1.08, yOut, 0]} radius={rOut} thickness={0.34} teeth={30} color="#c9d2dc" helixSkew={-0.46} />
          <SpurGear ref={gIdlerRef} position={[1.08, (yCounter + yOut) / 2, 0]} radius={0.25} thickness={0.24} teeth={24} color="#e5e7eb" helixSkew={0.3} />
        </group>

        <group position={[finalX, 0, 0]}>
          <ModuleBase size={[2.25, 0.08, 1.78]} position={[0.05, -1.02, 0]} />
          <Shaft position={[-1.1, yOut, 0]} length={1.55} radius={0.085} />
          <CompactGear ref={pinionRef} position={[-0.38, yOut, 0]} radius={rPinion} thickness={0.24} teeth={22} color="#d7dde3" />
          <SpurGear ref={ringRef} position={[-0.38, 0.28, 0]} radius={rRing} thickness={0.34} teeth={72} color="#aeb8c3" helixSkew={0.56} />
        </group>

        <group position={[diffX, 0, 0]}>
          <ModuleBase size={[1.92, 0.08, 1.5]} position={[0, -1.02, 0.02]} />
          <ShaftZ position={[0, -0.04, 1.08]} length={1.18} radius={0.055} />
          <DifferentialStlPart
            ref={diffPinionRef}
            file="engineering-mindset-drive-pinion.stl"
            axis="z"
            position={[0, -0.04, 0.48]}
            scale={0.0084}
            color="#f8fafc"
          />
          <DifferentialStlPart
            ref={diffRingRef}
            file="engineering-mindset-ring-gear.stl"
            axis="x"
            position={[0, -0.04, 0.04]}
            scale={0.0092}
            color="#aeb8c3"
          />
          <group ref={carrierRef} position={[0, -0.04, 0.04]}>
            <DifferentialCarrierFrame />
            <ShaftY ref={spiderShaftRef} position={[0, 0, 0]} length={0.56} radius={0.024} />
            <DifferentialBevelGear
              ref={sideLRef}
              axis="x"
              position={[-0.2, 0, 0]}
              radius={0.18}
              length={0.2}
              color="#c9d2dc"
            />
            <DifferentialBevelGear
              ref={sideRRef}
              axis="x"
              position={[0.2, 0, 0]}
              radius={0.18}
              length={0.2}
              color="#c9d2dc"
              flip
            />
            <DifferentialBevelGear
              ref={spiderARef}
              axis="y"
              position={[0, 0.18, 0]}
              radius={0.145}
              length={0.17}
              color="#e5e7eb"
            />
            <DifferentialBevelGear
              ref={spiderBRef}
              axis="y"
              position={[0, -0.18, 0]}
              radius={0.145}
              length={0.17}
              color="#e5e7eb"
              flip
            />
          </group>
          <Shaft ref={axleLRef} position={[1.22, -0.04, 0.04]} length={1.82} radius={0.065} />
          <Shaft ref={axleRRef} position={[-1.22, -0.04, 0.04]} length={1.82} radius={0.065} />
          <Wheel ref={wheelLRef} position={[2.16, -0.04, 0.04]} radius={0.52} width={0.3} />
          <Wheel ref={wheelRRef} position={[-2.16, -0.04, 0.04]} radius={0.52} width={0.3} />
        </group>

        {paramsRef.current.showLabels && <SceneLabels out={current} />}
      </group>
    </>
  );
}

function spinX(ref, theta) {
  if (!ref?.current) return;
  ref.current.rotation.x = theta;
}

function spinY(ref, theta) {
  if (!ref?.current) return;
  ref.current.rotation.y = theta;
}

function spinZ(ref, theta) {
  if (!ref?.current) return;
  ref.current.rotation.z = theta;
}

function SceneLabels({ out }) {
  const labels = [
    { position: [-4.7, 1.92, 0], title: "Gearbox out", value: `${formatNumber(out.gearboxOutRPM, 1)} rpm` },
    { position: [0.7, 1.72, 0], title: "Final output", value: `${formatNumber(out.finalOutRPM, 1)} rpm` },
    { position: [5.1, 1.65, 0], title: "Differential mode", value: out.mode },
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

const Shaft = React.forwardRef(function Shaft({ position, length, radius }, ref) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, length, 32]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.2} metalness={0.78} envMapIntensity={1.25} />
      </mesh>
    </group>
  );
});

const ShaftY = React.forwardRef(function ShaftY({ position, length, radius }, ref) {
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 24]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.22} metalness={0.74} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
});

function ShaftZ({ position, length, radius }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, length, 28]} />
      <meshStandardMaterial color="#dbeafe" roughness={0.22} metalness={0.74} envMapIntensity={1.2} />
    </mesh>
  );
}

function axisRotation(axis, flip = false) {
  if (axis === "y") return [0, 0, Math.PI / 2 + (flip ? Math.PI : 0)];
  if (axis === "z") return [0, -Math.PI / 2 + (flip ? Math.PI : 0), 0];
  return [0, flip ? Math.PI : 0, 0];
}

const DifferentialStlPart = React.forwardRef(function DifferentialStlPart(
  { file, axis = "x", position, scale = 0.01, color = "#e5e7eb", flip = false },
  ref,
) {
  const sourceGeometry = useLoader(STLLoader, `/models/differential/${file}`);
  const geometry = useMemo(() => {
    const nextGeometry = sourceGeometry.clone();
    nextGeometry.center();
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, [sourceGeometry]);

  return (
    <group ref={ref} position={position}>
      <group rotation={axisRotation(axis, flip)} scale={scale}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={color}
            roughness={0.28}
            metalness={0.58}
            envMapIntensity={1.24}
            emissive={new THREE.Color(color)}
            emissiveIntensity={0.018}
          />
        </mesh>
      </group>
    </group>
  );
});

function DifferentialCarrierFrame() {
  return (
    <group>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.34, 0.018, 8, 48]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.24} metalness={0.58} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.56, 0.035, 0.055]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.54} />
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <boxGeometry args={[0.56, 0.035, 0.055]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.54} />
      </mesh>
    </group>
  );
}

const DifferentialBevelGear = React.forwardRef(function DifferentialBevelGear(
  { axis = "x", position, radius = 0.18, length = 0.2, color = "#e5e7eb", flip = false },
  ref,
) {
  return (
    <group ref={ref} position={position} rotation={axisRotation(axis, flip)}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.66, radius * 0.66, length * 0.72, 40]} />
        <meshStandardMaterial
          color={color}
          roughness={0.26}
          metalness={0.62}
          envMapIntensity={1.18}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.012}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.24, radius * 0.24, length * 1.24, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.22} metalness={0.62} envMapIntensity={1.15} />
      </mesh>
      <TeethRing
        radius={radius * 0.92}
        teeth={18}
        toothW={Math.max(0.015, radius * 0.09)}
        toothH={Math.max(0.03, radius * 0.16)}
        toothD={Math.max(0.035, length * 0.34)}
        color={color}
        helixSkew={0.12}
      />
    </group>
  );
});

const CompactGear = React.forwardRef(function CompactGear(
  { position, radius = 0.22, thickness = 0.22, teeth = 24, color = "#e5e7eb" },
  ref,
) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.68, radius * 0.68, thickness, 40]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.52} envMapIntensity={1.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.1, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.24} metalness={0.62} envMapIntensity={1.12} />
      </mesh>
      <TeethRing
        radius={radius}
        teeth={teeth}
        toothW={Math.max(0.018, radius * 0.09)}
        toothH={Math.max(0.036, radius * 0.16)}
        toothD={Math.max(0.04, thickness * 0.45)}
        color={color}
        helixSkew={0.18}
      />
    </group>
  );
});

const SpurGear = React.forwardRef(function SpurGear(
  { position, radius, thickness, teeth = 32, color = "#60a5fa", helixSkew = 0 },
  ref,
) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
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
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.73, Math.max(0.014, radius * 0.032), 10, 64]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.24} metalness={0.52} envMapIntensity={1.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.08, 28]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.28} metalness={0.56} envMapIntensity={1.2} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
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
        helixSkew={helixSkew}
      />
    </group>
  );
});

function TeethRing({ radius, teeth, toothW, toothH, toothD, color, helixSkew = 0 }) {
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
    geometry.rotateY(Math.PI / 2);
    geometry.center();
    if (helixSkew) {
      const positions = geometry.attributes.position;
      for (let index = 0; index < positions.count; index += 1) {
        positions.setZ(index, positions.getZ(index) + positions.getX(index) * helixSkew);
      }
      positions.needsUpdate = true;
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [helixSkew, toothD, toothH, toothW]);

  useEffect(() => {
    if (!instRef.current) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    const xAxis = new THREE.Vector3(1, 0, 0);

    for (let index = 0; index < teeth; index += 1) {
      const angle = (index / teeth) * Math.PI * 2;
      position.set(0, Math.cos(angle) * radius * 0.905, Math.sin(angle) * radius * 0.905);
      rotation.setFromAxisAngle(xAxis, angle);
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

const Wheel = React.forwardRef(function Wheel({ position, radius = 0.7, width = 0.4 }, ref) {
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, width, 48]} />
        <meshStandardMaterial color="#101827" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, width * 1.05, 32]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.38} metalness={0.24} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
});
