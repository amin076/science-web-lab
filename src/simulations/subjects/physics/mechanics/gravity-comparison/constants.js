//src/simulations/subjects/physics/gravity-comparison/constants.js
// Simulation Constants
export const SIMULATION_MODES = {
  FREE_FALL: "freeFall",
  PROJECTILE: "projectile",
};

export const DEFAULT_SIMULATION_MODE = SIMULATION_MODES.FREE_FALL;

export const GRAVITY_WORLDS = [
  {
    id: "sun",
    name: "Sun",
    gravity: 274,
    color: "#FFD54F",
    radius: 14,
    enabled: false,
  },
  {
    id: "mercury",
    name: "Mercury",
    gravity: 3.7,
    color: "#B0BEC5",
    radius: 9,
    enabled: false,
  },
  {
    id: "venus",
    name: "Venus",
    gravity: 8.87,
    color: "#FFB74D",
    radius: 10,
    enabled: false,
  },
  {
    id: "earth",
    name: "Earth",
    gravity: 9.81,
    color: "#4CAF50",
    radius: 10,
    enabled: true,
  },
  {
    id: "moon",
    name: "Moon",
    gravity: 1.62,
    color: "#E0E0E0",
    radius: 9,
    enabled: true,
  },
  {
    id: "mars",
    name: "Mars",
    gravity: 3.71,
    color: "#D84315",
    radius: 10,
    enabled: true,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    gravity: 24.79,
    color: "#FF9800",
    radius: 12,
    enabled: true,
  },
  {
    id: "saturn",
    name: "Saturn",
    gravity: 10.44,
    color: "#FDD835",
    radius: 11,
    enabled: false,
  },
  {
    id: "uranus",
    name: "Uranus",
    gravity: 8.69,
    color: "#4DD0E1",
    radius: 10,
    enabled: false,
  },
  {
    id: "neptune",
    name: "Neptune",
    gravity: 11.15,
    color: "#1976D2",
    radius: 10,
    enabled: false,
  },
];

export const DEFAULT_FREE_FALL_SETTINGS = {
  height: 120,
};

export const DEFAULT_PROJECTILE_SETTINGS = {
  height: 0,
  speed: 45,
  angleDeg: 45,
};

export const ANIMATION_SETTINGS = {
  pixelsPerMeter: 4,
  timeScale: 0.35,
  groundPadding: 70,
  leftPadding: 80,
  maxTrailPoints: 180,
};
