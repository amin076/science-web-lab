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
          {safeData.length} points
        </div>
      </div>

      <div className="space-y-4">
        <ChartCard
          title="Kinematics"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          lines={[
            { key: "y", name: "y (m)", stroke: "rgba(167, 139, 250, 0.95)" },
            { key: "v", name: "v (m/s)", stroke: "rgba(34, 211, 238, 0.95)" },
            { key: "a", name: "a (m/s²)", stroke: "rgba(248, 113, 113, 0.95)" },
          ]}
        />

        <ChartCard
          title="Forces"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          lines={[
            { key: "W", name: "W (N)", stroke: "rgba(248, 113, 113, 0.95)" },
            {
              key: "F_up",
              name: "Lift (N)",
              stroke: "rgba(34, 197, 94, 0.95)",
            },
            { key: "T", name: "T (N)", stroke: "rgba(34, 211, 238, 0.95)" },
            {
              key: "F_hold",
              name: "Hold (N)",
              stroke: "rgba(245, 158, 11, 0.95)",
            },
          ]}
        />

        <div className="text-xs text-white/35">
          Keys:{" "}
          <span className="font-mono">t, y, v, a, W, F_up, T, F_hold</span>
        </div>
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

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={margin}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="t"
              tick={tickStyle}
              tickLine={false}
              axisLine={axisLineStyle}
            />
            <YAxis tick={tickStyle} tickLine={false} axisLine={axisLineStyle} />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name ?? l.key}
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
