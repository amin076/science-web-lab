import { Box, Stack, Typography } from "@mui/material";
import { MobileHUDContainer } from "@/components/mobile";

function formatNumber(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

function HudMetric({ label, value }) {
  return (
    <Box
      sx={{
        minWidth: { xs: 76, sm: 92 },
        px: 1.25,
        py: 0.9,
        borderRadius: 2,
        backgroundColor: "rgba(5, 12, 28, 0.66)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Typography
        component="div"
        sx={{
          color: "rgba(215, 238, 255, 0.62)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ color: "white", fontSize: { xs: 14, sm: 17 }, fontWeight: 900 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function MoonLanderHUD({ state }) {
  if (!state) return null;

  const { lander, mission } = state;
  const speed = Math.sqrt(
    lander.velocity.x * lander.velocity.x + lander.velocity.y * lander.velocity.y
  );
  const altitude = Math.max(0, lander.position.y - mission.world.groundY);

  return (
    <MobileHUDContainer
      position="top-right"
      sx={{
        right: {
          xs: "var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 12px))",
          md: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 18px)",
        },
        top: {
          xs: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 10px)",
          md: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 18px)",
        },
      }}
    >
      <Stack
        direction={{ xs: "row", sm: "row" }}
        spacing={1}
        sx={{
          maxWidth: "calc(100vw - 24px)",
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        <HudMetric label="Status" value={state.status} />
        <HudMetric label="Altitude" value={`${formatNumber(altitude)} m`} />
        <HudMetric label="Speed" value={`${formatNumber(speed)} m/s`} />
        <HudMetric label="Fuel" value={`${formatNumber(lander.fuel, 0)}%`} />
        <HudMetric label="Tilt" value={`${formatNumber(Math.abs(lander.angle), 0)}°`} />
      </Stack>
    </MobileHUDContainer>
  );
}
