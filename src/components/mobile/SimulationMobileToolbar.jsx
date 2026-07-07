import { Box } from "@mui/material";
import {
  SIMULATION_Z_INDEX,
  simulationSafeAreaOffset,
} from "./simulationSafeArea";

const PLACEMENT_SX = {
  top: {
    top: simulationSafeAreaOffset("top", "12px"),
    right: simulationSafeAreaOffset("right", "12px"),
    left: simulationSafeAreaOffset("left", "12px"),
  },
  bottom: {
    right: simulationSafeAreaOffset("right", "12px"),
    bottom: simulationSafeAreaOffset("bottom", "12px"),
    left: simulationSafeAreaOffset("left", "12px"),
  },
};

export default function SimulationMobileToolbar({
  children,
  component = "div",
  placement = "bottom",
  floating = true,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        minHeight: "var(--esbiko-touch-target, 44px)",
        minWidth: 0,
        px: { xs: 1, sm: 1.5 },
        py: 1,
        overflowX: "auto",
        overflowY: "hidden",
        overscrollBehaviorX: "contain",
        borderRadius: 999,
        backgroundColor: "rgba(5, 10, 20, 0.68)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
        backdropFilter: "blur(16px)",
        color: "white",
        ...(floating && {
          position: "fixed",
          zIndex: SIMULATION_Z_INDEX.toolbar,
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
