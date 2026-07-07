const SIMULATION_SAFE_AREA_VARS = {
  top: "var(--esbiko-simulation-safe-top, var(--esbiko-safe-top, 0px))",
  right: "var(--esbiko-simulation-safe-right, var(--esbiko-safe-right, 0px))",
  bottom:
    "var(--esbiko-simulation-safe-bottom, var(--esbiko-safe-bottom, 0px))",
  left: "var(--esbiko-simulation-safe-left, var(--esbiko-safe-left, 0px))",
};

export const SIMULATION_Z_INDEX = {
  hud: 1350,
  controls: 1360,
  toolbar: 1370,
  floatingActions: 1380,
};

export function simulationSafeArea(edge) {
  return SIMULATION_SAFE_AREA_VARS[edge] || "0px";
}

export function simulationSafeAreaOffset(edge, offset = "0px") {
  return `calc(${simulationSafeArea(edge)} + ${offset})`;
}

export function simulationSafeAreaPadding(offset = "0px") {
  return {
    pt: simulationSafeAreaOffset("top", offset),
    pr: simulationSafeAreaOffset("right", offset),
    pb: simulationSafeAreaOffset("bottom", offset),
    pl: simulationSafeAreaOffset("left", offset),
  };
}
