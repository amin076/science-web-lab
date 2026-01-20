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

export default function Charts({ data }) {
  const d = Array.isArray(data) ? data : [];

  // Data is now pre-calculated in the loop, ensuring KE matches Mass/Radius inputs
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-6">
      <div className="text-white font-black tracking-wide text-lg">
        Physical Analysis
      </div>

      {/* ---------- θ(t) + Ω(t) ---------- */}
      <ChartCard title="Tilt θ(t)  &  Precession Ω(t)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={d}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => fmt(v, 1)}
              unit="°"
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => fmt(v, 2)}
              unit=" rad/s"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                color: "#f8fafc",
              }}
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
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              dataKey="Omega"
              name="Precession Ω"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------- Angular Momentum ---------- */}
      <ChartCard title="Angular Momentum L(t)">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={d}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis
              tickFormatter={(v) => fmt(v, 2)}
              unit=" kg·m²/s"
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                color: "#f8fafc",
              }}
              formatter={(v) => fmt(v, 4)}
            />
            <Line
              dataKey="L"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ---------- Energy ---------- */}
      <ChartCard title="Energy Exchange (KE & PE)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="t" tickFormatter={timeFmt} />
            <YAxis tickFormatter={(v) => fmt(v, 1)} unit=" J" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                color: "#f8fafc",
              }}
              formatter={(v) => fmt(v, 4)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="KE"
              name="Kinetic Energy"
              stroke="#34d399"
              fill="rgba(52,211,153,0.15)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="PE"
              name="Potential Energy"
              stroke="#f87171"
              fill="rgba(248,113,113,0.15)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

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