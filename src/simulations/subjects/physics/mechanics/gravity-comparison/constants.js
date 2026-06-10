// src/simulations/subjects/physics/mechanics/gravity-comparison/constants.js
// Constants and default settings for the Gravity Comparison simulation.

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
    radius: 13,
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
    color: "#FF5722",
    radius: 10,
    enabled: true,
  },
  {
    id: "phobos",
    name: "Phobos",
    gravity: 0.0057,
    color: "#8D6E63",
    radius: 7,
    enabled: false,
  },
  {
    id: "deimos",
    name: "Deimos",
    gravity: 0.003,
    color: "#A1887F",
    radius: 7,
    enabled: false,
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
    id: "io",
    name: "Io",
    gravity: 1.8,
    color: "#FBC02D",
    radius: 8,
    enabled: false,
  },
  {
    id: "europa",
    name: "Europa",
    gravity: 1.31,
    color: "#B0BEC5",
    radius: 8,
    enabled: false,
  },
  {
    id: "ganymede",
    name: "Ganymede",
    gravity: 1.43,
    color: "#90A4AE",
    radius: 9,
    enabled: false,
  },
  {
    id: "callisto",
    name: "Callisto",
    gravity: 1.24,
    color: "#795548",
    radius: 9,
    enabled: false,
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
    id: "titan",
    name: "Titan",
    gravity: 1.35,
    color: "#FFB300",
    radius: 9,
    enabled: false,
  },
  {
    id: "enceladus",
    name: "Enceladus",
    gravity: 0.113,
    color: "#E3F2FD",
    radius: 7,
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
  {
    id: "triton",
    name: "Triton",
    gravity: 0.779,
    color: "#B3E5FC",
    radius: 8,
    enabled: false,
  },
  {
    id: "pluto",
    name: "Pluto",
    gravity: 0.62,
    color: "#BCAAA4",
    radius: 8,
    enabled: false,
  },
];

export const DEFAULT_FREE_FALL_SETTINGS = {
  height: 85,
};

export const DEFAULT_PROJECTILE_SETTINGS = {
  height: 0,
  speed: 45,
  angleDeg: 45,
};

export const ANIMATION_SETTINGS = {
  pixelsPerMeter: 5.2,
  timeScale: 0.35,

  groundPadding: 80,

  leftPadding: 120,

  maxTrailPoints: 900,

  laneSpacing:65,

  maxVisibleLanes: 6,
};
