import React, { useMemo } from "react";

/**
 * A lightweight oscilloscope overlay.
 * Shows Voltage(t) and Current(t) for the probed component.
 *
 * Notes:
 * - Uses SVG for clarity on HiDPI screens.
 * - No external chart library needed.
 */
export default function ScopeOverlay({
  samples = [],
  title = "Scope",
  windowSeconds = 6,
}) {
  const { vPoints, iPoints, vMin, vMax, iMin, iMax, t0, t1 } = useMemo(() => {
    if (!samples.length) {
      return {
        vPoints: "",
        iPoints: "",
        vMin: 0,
        vMax: 1,
        iMin: 0,
        iMax: 1,
        t0: 0,
        t1: 1,
      };
    }

    const lastT = samples[samples.length - 1].t;
    const startT = Math.max(0, lastT - windowSeconds);

    const windowed = samples.filter((s) => s.t >= startT);

    let vMin = Infinity,
      vMax = -Infinity,
      iMin = Infinity,
      iMax = -Infinity;

    for (const s of windowed) {
      vMin = Math.min(vMin, s.v);
      vMax = Math.max(vMax, s.v);
      iMin = Math.min(iMin, s.i);
      iMax = Math.max(iMax, s.i);
    }

    // Avoid flat-line divide-by-zero
    if (vMin === vMax) {
      vMin -= 1;
      vMax += 1;
    }
    if (iMin === iMax) {
      iMin -= 1;
      iMax += 1;
    }

    const W = 420;
    const H = 220;
    const pad = 16;

    // Two charts stacked
    const chartH = (H - pad * 3) / 2;
    const chartW = W - pad * 2;

    const t0 = startT;
    const t1 = Math.max(startT + 1e-6, lastT);

    const xOf = (t) => pad + ((t - t0) / (t1 - t0)) * chartW;

    const yV = (v) => pad + chartH - ((v - vMin) / (vMax - vMin)) * chartH;

    const yI = (i) =>
      pad * 2 + chartH + chartH - ((i - iMin) / (iMax - iMin)) * chartH;

    const vPoints = windowed
      .map((s) => `${xOf(s.t).toFixed(2)},${yV(s.v).toFixed(2)}`)
      .join(" ");

    const iPoints = windowed
      .map((s) => `${xOf(s.t).toFixed(2)},${yI(s.i).toFixed(2)}`)
      .join(" ");

    return { vPoints, iPoints, vMin, vMax, iMin, iMax, t0, t1 };
  }, [samples, windowSeconds]);

  return (
    <div className="pointer-events-auto rounded-xl border border-white/10 bg-black/35 backdrop-blur-md shadow-xl">
      <div className="px-3 py-2 text-sm font-semibold text-white/90">
        {title}
      </div>

      <svg width="420" height="220" className="block">
        {/* Grid / frames */}
        <rect x="0" y="0" width="420" height="220" fill="transparent" />
        <rect
          x="16"
          y="16"
          width="388"
          height="86"
          fill="transparent"
          stroke="rgba(255,255,255,0.12)"
        />
        <rect
          x="16"
          y="118"
          width="388"
          height="86"
          fill="transparent"
          stroke="rgba(255,255,255,0.12)"
        />

        {/* Labels */}
        <text x="20" y="30" fontSize="11" fill="rgba(255,255,255,0.7)">
          Voltage (V)
        </text>
        <text x="20" y="132" fontSize="11" fill="rgba(255,255,255,0.7)">
          Current (A)
        </text>

        {/* Ranges */}
        <text x="360" y="30" fontSize="10" fill="rgba(255,255,255,0.55)">
          {vMin.toFixed(2)}..{vMax.toFixed(2)}
        </text>
        <text x="360" y="132" fontSize="10" fill="rgba(255,255,255,0.55)">
          {iMin.toExponential(2)}..{iMax.toExponential(2)}
        </text>

        {/* Waveforms */}
        <polyline
          points={vPoints}
          fill="none"
          stroke="rgba(110,255,207,0.95)"
          strokeWidth="2"
        />
        <polyline
          points={iPoints}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
        />

        {/* Time range */}
        <text x="20" y="214" fontSize="10" fill="rgba(255,255,255,0.55)">
          t: {t0.toFixed(2)}s → {t1.toFixed(2)}s
        </text>
      </svg>
    </div>
  );
}
