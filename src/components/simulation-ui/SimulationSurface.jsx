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
  contentSx = {},
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
        border: "1px solid rgba(255, 255, 255, 0.15)",
        background:
          "linear-gradient(145deg, rgba(15, 23, 42, 0.58), rgba(3, 7, 18, 0.34))",
        backdropFilter: `blur(${simulationUiTokens.blur.elevated}px) saturate(155%)`,
        WebkitBackdropFilter: `blur(${simulationUiTokens.blur.elevated}px) saturate(155%)`,
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
      <Box sx={{ position: "relative", zIndex: 1, ...contentSx }}>{children}</Box>
    </Box>
  );
}
