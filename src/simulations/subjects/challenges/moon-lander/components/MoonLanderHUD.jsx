import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { MobileHUDContainer } from "@/components/mobile";

function formatNumber(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

function getFlightCue(state, speed, tilt, horizontalSpeed) {
  const { thresholds } = state.mission;

  if (state.status === "ready") {
    return { label: "Training ready", color: "#7dd3fc" };
  }

  if (speed > thresholds.maxVerticalSpeed * 1.4) {
    return { label: "Brake descent", color: "#fbbf24" };
  }

  if (horizontalSpeed > thresholds.maxHorizontalSpeed * 1.4) {
    return { label: "Cancel drift", color: "#fbbf24" };
  }

  if (tilt > thresholds.maxTilt) {
    return { label: "Level lander", color: "#fb7185" };
  }

  return { label: "Good approach", color: "#5eead4" };
}

function TelemetryValue({ label, value, tone = "rgba(255,255,255,0.94)" }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="div"
        sx={{
          color: "rgba(215, 232, 255, 0.56)",
          fontSize: { xs: 9, sm: 10 },
          fontWeight: 900,
          letterSpacing: 0,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{
          color: tone,
          fontSize: { xs: 14, sm: 16 },
          fontWeight: 950,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function MoonLanderHUD({ state }) {
  if (!state) return null;

  const { lander, mission } = state;
  const descentSpeed = Math.max(0, -lander.velocity.y);
  const horizontalSpeed = Math.abs(lander.velocity.x);
  const tilt = Math.abs(lander.angle);
  const altitude = Math.max(0, lander.position.y - mission.world.groundY);
  const fuelPercent = Math.max(0, Math.min(100, lander.fuel));
  const cue = getFlightCue(state, descentSpeed, tilt, horizontalSpeed);
  const speedTone =
    descentSpeed > mission.thresholds.maxVerticalSpeed ? "#fbbf24" : "#ffffff";
  const tiltTone = tilt > mission.thresholds.maxTilt ? "#fb7185" : "#ffffff";

  return (
    <MobileHUDContainer
      position="top-right"
      sx={{
        top: {
          xs: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 12px)",
          md: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 18px)",
        },
        right: {
          xs: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 12px)",
          md: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 18px)",
        },
        maxWidth: { xs: "calc(100vw - 24px)", md: 520 },
      }}
    >
      <Box
        sx={{
          minWidth: { xs: 278, sm: 430 },
          px: { xs: 1.25, sm: 1.5 },
          py: 1.1,
          borderRadius: 999,
          backgroundColor: "rgba(4, 11, 25, 0.72)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: "0 18px 54px rgba(0,0,0,0.28)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.1, sm: 1.7 }}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              flexShrink: 0,
              px: 1.15,
              py: 0.7,
              borderRadius: 999,
              color: cue.color,
              backgroundColor: "rgba(255,255,255,0.07)",
              border: `1px solid ${cue.color}55`,
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 950,
              lineHeight: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {cue.label}
          </Box>

          <TelemetryValue
            label="Alt"
            value={`${formatNumber(altitude, 0)} m`}
          />
          <TelemetryValue
            label="V-spd"
            value={`${formatNumber(descentSpeed)} m/s`}
            tone={speedTone}
          />
          <TelemetryValue
            label="Tilt"
            value={`${formatNumber(tilt, 0)} deg`}
            tone={tiltTone}
          />

          <Box sx={{ width: { xs: 54, sm: 82 }, flexShrink: 0 }}>
            <Typography
              component="div"
              sx={{
                color: "rgba(215, 232, 255, 0.56)",
                fontSize: 9,
                fontWeight: 900,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              Fuel {formatNumber(fuelPercent, 0)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={fuelPercent}
              sx={{
                mt: 0.6,
                height: 5,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background:
                    fuelPercent < 22
                      ? "linear-gradient(90deg, #fb7185, #fbbf24)"
                      : "linear-gradient(90deg, #5eead4, #38bdf8)",
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    </MobileHUDContainer>
  );
}
