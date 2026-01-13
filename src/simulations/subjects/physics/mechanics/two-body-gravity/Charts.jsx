import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Charts({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  const margin = useMemo(() => ({ top: 8, right: 12, left: 0, bottom: 0 }), []);
  const tickStyle = useMemo(
    () => ({ fill: "rgba(255,255,255,0.45)", fontSize: 11 }),
    []
  );
  const axisLineStyle = useMemo(
    () => ({ stroke: "rgba(255,255,255,0.10)" }),
    []
  );

  const tooltipContentStyle = useMemo(
    () => ({
      background: "rgba(2, 6, 23, 0.92)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "8px 10px",
    }),
    []
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-black tracking-wide">Charts</div>
        <div className="text-xs text-white/40 font-mono">
          {safeData.length} pts
        </div>
      </div>

      <div className="space-y-4">
        {/* Velocities */}
        <ChartCard
          title="Velocities (m/s)"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          lines={[
            { key: "v1", stroke: "#22d3ee", name: "V1" },
            { key: "v2", stroke: "#f87171", name: "V2" },
          ]}
        />

        {/* Distance */}
        <ChartCard
          title="Distance (m)"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          lines={[{ key: "dist", stroke: "#a78bfa", name: "Separation" }]}
        />

        {/* Energy */}
        <ChartCard
          title="Total Kinetic Energy (J)"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          lines={[{ key: "ke", stroke: "#fbbf24", name: "KE" }]}
        />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  margin,
  tickStyle,
  axisLineStyle,
  tooltipContentStyle,
  lines,
}) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-3">
      <div className="text-white/75 font-bold text-sm mb-2">{title}</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={margin}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="t"
              tick={tickStyle}
              tickLine={false}
              axisLine={axisLineStyle}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={axisLineStyle}
              width={30}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={{ color: "white", marginBottom: 4 }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
            {lines.map((l) => (
              <Line
                key={l.key}
                name={l.name || l.key}
                type="monotone"
                dataKey={l.key}
                dot={false}
                stroke={l.stroke}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
