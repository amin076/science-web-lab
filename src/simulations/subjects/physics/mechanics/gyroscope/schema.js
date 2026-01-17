// src/simulations/subjects/physics/mechanics/gyroscope/schema.js

export const DEFAULT_PARAMS = {
  mass: 1.0,        // kg
  diskRadius: 0.25, // m (matches our model visual)
  rodLength: 0.4,   // m (matches our model visual)
  spinSpeed: 10.0,  // rad/s
  tilt: 30,         // degrees
  showVectors: true,
};

export const CONTROL_SCHEMA = [
  {
    key: "spinSpeed",
    label: "Spin Speed (ω)",
    unit: "rad/s",
    type: "number",
    min: 0,
    max: 50,
    step: 1,
    defaultValue: DEFAULT_PARAMS.spinSpeed,
  },
  {
    key: "tilt",
    label: "Tilt Angle",
    unit: "deg",
    type: "number",
    min: 0,
    max: 85,
    step: 1,
    defaultValue: DEFAULT_PARAMS.tilt,
  },
  {
    key: "mass",
    label: "Disk Mass",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 5,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.mass,
  },
  {
    key: "showVectors",
    label: "Show Vectors",
    type: "toggle",
  },
];

export const HUD_SCHEMA = [
  { key: "t", label: "Time", unit: "s", precision: 2 },
  { key: "omega", label: "Spin (ω)", unit: "rad/s", precision: 2 },
  { key: "L", label: "Ang. Mom (L)", unit: "kg·m²/s", precision: 3 },
  { key: "tau", label: "Torque (τ)", unit: "N·m", precision: 3 },
  { key: "Omega", label: "Precession (Ω)", unit: "rad/s", precision: 4 },
];

export const DEFAULT_CHART_CONFIG = {
  sampleRate: 20,
  windowSec: 10,
  get maxPoints() {
    return this.sampleRate * this.windowSec;
  },
};