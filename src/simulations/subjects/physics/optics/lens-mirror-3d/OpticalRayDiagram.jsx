import React from "react";
import { OpticalLine } from "./OpticalPrimitives";
import { SVG_WIDTH, SVG_HEIGHT, ORIGIN_X, ORIGIN_Y } from "./OpticalConstants";

/**
 * This RayDiagram works in "physics coords" where:
 * - Element is at x = 0
 * - Optical axis is y = 0
 * - Object is at x = -do (left side)
 *
 * NOTE about Mirrors:
 * Physics sign convention uses:
 *   di > 0 real image in front of mirror
 *   di < 0 virtual image behind mirror
 * But our diagram coordinate system puts:
 *   left side  => negative x (in front of mirror)
 *   right side => positive x (behind mirror)
 * Therefore, for mirrors we map: x_image = -di
 */

const PAD = 18;

function boundsFromSvg() {
  const xMin = -ORIGIN_X + PAD;
  const xMax = SVG_WIDTH - ORIGIN_X - PAD;
  const yMin = -ORIGIN_Y + PAD;
  const yMax = ORIGIN_Y - PAD;
  return { xMin, xMax, yMin, yMax };
}

function clipRayToBox(x0, y0, dx, dy, b) {
  // Find the first intersection (smallest positive t) with the bounding box
  const candidates = [];

  // x = xMin
  if (dx !== 0) {
    const t = (b.xMin - x0) / dx;
    if (t > 0) {
      const y = y0 + dy * t;
      if (y >= b.yMin && y <= b.yMax) candidates.push({ t, x: b.xMin, y });
    }
  }
  // x = xMax
  if (dx !== 0) {
    const t = (b.xMax - x0) / dx;
    if (t > 0) {
      const y = y0 + dy * t;
      if (y >= b.yMin && y <= b.yMax) candidates.push({ t, x: b.xMax, y });
    }
  }
  // y = yMin
  if (dy !== 0) {
    const t = (b.yMin - y0) / dy;
    if (t > 0) {
      const x = x0 + dx * t;
      if (x >= b.xMin && x <= b.xMax) candidates.push({ t, x, y: b.yMin });
    }
  }
  // y = yMax
  if (dy !== 0) {
    const t = (b.yMax - y0) / dy;
    if (t > 0) {
      const x = x0 + dx * t;
      if (x >= b.xMin && x <= b.xMax) candidates.push({ t, x, y: b.yMax });
    }
  }

  if (!candidates.length) {
    // fallback: just go a bit
    return { x: x0 + dx * 10, y: y0 + dy * 10 };
  }

  candidates.sort((a, c) => a.t - c.t);
  return { x: candidates[0].x, y: candidates[0].y };
}

function clipSegmentToBox(x1, y1, x2, y2, b) {
  // Liang–Barsky clipping
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [x1 - b.xMin, b.xMax - x1, y1 - b.yMin, b.yMax - y1];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, r);
      else t1 = Math.min(t1, r);
      if (t0 > t1) return null;
    }
  }

  return {
    x1: x1 + t0 * dx,
    y1: y1 + t0 * dy,
    x2: x1 + t1 * dx,
    y2: y1 + t1 * dy,
  };
}

function focusXForMode(mode, fAbs) {
  // Diagram focus positions (using positive fAbs slider value):
  // - convex lens: +f
  // - concave lens: -f
  // - concave mirror: -f  (in front of mirror, left)
  // - convex mirror: +f   (behind mirror, right)
  if (mode === "convex-lens") return +fAbs;
  if (mode === "concave-lens") return -fAbs;
  if (mode === "concave-mirror") return -fAbs;
  if (mode === "convex-mirror") return +fAbs;
  return +fAbs;
}

function getMirrorHitX(mode, yVal) {
  // Keep it stable: clamp y to the mirror span and clamp x offset to curve strength
  const y = Math.max(-120, Math.min(120, yVal));
  const curvature = 40 / (120 * 120);
  const xOffset = curvature * (y * y);

  const x =
    mode === "concave-mirror"
      ? +xOffset
      : mode === "convex-mirror"
      ? -xOffset
      : 0;
  return Math.max(-40, Math.min(40, x));
}

