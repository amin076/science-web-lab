import lazyWithRetry from "@/components/system/lazyWithRetry";

export const simulationRegistry = {
  mechanics: lazyWithRetry(() =>
    import("@/simulations/subjects/physics/mechanics/projectile-motion")
  ),

  "coulomb-law-2d": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/electricity/coulomb-law-2d")
  ),

  "coulomb-law-3d": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/electricity/coulomb-law-3d")
  ),

  "earth-science.geology.plate-tectonics": lazyWithRetry(() =>
    import("@/simulations/subjects/earth-science/geology/plate-tectonics")
  ),

  "astronomy.space.solar-system": lazyWithRetry(() =>
    import("@/simulations/subjects/astronomy/space/solar-system")
  ),
};
