import { Box, Chip, Stack, Typography } from "@mui/material";
import SimulationMetric from "@/components/simulation-ui/SimulationMetric";
import SimulationPanel from "@/components/simulation-ui/SimulationPanel";
import { formatNumber } from "./constants";

function formatHudValue(value, precision = 2) {
  if (value === Infinity) return "infinite";
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "—";
  return formatNumber(value, precision);
}

export default function HUD({ hud, running }) {
  const mode = hud?.mode || "straight • open";
  const direction = hud?.direction || "CW";

  return (
    <SimulationPanel
      title="Live Drivetrain"
      subtitle="RPM and direction"
      domain="physics"
      compact
      sx={{
        width: { xs: "100%", sm: 430 },
        background: "rgba(2,6,23,0.50)",
      }}
      actions={
        <Chip
          label={running ? "running" : "paused"}
          size="small"
          sx={{
            height: 24,
            color: running ? "#a7f3d0" : "rgba(226,232,240,0.72)",
            border: `1px solid ${running ? "rgba(16,185,129,0.45)" : "rgba(148,163,184,0.22)"}`,
            background: running ? "rgba(16,185,129,0.14)" : "rgba(15,23,42,0.66)",
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
            gap: 0.85,
          }}
        >
          <SimulationMetric
            label="Input"
            value={formatHudValue(hud?.inputRPM, 0)}
            unit="rpm"
            domain="physics"
            emphasis
            sx={{ minHeight: 72 }}
          />
          <SimulationMetric
            label="Final out"
            value={formatHudValue(hud?.finalOutRPM, 2)}
            unit="rpm"
            domain="physics"
            emphasis
            sx={{ minHeight: 72 }}
          />
          <SimulationMetric
            label="Left wheel"
            value={formatHudValue(hud?.leftWheelRPM, 2)}
            unit="rpm"
            domain="physics"
            sx={{ minHeight: 66 }}
          />
          <SimulationMetric
            label="Right wheel"
            value={formatHudValue(hud?.rightWheelRPM, 2)}
            unit="rpm"
            domain="physics"
            sx={{ minHeight: 66 }}
          />
        </Box>

        <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
          <Chip
            label={`Direction ${direction}`}
            size="small"
            sx={{
              color: "#67e8f9",
              background: "rgba(8,145,178,0.16)",
              border: "1px solid rgba(103,232,249,0.28)",
              fontWeight: 800,
            }}
          />
          <Chip
            label={mode}
            size="small"
            sx={{
              color: "rgba(248,250,252,0.84)",
              background: "rgba(15,23,42,0.64)",
              border: "1px solid rgba(148,163,184,0.18)",
              fontWeight: 750,
            }}
          />
        </Stack>

        <Typography sx={{ color: "rgba(203,213,225,0.55)", fontSize: 11.5, lineHeight: 1.45 }}>
          Open differential splits wheel speed only when turning is enabled and the diff is unlocked.
        </Typography>
      </Stack>
    </SimulationPanel>
  );
}
