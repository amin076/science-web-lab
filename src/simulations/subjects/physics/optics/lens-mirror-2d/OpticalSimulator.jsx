// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalSimulator.jsx
import React, { useState } from "react";
import OpticalControls from "./OpticalControls";
import OpticalResults from "./OpticalResults";
import OpticalRayDiagram from "./OpticalRayDiagram";

export default function OpticalSimulator() {
  // Default to "convex-lens" to show off the standard case first
  const [lensType, setLensType] = useState("convex-lens");
  const [objDistance, setObjDistance] = useState(250);
  const [focalLength, setFocalLength] = useState(120);
  const [objHeight, setObjHeight] = useState(60);
  const [objType, setObjType] = useState("tree");
  const [objSide, setObjSide] = useState("left");

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden font-sans">
      {/* 1. Ultra-Minimal Scrollbar CSS */}
      <style>{`
        /* Width */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        /* Track (Background) - Completely Invisible */
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        /* Handle (Thumb) - Semi-transparent glass pill */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px;
        }
        /* Handle on Hover */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); 
        }
      `}</style>

      {/* 2. Main Canvas */}
      <div className="absolute inset-0 z-0">
        <OpticalRayDiagram
          type={lensType}
          focalLength={focalLength}
          objDistance={objDistance}
          objHeight={objHeight}
          objType={objType}
          objSide={objSide}
        />
      </div>

      {/* 3. Floating HUD Panel */}
      <div className="absolute top-4 left-4 z-10 w-[350px] flex flex-col max-h-[calc(100vh-32px)] pointer-events-none">
        {/* Panel Container */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden pointer-events-auto transition-all">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent shrink-0">
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-md">
              Optics Lab
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                2D SIM
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
            <OpticalResults
              type={lensType}
              focalLength={focalLength}
              objDistance={objDistance}
              objHeight={objHeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
