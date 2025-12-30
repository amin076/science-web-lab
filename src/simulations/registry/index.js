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
  "physics.mechanics.spring-mass": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/mechanics/spring-mass")
  ),
  "physics.waves.surface-waves-double-slit": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/waves/surface-waves-double-slit")
  ),
  "astronomy.space.satellites-telescopes": lazyWithRetry(() =>
    import("@/simulations/subjects/astronomy/space/satellites-telescopes")
  ),
  "astronomy.space.earth-orbit-lab": lazyWithRetry(() =>
    import("@/simulations/subjects/astronomy/space/earth-orbit-lab")
  ),
  "physics.optics.lens-mirror-2d": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/optics/lens-mirror-2d")
  ),
  "physics.optics.lens-mirror-3d": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/optics/lens-mirror-3d")
  ),
  "physics.mechanics.seesaw": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/mechanics/seesaw")
  ),
  "physics.electricity.circuits": lazyWithRetry(() =>
    import("@/simulations/subjects/physics/electricity/circuits")
  ),
};
