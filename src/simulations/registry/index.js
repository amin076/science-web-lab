// src/simulations/registry/index.js
import { lazy } from "react";

/**
 * Registry format:
 * key = experiment id (must match src/data/experiments.js)
 * value = React component (lazy-loaded)
 *
 * NOTE:
 * - Keep keys stable forever once published (used by DB paths and URLs)
 */

export const simulationRegistry = {
  mechanics: lazy(() => import("@/simulations/physics/ProjectileMotion")),

  // ✅ example new one (you already created):
  newSimulation: lazy(() =>
    import("@/components/simulations/newSimulation/NewSimulationSim")
  ),
};
