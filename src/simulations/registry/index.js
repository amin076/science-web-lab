import { lazy } from "react";

export const simulationRegistry = {
  mechanics: lazy(() =>
    import("@/simulations/subjects/physics/mechanics/projectile-motion")
  ),

  "coulomb-law-2d": lazy(() =>
    import("@/simulations/subjects/physics/electricity/coulomb-law-2d")
  ),

  "coulomb-law-3d": lazy(() =>
    import("@/simulations/subjects/physics/electricity/coulomb-law-3d")
  ),

  "earth-science.geology.plate-tectonics": lazy(() =>
    import("@/simulations/subjects/earth-science/geology/plate-tectonics")
  ),
};
