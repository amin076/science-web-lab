import { Button, CircularProgress } from "@mui/material";
import {
  getSimulationDomainTheme,
  simulationUiTokens,
} from "./simulationUiTokens";

function getVariantStyles(variant, theme) {
  if (variant === "subtle") {
    return {
      color: "rgba(241, 245, 249, 0.92)",
      background: "rgba(148, 163, 184, 0.10)",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      "&:hover": { background: "rgba(148, 163, 184, 0.18)" },
    };
  }

  if (variant === "danger") {
    return {
      color: "#fff",
      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
      "&:hover": {
        background: "linear-gradient(135deg, #f87171, #dc2626)",
      },
    };
  }

  if (variant === "secondary") {
    return {
      color: theme.accent,
      background: theme.accentSoft,
      border: `1px solid ${theme.accentSoft}`,
      "&:hover": {
        background: theme.accentSoft,
        filter: "brightness(1.18)",
      },
    };
  }

  return {
    color: "#fff",
    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentStrong})`,
    "&:hover": { filter: "brightness(1.08)" },
  };
}

export default function SimulationButton({
  children,
  domain = "default",
  simulationVariant = "primary",
  loading = false,
  startIcon,
  disabled,
  sx = {},
  ...props
}) {
  const domainTheme = getSimulationDomainTheme(domain);

  return (
    <Button
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress size={17} color="inherit" /> : startIcon
      }
      sx={{
        minHeight: simulationUiTokens.control.minTouchSize,
        minWidth: simulationUiTokens.control.minTouchSize,
        px: 2,
        borderRadius: simulationUiTokens.radius.control,
        fontWeight: 700,
        letterSpacing: "0.01em",
        textTransform: "none",
        boxShadow: simulationUiTokens.shadow.control,
        transition: `transform ${simulationUiTokens.motion.fast}ms ease, filter ${simulationUiTokens.motion.fast}ms ease`,
        "&:active": { transform: "scale(0.98)" },
        "&:focus-visible": {
          boxShadow: simulationUiTokens.shadow.focus,
        },
        "&.Mui-disabled": {
          color: "rgba(226, 232, 240, 0.45)",
          background: "rgba(100, 116, 139, 0.15)",
        },
        ...getVariantStyles(simulationVariant, domainTheme),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
