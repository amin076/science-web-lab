import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, Text } from "@react-three/drei";
import * as THREE from "three";

// Import Shared Components
import OpticalControls from "./OpticalControls";
import OpticalResults from "./OpticalResults";
import { calculateOpticalElement } from "./OpticalPhysics";

// Import 3D Specific Components
import OpticalElements3D from "./OpticalElements3D";
import OpticalRays3D from "./OpticalRays3D";

const SCALE = 0.015;

// --- 3D OBJECTS (Reused from previous fix) ---
const ArrowObject = ({
  position,
  height,
  color,
  opacity = 1,
  label,
  inverted = false,
}) => {
  const h = Math.abs(height) * SCALE;
  const dir = inverted ? -1 : 1;
  const labelY = inverted ? -h - 0.5 : h + 0.5;

  return (
    <group position={position}>
      <Text
        position={[0, labelY, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
      <mesh position={[0, (h / 2) * dir, 0]}>
        <cylinderGeometry args={[0.05, 0.05, h, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh
        position={[0, h * dir, 0]}
        rotation={[inverted ? Math.PI : 0, 0, 0]}
      >
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color={color} opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

const TreeObject = ({
  position,
  height,
  color,
  opacity = 1,
  label,
  inverted = false,
}) => {
  const h = Math.abs(height) * SCALE;
  const scaleY = inverted ? -1 : 1;
  const labelY = inverted ? -h - 0.5 : h + 0.5;

  return (
    <group position={position}>
      <Text
        position={[0, labelY, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
      <group scale={[h / 3, (h / 3) * scaleY, h / 3]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 1, 8]} />
          <meshStandardMaterial color="#5D4037" transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[1, 1.5, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 2.0, 0]}>
          <coneGeometry args={[0.8, 1.2, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <coneGeometry args={[0.5, 1.0, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      </group>
    </group>
  );
};

function FocalMarker({ x, label }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.2} color="#fbbf24">
        {label}
      </Text>
    </group>
  );
}

export default function OpticalSimulator3D() {
  // Shared State
  const [lensType, setLensType] = useState("convex-lens");
  const [objDistance, setObjDistance] = useState(250);
  const [focalLength, setFocalLength] = useState(120);
  const [objHeight, setObjHeight] = useState(60);
  const [objType, setObjType] = useState("tree");
  const [objSide, setObjSide] = useState("left");

  // Physics Calc
  const results = useMemo(
    () =>
      calculateOpticalElement(lensType, focalLength, objDistance, objHeight),
    [lensType, focalLength, objDistance, objHeight]
  );

  const dir = objSide === "left" ? -1 : 1;
  const isMirror = lensType.includes("mirror");
  const objX = results.do * dir * SCALE;

  let imgX = 0;
  if (isMirror) {
    const side = results.isReal ? 1 : -1;
    imgX = Math.abs(results.di) * dir * side * SCALE;
  } else {
    const side = results.isReal ? -1 : 1;
    imgX = Math.abs(results.di) * dir * side * SCALE;
  }

  const fX = focalLength * SCALE;

  return (
    <div className="relative w-full h-full bg-[#050510] overflow-hidden font-sans">
      {/* 1. Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>

      {/* 2. 3D Canvas (Full Screen Background) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 12], fov: 45 }} shadows>
          <color attach="background" args={["#080b14"]} />
          <OrbitControls makeDefault maxPolarAngle={Math.PI / 1.8} />

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <Environment preset="city" />

          <group position={[0, 0, 0]}>
            <Grid
              position={[0, -1, 0]}
              infiniteGrid
              fadeDistance={40}
              sectionColor="#333"
              cellColor="#111"
            />

            {/* Optical Axis */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 50, 8]} />
              <meshBasicMaterial color="gray" opacity={0.3} transparent />
            </mesh>

            <FocalMarker x={-fX} label="F" />
            <FocalMarker x={fX} label="F'" />
            <FocalMarker x={-fX * 2} label="2F" />
            <FocalMarker x={fX * 2} label="2F'" />

            <OpticalElements3D
              type={lensType}
              focalLength={focalLength}
              objSide={objSide}
            />

            <OpticalRays3D
              type={lensType}
              focalLength={focalLength}
              objDistance={objDistance}
              objHeight={objHeight}
              objSide={objSide}
              scale={SCALE}
            />

            {/* Object */}
            {objType === "tree" ? (
              <TreeObject
                position={[objX, 0, 0]}
                height={objHeight}
                color="#22d3ee"
                label="OBJECT"
              />
            ) : (
              <ArrowObject
                position={[objX, 0, 0]}
                height={objHeight}
                color="#22d3ee"
                label="OBJECT"
              />
            )}

            {/* Image */}
            {objType === "tree" ? (
              <TreeObject
                position={[imgX, 0, 0]}
                height={Math.abs(results.hi)}
                color="#fbbf24"
                label="IMAGE"
                opacity={results.isReal ? 0.9 : 0.5}
                inverted={results.m < 0}
              />
            ) : (
              <ArrowObject
                position={[imgX, 0, 0]}
                height={Math.abs(results.hi)}
                color="#fbbf24"
                label="IMAGE"
                opacity={results.isReal ? 0.9 : 0.5}
                inverted={results.m < 0}
              />
            )}
          </group>
        </Canvas>
      </div>

      {/* 3. Floating HUD Panel (Glassmorphism) */}
      <div className="absolute top-4 left-4 z-10 w-[350px] flex flex-col max-h-[calc(100vh-32px)] pointer-events-none">
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden pointer-events-auto backdrop-blur-md">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent shrink-0">
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-md">
              Optics Lab
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                3D SIM
              </span>
            </h1>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-5 pr-2 custom-scrollbar">
            <OpticalControls
              lensType={lensType}
              setLensType={setLensType}
              objDistance={objDistance}
              setObjDistance={setObjDistance}
              focalLength={focalLength}
              setFocalLength={setFocalLength}
              objHeight={objHeight}
              setObjHeight={setObjHeight}
              objType={objType}
              setObjType={setObjType}
              objSide={objSide}
              setObjSide={setObjSide}
              onReset={() => {
                setLensType("convex-lens");
                setObjDistance(250);
                setFocalLength(120);
                setObjHeight(60);
                setObjSide("left");
              }}
            />

            {/* Results Analysis */}
            <OpticalResults
              type={lensType}
              focalLength={focalLength}
              objDistance={objDistance}
              objHeight={objHeight}
            />
          </div>
        </div>
      </div>

      {/* 4. Canvas Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white/50 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border border-white/5 pointer-events-none">
        Drag to Rotate • Scroll to Zoom
      </div>
    </div>
  );
}
