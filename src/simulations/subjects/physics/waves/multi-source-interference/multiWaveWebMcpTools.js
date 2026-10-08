import { createSafeToolExecutor } from "../../../../../webmcp/registerWebMcpTools.js";
import { SOURCE_MOTION_PRESETS } from "./MultiWavePhysics.js";
import { WATER_ART_PRESETS, CAUSTIC_STYLE_PRESETS } from "./MultiWaveWaterRender.js";

export const MULTI_WAVE_ID = "physics.waves.multi-source-interference";
const motionNames = SOURCE_MOTION_PRESETS.map((item) => item.value);
const waterNames = WATER_ART_PRESETS.map((item) => item.value);
const causticNames = CAUSTIC_STYLE_PRESETS.map((item) => item.value);

const number = (minimum, maximum) => ({ type: "number", minimum, maximum });
const option = (values) => ({ type: "string", enum: values });
const sourceFields = Object.freeze({
  x: number(0.04, 0.96), y: number(0.04, 0.96),
  frequency: number(0.5, 4), amplitude: number(0.1, 5),
  phase: number(-6.2832, 6.2832), active: { type: "boolean" },
  motion: option(motionNames), motionSpeed: number(0.02, 0.8),
  motionRadius: number(0.02, 0.32), motionPhase: number(-100, 100),
  sourceSize: number(0.05, 1.5), pulseEnabled: { type: "boolean" },
  pulseOnTime: number(0.02, 1), pulseOffTime: number(0, 3),
});
const visualFields = Object.freeze({
  preset: option(waterNames), causticStyle: option(causticNames),
  bloom: number(0.2, 3), depth: number(0.2, 2.4),
  contrast: number(0.5, 2.6), caustics: number(0, 1.1),
  colorShift: number(0, 1), orbGlow: number(0.1, 3),
  highlightSoftness: number(0, 1), surfaceDetail: number(0, 1.4),
  lightAngle: number(-1, 1), backgroundGlow: number(0, 1.4),
});
const configurationFields = Object.freeze({
  renderMode: option(["pattern", "water"]), waveSpeed: number(10, 30),
  damping: number(0, 0.1), ...visualFields,
});
const videoFields = Object.freeze({
  durationSeconds: number(5, 600), fps: { type: "number", enum: [30, 60], minimum: 30, maximum: 60 },
  aspectRatio: option(["16:9", "9:16"]),
});

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}
export function validateWavePatch(input, fields, { required = [], allowEmpty = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    fail("INVALID_INPUT", "Expected an object of simulation parameters.");
  }
  for (const name of required) {
    if (!Object.prototype.hasOwnProperty.call(input, name)) {
      fail("MISSING_PARAMETER", "Missing required parameter: " + name);
    }
  }
  if (!allowEmpty && Object.keys(input).length === 0) {
    fail("EMPTY_CONFIGURATION", "At least one parameter is required.");
  }
  for (const [key, value] of Object.entries(input)) {
    const rule = fields[key];
    if (!rule) fail("UNKNOWN_PARAMETER", "Unsupported parameter: " + key);
    if (rule.type === "number" && (
      typeof value !== "number" || !Number.isFinite(value) ||
      value < rule.minimum || value > rule.maximum
    )) fail("PARAMETER_OUT_OF_RANGE", key + " is outside the allowed numeric range.");
    if (rule.type === "boolean" && typeof value !== "boolean") {
      fail("INVALID_PARAMETER", key + " must be boolean.");
    }
    if (Array.isArray(rule.enum) && !rule.enum.includes(value)) {
      fail("INVALID_PARAMETER", key + " must be one of " + rule.enum.join(", "));
    }
  }
  return input;
}
const spec = (properties, required = []) => ({
  type: "object", properties, ...(required.length ? { required } : {}), additionalProperties: false,
});
const tool = (name, description, inputSchema, readonly, handler) => ({
  name, description, inputSchema, annotations: { readOnlyHint: readonly },
  execute: createSafeToolExecutor(name, handler),
});

export function createMultiWaveWebMcpTools(actions) {
  return [
    tool("get_multi_source_state", "Read the live shared multi-source interference state, moving wave sources, medium, visual style, recording configuration and video status.", spec({}), true, () => actions.getState()),
    tool("configure_multi_source", "Configure water/pattern rendering, wave propagation/damping and every cinematic water appearance setting.", spec(configurationFields), false,
      (input) => actions.configure(validateWavePatch(input, configurationFields))),
    tool("set_multi_source_playback", "Run, pause, or reset the actual interference physics simulation.", spec({ action: option(["run", "pause", "reset"]) }, ["action"]), false,
      (input) => { validateWavePatch(input, { action: option(["run", "pause", "reset"]) }, { required: ["action"] }); return actions.playback(input.action); }),
    tool("add_multi_source_source", "Add a new wave source with frequency, amplitude, position, phase, motion, size and pulse controls.", spec(sourceFields), false,
      (input) => actions.addSource(validateWavePatch(input, sourceFields, { allowEmpty: true }))),
    tool("update_multi_source_source", "Update a source by the numeric sourceId returned by get_multi_source_state. Can change any source property including pulse, motion and position.", spec({ sourceId: number(1, 1000000), ...sourceFields }, ["sourceId"]), false,
      ({ sourceId, ...patch }) => { validateWavePatch({ sourceId, ...patch }, { sourceId: number(1, 1000000), ...sourceFields }, { required: ["sourceId"] }); if (!Object.keys(patch).length) fail("EMPTY_CONFIGURATION", "Source changes are required."); return actions.updateSource(sourceId, patch); }),
    tool("remove_multi_source_source", "Remove a wave source by its numeric ID. At least one source must remain.", spec({ sourceId: number(1, 1000000) }, ["sourceId"]), false,
      (input) => { validateWavePatch(input, { sourceId: number(1, 1000000) }, { required: ["sourceId"] }); return actions.removeSource(input.sourceId); }),
    tool("configure_multi_source_video", "Configure video duration (5–600 seconds), FPS (30/60) and 16:9 or 9:16 output; changes are reflected in the human interface.", spec(videoFields), false,
      (input) => actions.configureVideo(validateWavePatch(input, videoFields))),
    tool("start_multi_source_video", "Start a real browser WebM capture of the live wave scene, at 16:9 landscape or 9:16 vertical, with configured duration/FPS. Completed clips can be downloaded.", spec(videoFields), false,
      (input) => actions.startVideo(validateWavePatch(input, videoFields, { allowEmpty: true }))),
    tool("get_multi_source_video_status", "Inspect live recording progress, output format, errors and last completed clip metadata.", spec({}), true,
      () => actions.getVideoStatus()),
    tool("stop_multi_source_video", "Stop a running recording and finalize its WebM output.", spec({}), false,
      () => actions.stopVideo()),
    tool("download_multi_source_video", "Download the latest finalized multi-source interference WebM recording.", spec({}), false,
      () => actions.downloadVideo()),
  ];
}
