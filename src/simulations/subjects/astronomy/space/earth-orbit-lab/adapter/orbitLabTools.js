import { createSafeToolExecutor } from "../../../../../../webmcp/registerWebMcpTools.js";

const bools = Object.fromEntries([
  "showTrails", "showVectors", "showLOS", "showOrbits", "showOnlyVisible",
  "showMoon", "showLagrangePoints", "showLabels",
].map((key) => [key, { type: "boolean" }]));

export function createOrbitLabWebMcpTools(actions) {
  return [
    {
      name: "get_orbit_lab_state",
      description: "Read the live 3D Earth Orbit Lab configuration, playback status, focused object, and simulated time.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: createSafeToolExecutor("get_orbit_lab_state", () => actions.getState()),
    },
    {
      name: "configure_orbit_lab",
      description: "Configure orbit simulation time scale, rendering options, ground telescope coordinates and visualization mode.",
      inputSchema: {
        type: "object",
        properties: {
          simMode: { type: "string", enum: ["educational", "semi", "realistic"] },
          timeScale: { type: "number", minimum: 1, maximum: 500000 },
          telescopeLat: { type: "number", minimum: -90, maximum: 90 },
          telescopeLon: { type: "number", minimum: -180, maximum: 180 },
          ...bools,
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("configure_orbit_lab", (input) => actions.configure(input)),
    },
    {
      name: "set_orbit_lab_playback",
      description: "Start or pause the Earth Orbit Lab physics simulation.",
      inputSchema: { type: "object", properties: { action: { type: "string", enum: ["run", "pause"] } }, required: ["action"], additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("set_orbit_lab_playback", ({ action }) => actions.setPlayback(action)),
    },
    {
      name: "focus_orbit_lab_object",
      description: "Focus camera on Earth, Moon, or an existing satellite body by its live ID. Use get_orbit_lab_state to discover IDs.",
      inputSchema: { type: "object", properties: { bodyId: { type: "string" } }, required: ["bodyId"], additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("focus_orbit_lab_object", ({ bodyId }) => actions.focus(bodyId)),
    },
    {
      name: "add_orbit_lab_preset",
      description: "Add or focus a predefined satellite or space telescope in the live orbit scene.",
      inputSchema: { type: "object", properties: { preset: { type: "string", enum: ["ISS", "CSS", "HST", "JWST", "Gateway", "GPS", "Starlink"] } }, required: ["preset"], additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("add_orbit_lab_preset", ({ preset }) => actions.addPreset(preset)),
    },
    {
      name: "create_orbit_lab_video",
      description: "Record a 5-60 second WebM of the actual 3D Earth Orbit Lab scene. Supports a focused target or automatic tour and landscape/portrait aspect ratios.",
      inputSchema: {
        type: "object",
        properties: {
          storyMode: { type: "string", enum: ["focus_target", "cinematic_tour"] },
          durationSeconds: { type: "number", minimum: 5, maximum: 60 },
          aspectRatio: { type: "string", enum: ["16:9", "9:16"] },
          focusTarget: { type: "string", description: "earth, moon, or a body ID returned by get_orbit_lab_state" },
          timeScale: { type: "number", minimum: 1, maximum: 500000 },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("create_orbit_lab_video", (input) => actions.startVideo(input)),
    },
    {
      name: "get_orbit_lab_video_status",
      description: "Read recording progress, error, file size and download readiness.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: createSafeToolExecutor("get_orbit_lab_video_status", () => actions.getVideoStatus()),
    },
    {
      name: "stop_orbit_lab_video",
      description: "Stop an active recording and finalize its WebM.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("stop_orbit_lab_video", () => actions.stopVideo()),
    },
    {
      name: "download_orbit_lab_video",
      description: "Download the finalized Orbit Lab WebM file after video status reports ready.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("download_orbit_lab_video", () => actions.downloadVideo()),
    },
    {
      name: "reset_orbit_lab",
      description: "Reset the simulated time and replace bodies with the initial ISS satellite.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: createSafeToolExecutor("reset_orbit_lab", () => actions.reset()),
    },
  ];
}
