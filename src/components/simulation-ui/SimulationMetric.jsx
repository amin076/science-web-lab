import { Box, Stack, Typography } from "@mui/material";
import { getSimulationDomainTheme, simulationUiTokens } from "./simulationUiTokens";

export default function SimulationMetric({
  label,
  value,
  unit,
  helperText,
  icon,
  domain = "default",
  emphasis = false,
  sx = {},
}) {
  const domainTheme = getSimulationDomainTheme(domain);

  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 82,
        p: 1.5,
        borderRadius: simulationUiTokens.radius.control,
        border: `1px solid ${emphasis ? domainTheme.accentSoft : "rgba(148, 163, 184, 0.14)"}`,
        background: emphasis
          ? `linear-gradient(145deg, ${domainTheme.accentSoft}, rgba(15, 23, 42, 0.62))`
          : "rgba(15, 23, 42, 0.54)",
        backdropFilter: "blur(12px)",
        ...sx,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        {icon && (
          <Box sx={{ color: domainTheme.accent, display: "grid", placeItems: "center" }}>
            {icon}
          </Box>
        )}
        <Box minWidth={0} flex={1}>
          <Typography
            sx={{
              color: "rgba(203, 213, 225, 0.64)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.6} flexWrap="wrap">
            <Typography
              sx={{
                mt: 0.45,
                color: "rgba(248, 250, 252, 0.98)",
                fontSize: emphasis ? 24 : 20,
                fontWeight: 850,
                lineHeight: 1.15,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </Typography>
            {unit && (
              <Typography sx={{ color: domainTheme.accent, fontSize: 12, fontWeight: 750 }}>
                {unit}
              </Typography>
            )}
          </Stack>
          {helperText && (
            <Typography sx={{ mt: 0.5, color: "rgba(203, 213, 225, 0.58)", fontSize: 11 }}>
              {helperText}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
