import { Box } from "@mui/material";
import {
  SIMULATION_Z_INDEX,
  simulationSafeAreaOffset,
} from "./simulationSafeArea";

const PLACEMENT_SX = {
  right: {
    top: simulationSafeAreaOffset("top", "16px"),
    right: simulationSafeAreaOffset("right", "16px"),
    bottom: simulationSafeAreaOffset("bottom", "16px"),
  },
  left: {
    top: simulationSafeAreaOffset("top", "16px"),
    bottom: simulationSafeAreaOffset("bottom", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
  bottom: {
    right: simulationSafeAreaOffset("right", "16px"),
    bottom: simulationSafeAreaOffset("bottom", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
};

export default function MobileControlPanel({
  children,
  component = "aside",
  placement = "right",
  floating = true,
  width = "min(92vw, 380px)",
  scrollable = true,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        width: placement === "bottom" ? "auto" : width,
        maxWidth: "100%",
        minWidth: 0,
        maxHeight:
          placement === "bottom"
            ? "min(72dvh, 560px)"
            : "calc(100dvh - 32px - var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px)) - var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px)))",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: scrollable ? "auto" : "hidden",
        overscrollBehavior: "contain",
        borderRadius: { xs: 2, md: 3 },
        backgroundColor: "rgba(5, 10, 20, 0.72)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
        backdropFilter: "blur(18px)",
        color: "white",
        ...(floating && {
          position: "fixed",
          zIndex: SIMULATION_Z_INDEX.controls,
          ...PLACEMENT_SX[placement],
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
