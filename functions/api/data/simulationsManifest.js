/* eslint-env node */

const simulationsManifest = [
  {
    id: "physics.mechanics.projectile",
    name: "Projectile Motion",
    subject: "Physics",
    category: "Mechanics",
    status: "available",
    runPath: "/experiments/physics.mechanics.projectile/run",
  },
  {
    id: "physics.mechanics.gravity-comparison",
    name: "Gravity Comparison",
    subject: "Physics",
    category: "Mechanics",
    status: "available",
    runPath: "/experiments/physics.mechanics.gravity-comparison/run",
  },
  {
    id: "astronomy.space.solar-system",
    name: "Solar System",
    subject: "Astronomy",
    category: "Space",
    status: "available",
    runPath: "/experiments/astronomy.space.solar-system/run",
  },
  {
    id: "astronomy.space.earth-orbit-lab",
    name: "Earth Orbit Lab",
    subject: "Astronomy",
    category: "Space",
    status: "available",
    runPath: "/experiments/astronomy.space.earth-orbit-lab/run",
  },
  {
    id: "physics.acoustics.doppler",
    name: "Doppler Effect",
    subject: "Physics",
    category: "Acoustics",
    status: "available",
    runPath: "/experiments/physics.acoustics.doppler/run",
  },
];

module.exports = {
  simulationsManifest,
};