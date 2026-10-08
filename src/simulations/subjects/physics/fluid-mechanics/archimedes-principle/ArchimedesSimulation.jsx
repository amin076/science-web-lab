import React, { useState, useMemo, useRef } from "react";
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
import { readEmbeddedMcpParameters } from "@/platform/agent";

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
  const initialMcpRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "physics.fluid-mechanics.archimedes-principle",
      {
        objDensity: 600,
        fluidDensity: 1000,
        showForces: true,
        shape: SHAPES.box,
      },
    );
  }

  const initialMcp = initialMcpRef.current;
  const [objDensity, setObjDensity] = useState(initialMcp.values.objDensity);
  const [fluidDensity, setFluidDensity] = useState(initialMcp.values.fluidDensity);
  const [showForces, setShowForces] = useState(initialMcp.values.showForces);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [shape, setShape] = useState(initialMcp.values.shape);
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
    <div className="w-full h-full min-h-0 min-w-0 overflow-y-auto xl:overflow-hidden bg-slate-950 text-white p-2 sm:p-3">
      <div className="flex min-h-full min-w-0 flex-col gap-3 xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[minmax(250px,300px)_minmax(0,1fr)_minmax(280px,340px)] xl:grid-rows-[minmax(0,1fr)]">
      <style>{scrollbarStyle}</style>


      {/* Analysis is below the stage on compact devices and beside it on desktops. */}
      <div className="order-2 xl:order-none xl:col-start-1 xl:row-start-1 w-full min-w-0 xl:min-h-0 flex flex-col">
        <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-lg text-white font-sans min-w-0 xl:min-h-0 flex flex-col">
          {/* SCROLLABLE CONTENT AREA */}
          <div className="p-3 sm:p-4 xl:overflow-y-auto custom-scroll min-w-0">
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

      {/* Full-width, unobstructed 3D stage on narrow MCP App viewports. */}
      <div data-esbiko-archimedes-stage className="order-first xl:order-none xl:col-start-2 xl:row-start-1 relative w-full min-w-0 shrink-0 h-[min(60dvh,560px)] min-h-[320px] xl:h-full xl:min-h-0 xl:shrink overflow-hidden rounded-2xl border border-white/10 bg-slate-200">
        <Canvas
          shadows
          camera={{ position: [23, 14, 27], fov: 48 }}
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

      {/* Controls always follow the stage and analysis in narrow viewports. */}
      <div className="order-3 xl:order-none xl:col-start-3 xl:row-start-1 min-w-0 xl:min-h-0 xl:overflow-y-auto">
      {initialMcp.embeddedMcpApp && (
        <div className="mb-3 rounded-lg border border-cyan-400/30 bg-slate-950 px-3 py-2 text-xs text-cyan-200 break-words">
          MCP configured · object={objDensity}kg/m³ · fluid={fluidDensity}kg/m³ · shape={shape}
        </div>
      )}
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
      </div>
    </div>
  );
}
