// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalPrimitives.jsx
import React from "react";

// --- SHAPES ---
const TreeShape = () => (
  <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))">
    <rect x="-6" y="0" width="12" height="30" fill="#78350f" />
    <path d="M -30 30 L 30 30 L 0 70 Z" fill="#15803d" />
    <path d="M -25 55 L 25 55 L 0 90 Z" fill="#16a34a" />
    <path d="M -18 80 L 18 80 L 0 110 Z" fill="#22c55e" />
  </g>
);

// --- DEFS & FILTERS ---
export function SvgDefs() {
  return (
    <defs>
      {/* Crisp Arrow Heads */}
      <marker
        id="arrowRed"
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto"
      >
        <path d="M0,0 L6,3 L0,6 Z" fill="#ff4b4b" />
      </marker>
      <marker
        id="arrowCyan"
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto"
      >
        <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
      </marker>

      {/* Grid Pattern */}
      <pattern
        id="gridMain"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 100 0 L 0 0 0 100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <path
          d="M 50 0 L 50 100 M 0 50 L 100 50"
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1"
        />
      </pattern>

      {/* Neon Glow Filter for Rays */}
      <filter id="rayGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// --- BACKGROUND ---
export function Background({ width, height }) {
  return (
    <g>
      <rect width={width} height={height} fill="#0b1121" /> {/* Darker Slate */}
      <rect width={width} height={height} fill="url(#gridMain)" />
      <radialGradient id="vignette" cx="50%" cy="50%" r="80%">
        <stop offset="0%" stopColor="#0b1121" stopOpacity="0" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
      </radialGradient>
      <rect width={width} height={height} fill="url(#vignette)" />
    </g>
  );
}

// --- GLASS LABEL COMPONENT ---
export function GlassLabel({ x, y, text, color = "white", align = "middle" }) {
  const width = text.length * 7 + 20; // Auto-width approx
  const height = 24;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Glass Background */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx="6"
        fill="rgba(15, 23, 42, 0.7)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      {/* Text */}
      <text
        x="0"
        y="1"
        fill={color}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="bold"
        style={{ letterSpacing: "0.5px" }}
      >
        {text}
      </text>
    </g>
  );
}

// --- RAY COMPONENT ---
export function Ray({ p1, p2, color, dashed, withArrow }) {
  const marker = withArrow
    ? color.includes("ff")
      ? "url(#arrowRed)"
      : "url(#arrowCyan)"
    : undefined;

  return (
    <g>
      {/* 1. Outer Glow (Thick, transparent, blurred) */}
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={color}
        strokeWidth={5}
        strokeOpacity={0.3}
        filter="blur(3px)"
      />

      {/* 2. Core Line (Thin, Solid) */}
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "5 5" : "none"}
        opacity={dashed ? 0.7 : 1.0}
        markerEnd={!dashed && withArrow ? marker : undefined}
      />

      {/* 3. Mid-point Arrow for long rays */}
      {withArrow && !dashed && (
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p1.x + (p2.x - p1.x) * 0.55} // Place slightly past center
          y2={p1.y + (p2.y - p1.y) * 0.55}
          stroke="none"
          markerEnd={marker}
        />
      )}
    </g>
  );
}

// --- POINT (F / 2F) COMPONENT ---
export function OpticalPoint({ x, y, label, subLabel, active }) {
  const color = active ? "#fbbf24" : "rgba(255,255,255,0.4)";

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Dot */}
      <circle r={active ? 3.5 : 2.5} fill={color} stroke="none" />
      {active && (
        <circle
          r={6}
          fill="none"
          stroke={color}
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      )}

      {/* Label */}
      <text
        y="18"
        fill={color}
        textAnchor="middle"
        fontSize="10"
        fontWeight={active ? "bold" : "normal"}
        style={{ fontFamily: "monospace" }}
      >
        {label}
      </text>
    </g>
  );
}

// --- OBJECT / IMAGE (SVG OBJECT) ---
export function SvgObject({
  x,
  yBase,
  heightPx,
  type = "arrow",
  label,
  color,
  opacity = 1,
}) {
  const isTree = type === "tree";
  const scale = heightPx / 110;

  return (
    <g transform={`translate(${x}, ${yBase})`} opacity={opacity}>
      {/* The Visual Object */}
      {isTree ? (
        <g transform={`scale(${scale}, ${-scale})`}>
          <TreeShape />
        </g>
      ) : (
        <g>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-heightPx}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <path
            d={`M -5 ${-heightPx + 6} L 0 ${-heightPx} L 5 ${-heightPx + 6}`}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeJoin="round"
          />
        </g>
      )}

      {/* Floating Glass Label */}
      <GlassLabel x={0} y={-heightPx - 20} text={label} color={color} />
    </g>
  );
}
