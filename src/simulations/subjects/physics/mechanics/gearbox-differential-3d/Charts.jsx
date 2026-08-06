import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
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
import SimulationPanel from "@/components/simulation-ui/SimulationPanel";

export default function Charts({ data }) {
  const safeData = Array.isArray(data) ? data : [];
  const shared = useChartStyles();

  return (
    <SimulationPanel
      title="Telemetry"
      subtitle={`${safeData.length} samples, capped window`}
      domain="physics"
      compact
    >
      <Box sx={{ display: "grid", gap: 1.15, minWidth: 0 }}>
        <ChartCard
          title="Final Output RPM"
          data={safeData}
          shared={shared}
          lines={[
            { key: "finalOutRPM", name: "Final output", stroke: "#67e8f9" },
          ]}
        />

        <ChartCard
          title="Wheel RPM Split"
          data={safeData}
          shared={shared}
          lines={[
            { key: "leftWheelRPM", name: "Left wheel", stroke: "#a78bfa" },
            { key: "rightWheelRPM", name: "Right wheel", stroke: "#f87171" },
          ]}
        />
      </Box>
    </SimulationPanel>
  );
}

function useChartStyles() {
  return useMemo(
    () => ({
      margin: { top: 8, right: 10, left: -8, bottom: 0 },
      tickStyle: { fill: "rgba(203,213,225,0.56)", fontSize: 10 },
      axisLineStyle: { stroke: "rgba(148,163,184,0.14)" },
      tooltipContentStyle: {
        background: "rgba(2, 6, 23, 0.94)",
        border: "1px solid rgba(148,163,184,0.20)",
        borderRadius: 12,
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
      },
      tooltipLabelStyle: {
        color: "rgba(248,250,252,0.92)",
        fontWeight: 800,
      },
      tooltipItemStyle: {
        color: "rgba(226,232,240,0.82)",
        fontSize: 12,
      },
    }),
    [],
  );
}

function ChartCard({ title, data, shared, lines }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 1.25,
        borderRadius: 2,
        border: "1px solid rgba(148,163,184,0.14)",
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.58), rgba(2,6,23,0.32))",
      }}
    >
      <Typography sx={{ mb: 0.8, color: "rgba(248,250,252,0.86)", fontSize: 13, fontWeight: 850 }}>
        {title}
      </Typography>

      <Box sx={{ height: 188, width: "100%", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <LineChart data={data} margin={shared.margin}>
            <CartesianGrid stroke="rgba(148,163,184,0.10)" />
            <XAxis
              dataKey="t"
              tick={shared.tickStyle}
              tickLine={false}
              axisLine={shared.axisLineStyle}
            />
            <YAxis
              tick={shared.tickStyle}
              tickLine={false}
              axisLine={shared.axisLineStyle}
              width={42}
            />
            <Tooltip
              contentStyle={shared.tooltipContentStyle}
              labelStyle={shared.tooltipLabelStyle}
              itemStyle={shared.tooltipItemStyle}
            />
            <Legend wrapperStyle={{ color: "rgba(226,232,240,0.68)", fontSize: 11 }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                dot={false}
                stroke={line.stroke}
                strokeWidth={2.25}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
