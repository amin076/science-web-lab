/**
 * schema.js
 */

export const DEFAULT_PARAMS = {
  // Body 1
  m1: 100, // kg
  v1: 0, // m/s
  ang1: 90, // degrees
  x1: 0, // meters

  // Body 2
  m2: 10, // kg
  v2: 12, // m/s
  ang2: 270, // degrees
  x2: 10, // meters

  // Environment
  G: 10, // Scaled Gravitational Constant

  // Visuals
  showVectors: true,
  showTrail: true,
  showCM: true, // Center of Mass
  followCM: false, // Camera follow the center of mass
};

export const CONTROL_SCHEMA = [
  // --- Body 1 ---
  {
    key: "m1",
    label: "Mass 1",
    unit: "kg",
    type: "number",
    min: 1,
    max: 2000,
    step: 1,
    defaultValue: DEFAULT_PARAMS.m1,
  },
  {
    key: "x1",
    label: "Position X1",
    unit: "m",
    type: "number",
    min: -50,
    max: 50,
    step: 0.5,
    defaultValue: DEFAULT_PARAMS.x1,
  },
  {
    key: "v1",
    label: "Velocity 1",
    unit: "m/s",
    type: "number",
    min: 0,
    max: 100,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.v1,
  },
  {
    key: "ang1",
    label: "Angle 1",
    unit: "deg",
    type: "number",
    min: 0,
    max: 360,
    step: 15,
    defaultValue: DEFAULT_PARAMS.ang1,
  },

  // --- Body 2 ---
  {
    key: "m2",
    label: "Mass 2",
    unit: "kg",
    type: "number",
    min: 0.1,
    max: 2000,
    step: 1,
    defaultValue: DEFAULT_PARAMS.m2,
  },
  {
    key: "x2",
    label: "Position X2",
    unit: "m",
    type: "number",
    min: -50,
    max: 50,
    step: 0.5,
    defaultValue: DEFAULT_PARAMS.x2,
  },
  {
    key: "v2",
    label: "Velocity 2",
    unit: "m/s",
    type: "number",
    min: 0,
    max: 100,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.v2,
  },
  {
    key: "ang2",
    label: "Angle 2",
    unit: "deg",
    type: "number",
    min: 0,
    max: 360,
    step: 15,
    defaultValue: DEFAULT_PARAMS.ang2,
  },

  // --- Globals ---
  {
    key: "G",
    label: "Gravity Const (G)",
    type: "number",
    min: 0.1,
    max: 50,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.G,
  },
  {
    key: "showVectors",
    label: "Show Vectors",
    type: "toggle",
  },
  {
    key: "showTrail",
    label: "Show Trails",
    type: "toggle",
  },
  {
    key: "showCM",
    label: "Show Center of Mass",
    type: "toggle",
    help: "Visualizes the system's center of mass and its path",
  },
  {
    key: "followCM",
    label: "Follow Center of Mass",
    type: "toggle",
    help: "Locks the camera to the center of mass (wheel zoom still works)",
  },
];

export const HUD_SCHEMA = [
  { key: "t", label: "Time", unit: "s", precision: 2 },
  { key: "dist", label: "Distance", unit: "m", precision: 2 },

  // Velocities
  { key: "v1", label: "Speed 1", unit: "m/s", precision: 2 },
  { key: "v2", label: "Speed 2", unit: "m/s", precision: 2 },

  // Momentum
  { key: "p1", label: "Momentum 1", unit: "kg·m/s", precision: 1 },
  { key: "p2", label: "Momentum 2", unit: "kg·m/s", precision: 1 },
  { key: "pSys", label: "Sys Momentum", unit: "kg·m/s", precision: 2 },

  // Energy
  { key: "ke", label: "Total KE", unit: "J", precision: 0 },
];

export const DEFAULT_CHART_CONFIG = {
  sampleRate: 20, // Hz
  windowSec: 10,
  get maxPoints() {
    return Math.max(60, Math.floor(this.sampleRate * this.windowSec));
  },
};
