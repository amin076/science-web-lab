// src/components/features/circuits/Resistor3D.jsx
import React from "react";

const MATERIAL_COLORS = {
  Copper: { main: "#b45309", light: "#fbbf24", dark: "#78350f" }, // Orange/Gold
  Aluminum: { main: "#9ca3af", light: "#e5e7eb", dark: "#4b5563" }, // Silver
  Carbon: { main: "#374151", light: "#6b7280", dark: "#1f2937" }, // Dark Gray
  Nichrome: { main: "#94a3b8", light: "#cbd5e1", dark: "#64748b" }, // Blueish Gray
};

const Resistor3D = ({ length, area, material }) => {
  // --- SCALING LOGIC ---
  // Real length is 0.01m - 0.1m. We want 100px - 400px.
  // Multiplier: 3500
  const visualL = Math.min(Math.max(length * 3500, 100), 400);

  // Real Area is 1e-7 - 1e-5. Radius is sqrt(A/PI).
  // Visual Radius needs to be 15px - 50px.
  const realRadius = Math.sqrt(area / Math.PI);
  const visualR = Math.min(Math.max(realRadius * 25000, 15), 60);

  const mat = MATERIAL_COLORS[material] || MATERIAL_COLORS.Carbon;
  const cx = 250; // Center X of SVG
  const cy = 150; // Center Y of SVG

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="500" height="300" viewBox="0 0 500 300">
        <defs>
          {/* Cylinder Gradient */}
          <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={mat.dark} />
            <stop offset="40%" stopColor={mat.light} />
            <stop offset="60%" stopColor={mat.main} />
            <stop offset="100%" stopColor={mat.dark} />
          </linearGradient>

          {/* Side Face Gradient */}
          <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={mat.light} />
            <stop offset="100%" stopColor={mat.dark} />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${cx}, ${cy})`}>
          {/* Connection Wire Left */}
          <line
            x1={-250}
            y1={0}
            x2={-visualL / 2}
            y2={0}
            stroke="#aaa"
            strokeWidth="4"
          />

          {/* Cylinder Body */}
          <rect
            x={-visualL / 2}
            y={-visualR}
            width={visualL}
            height={visualR * 2}
            fill="url(#cylinderGrad)"
            stroke={mat.dark}
            strokeWidth="1"
          />

          {/* Left Face (Back) */}
          <ellipse
            cx={-visualL / 2}
            cy={0}
            rx={visualR / 4}
            ry={visualR}
            fill={mat.dark}
          />

          {/* Right Face (Front) */}
          <ellipse
            cx={visualL / 2}
            cy={0}
            rx={visualR / 4}
            ry={visualR}
            fill="url(#faceGrad)"
            stroke={mat.dark}
            strokeWidth="1"
          />

          {/* Connection Wire Right */}
          <line
            x1={visualL / 2}
            y1={0}
            x2={250}
            y2={0}
            stroke="#aaa"
            strokeWidth="4"
          />

          {/* Dimensions Annotations */}
          <g opacity="0.6">
            <line
              x1={-visualL / 2}
              y1={visualR + 30}
              x2={visualL / 2}
              y2={visualR + 30}
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1={-visualL / 2}
              y1={visualR + 25}
              x2={-visualL / 2}
              y2={visualR + 35}
              stroke="white"
            />
            <line
              x1={visualL / 2}
              y1={visualR + 25}
              x2={visualL / 2}
              y2={visualR + 35}
              stroke="white"
            />

            <text
              x={0}
              y={visualR + 50}
              fill="white"
              fontSize="12"
              textAnchor="middle"
            >
              L = {length}m
            </text>
            <text
              x={visualL / 2 + 10}
              y={-visualR - 10}
              fill="white"
              fontSize="12"
            >
              A = {area.toExponential(1)} m²
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Resistor3D;
