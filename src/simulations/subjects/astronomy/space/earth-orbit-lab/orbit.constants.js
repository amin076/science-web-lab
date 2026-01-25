// src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.constants.js

export const OBJECT_INFO = {
  EARTH: {
    title: "Earth",
    subtitle: "Home Planet",
    description:
      "The third planet from the Sun. In this simulation, we use a Spherical Earth model scaled to 1 render unit radius.",
    stats: [
      { label: "Radius", value: "6,371 km" },
      { label: "Day Length", value: "23h 56m 4s" },
      { label: "Axial Tilt", value: "23.5°" },
      { label: "Surface Gravity", value: "9.8 m/s²" },
    ],
  },
  MOON: {
    title: "The Moon",
    subtitle: "Earth's Natural Satellite",
    description:
      "Earth's only natural satellite. The simulation calculates its position using orbital mechanics relative to Earth.",
    stats: [
      { label: "Radius", value: "1,737 km" },
      { label: "Orbital Period", value: "27.3 days" },
      { label: "Avg Distance", value: "384,400 km" },
      { label: "Gravity", value: "1.62 m/s²" },
    ],
  },
  ISS: {
    title: "International Space Station",
    subtitle: "Habitable Artificial Satellite",
    description:
      "A modular space station in low Earth orbit. It serves as a microgravity and space environment research laboratory.",
    stats: [
      { label: "Launch Date", value: "Nov 1998" },
      { label: "Avg Speed", value: "7.66 km/s" },
      { label: "Orbital Period", value: "~93 min" },
      { label: "Altitude", value: "~420 km" },
    ],
  },
  "Tiangong": {
    title: "Tiangong Space Station",
    subtitle: "Chinese Space Station",
    description:
      "A space station constructed by China in low Earth orbit between 340 and 450 km above the surface.",
    stats: [
      { label: "Launch Date", value: "Apr 2021" },
      { label: "Mass", value: "~100t" },
      { label: "Inclination", value: "41.5°" },
    ],
  },
  "Hubble": {
    title: "Hubble Space Telescope",
    subtitle: "Visible Light Telescope",
    description:
      "A space telescope that was launched into low Earth orbit in 1990 and remains in operation.",
    stats: [
      { label: "Launch Date", value: "Apr 1990" },
      { label: "Altitude", value: "~540 km" },
      { label: "Mirror", value: "2.4 m" },
    ],
  },
  "James Webb": {
    title: "James Webb Space Telescope",
    subtitle: "Infrared Observatory",
    description:
      "Orbits the Sun-Earth L2 Lagrange point (simulated here as a high altitude orbit). It observes infrared light.",
    stats: [
      { label: "Launch Date", value: "Dec 2021" },
      { label: "Distance", value: "1.5M km" },
      { label: "Mirror", value: "6.5 m" },
    ],
  },
  GENERIC: {
    title: "Satellite",
    subtitle: "Artificial Orbiter",
    description: "An object intentionally placed into orbit.",
    stats: [],
  },
};