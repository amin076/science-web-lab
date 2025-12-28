// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalElement.jsx
import React from "react";
import {
  ELEMENT_HALF_HEIGHT_CM,
  LENS_WIDTH_CM,
  LENS_CENTER_THICKNESS_CM,
  MIRROR_SAG_CM,
  cmToPx,
} from "./OpticalConstants";
import { OpticalPoint } from "./OpticalPrimitives";

export default function OpticalElement({ cx, cy, fAbs, type, objSide }) {
  const hPx = cmToPx(ELEMENT_HALF_HEIGHT_CM);
  const wPx = cmToPx(LENS_WIDTH_CM / 2);
  const centerThickPx = cmToPx(LENS_CENTER_THICKNESS_CM / 2);
  const sagPx = cmToPx(MIRROR_SAG_CM);

  const x0 = cx(0);
  const yTop = cy(ELEMENT_HALF_HEIGHT_CM);
  const yBot = cy(-ELEMENT_HALF_HEIGHT_CM);
  const y0 = cy(0);

  const isMirror = type.includes("mirror");

  let path = "";
  let hatchLines = [];
  let color = "";
  let title = "";

  if (isMirror) {
    color = "#a78bfa"; // Purple
    const isConcave = type === "concave-mirror";
    title = isConcave ? "CONCAVE MIRROR" : "CONVEX MIRROR";

    // --- CURVE DIRECTION ---
    // Vertex at x=0.
    // Left Source:
    //   Concave: ')' Tips Left (-).
    //   Convex:  '(' Tips Right (+).
    // Right Source:
    //   Concave: '(' Tips Right (+).
    //   Convex:  ')' Tips Left (-).

    let tipDir = 0;
    if (objSide === "left") {
      tipDir = isConcave ? -1 : 1;
    } else {
      tipDir = isConcave ? 1 : -1;
    }

    // Bezier Path
    const tipX = x0 + tipDir * sagPx;
    const controlX = x0 + -tipDir * sagPx;
    path = `M ${tipX} ${yTop} Q ${controlX} ${y0} ${tipX} ${yBot}`;

    // --- HATCHING ---
    // Always on the side opposite to the object.
    const hatchDir = objSide === "left" ? 1 : -1;

    // Generate 'Comb' style hatching
    const numHatches = 20;
    for (let i = 0; i <= numHatches; i++) {
      const t = i / numHatches;
      const yPos = yTop + t * (yBot - yTop);

      // Exact Bezier interpolation for X
      const mt = 1 - t;
      // B(t) formula for Quadratic Bezier X coordinate
      const xOnCurve = mt * mt * tipX + 2 * mt * t * controlX + t * t * tipX;

      hatchLines.push(
        <line
          key={i}
          x1={xOnCurve}
          y1={yPos}
          x2={xOnCurve + hatchDir * 8}
          y2={yPos}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.4}
        />
      );
    }
  } else {
    // Lens Logic
    if (type === "concave-lens") {
      title = "CONCAVE LENS";
      color = "#22d3ee";
      path = `M ${x0 - wPx} ${yTop} Q ${x0 - centerThickPx} ${y0} ${
        x0 - wPx
      } ${yBot} L ${x0 + wPx} ${yBot} Q ${x0 + centerThickPx} ${y0} ${
        x0 + wPx
      } ${yTop} Z`;
    } else {
      title = "CONVEX LENS";
      color = "#2dd4bf";
      path = `M ${x0} ${yTop} Q ${x0 - wPx} ${y0} ${x0} ${yBot} Q ${
        x0 + wPx
      } ${y0} ${x0} ${yTop} Z`;
    }
  }

  return (
    <g>
      <defs>
        <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
        </linearGradient>
      </defs>

      {hatchLines}

      <path
        d={path}
        fill={isMirror ? "none" : `url(#grad-${type})`}
        stroke={color}
        strokeWidth={isMirror ? 4 : 1.5}
        strokeLinecap="round"
        filter={`drop-shadow(0 0 8px ${color})`}
      />

      <g transform={`translate(${x0}, ${yTop - 35})`}>
        <rect
          x="-55"
          y="-12"
          width="110"
          height="24"
          rx="12"
          fill="#0f172a"
          stroke={color}
          strokeWidth={1}
        />
        <text
          x="0"
          y="4"
          fill={color}
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          {title}
        </text>
        <line
          x1="0"
          y1="12"
          x2="0"
          y2={35}
          stroke={color}
          strokeDasharray="2 2"
          strokeOpacity={0.5}
        />
      </g>

      {!isMirror && (
        <line
          x1={x0}
          y1={yTop - 10}
          x2={x0}
          y2={yBot + 10}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="3 3"
        />
      )}

      {/* Points */}
      {/* Mirror: Points active only on the REFLECTIVE side (Object Side) */}
      <OpticalPoint
        x={cx(-fAbs)}
        y={y0}
        label="F"
        active={!isMirror || objSide === "left"}
      />
      <OpticalPoint
        x={cx(-fAbs * 2)}
        y={y0}
        label="C"
        active={!isMirror || objSide === "left"}
      />
      <OpticalPoint
        x={cx(fAbs)}
        y={y0}
        label={isMirror ? "F" : "F'"}
        active={!isMirror || objSide === "right"}
      />
      <OpticalPoint
        x={cx(fAbs * 2)}
        y={y0}
        label={isMirror ? "C" : "2F'"}
        active={!isMirror || objSide === "right"}
      />
    </g>
  );
}
