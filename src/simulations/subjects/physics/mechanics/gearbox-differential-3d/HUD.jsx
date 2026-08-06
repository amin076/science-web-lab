import { Box, Chip, Stack, Typography } from "@mui/material";
import SimulationMetric from "@/components/simulation-ui/SimulationMetric";
import SimulationPanel from "@/components/simulation-ui/SimulationPanel";
import { formatNumber } from "./constants";

function formatHudValue(value, precision = 2) {
  if (value === Infinity) return "infinite";
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "--";
  return formatNumber(value, precision);
}

export default function HUD({ hud, running }) {
  const mode = hud?.mode || "straight / open";
  const direction = hud?.direction || "CW";

  return (
    <SimulationPanel
      title="Live Drivetrain"
      subtitle="RPM and direction"
      domain="physics"
      compact
      sx={{
        width: { xs: "100%", sm: 300 },
        maxWidth: "100%",
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.42), rgba(8,47,73,0.24) 48%, rgba(2,6,23,0.34))",
        border: "1px solid rgba(226,232,240,0.20)",
        boxShadow: "0 22px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.13)",
        backdropFilter: "blur(22px) saturate(1.2)",
      }}
      bodySx={{ p: { xs: 1, sm: 1.25 } }}
      actions={
        <Chip
          label={running ? "running" : "paused"}
          size="small"
          sx={{
            height: 24,
            color: running ? "#a7f3d0" : "rgba(226,232,240,0.72)",
            border: `1px solid ${running ? "rgba(16,185,129,0.48)" : "rgba(226,232,240,0.20)"}`,
            background: running ? "rgba(16,185,129,0.18)" : "rgba(15,23,42,0.36)",
            backdropFilter: "blur(12px)",
            fontWeight: 800,
          }}
        />
      }
    >
      <Stack spacing={1}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.65,
          }}
        >
          <SimulationMetric
            label="Input"
            value={formatHudValue(hud?.inputRPM, 0)}
            unit="rpm"
            domain="physics"
            emphasis
            sx={{
              minHeight: { xs: 50, sm: 58 },
              p: 1,
              background: "linear-gradient(145deg, rgba(8,145,178,0.22), rgba(15,23,42,0.30))",
              border: "1px solid rgba(103,232,249,0.24)",
            }}
          />
          <SimulationMetric
            label="Final out"
            value={formatHudValue(hud?.finalOutRPM, 2)}
            unit="rpm"
            domain="physics"
            emphasis
            sx={{
              minHeight: { xs: 50, sm: 58 },
              p: 1,
              background: "linear-gradient(145deg, rgba(8,145,178,0.20), rgba(15,23,42,0.30))",
              border: "1px solid rgba(103,232,249,0.22)",
            }}
          />
          <SimulationMetric
            label="Left wheel"
            value={formatHudValue(hud?.leftWheelRPM, 2)}
            unit="rpm"
            domain="physics"
            sx={{
              minHeight: { xs: 48, sm: 56 },
              p: 1,
              background: "rgba(15,23,42,0.28)",
              border: "1px solid rgba(226,232,240,0.12)",
            }}
          />
          <SimulationMetric
            label="Right wheel"
            value={formatHudValue(hud?.rightWheelRPM, 2)}
            unit="rpm"
            domain="physics"
            sx={{
              minHeight: { xs: 48, sm: 56 },
              p: 1,
              background: "rgba(15,23,42,0.28)",
              border: "1px solid rgba(226,232,240,0.12)",
            }}
          />
        </Box>

        <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${direction}`}
            size="small"
            sx={{
              color: "#67e8f9",
              background: "rgba(8,145,178,0.18)",
              border: "1px solid rgba(103,232,249,0.28)",
              backdropFilter: "blur(10px)",
              fontWeight: 800,
            }}
          />
          <Chip
            label={mode}
            size="small"
            sx={{
              color: "rgba(248,250,252,0.84)",
              background: "rgba(15,23,42,0.36)",
              border: "1px solid rgba(226,232,240,0.14)",
              backdropFilter: "blur(10px)",
              fontWeight: 750,
            }}
          />
        </Stack>

        <Typography sx={{ color: "rgba(203,213,225,0.55)", fontSize: 11, lineHeight: 1.35 }}>
          Open diff splits wheel speed while turning.
        </Typography>
      </Stack>
    </SimulationPanel>
  );
}
