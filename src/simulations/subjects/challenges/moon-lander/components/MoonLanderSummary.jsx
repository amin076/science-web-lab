import { Box, Button, Stack, Typography } from "@mui/material";
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react";

const RESULT_COPY = {
  safeLanding: {
    title: "Touchdown confirmed",
    message: "You controlled speed, angle, and fuel well enough for a safe landing.",
    lesson: "Good landing strategy: reduce vertical speed before contact and keep the lander level.",
  },
  missedPad: {
    title: "Missed the pad",
    message: "The lander touched down outside the glowing training zone.",
    lesson: "Cancel sideways drift earlier, then guide the module toward the beacon.",
  },
  verticalSpeed: {
    title: "Too fast",
    message: "The descent speed was above the safe landing limit.",
    lesson: "Start braking earlier. Thrust changes velocity gradually because the lander has inertia.",
  },
  horizontalSpeed: {
    title: "Too much drift",
    message: "The lander was moving sideways too quickly at touchdown.",
    lesson: "Rotate before thrusting so the engine can reduce horizontal velocity.",
  },
  tilt: {
    title: "Unstable angle",
    message: "The lander was tilted too far when it touched down.",
    lesson: "Level the lander before the final descent. A small tilt changes thrust direction.",
  },
  outOfBounds: {
    title: "Lost trajectory",
    message: "The lander left the training area.",
    lesson: "Use shorter thrust bursts to correct drift before it becomes too large.",
  },
};

function formatMetric(value, suffix = "") {
  if (!Number.isFinite(Number(value))) return `0${suffix}`;

  return `${Number(value).toFixed(1)}${suffix}`;
}

function ResultMetric({ label, value }) {
  return (
    <Box
      sx={{
        px: 1.2,
        py: 1,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.065)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Typography
        component="div"
        sx={{
          color: "rgba(219, 238, 255, 0.58)",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 0,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography component="div" sx={{ color: "white", fontWeight: 950 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function MoonLanderSummary({ result, onReset }) {
  if (!result) return null;

  const copy = RESULT_COPY[result.reason] || RESULT_COPY.safeLanding;
  const Icon = result.success ? Sparkles : TriangleAlert;
  const metrics = result.metrics || {};
  const accent = result.success ? "#5eead4" : "#fbbf24";

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
        background:
          "radial-gradient(circle at 50% 62%, rgba(0,0,0,0.12), rgba(0,0,0,0.32))",
      }}
    >
      <Box
        sx={{
          width: "min(92vw, 500px)",
          p: { xs: 2, sm: 2.6 },
          borderRadius: 5,
          color: "white",
          backgroundColor: "rgba(4, 10, 22, 0.82)",
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 48px ${accent}22, 0 30px 90px rgba(0,0,0,0.54)`,
          backdropFilter: "blur(22px)",
          pointerEvents: "auto",
        }}
      >
        <Stack spacing={2.1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                backgroundColor: `${accent}22`,
                color: accent,
                boxShadow: `0 0 28px ${accent}33`,
              }}
            >
              <Icon size={27} aria-hidden="true" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 950,
                  letterSpacing: 0,
                  lineHeight: 1.05,
                }}
              >
                {copy.title}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: "rgba(232, 242, 255, 0.72)",
                  fontWeight: 650,
                }}
              >
                {copy.message}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              p: 1.35,
              borderRadius: 3,
              backgroundColor: "rgba(125, 211, 252, 0.08)",
              border: "1px solid rgba(125, 211, 252, 0.18)",
            }}
          >
            <Typography
              component="div"
              sx={{
                color: "#bae6fd",
                fontSize: 11,
                fontWeight: 950,
                textTransform: "uppercase",
              }}
            >
              Flight lesson
            </Typography>
            <Typography sx={{ color: "rgba(238, 247, 255, 0.84)" }}>
              {copy.lesson}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              gap: 1,
            }}
          >
            <ResultMetric label="Score" value={result.score} />
            <ResultMetric
              label="Fuel"
              value={formatMetric(metrics.fuelRemaining, "%")}
            />
            <ResultMetric
              label="V-speed"
              value={formatMetric(metrics.verticalSpeed, " m/s")}
            />
            <ResultMetric
              label="Tilt"
              value={formatMetric(metrics.tilt, " deg")}
            />
          </Box>

          <Button
            startIcon={<RotateCcw size={18} />}
            onClick={onReset}
            variant="contained"
            sx={{
              minHeight: 48,
              borderRadius: 999,
              color: "#06111f",
              fontWeight: 950,
              background:
                "linear-gradient(135deg, rgba(125, 249, 255, 1), rgba(94, 234, 212, 0.96))",
              boxShadow: "0 18px 46px rgba(94, 234, 212, 0.24)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(186, 255, 255, 1), rgba(125, 249, 220, 1))",
              },
            }}
          >
            Retry mission
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
