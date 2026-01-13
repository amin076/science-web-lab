import React from "react";
import { SHAPES } from "./Shapes";

// Helper for equation lines
const EquationLine = ({ label, value, unit }) => (
  <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 py-1">
    <span className="text-gray-400">{label}</span>
    <span className="text-blue-200">
      {value} <span className="text-gray-500">{unit}</span>
    </span>
  </div>
);

const ShapeDiagram = ({ shape, submergedPct }) => {
  return (
    <div className="w-full h-20 bg-slate-800/50 rounded-lg relative overflow-hidden flex items-center justify-center mb-3 border border-white/10">
      <div className="absolute w-full h-[1px] bg-blue-400 top-1/2 left-0 z-10 border-t border-dashed border-blue-300 opacity-50"></div>
      <div className="absolute right-2 top-[55%] text-[8px] text-blue-300">
        Water Level
      </div>

      <svg
        width="50"
        height="50"
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        {shape === SHAPES.box && (
          <rect
            x="25"
            y="25"
            width="50"
            height="50"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}

        {/* Sphere OR Horizontal Cylinder look like circles from the side */}
        {(shape === SHAPES.sphere || shape === SHAPES.cylinderHorizontal) && (
          <circle
            cx="50"
            cy="50"
            r="25"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}

        {shape === SHAPES.cylinder && (
          <rect
            x="35"
            y="25"
            width="30"
            height="50"
            rx="2"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}
        {shape === SHAPES.pyramid && (
          <polygon
            points="50,25 25,75 75,75"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}

        <clipPath id="shapeClipMath">
          {shape === SHAPES.box && (
            <rect x="25" y="25" width="50" height="50" />
          )}
          {(shape === SHAPES.sphere || shape === SHAPES.cylinderHorizontal) && (
            <circle cx="50" cy="50" r="25" />
          )}
          {shape === SHAPES.cylinder && (
            <rect x="35" y="25" width="30" height="50" rx="2" />
          )}
          {shape === SHAPES.pyramid && <polygon points="50,25 25,75 75,75" />}
        </clipPath>

        <rect
          x="0"
          y={50}
          width="100"
          height="50"
          fill="#3b82f6"
          opacity="0.6"
          clipPath="url(#shapeClipMath)"
        />
      </svg>
    </div>
  );
};

export default function MathExplanation({ shape, hudData }) {
  // RENDER DIFFERENT CONTENT BASED ON SHAPE
  const renderFormulaContent = () => {
    switch (shape) {
      case SHAPES.box:
      case SHAPES.cylinder:
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-300 leading-relaxed">
              For a prism (Box/Cylinder), the Cross-Sectional Area (
              <span className="text-yellow-200">A</span>) is constant.
            </p>
            <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20 text-xs text-blue-200 font-mono text-center">
              V<sub>sub</sub> = A × h
            </div>
            <p className="text-[9px] text-gray-400">
              The relationship is <b>Linear</b>. If you double the depth (h),
              you double the submerged volume.
            </p>
          </div>
        );

      case SHAPES.sphere:
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-300 leading-relaxed">
              For a Sphere, area changes with depth. We use the{" "}
              <b>Spherical Cap</b> formula.
            </p>
            <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20 text-xs text-blue-200 font-mono text-center">
              V<sub>sub</sub> = <span className="text-lg">⅓</span>πh²(3R - h)
            </div>
            <div className="text-[9px] text-gray-400 grid grid-cols-2 gap-2 mt-1">
              <span>
                <b>h</b>: Depth submerged
              </span>
              <span>
                <b>R</b>: Radius of sphere
              </span>
            </div>
            <p className="text-[9px] text-yellow-500/80 mt-1 italic">
              *Non-Linear: Volume grows slowly at the bottom, fastest at the
              middle (equator).
            </p>
          </div>
        );

      case SHAPES.cylinderHorizontal: // <--- NEW EXPLANATION
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-300 leading-relaxed">
              For a horizontal cylinder, we calculate the area of the{" "}
              <b>Circular Segment</b> and multiply by length (L).
            </p>
            <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20 text-xs text-blue-200 font-mono text-center">
              V<sub>sub</sub> = Area<sub>seg</sub> × L
            </div>
            <div className="text-[9px] text-gray-400 mt-2">
              <p>Area Formula involves inverse cosine:</p>
              <div className="font-mono text-[9px] mt-1 text-gray-500">
                A = R²·arccos((R-h)/R) - (R-h)√(2Rh-h²)
              </div>
            </div>
            <p className="text-[9px] text-yellow-500/80 mt-1 italic">
              *Complex: Volume fills non-linearly.
            </p>
          </div>
        );

      case SHAPES.pyramid:
        return (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-300 leading-relaxed">
              Area shrinks as you go up. We calculate the volume of the{" "}
              <b>Exposed Pyramid</b> (top) and subtract it from the Total.
            </p>

            <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20 text-xs text-blue-200 font-mono space-y-1">
              <div>
                V<sub>sub</sub> = V<sub>total</sub> - V<sub>top</sub>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-2">
              <p className="mb-1">Using Similar Triangles ratio:</p>
              <div className="font-mono text-center text-xs bg-black/20 p-1 rounded">
                V<sub>top</sub> = V<sub>total</sub> × (h<sub>exposed</sub> / H)³
              </div>
            </div>
            <p className="text-[9px] text-yellow-500/80 mt-1 italic">
              *Cubic Relationship: Volume depends on height cubed.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-white/10 mt-4">
      {/* DIAGRAM */}
      <ShapeDiagram shape={shape} submergedPct={hudData.submergedPct} />

      <div className="space-y-4">
        {/* 1. PRINCIPLE */}
        <div>
          <div className="bg-black/40 p-2 rounded border border-white/10 text-center mb-2">
            <span className="font-serif italic text-yellow-100 text-sm">
              F<sub>b</sub> = ρ · V<sub>sub</sub> · g
            </span>
          </div>
        </div>

        {/* 2. DYNAMIC FORMULA SECTION */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 border-b border-white/5 pb-1">
            Calculating V<sub>sub</sub> from Height (h)
          </p>
          {renderFormulaContent()}
        </div>

        {/* 3. LIVE DATA */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
            Live Variables
          </p>
          <EquationLine
            label="Total Height (H)"
            value={hudData.heightIn + hudData.heightOut}
            unit="m"
          />
          <EquationLine
            label="Submerged (h)"
            value={hudData.heightIn?.toFixed(3)}
            unit="m"
          />

          <div className="flex justify-between items-center text-xs font-mono pt-2 text-blue-300 font-bold border-t border-white/5 mt-1">
            <span>Calc. Volume</span>
            <span>{hudData.volIn?.toFixed(3)} m³</span>
          </div>
        </div>
      </div>
    </div>
  );
}
