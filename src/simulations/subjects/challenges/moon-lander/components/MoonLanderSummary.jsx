import { Box, Button, Stack, Typography } from "@mui/material";
import { RotateCcw, Trophy, TriangleAlert } from "lucide-react";

function ResultMetric({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Typography
        component="div"
        sx={{
          color: "rgba(219, 238, 255, 0.64)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography component="div" sx={{ color: "white", fontWeight: 900 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function MoonLanderSummary({ result, onReset }) {
  if (!result) return null;

  const Icon = result.success ? Trophy : TriangleAlert;
  const title = result.success ? "Safe Landing" : "Mission Ended";
  const metrics = result.metrics || {};

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        p: 2,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          width: "min(92vw, 460px)",
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          color: "white",
          backgroundColor: "rgba(4, 9, 20, 0.82)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 28px 90px rgba(0,0,0,0.52)",
          backdropFilter: "blur(20px)",
          pointerEvents: "auto",
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                backgroundColor: result.success
                  ? "rgba(66, 255, 178, 0.18)"
                  : "rgba(255, 118, 118, 0.16)",
                color: result.success ? "#8affd7" : "#ff9f9f",
              }}
            >
              <Icon size={26} aria-hidden="true" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950 }}>
                {title}
              </Typography>
              <Typography sx={{ color: "rgba(232, 242, 255, 0.72)" }}>
                {result.message}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 1,
            }}
          >
            <ResultMetric label="Score" value={result.score} />
            <ResultMetric label="Fuel" value={`${metrics.fuelRemaining ?? 0}%`} />
            <ResultMetric label="Speed" value={`${metrics.landingSpeed ?? 0} m/s`} />
            <ResultMetric label="Vertical" value={`${metrics.verticalSpeed ?? 0} m/s`} />
            <ResultMetric label="Horizontal" value={`${metrics.horizontalSpeed ?? 0} m/s`} />
            <ResultMetric label="Tilt" value={`${metrics.tilt ?? 0}°`} />
          </Box>

          <Button
            startIcon={<RotateCcw size={18} />}
            onClick={onReset}
            variant="contained"
            sx={{
              minHeight: 46,
              borderRadius: 999,
              fontWeight: 950,
              background:
                "linear-gradient(135deg, rgba(74, 222, 255, 0.95), rgba(124, 92, 255, 0.9))",
              boxShadow: "0 18px 46px rgba(74, 222, 255, 0.24)",
            }}
          >
            Try Again
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
