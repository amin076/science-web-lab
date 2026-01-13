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
  const tooltipLabelStyle = useMemo(
    () => ({ color: "rgba(255,255,255,0.85)", fontWeight: 800 }),
    []
  );
  const tooltipItemStyle = useMemo(
    () => ({ color: "rgba(255,255,255,0.75)", fontSize: 12 }),
    []
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-black tracking-wide">Charts</div>
        <div className="text-xs text-white/40 font-mono">
          {safeData.length} points
        </div>
      </div>

      <div className="space-y-4 min-w-0">
        <ChartCard
          title="Final Output RPM"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          tooltipLabelStyle={tooltipLabelStyle}
          tooltipItemStyle={tooltipItemStyle}
          lines={[
            { key: "finalOutRPM", name: "finalOutRPM", stroke: "rgba(34, 211, 238, 0.9)" },
          ]}
        />

        <ChartCard
          title="Wheel RPMs"
          data={safeData}
          margin={margin}
          tickStyle={tickStyle}
          axisLineStyle={axisLineStyle}
          tooltipContentStyle={tooltipContentStyle}
          tooltipLabelStyle={tooltipLabelStyle}
          tooltipItemStyle={tooltipItemStyle}
          lines={[
            { key: "leftWheelRPM", name: "leftWheelRPM", stroke: "rgba(167, 139, 250, 0.9)" },
            { key: "rightWheelRPM", name: "rightWheelRPM", stroke: "rgba(248, 113, 113, 0.9)" },
          ]}
        />

        <div className="text-xs text-white/35">
          Expected keys:{" "}
          <span className="font-mono">
            t, finalOutRPM, leftWheelRPM, rightWheelRPM
          </span>
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
  tooltipLabelStyle,
  tooltipItemStyle,
  lines,
}) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-3 min-w-0">
      <div className="text-white/75 font-bold text-sm mb-2">{title}</div>

      {/* Force a real size so Recharts can’t measure 0/negative */}
      <div style={{ height: 224, width: "100%", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <LineChart data={data} margin={margin}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="t"
              tick={tickStyle}
              tickLine={false}
              axisLine={axisLineStyle}
            />
            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={axisLineStyle}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
            />
            <Legend />
            {Array.isArray(lines)
              ? lines.map((l) => (
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
                ))
              : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
