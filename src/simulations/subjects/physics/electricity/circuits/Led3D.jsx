// src/components/features/circuits/Led3D.jsx
import React from "react";

const Led3D = ({ color, voltage, threshold, opacity = 0.9 }) => {
  // Calculate Glow Intensity based on voltage vs threshold
  // If Voltage < Threshold, intensity is 0.
  const intensity = Math.max(0, Math.min((voltage - threshold) * 0.8, 1));

  // Dynamic glow filter
  const glowColor = color;
  const lightOpacity = 0.3 + intensity * 0.7; // Base opacity + glow

  const cx = 250;
  const cy = 150;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="400" height="400" viewBox="0 0 500 500">
        <defs>
          {/* Plastic Body Gradient */}
          <radialGradient id="bulbGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.9} />
          </radialGradient>

          {/* Metal Parts Gradient */}
          <linearGradient id="metalGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#999" />
            <stop offset="50%" stopColor="#fff" />
            <stop offset="100%" stopColor="#777" />
          </linearGradient>

          {/* Active Glow Filter */}
          <filter id="lightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              stdDeviation={10 * intensity}
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${cx}, ${cy})`}>
          {/* --- LEGS --- */}
          {/* Cathode (Short Leg) */}
          <rect x={15} y={140} width={10} height={160} fill="url(#metalGrad)" />
          {/* Anode (Long Leg) */}
          <rect
            x={-25}
            y={140}
            width={10}
            height={200}
            fill="url(#metalGrad)"
          />
          {/* --- INTERNAL STRUCTURE (Anvil & Post) --- */}
          {/* Anode Post (Thin) */}
          <rect x={-22} y={50} width={4} height={100} fill="#888" />
          {/* Cathode Anvil (Cup holding the chip) */}
          <path
            d="M 10 140 L 30 140 L 25 80 L 40 50 L 0 50 L 15 80 Z"
            fill="#888"
          />
          {/* The Semiconductor Chip (The Source of Light) */}
          <rect x={18} y={55} width={4} height={4} fill="#333" />
          <line
            x1={-20}
            y1={55}
            x2={18}
            y2={55}
            stroke="gold"
            strokeWidth="1"
          />{" "}
          {/* Gold Wire */}
          {/* --- GLOW EFFECT (Behind the bulb) --- */}
          {intensity > 0.1 && (
            <circle
              cx={0}
              cy={0}
              r={90}
              fill={color}
              filter="url(#lightGlow)"
              opacity={intensity * 0.6}
            />
          )}
          {/* --- EPOXY LENS (The Bulb) --- */}
          <path
            d="M -60 140 
               L -60 0 
               C -60 -100, 60 -100, 60 0 
               L 60 140 
               Z"
            fill="url(#bulbGrad)"
            stroke={color}
            strokeWidth="2"
            style={{ transition: "all 0.3s" }}
          />
          {/* Rim at bottom of bulb */}
          <rect
            x={-65}
            y={135}
            width={130}
            height={15}
            rx={5}
            fill={color}
            opacity="0.5"
          />
          {/* Info Text */}
          <text x={-100} y={180} fill="#fff" fontSize="14" textAnchor="end">
            Anode (+)
          </text>
          <text x={100} y={180} fill="#fff" fontSize="14" textAnchor="start">
            Cathode (-)
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Led3D;
