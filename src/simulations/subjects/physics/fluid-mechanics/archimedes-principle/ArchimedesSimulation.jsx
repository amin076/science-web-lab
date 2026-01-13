import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Cylinder } from "@react-three/drei";
import CalculateIcon from "@mui/icons-material/Calculate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import Environment from "./Environment";
import WaterTank from "./WaterTank";
import Controls from "./Controls";
import { usePhysics } from "./usePhysics";
import { getShapeData, SHAPES } from "./Shapes";
import ObjectWithWaterCut from "./ObjectWithWaterCut";
import MathExplanation from "./MathExplanation";
import Ruler from "./Ruler";
import { BLOCK_SIDE } from "./constants";

// --- CUSTOM SCROLLBAR CSS ---
const scrollbarStyle = `
  .custom-scroll::-webkit-scrollbar { width: 4px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
`;

// --- ARROW COMPONENT ---
const Arrow = ({ dir, len, color, label, offset = 0 }) => {
  if (len < 0.1) return null;
  return (
    <group position={[0, offset * dir, 0]}>
      <Cylinder args={[0.08, 0.08, len, 8]} position={[0, (len / 2) * dir, 0]}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </Cylinder>
      <mesh
        position={[0, len * dir, 0]}
        rotation={[dir === -1 ? Math.PI : 0, 0, 0]}
      >
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- SCENE ---
const SimulationScene = ({
  objDensity,
  fluidDensity,
  showForces,
  isPlaying,
  resetKey,
  hudData,
  setHudData,
  shape,
}) => {
  const shapeData = useMemo(() => getShapeData(shape, BLOCK_SIDE), [shape]);
  const { blockRef } = usePhysics(
    objDensity,
    fluidDensity,
    shapeData,
    isPlaying,
    resetKey,
    setHudData
  );
  const blockColor =
    objDensity < fluidDensity
      ? "#fbbf24"
      : objDensity > fluidDensity
      ? "#ef4444"
      : "#9ca3af";
  const weightLen = Math.min((hudData.weight || 0) / 10000, 5);
  const buoyLen = Math.min((hudData.buoyantForce || 0) / 10000, 5);

  return (
    <>
      <Environment />
      <WaterTank blockRef={blockRef} />
      <Ruler />
      <ObjectWithWaterCut
        ref={blockRef}
        shapeData={shapeData}
        color={blockColor}
        underwaterColor="#1e40af"
      />
      {showForces && (
        <group position={[0, blockRef.current?.position.y || 8, 0]}>
          <Arrow dir={-1} len={weightLen} color="#ef4444" label="Mg" />
          <Arrow
            dir={1}
            len={buoyLen}
            color="#3b82f6"
            label="Fb"
            offset={shapeData.height / 2 + 0.1}
          />
        </group>
      )}
      <OrbitControls
        target={[0, -2, 0]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={15}
        maxDistance={50}
      />
    </>
  );
};

// --- MAIN PAGE ---
export default function ArchimedesSimulation() {
  const [objDensity, setObjDensity] = useState(600);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [showForces, setShowForces] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [shape, setShape] = useState(SHAPES.box);
  const [showMath, setShowMath] = useState(false); // Math state inside HUD

  const [hudData, setHudData] = useState({
    buoyantForce: 0,
    weight: 0,
    submergedPct: 0,
    heightIn: 0,
    heightOut: 0,
    volIn: 0,
    volOut: 0,
    isSinking: false,
  });

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-200 to-gray-400 overflow-hidden flex flex-col">
      <style>{scrollbarStyle}</style>

      {/* 1. HUD OVERLAY (Left Side - Fixed Width, Dynamic Height) */}
      <div className="absolute top-4 left-4 z-10 w-80 max-h-[90vh] flex flex-col pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white font-sans overflow-hidden flex flex-col">
          {/* SCROLLABLE CONTENT AREA */}
          <div className="p-5 overflow-y-auto custom-scroll">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    hudData.isSinking
                      ? "bg-red-500 shadow-[0_0_10px_red]"
                      : "bg-green-400 shadow-[0_0_10px_#4ade80]"
                  }`}
                ></div>
                <h3 className="text-sm font-bold tracking-widest text-blue-100 uppercase">
                  Analysis
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">v3.1</span>
            </div>

            <div className="space-y-4">
              {/* DISPLACEMENT */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg">
                  <div className="text-[9px] text-blue-200 uppercase">
                    Depth
                  </div>
                  <div className="text-lg font-mono font-bold text-blue-400 leading-tight">
                    {hudData.heightIn?.toFixed(2)}m
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg">
                  <div className="text-[9px] text-yellow-200 uppercase">
                    Exposed
                  </div>
                  <div className="text-lg font-mono font-bold text-yellow-400 leading-tight">
                    {hudData.heightOut?.toFixed(2)}m
                  </div>
                </div>
              </div>

              {/* VOLUME */}
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-blue-300">
                  <span className="text-[10px]">Volume In</span>
                  <span className="text-xs font-mono font-bold">
                    {hudData.volIn?.toFixed(3)} m³
                  </span>
                </div>
                <div className="flex justify-between items-center text-yellow-300">
                  <span className="text-[10px]">Volume Out</span>
                  <span className="text-xs font-mono font-bold">
                    {hudData.volOut?.toFixed(3)} m³
                  </span>
                </div>
              </div>

              {/* SUBMERGED BAR */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 text-gray-400 uppercase">
                  <span>Submerged</span>
                  <span
                    className={
                      hudData.submergedPct === 100
                        ? "text-red-400"
                        : "text-blue-400"
                    }
                  >
                    {hudData.submergedPct}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${hudData.submergedPct}%` }}
                  ></div>
                </div>
              </div>

              {/* FORCE BALANCE */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">
                    Weight
                  </div>
                  <div className="text-red-400 font-mono font-bold text-md">
                    {hudData.weight?.toFixed(0)} N
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 uppercase">
                    Buoyancy
                  </div>
                  <div className="text-blue-400 font-mono font-bold text-md">
                    {hudData.buoyantForce?.toFixed(0)} N
                  </div>
                </div>
              </div>

              {/* TOGGLE MATH BUTTON */}
              <button
                onClick={() => setShowMath(!showMath)}
                className="w-full mt-2 py-2 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded transition-colors text-blue-200"
              >
                {showMath ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
                {showMath ? "Hide Calculation" : "Show Calculation"}
              </button>

              {/* EXPANDABLE MATH SECTION */}
              {showMath && <MathExplanation shape={shape} hudData={hudData} />}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3D CANVAS */}
      <div className="flex-grow">
        <Canvas
          shadows
          camera={{ position: [25, 15, 30], fov: 40 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            localClippingEnabled: true,
          }}
        >
          <SimulationScene
            objDensity={objDensity}
            fluidDensity={fluidDensity}
            showForces={showForces}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            resetKey={resetKey}
            hudData={hudData}
            setHudData={setHudData}
            shape={shape}
          />
        </Canvas>
      </div>

      {/* 3. CONTROLS */}
      <Controls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleReset}
        objDensity={objDensity}
        setObjDensity={setObjDensity}
        fluidDensity={fluidDensity}
        setFluidDensity={setFluidDensity}
        showForces={showForces}
        setShowForces={setShowForces}
        isSinking={objDensity > fluidDensity}
        shape={shape}
        setShape={setShape}
      />
    </div>
  );
}
