// src/simulations/subjects/physics/mechanics/gyroscope/Charts.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

/* ---------- helpers ---------- */
const fmt = (v, d = 3) =>
  Number.isFinite(v) ? Number(v).toFixed(d) : "—";

const timeFmt = (v) => fmt(v, 2);

/* ---------- derived quantities ---------- */
/**
 * KE ≈ L² / (2I)
 * (I ثابت فرض شده – برای آموزش کاملاً مناسب)
 */
function kineticEnergy(d) {
  const I = 0.5; // مقدار نرمال‌شده آموزشی
  return (d.L * d.L) / (2 * I);
}

/**
 * PE ≈ M g r cos(θ)
 * θ بر حسب درجه در داده‌ها
 */
function potentialEnergy(d) {
  const M = 1;
  const g = 9.81;
  const r = 1;
  const theta = (d.tilt * Math.PI) / 180;
  return M * g * r * Math.cos(theta);
}

export default function Charts({ data }) {
  const d = Array.isArray(data) ? data : [];

  const enriched = d.map((p) => ({
    ...p,
    KE: kineticEnergy(p),
    PE: potentialEnergy(p),
  }));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-6">
      <div className="text-white font-black tracking-wide text-lg">
        Physical Analysis
      </div>

      {/* ---------- θ(t) + Ω(t) ---------- */}
      <ChartCard title="Tilt θ(t)  &  Precession Ω(t)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={enriched}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => fmt(v, 3)}
              unit="°"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => fmt(v, 4)}
              unit=" rad/s"
            />
            <Tooltip
              formatter={(v) => fmt(v, 4)}
              labelFormatter={(l) => `t = ${timeFmt(l)} s`}
            />
            <Legend />
            <Line
              yAxisId="left"
              dataKey="tilt"
              name="Tilt θ"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              dataKey="Omega"
              name="Precession Ω"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------- Angular Momentum ---------- */}
      <ChartCard title="Angular Momentum L(t)">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={enriched}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis tickFormatter={(v) => fmt(v, 3)} unit=" kg·m²/s" />
            <Tooltip formatter={(v) => fmt(v, 4)} />
            <Line
              dataKey="L"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------- Energy ---------- */}
      <ChartCard title="Energy Exchange (KE & PE)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={enriched}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis tickFormatter={(v) => fmt(v, 3)} unit=" J" />
            <Tooltip formatter={(v) => fmt(v, 4)} />
            <Legend />
            <Area
              dataKey="KE"
              name="Kinetic Energy"
              stroke="#34d399"
              fill="rgba(52,211,153,0.15)"
            />
            <Area
              dataKey="PE"
              name="Potential Energy"
              stroke="#f87171"
              fill="rgba(248,113,113,0.15)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ---------- UI wrapper ---------- */
function ChartCard({ title, children }) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-3">
      <div className="text-white/70 font-bold text-sm mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}