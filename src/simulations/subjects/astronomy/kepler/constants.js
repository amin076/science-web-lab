//src/simulations/subjects/astronomy/kepler/constants.js
export const COLORS = {
  background: "#0f172a", // Slate 900
  star: "#fbbf24", // Amber 400
  planet: "#38bdf8", // Sky 400
  trail: "rgba(56, 189, 248, 0.3)",
  vector: "#ef4444", // Red 500
  sweep: "rgba(168, 85, 247, 0.25)", // Purple slice
  grid: "rgba(255, 255, 255, 0.05)",
  text: "#94a3b8",
};

export const PHYSICS = {
  G: 1000, // Scaled gravitational constant for pixel space
  STAR_MASS: 1000, // Arbitrary mass units
  DT: 1 / 60, // Fixed time step
  MAX_TRAIL: 300, // Trail length
};
