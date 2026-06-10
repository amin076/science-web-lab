//src/simulations/registry/index.js
// Central registry for all simulations in the Science Web Lab, using lazy loading for performance optimization.
import lazyWithRetry from "@/components/system/lazyWithRetry";

export const simulationRegistry = {
  "physics.mechanics.projectile": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/projectile-motion"),
  ),
  "physics.mechanics.gravity-comparison": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/gravity-comparison"),
  ),
  "physics.electricity.coulomb-law-2d": lazyWithRetry(
    () => import("@/simulations/subjects/physics/electricity/coulomb-law-2d"),
  ),
  "physics.electricity.coulomb-law-3d": lazyWithRetry(
    () => import("@/simulations/subjects/physics/electricity/coulomb-law-3d"),
  ),

  "earth-science.geology.plate-tectonics": lazyWithRetry(
    () =>
      import("@/simulations/subjects/earth-science/geology/plate-tectonics"),
  ),

  "astronomy.space.solar-system": lazyWithRetry(
    () => import("@/simulations/subjects/astronomy/space/solar-system"),
  ),
  "physics.mechanics.spring-mass": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/spring-mass"),
  ),
  "physics.waves.surface-waves-double-slit": lazyWithRetry(
    () =>
      import("@/simulations/subjects/physics/waves/surface-waves-double-slit"),
  ),
  "astronomy.space.satellites-telescopes": lazyWithRetry(
    () =>
      import("@/simulations/subjects/astronomy/space/satellites-telescopes"),
  ),
  "astronomy.space.earth-orbit-lab": lazyWithRetry(
    () => import("@/simulations/subjects/astronomy/space/earth-orbit-lab"),
  ),
  "physics.optics.lens-mirror-2d": lazyWithRetry(
    () => import("@/simulations/subjects/physics/optics/lens-mirror-2d"),
  ),
  "physics.optics.lens-mirror-3d": lazyWithRetry(
    () => import("@/simulations/subjects/physics/optics/lens-mirror-3d"),
  ),

  "physics.mechanics.seesaw": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/seesaw"),
  ),
  "physics.electricity.circuits": lazyWithRetry(
    () => import("@/simulations/subjects/physics/electricity/circuits"),
  ),
  "physics.mechanics.collision": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/collision"),
  ),
  "physics.acoustics.doppler": lazyWithRetry(
    () => import("@/simulations/subjects/physics/acoustics/Doppler"),
  ),
  "physics.mechanics.simple-pendulum": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/pendulum"),
  ),
  "physics.thermodynamics.gas": lazyWithRetry(
    () => import("@/simulations/subjects/physics/thermodynamics/gas"),
  ),
  "physics.waves.multi-source-interference": lazyWithRetry(
    () =>
      import("@/simulations/subjects/physics/waves/multi-source-interference"),
  ),
  "physics.fluid-mechanics.archimedes-principle": lazyWithRetry(
    () =>
      import("@/simulations/subjects/physics/fluid-mechanics/archimedes-principle"),
  ),
  "physics.acoustics.sound-waves": lazyWithRetry(
    () => import("@/simulations/subjects/physics/acoustics/SoundWaves"),
  ),
  "physics.acoustics.spatial-audio": lazyWithRetry(
    () => import("@/simulations/subjects/physics/acoustics/spatial-audio"),
  ),
  "astronomy.kepler-lab": lazyWithRetry(
    () => import("@/simulations/subjects/astronomy/kepler"),
  ),
  "physics.mechanics.circular-motion": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/circular-motion"),
  ),
  "physics.mechanics.two-body-gravity": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/two-body-gravity"),
  ),
  "physics.mechanics.pulley-system": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/pulley-system"),
  ),
  "physics.mechanics.gearbox-differential-3d": lazyWithRetry(
    () =>
      import("@/simulations/subjects/physics/mechanics/gearbox-differential-3d"),
  ),
  "physics.optics.microscope": lazyWithRetry(
    () => import("@/simulations/subjects/physics/optics/microscope"),
  ),
  "physics.mechanics.gyroscope": lazyWithRetry(
    () => import("@/simulations/subjects/physics/mechanics/gyroscope"),
  ),
};
