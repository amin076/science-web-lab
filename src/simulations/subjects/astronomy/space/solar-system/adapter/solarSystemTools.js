import { createSafeToolExecutor } from "../../../../../../webmcp/registerWebMcpTools.js";

export const SOLAR_FOCUS_TARGETS = Object.freeze([
  "system",
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
]);

export const SOLAR_SCALE_MODES = Object.freeze([
  "educational",
  "semiRealistic",
  "realistic",
]);

export const SOLAR_VIDEO_STORY_MODES = Object.freeze([
  "focus_target",
  "cinematic_tour",
]);

export const SOLAR_VIDEO_ASPECT_RATIOS = Object.freeze(["16:9", "9:16"]);

const visualProperties = {
  showTrails: { type: "boolean" },
  showOrbits: { type: "boolean" },
  showAxis: { type: "boolean" },
  showStars: { type: "boolean" },
  showLabels: { type: "boolean" },
};

export function createSolarSystemWebMcpTools(actions) {
  return [
    {
      name: "get_solar_system_state",
      description:
        "Read the live Solar System playback state, scale, camera focus, visual options, tour state, and video status.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: createSafeToolExecutor("get_solar_system_state", async () =>
        actions.getState(),
      ),
    },
    {
      name: "configure_solar_system",
      description:
        "Configure the visible Solar System simulation, including speed, scale mode, focus target, and visual overlays.",
      inputSchema: {
        type: "object",
        properties: {
          speed: { type: "number", minimum: 0, maximum: 30 },
          scaleMode: { type: "string", enum: SOLAR_SCALE_MODES },
          focusTarget: { type: "string", enum: SOLAR_FOCUS_TARGETS },
          ...visualProperties,
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("configure_solar_system", async (input) =>
        actions.configure(input),
      ),
    },
    {
      name: "set_solar_system_playback",
      description: "Run or pause the visible Solar System simulation.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["run", "pause"] },
        },
        required: ["action"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor(
        "set_solar_system_playback",
        async ({ action }) => actions.setPlayback(action),
      ),
    },
    {
      name: "reset_solar_system",
      description: "Reset the visible Solar System to its default educational view.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("reset_solar_system", async () =>
        actions.reset(),
      ),
    },
    {
      name: "set_solar_system_tour",
      description:
        "Start or stop Esbiko's cinematic Solar System tour. The tour automatically moves the camera through the system.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["start", "stop"] },
        },
        required: ["action"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor(
        "set_solar_system_tour",
        async ({ action }) => actions.setTour(action),
      ),
    },
    {
      name: "create_solar_system_video",
      description:
        "Record a 5–60 second WebM from the visible 3D Solar System. Use cinematic_tour for an automatically directed camera tour or focus_target to record the configured target. Supports 16:9 and 9:16.",
      inputSchema: {
        type: "object",
        properties: {
          storyMode: {
            type: "string",
            enum: SOLAR_VIDEO_STORY_MODES,
            default: "cinematic_tour",
          },
          durationSeconds: {
            type: "number",
            minimum: 5,
            maximum: 60,
            default: 20,
          },
          aspectRatio: {
            type: "string",
            enum: SOLAR_VIDEO_ASPECT_RATIOS,
            default: "16:9",
          },
          speed: { type: "number", minimum: 0.25, maximum: 30, default: 5 },
          scaleMode: {
            type: "string",
            enum: SOLAR_SCALE_MODES,
            default: "educational",
          },
          focusTarget: {
            type: "string",
            enum: SOLAR_FOCUS_TARGETS,
            default: "earth",
          },
          ...visualProperties,
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("create_solar_system_video", async (input) =>
        actions.startVideo(input),
      ),
    },
    {
      name: "get_solar_system_video_status",
      description:
        "Read the current Solar System WebM recording state, progress, file size, and download readiness.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: createSafeToolExecutor(
        "get_solar_system_video_status",
        async () => actions.getVideoStatus(),
      ),
    },
    {
      name: "stop_solar_system_video",
      description: "Stop an active Solar System recording and finalize the WebM.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("stop_solar_system_video", async () =>
        actions.stopVideo(),
      ),
    },
    {
      name: "download_solar_system_video",
      description:
        "Download the finalized Solar System WebM after video status reports ready.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: createSafeToolExecutor("download_solar_system_video", async () =>
        actions.downloadVideo(),
      ),
    },
  ];
}
