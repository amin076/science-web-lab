import { createSafeToolExecutor } from "../../../../../../webmcp/registerWebMcpTools.js";
import { DOPPLER_LIMITS } from "./dopplerAdapter.js";

export function createDopplerWebMcpTools(actions) {
  return [
    {
      name: "get_doppler_state",
      description:
        "Read the visible Doppler experiment's live parameters and calculated measurements, including emitted and observed frequency and shift.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("get_doppler_state", async () =>
        actions.getState(),
      ),
    },
    {
      name: "configure_doppler",
      description:
        "Configure one visible Doppler sound-source experiment. Motion is relative to the observer; omitted numeric values preserve the current value or use safe defaults.",
      inputSchema: {
        type: "object",
        properties: {
          motion: {
            type: "string",
            enum: ["approaching", "receding", "stationary"],
            description: "Whether the source moves toward, away from, or stays still relative to the observer.",
          },
          sourceSpeedMps: {
            type: "number",
            minimum: DOPPLER_LIMITS.sourceSpeedMps.min,
            maximum: DOPPLER_LIMITS.sourceSpeedMps.max,
            description: "Non-negative source speed in metres per second; direction comes from motion.",
          },
          emittedFrequencyHz: {
            type: "number",
            minimum: DOPPLER_LIMITS.emittedFrequencyHz.min,
            maximum: DOPPLER_LIMITS.emittedFrequencyHz.max,
            description: "Emitted pure-tone frequency in hertz.",
          },
          sourcePositionM: {
            type: "number",
            minimum: DOPPLER_LIMITS.sourcePositionM.min,
            maximum: DOPPLER_LIMITS.sourcePositionM.max,
            description: "Source position on Esbiko's 0–1000 metre horizontal coordinate.",
          },
          observerPositionM: {
            type: "number",
            minimum: DOPPLER_LIMITS.observerPositionM.min,
            maximum: DOPPLER_LIMITS.observerPositionM.max,
            description: "Observer position on Esbiko's 0–1000 metre horizontal coordinate.",
          },
          observerVelocityMps: {
            type: "number",
            minimum: DOPPLER_LIMITS.observerVelocityMps.min,
            maximum: DOPPLER_LIMITS.observerVelocityMps.max,
            description: "Signed observer velocity in metres per second; positive is rightward.",
          },
          instrument: {
            type: "string",
            enum: ["sine", "saw", "square", "organ", "brass", "drone"],
            description: "Exact-frequency sound used for the experiment.",
          },
        },
        required: ["motion"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("configure_doppler", async (input) =>
        actions.configure(input),
      ),
    },
    {
      name: "set_doppler_playback",
      description:
        "Run or pause the visible Doppler experiment. Running advances the source, observer, wavefronts, and calculated measurements.",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["run", "pause"],
            description: "Set the simulation playback state to run or pause.",
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor(
        "set_doppler_playback",
        async ({ action }) => actions.setPlayback(action),
      ),
    },
    {
      name: "reset_doppler",
      description:
        "Reset the visible Doppler experiment to scientific mode with a stationary observer, no sources, and paused playback.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("reset_doppler", async () =>
        actions.reset(),
      ),
    },
  ];
}
