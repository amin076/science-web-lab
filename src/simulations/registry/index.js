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
  mechanics: lazy(() =>
    import("@/simulations/subjects/physics/mechanics/projectile-motion")
  ),

  newSimulation: lazy(() =>
    import(
      "@/simulations/subjects/physics/mechanics/new-simulation/NewSimulationSim"
    )
  ),
  "earth-science.geology.plate-tectonics": lazy(() =>
    import("@/simulations/subjects/earth-science/geology/plate-tectonics")
  ),
};
