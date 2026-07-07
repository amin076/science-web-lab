import { Box, Stack, Typography } from "@mui/material";
import {
  AlertTriangle,
  CheckCircle2,
  Fuel,
  Navigation,
} from "lucide-react";
import { MobileHUDContainer } from "@/components/mobile";

function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function formatNumber(value, digits = 1) {
  return safeNumber(value).toFixed(digits);
}

function getFlightAnalysis(state) {
  const { lander, mission } = state;
  const descentSpeed = Math.max(0, -safeNumber(lander.velocity?.y));
  const horizontalSpeed = Math.abs(safeNumber(lander.velocity?.x));
  const tilt = Math.abs(safeNumber(lander.angle));
  const altitude = Math.max(
    0,
    safeNumber(lander.position?.y) - safeNumber(mission.world?.groundY),
  );
  const fuelPercent = Math.max(0, Math.min(100, safeNumber(lander.fuel)));
  const thresholds = mission.thresholds || {};

  const maxVertical = safeNumber(thresholds.maxVerticalSpeed, 3);
  const maxHorizontal = safeNumber(thresholds.maxHorizontalSpeed, 2);
  const maxTilt = safeNumber(thresholds.maxTilt, 8);

  let status = {
    label: "Good descent",
    detail: "Keep it steady",
    tone: "safe",
    color: "#5eead4",
    icon: CheckCircle2,
  };

  if (state.status === "ready") {
    status = {
      label: "Training mission",
      detail: "Hold thrust to slow down",
      tone: "info",
      color: "#7dd3fc",
      icon: Navigation,
    };
  } else if (fuelPercent <= 20 && state.status === "running") {
    status = {
      label: "Fuel low",
      detail: "Use short bursts",
      tone: "warning",
      color: "#fbbf24",
      icon: Fuel,
    };
  }

  if (state.status === "running" || state.status === "paused") {
    if (descentSpeed > maxVertical * 1.35) {
      status = {
        label: "Brake now",
        detail: "Vertical speed is dangerous",
        tone: "danger",
        color: "#fb7185",
        icon: AlertTriangle,
      };
    } else if (horizontalSpeed > maxHorizontal * 1.35) {
      status = {
        label: "Cancel drift",
        detail: "Reduce sideways motion",
        tone: "warning",
        color: "#fbbf24",
        icon: AlertTriangle,
      };
    } else if (tilt > maxTilt) {
      status = {
        label: "Level lander",
        detail: "Tilt is outside safe range",
        tone: "danger",
        color: "#fb7185",
        icon: AlertTriangle,
      };
    } else if (altitude < 90 && descentSpeed < maxVertical && tilt < maxTilt) {
      status = {
        label: "Soft landing",
        detail: "You are inside safe limits",
        tone: "safe",
        color: "#86efac",
        icon: CheckCircle2,
      };
    }
  }

  if (["landed", "finished"].includes(state.status)) {
    status = {
      label: "Touchdown confirmed",
      detail: "Clean landing recorded",
      tone: "success",
      color: "#86efac",
      icon: CheckCircle2,
    };
  }

  if (["crashed", "outOfFuel"].includes(state.status)) {
    status = {
      label: "Mission failed",
      detail: state.result?.reason || "Review your approach",
      tone: "danger",
      color: "#fb7185",
      icon: AlertTriangle,
    };
  }

  return {
    altitude,
    descentSpeed,
    horizontalSpeed,
    tilt,
    fuelPercent,
    maxVertical,
    maxHorizontal,
    maxTilt,
    status,
  };
}

function TelemetryPill({ label, value, color = "#eaf6ff" }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: { xs: 1, sm: 1.15 },
        py: 0.72,
        borderRadius: 999,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.035))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <Typography
        component="div"
        sx={{
          color: "rgba(218,235,255,0.5)",
          fontSize: { xs: 8, sm: 9 },
          fontWeight: 950,
          letterSpacing: 0.4,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{
          color,
          fontSize: { xs: 13, sm: 15 },
          fontWeight: 950,
          lineHeight: 1.15,
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

  const analysis = getFlightAnalysis(state);
  const StatusIcon = analysis.status.icon;
  const speedColor =
    analysis.descentSpeed > analysis.maxVertical ? "#fbbf24" : "#eaf6ff";
  const tiltColor = analysis.tilt > analysis.maxTilt ? "#fb7185" : "#eaf6ff";
  const fuelColor = analysis.fuelPercent < 22 ? "#fbbf24" : "#5eead4";

  return (
    <MobileHUDContainer
      position="top-right"
      sx={{
        top: {
          xs: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 12px)",
          md: "calc(var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) + 18px)",
        },
        left: {
          xs: "calc(var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px)) + 74px)",
          md: "auto",
        },
        right: {
          xs: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 12px)",
          md: "calc(var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px)) + 22px)",
        },
        width: {
          xs: "auto",
          md: "min(620px, calc(100vw - 520px))",
        },
        maxWidth: {
          xs: "calc(100vw - 96px)",
          md: 620,
        },
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 1.5 },
          width: "100%",
          px: { xs: 1, sm: 1.25 },
          py: { xs: 0.8, sm: 0.95 },
          borderRadius: { xs: 4, sm: 999 },
          background:
            "linear-gradient(135deg, rgba(8,18,35,0.46), rgba(8,18,35,0.24))",
          border: "1px solid rgba(180,235,255,0.18)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.16), 0 24px 80px rgba(0,0,0,0.22)",
          backdropFilter: "blur(24px) saturate(1.22)",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.9}
          sx={{ minWidth: 0, flex: { xs: "1 1 auto", sm: "0 0 auto" } }}
        >
          <Box
            sx={{
              width: { xs: 34, sm: 38 },
              height: { xs: 34, sm: 38 },
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              borderRadius: "50%",
              color: analysis.status.color,
              background: `${analysis.status.color}16`,
              border: `1px solid ${analysis.status.color}66`,
              boxShadow: `0 0 24px ${analysis.status.color}22`,
            }}
          >
            <StatusIcon size={18} aria-hidden="true" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              sx={{
                color: analysis.status.color,
                fontSize: { xs: 12, sm: 14 },
                fontWeight: 950,
                lineHeight: 1.05,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {analysis.status.label}
            </Typography>
            <Typography
              component="div"
              sx={{
                color: "rgba(226,242,255,0.64)",
                display: { xs: "none", sm: "block" },
                fontSize: 11,
                fontWeight: 800,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {analysis.status.detail}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 0.55, sm: 0.8 }}
          alignItems="center"
          sx={{ flexShrink: 0 }}
        >
          <TelemetryPill
            label="Alt"
            value={`${formatNumber(analysis.altitude, 0)}m`}
          />
          <TelemetryPill
            label="Vspd"
            value={`${formatNumber(analysis.descentSpeed, 1)}`}
            color={speedColor}
          />
          <TelemetryPill
            label="Fuel"
            value={`${formatNumber(analysis.fuelPercent, 0)}%`}
            color={fuelColor}
          />
          <TelemetryPill
            label="Tilt"
            value={`${formatNumber(analysis.tilt, 0)} deg`}
            color={tiltColor}
          />
        </Stack>
      </Box>
    </MobileHUDContainer>
  );
}
