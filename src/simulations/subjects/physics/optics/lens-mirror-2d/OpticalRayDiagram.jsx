// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalRayDiagram.jsx
import React from "react";
import { calculateOpticalElement } from "./OpticalPhysics";
import OpticalElement from "./OpticalElement";
import { SvgDefs, Background, Ray, SvgObject } from "./OpticalPrimitives";
import {
  VIEW_WIDTH,
  VIEW_HEIGHT,
  ORIGIN_X,
  ORIGIN_Y,
  PX_PER_CM,
  COLOR_RAY_1,
  COLOR_RAY_2,
  MIRROR_SAG_CM,
  ELEMENT_HALF_HEIGHT_CM,
} from "./OpticalConstants";

export default function OpticalRayDiagram({
  type,
  focalLength,
  objDistance,
  objHeight,
  objType,
  objSide,
}) {
  const results = calculateOpticalElement(
    type,
    focalLength,
    objDistance,
    objHeight
  );
  const cx = (cm) => ORIGIN_X + cm * PX_PER_CM;
  const cy = (cm) => ORIGIN_Y - cm * PX_PER_CM;
  const cmToPx = (cm) => cm * PX_PER_CM;
  const dir = objSide === "left" ? -1 : 1;
  const isMirror = type.includes("mirror");

  // Coordinates
  const objX = cx(results.do * dir);
  const objYTop = cy(results.ho);
  const objTip = { x: objX, y: objYTop };
  const center = { x: cx(0), y: cy(0) };

  // --- SURFACE INTERSECTION ---
  const sagPx = cmToPx(MIRROR_SAG_CM);
  const yRatio = results.ho / ELEMENT_HALF_HEIGHT_CM;
  const yRatioSq = yRatio * yRatio;

  // Calculate Sag Direction (Must match Element Logic)
  let tipDir = 0;
  if (isMirror) {
    const isConcave = type === "concave-mirror";
    if (objSide === "left") {
      tipDir = isConcave ? -1 : 1;
    } else {
      tipDir = isConcave ? 1 : -1;
    }
  }

  const hitXOffset = isMirror ? tipDir * sagPx * yRatioSq : 0;
  const lensHit = { x: cx(0) + hitXOffset, y: cy(results.ho) };

  // --- IMAGE POS ---
  // Mirror Real: Same Side. Mirror Virtual: Opposite.
  let imgSideFactor = isMirror
    ? results.isReal
      ? 1
      : -1
    : results.isReal
    ? -1
    : 1;
  const imgX = cx(Math.abs(results.di) * dir * imgSideFactor);
  const imgYTop = cy(results.hi);

  // --- RAY 1: Parallel -> Focus ---
  // 1. Determine which Focus is active.
  //    Concave Mirror: Real Focus (Same side).
  //    Convex Mirror: Virtual Focus (Behind).
  //    Lens: Depends on type.
  let focusX = 0;
  if (!isMirror) {
    const side = type === "concave-lens" ? 1 : -1;
    focusX = cx(Math.abs(results.f) * dir * side);
  } else {
    // Mirror Focus Logic
    // Concave: F on object side.
    // Convex: F on opposite side (Virtual).
    const side = type === "concave-mirror" ? 1 : -1;
    focusX = cx(Math.abs(results.f) * dir * side);
  }
  const focalPoint = { x: focusX, y: cy(0) };

  // 2. Calculate Reflection/Refraction Vector
  const dx = focalPoint.x - lensHit.x;
  const dy = focalPoint.y - lensHit.y;
  const m1 = dy / dx;

  // 3. Determine Ray Direction (Left or Right?)
  // Lens: Goes through to opposite side.
  // Mirror: Reflects back to object side.
  const ray1GoesRight = !isMirror ? objSide === "left" : objSide === "right";

  // BUT: For Convex Mirror, the ray reflects OUTWARDS.
  // The line is defined by (F_virtual, HitPoint).
  // The Ray travels away from F_virtual.
  // So the destination X is indeed "back to object side".

  const farX1 = ray1GoesRight ? VIEW_WIDTH : 0;
  const r1_End = { x: farX1, y: lensHit.y + m1 * (farX1 - lensHit.x) };

  // --- RAY 2: Vertex Reflection ---
  let r2_End = { x: 0, y: 0 };
  if (!isMirror) {
    const m2 = (center.y - objTip.y) / (center.x - objTip.x);
    const farX2 = objSide === "left" ? VIEW_WIDTH : 0;
    r2_End = { x: farX2, y: center.y + m2 * (farX2 - center.x) };
  } else {
    // Mirror Reflection at Vertex
    const incidentSlope = (center.y - objTip.y) / (center.x - objTip.x);
    // Reflects back: slope is inverted
    const farX2 = objSide === "left" ? 0 : VIEW_WIDTH;
    r2_End = { x: farX2, y: center.y + -incidentSlope * (farX2 - center.x) };
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <SvgDefs />
      <Background width={VIEW_WIDTH} height={VIEW_HEIGHT} />
      <line
        x1={0}
        y1={ORIGIN_Y}
        x2={VIEW_WIDTH}
        y2={ORIGIN_Y}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* RAY 1 */}
      <Ray p1={objTip} p2={lensHit} color={COLOR_RAY_1} withArrow />
      <Ray p1={lensHit} p2={r1_End} color={COLOR_RAY_1} withArrow />

      {/* Extensions (Dashed Lines) */}
      {/* Virtual Image Extension */}
      {!results.isReal && (
        <Ray
          p1={lensHit}
          p2={{ x: imgX, y: imgYTop }}
          color={COLOR_RAY_1}
          dashed
        />
      )}

      {/* Special Backtraces for Diverging Systems */}
      {/* Concave Lens OR Convex Mirror: Ray appears to come from F */}
      {(type === "concave-lens" || type === "convex-mirror") && (
        <Ray p1={lensHit} p2={focalPoint} color={COLOR_RAY_1} dashed />
      )}

      {/* RAY 2 */}
      <Ray p1={objTip} p2={center} color={COLOR_RAY_2} withArrow />
      <Ray p1={center} p2={r2_End} color={COLOR_RAY_2} withArrow />

      {!results.isReal && (
        <Ray
          p1={center}
          p2={{ x: imgX, y: imgYTop }}
          color={COLOR_RAY_2}
          dashed
        />
      )}

      <OpticalElement
        cx={cx}
        cy={cy}
        fAbs={Math.abs(results.f)}
        type={type}
        objSide={objSide}
      />

      <SvgObject
        type={objType}
        x={objX}
        yBase={cy(0)}
        heightPx={results.ho * PX_PER_CM}
        color="#22d3ee"
        label="OBJECT"
      />
      <SvgObject
        type={objType}
        x={imgX}
        yBase={cy(0)}
        heightPx={results.hi * PX_PER_CM}
        color="#fbbf24"
        label="IMAGE"
        opacity={results.isReal ? 0.9 : 0.5}
      />
    </svg>
  );
}
