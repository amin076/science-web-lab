// src/components/features/circuits/Inductor3D.jsx
import React, { useMemo } from "react";

const CORE_STYLES = {
  Air: { fill: "transparent", stroke: "none" },
  Iron: { fill: "url(#ironGradient)", stroke: "#444" },
  Ferrite: { fill: "url(#ferriteGradient)", stroke: "#222" },
};

const Inductor3D = ({ turns, length, area, core }) => {
  // --- VISUAL SCALING ---
  // Length 0.01m - 0.2m  ->  Map to 100px - 400px
  const visualLen = Math.min(Math.max(length * 2000, 100), 400);

  // Area 0.0001 - 0.005 -> Radius 20px - 60px
  const realR = Math.sqrt(area / Math.PI);
  const visualR = Math.min(Math.max(realR * 3000, 20), 60);

  const startX = 250 - visualLen / 2;
  const turnSpacing = visualLen / turns;
  const centerY = 150;

  // Generate Coil Paths (Helix)
  const { backPath, frontPath } = useMemo(() => {
    let bPath = "";
    let fPath = "";

    for (let i = 0; i < turns; i++) {
      const x = startX + i * turnSpacing;

      // 1. Back Arc (Going behind the core)
      // Starts at bottom-left of turn, goes to top-right of turn
      bPath += `M ${x} ${centerY + visualR} 
                Q ${x + turnSpacing / 2} ${centerY - visualR} ${
        x + turnSpacing
      } ${centerY - visualR} `;

      // 2. Front Arc (Going in front of the core)
      // Starts at top-left of turn, goes to bottom-right of turn
      // We offset X slightly to create the spiral effect
      fPath += `M ${x} ${centerY - visualR} 
                Q ${x + turnSpacing / 2} ${centerY + visualR} ${
        x + turnSpacing
      } ${centerY + visualR} `;
    }
    return { backPath: bPath, frontPath: fPath };
  }, [turns, visualLen, visualR, startX, turnSpacing]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="500" height="300" viewBox="0 0 500 300">
        <defs>
          <linearGradient id="ironGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#444" />
            <stop offset="50%" stopColor="#777" />
            <stop offset="100%" stopColor="#444" />
          </linearGradient>
          <linearGradient id="ferriteGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#111" />
            <stop offset="50%" stopColor="#333" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Connection Wire */}
        <line
          x1={0}
          y1={centerY}
          x2={startX}
          y2={centerY}
          stroke="#eab308"
          strokeWidth="4"
        />

        {/* LAYER 1: Back Wires (Behind) */}
        <path
          d={backPath}
          stroke="#ca8a04"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* LAYER 2: Core */}
        {core !== "Air" && (
          <rect
            x={startX}
            y={centerY - visualR + 4}
            width={visualLen}
            height={visualR * 2 - 8}
            {...CORE_STYLES[core]}
            rx={4}
          />
        )}

        {/* LAYER 3: Front Wires (In Front) */}
        <path
          d={frontPath}
          stroke="#facc15"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Right Connection Wire */}
        <line
          x1={startX + visualLen}
          y1={centerY}
          x2={500}
          y2={centerY}
          stroke="#eab308"
          strokeWidth="4"
        />

        {/* Dimensions Text */}
        <text x={250} y={280} fill="#666" fontSize="12" textAnchor="middle">
          {turns} Turns
        </text>
      </svg>
    </div>
  );
};

export default Inductor3D;
