import { IconButton, Tooltip } from "@mui/material";
import {
  getSimulationDomainTheme,
  simulationUiTokens,
} from "./simulationUiTokens";

export default function SimulationIconButton({
  label,
  children,
  domain = "default",
  selected = false,
  sx = {},
  ...props
}) {
  const domainTheme = getSimulationDomainTheme(domain);

  const button = (
    <IconButton
      aria-label={label}
      sx={{
        width: simulationUiTokens.control.minTouchSize,
        height: simulationUiTokens.control.minTouchSize,
        borderRadius: `${simulationUiTokens.radius.control}px`,
        color: selected ? "#fff" : "rgba(226, 232, 240, 0.82)",
        border: `1px solid ${
          selected ? domainTheme.accent : "rgba(148, 163, 184, 0.18)"
        }`,
        background: selected
          ? domainTheme.accentSoft
          : "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(12px)",
        transition: `transform ${simulationUiTokens.motion.fast}ms ease, background ${simulationUiTokens.motion.fast}ms ease`,
        "&:hover": {
          background: domainTheme.accentSoft,
          transform: "translateY(-1px)",
        },
        "&:focus-visible": {
          boxShadow: simulationUiTokens.shadow.focus,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );

  return label ? <Tooltip title={label}>{button}</Tooltip> : button;
}
