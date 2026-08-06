/**
 * schema.js
 * Define default params + control UI schema + HUD schema + chart settings.
 *
 * Simulation: Gearbox & Differential (3D)
 * Registry Key: physics.mechanics.gearbox-differential-3d
 *
 * Keep this file aligned with spec.md. If keys drift, your UI and HUD will break.
 */

export const DEFAULT_PARAMS = {
  inputRPM: 1200,
  gearRatio: 2.5,
  finalDriveRatio: 3.2,

  reverse: true,

  turning: false,
  turnFactor: 0.25,

  diffLocked: false,

  showLabels: false,
};

export const CONTROL_SCHEMA = [
  {
    key: "inputRPM",
    label: "Input RPM",
    unit: "rpm",
    type: "number",
    min: 0,
    max: 6000,
    step: 50,
    defaultValue: DEFAULT_PARAMS.inputRPM,
    help: "Motor/shaft input speed.",
  },
  {
    key: "gearRatio",
    label: "Gear Ratio",
    unit: ":1",
    type: "number",
    min: 0.5,
    max: 6.0,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.gearRatio,
    help: "Higher ratio reduces output speed (and increases torque qualitatively).",
  },
  {
    key: "finalDriveRatio",
    label: "Final Drive Ratio",
    unit: ":1",
    type: "number",
    min: 1.0,
    max: 6.0,
    step: 0.1,
    defaultValue: DEFAULT_PARAMS.finalDriveRatio,
    help: "Differential/final reduction ratio.",
  },
  {
    key: "reverse",
    label: "Reverse",
    type: "toggle",
    help: "Flip output direction (sign).",
  },
  {
    key: "turning",
    label: "Turning",
    type: "toggle",
    help: "Enable left/right wheel speed split (open diff behavior).",
  },
  {
    key: "turnFactor",
    label: "Turn Factor",
    type: "number",
    min: 0.0,
    max: 0.8,
    step: 0.01,
    defaultValue: DEFAULT_PARAMS.turnFactor,
    help: "Split magnitude when turning (0 = straight).",
  },
  {
    key: "diffLocked",
    label: "Diff Locked",
    type: "toggle",
    help: "If locked, left and right wheel RPM remain equal.",
  },
  {
    key: "showLabels",
    label: "Show Labels",
    type: "toggle",
    help: "Show RPM and direction labels in the 3D scene.",
  },
];

export const HUD_SCHEMA = [
  { key: "t", label: "t", unit: "s", precision: 3 },

  { key: "inputRPM", label: "Input", unit: "rpm", precision: 0 },
  { key: "gearboxOutRPM", label: "Gearbox Out", unit: "rpm", precision: 2 },
  { key: "finalOutRPM", label: "Final Out", unit: "rpm", precision: 2 },

  { key: "leftWheelRPM", label: "Left Wheel", unit: "rpm", precision: 2 },
  { key: "rightWheelRPM", label: "Right Wheel", unit: "rpm", precision: 2 },

  { key: "direction", label: "Direction", unit: "", precision: 0 },
  { key: "mode", label: "Mode", unit: "", precision: 0 },
];

export const DEFAULT_CHART_CONFIG = {
  sampleRate: 30, // Hz
  windowSec: 10, // seconds
  get maxPoints() {
    return Math.max(60, Math.floor(this.sampleRate * this.windowSec));
  },
};
