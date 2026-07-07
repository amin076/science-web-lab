import { Box } from "@mui/material";
import {
  SIMULATION_Z_INDEX,
  simulationSafeAreaOffset,
} from "./simulationSafeArea";

const POSITION_SX = {
  "top-left": {
    top: simulationSafeAreaOffset("top", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
  "top-center": {
    top: simulationSafeAreaOffset("top", "16px"),
    left: "50%",
    transform: "translateX(-50%)",
  },
  "top-right": {
    top: simulationSafeAreaOffset("top", "16px"),
    right: simulationSafeAreaOffset("right", "16px"),
  },
  "bottom-left": {
    bottom: simulationSafeAreaOffset("bottom", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
  "bottom-center": {
    bottom: simulationSafeAreaOffset("bottom", "16px"),
    left: "50%",
    transform: "translateX(-50%)",
  },
  "bottom-right": {
    right: simulationSafeAreaOffset("right", "16px"),
    bottom: simulationSafeAreaOffset("bottom", "16px"),
  },
};

export default function MobileHUDContainer({
  children,
  component = "div",
  position = "top-right",
  interactive = false,
  sx = {},
  ...props
}) {
  return (
    <Box
      component={component}
      sx={{
        position: "fixed",
        zIndex: SIMULATION_Z_INDEX.hud,
        maxWidth: "min(92vw, 420px)",
        minWidth: 0,
        pointerEvents: interactive ? "auto" : "none",
        color: "white",
        ...POSITION_SX[position],
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
