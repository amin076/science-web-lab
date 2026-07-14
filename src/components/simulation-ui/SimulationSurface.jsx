import { Box } from "@mui/material";
import {
  getSimulationDomainTheme,
  simulationUiTokens,
} from "./simulationUiTokens";

export default function SimulationSurface({
  children,
  domain = "default",
  elevation = "surface",
  interactive = false,
  sx = {},
  ...props
}) {
  const domainTheme = getSimulationDomainTheme(domain);

  return (
    <Box
      sx={{
        position: "relative",
        minWidth: 0,
        borderRadius: simulationUiTokens.radius.panel,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background:
          "linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(3, 7, 18, 0.76))",
        backdropFilter: `blur(${simulationUiTokens.blur.surface}px)`,
        boxShadow:
          simulationUiTokens.shadow[elevation] ||
          simulationUiTokens.shadow.surface,
        overflow: "hidden",
        transition: [
          `transform ${simulationUiTokens.motion.standard}ms ease`,
          `border-color ${simulationUiTokens.motion.standard}ms ease`,
          `box-shadow ${simulationUiTokens.motion.standard}ms ease`,
        ].join(", "),
        "&::before": {
          content: "\"\"",
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at top left, ${domainTheme.accentSoft}, transparent 42%)`,
        },
        ...(interactive && {
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: domainTheme.accent,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
