import { Stack } from "@mui/material";
import {
  SIMULATION_Z_INDEX,
  simulationSafeAreaOffset,
} from "./simulationSafeArea";

const POSITION_SX = {
  "top-left": {
    top: simulationSafeAreaOffset("top", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
  "top-right": {
    top: simulationSafeAreaOffset("top", "16px"),
    right: simulationSafeAreaOffset("right", "16px"),
  },
  "bottom-left": {
    bottom: simulationSafeAreaOffset("bottom", "16px"),
    left: simulationSafeAreaOffset("left", "16px"),
  },
  "bottom-right": {
    right: simulationSafeAreaOffset("right", "16px"),
    bottom: simulationSafeAreaOffset("bottom", "16px"),
  },
};

export default function SimulationFloatingActions({
  children,
  component = "div",
  position = "bottom-right",
  direction = "column",
  spacing = 1,
  sx = {},
  ...props
}) {
  return (
    <Stack
      component={component}
      direction={direction}
      spacing={spacing}
      sx={{
        position: "fixed",
        zIndex: SIMULATION_Z_INDEX.floatingActions,
        pointerEvents: "auto",
        ...POSITION_SX[position],
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}