const OpticalRayDiagram = ({
  mode,
  objDistance,
  objHeight,
  imgDistance,
  imgHeight,
  focalLength,
  isReal,
}) => {
  const b = boundsFromSvg();

  const elementKind = String(mode || "").includes("mirror") ? "mirror" : "lens";

  const finiteImg = Number.isFinite(imgDistance);
  const ox = -objDistance;
  const oy = objHeight;

  // For mirrors: x_image = -di (see header note)
  const ix = finiteImg
    ? elementKind === "mirror"
      ? -imgDistance
      : imgDistance
    : null;
  const iy = finiteImg ? imgHeight : null;

  const fAbs = Math.abs(Number(focalLength) || 0);
  const fX = focusXForMode(mode, fAbs);

  const rays = [];

  const addClippedDashed = (key, x1, y1, x2, y2, color, opacity = 0.55) => {
    const seg = clipSegmentToBox(x1, y1, x2, y2, b);
    if (!seg) return;
    rays.push(
      <OpticalLine
        key={key}
        x1={seg.x1}
        y1={seg.y1}
        x2={seg.x2}
        y2={seg.y2}
        color={color}
        dash="6 6"
        opacity={opacity}
        width={2}
      />
    );
  };

  // ---------- LENSES ----------
  if (mode === "convex-lens" || mode === "concave-lens") {
    const isConvex = mode === "convex-lens";

    // Ray 1: Parallel ray from top of object -> element at x=0
    rays.push(
      <OpticalLine
        key="L1_in"
        x1={ox}
        y1={oy}
        x2={0}
        y2={oy}
        color="#FF6B6B"
        showArrow
      />
    );

    // Ray 1 after element
    if (isConvex) {
      // refracts through far focus (+f)
      const dx = fX - 0;
      const dy = 0 - oy;
      const end = clipRayToBox(0, oy, dx, dy, b);

      rays.push(
        <OpticalLine
          key="L1_out"
          x1={0}
          y1={oy}
          x2={end.x}
          y2={end.y}
          color="#FF6B6B"
          showArrow
        />
      );

      // If image is virtual, show back-extension to the image point (clipped)
      if (finiteImg && !isReal && ix != null && iy != null) {
        addClippedDashed("L1_virtual", 0, oy, ix, iy, "#FF6B6B", 0.55);
      }
    } else {
      // concave (diverging): ray diverges as if coming from near focus (-f)
      // direction from focus(-f,0) to hit point (0,oy), extended forward
      const dx = 0 - fX; // fX is negative => dx positive
      const dy = oy - 0; // dy positive
      const end = clipRayToBox(0, oy, dx, dy, b);

      rays.push(
        <OpticalLine
          key="L1_out"
          x1={0}
          y1={oy}
          x2={end.x}
          y2={end.y}
          color="#FF6B6B"
          showArrow
        />
      );

      // virtual extension back to focal point
      addClippedDashed("L1_focus_back", 0, oy, fX, 0, "#FF6B6B", 0.6);

      // also show dashed to image point (more explicit)
      if (finiteImg && !isReal && ix != null && iy != null) {
        addClippedDashed("L1_to_img", 0, oy, ix, iy, "#FF6B6B", 0.55);
      }
    }

    // Ray 2: Through the center (passes straight)
    // Direction from object-top to origin (0,0)
    const dx2 = 0 - ox;
    const dy2 = 0 - oy;
    const end2 = clipRayToBox(ox, oy, dx2, dy2, b);

    rays.push(
      <OpticalLine
        key="L2"
        x1={ox}
        y1={oy}
        x2={end2.x}
        y2={end2.y}
        color="#4ECDC4"
        showArrow
      />
    );

    // For virtual images, show dashed intersection guidance to image point
    if (finiteImg && !isReal && ix != null && iy != null) {
      addClippedDashed("L2_virtual", 0, 0, ix, iy, "#4ECDC4", 0.5);
    }
  }

  // ---------- MIRRORS ----------
  else if (mode === "concave-mirror" || mode === "convex-mirror") {
    const isConcave = mode === "concave-mirror";

    // Use a better hit point on the mirror curve for the parallel ray
    const hitX = getMirrorHitX(mode, oy);

    // Ray 1: incident parallel (horizontal) to mirror surface at hitX
    rays.push(
      <OpticalLine
        key="M1_in"
        x1={ox}
        y1={oy}
        x2={hitX}
        y2={oy}
        color="#FF6B6B"
        showArrow
      />
    );

    if (isConcave) {
      // Reflected: goes through focus (fX is negative)
      const dx = fX - hitX;
      const dy = 0 - oy;
      const end = clipRayToBox(hitX, oy, dx, dy, b);

      rays.push(
        <OpticalLine
          key="M1_out"
          x1={hitX}
          y1={oy}
          x2={end.x}
          y2={end.y}
          color="#FF6B6B"
          showArrow
        />
      );
    } else {
      // Convex mirror: reflected ray diverges as if from focus behind mirror (+fX)
      // direction from focus(+f,0) to hitpoint (hitX,oy), extended left
      const dx = hitX - fX; // negative
      const dy = oy - 0; // positive
      const end = clipRayToBox(hitX, oy, dx, dy, b);

      rays.push(
        <OpticalLine
          key="M1_out"
          x1={hitX}
          y1={oy}
          x2={end.x}
          y2={end.y}
          color="#FF6B6B"
          showArrow
        />
      );

      // virtual extension behind mirror to focus
      addClippedDashed("M1_focus_back", hitX, oy, fX, 0, "#FF6B6B", 0.6);
    }

    // If image is virtual, show dashed extensions to image point (clipped)
    if (finiteImg && !isReal && ix != null && iy != null) {
      addClippedDashed("M1_to_img", hitX, oy, ix, iy, "#FF6B6B", 0.55);
    }

    // Ray 2: "vertex ray" (approx) to origin then reflected symmetrically (legacy style)
    rays.push(
      <OpticalLine
        key="M2_in"
        x1={ox}
        y1={oy}
        x2={0}
        y2={0}
        color="#4ECDC4"
        showArrow
      />
    );

    const mInc = (0 - oy) / (0 - ox);
    const mRef = -mInc;

    // reflected direction: x negative side
    const dxR = -1;
    const dyR = -mRef; // ensures y = mRef * x
    const endR = clipRayToBox(0, 0, dxR, dyR, b);

    rays.push(
      <OpticalLine
        key="M2_out"
        x1={0}
        y1={0}
        x2={endR.x}
        y2={endR.y}
        color="#4ECDC4"
        showArrow
      />
    );

    // Virtual guidance to image point
    if (finiteImg && !isReal && ix != null && iy != null) {
      addClippedDashed("M2_to_img", 0, 0, ix, iy, "#4ECDC4", 0.5);
    }
  }

  return <g>{rays}</g>;
};

export default OpticalRayDiagram;
