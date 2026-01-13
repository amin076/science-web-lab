/**
 * schema.js
 * Pulley System / Block and Tackle
 */

export const DEFAULT_PARAMS = {
  config: "bt2", // Default to 2x2
  loadMass: 50, // kg
  effortForce: 150, // N
  g: 9.81, // m/s^2
  efficiency: 1.0, // [0.5..1]
  damping: 10, // N*s/m
  showForces: true,
};

export const CONTROL_SCHEMA = [
  {
    key: "config",
    label: "System Configuration",
    type: "select", // We will render this specially in Controls.jsx
    layout: "inline", // Hint to use buttons
    defaultValue: DEFAULT_PARAMS.config,
    options: [
      { value: "fixed", label: "Fixed (MA=1)" },
      { value: "movable", label: "Movable (MA=2)" },
      { value: "bt_luff", label: "Luff (MA=3)" },
      { value: "bt2", label: "Double (MA=4)" },
      { value: "bt_gyn", label: "Gyn (MA=5)" },
      { value: "bt3", label: "Triple (MA=6)" },
    ],
    help: "Select a pulley arrangement.",
  },
  {
    key: "loadMass",
    label: "Load Mass",
    unit: "kg",
    type: "number",
    min: 1,
    max: 500,
    step: 1,
    defaultValue: DEFAULT_PARAMS.loadMass,
  },
  {
    key: "effortForce",
    label: "Effort Force",
    unit: "N",
    type: "number",
    min: 0,
    max: 2000,
    step: 5,
    defaultValue: DEFAULT_PARAMS.effortForce,
    help: "Pulling force applied on the free end of the rope.",
  },
  {
    key: "g",
    label: "Gravity",
    unit: "m/s²",
    type: "number",
    min: 0,
    max: 20,
    step: 0.01,
    defaultValue: DEFAULT_PARAMS.g,
  },
  {
    key: "efficiency",
    label: "Efficiency",
    unit: "—",
    type: "number",
    min: 0.5,
    max: 1.0,
    step: 0.01,
    defaultValue: DEFAULT_PARAMS.efficiency,
    help: "Loss factor (1.0 = ideal).",
  },
  {
    key: "damping",
    label: "Damping",
    unit: "N·s/m",
    type: "number",
    min: 0,
    max: 200,
    step: 1,
    defaultValue: DEFAULT_PARAMS.damping,
    help: "Viscous damping on the moving block/load.",
  },
  {
    key: "showForces",
    label: "Show forces",
    type: "toggle",
    help: "Draw weight and lift arrows.",
  },
];

export const HUD_SCHEMA = [
  { key: "t", label: "t", unit: "s", precision: 2 },
  { key: "configLabel", label: "Config", unit: "", precision: 0 },
  { key: "status", label: "Status", unit: "", precision: 0 },
  { key: "MA", label: "MA", unit: "—", precision: 0 },
  { key: "T", label: "Tension", unit: "N", precision: 1 },
  { key: "W", label: "Weight", unit: "N", precision: 1 },
  { key: "F_up", label: "Lift", unit: "N", precision: 1 },
  { key: "y", label: "Height", unit: "m", precision: 2 },
  { key: "v", label: "Velocity", unit: "m/s", precision: 2 },
  { key: "a", label: "Accel", unit: "m/s²", precision: 2 },
];

export const DEFAULT_CHART_CONFIG = {
  sampleRate: 30,
  windowSec: 10,
  get maxPoints() {
    return Math.max(60, Math.floor(this.sampleRate * this.windowSec));
  },
};
