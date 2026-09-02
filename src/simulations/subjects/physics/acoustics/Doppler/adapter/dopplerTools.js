import { createSafeToolExecutor } from "../../../../../../webmcp/registerWebMcpTools.js";
import {
  DOPPLER_LIMITS,
  DOPPLER_SUPPORTED_INSTRUMENTS,
} from "./dopplerAdapter.js";
import {
  DOPPLER_DIRECTOR_DEFAULTS,
  DOPPLER_DIRECTOR_INSTRUMENTS,
  DOPPLER_DIRECTOR_LIMITS,
  DOPPLER_DIRECTOR_STORY_MODES,
} from "../director/dopplerDirector.js";

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
      name: "configure_doppler_scene",
      description:
        "Configure one visible Doppler scene with one or two independently positioned sound sources. Signed velocity controls left-to-right or right-to-left travel, and recorded vehicle sounds are supported.",
      inputSchema: {
        type: "object",
        properties: {
          observerPositionM: {
            type: "number",
            minimum: DOPPLER_LIMITS.observerPositionM.min,
            maximum: DOPPLER_LIMITS.observerPositionM.max,
            description: "Stationary or moving observer position in metres.",
          },
          observerVelocityMps: {
            type: "number",
            minimum: DOPPLER_LIMITS.observerVelocityMps.min,
            maximum: DOPPLER_LIMITS.observerVelocityMps.max,
            description: "Signed observer velocity in metres per second.",
          },
          sources: {
            type: "array",
            minItems: 1,
            maxItems: 2,
            description: "One or two sound sources sharing the visible simulation.",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Stable source identifier used by later state reads.",
                },
                label: {
                  type: "string",
                  description: "Short human-readable source label.",
                },
                sourcePositionM: {
                  type: "number",
                  minimum: DOPPLER_LIMITS.sourcePositionM.min,
                  maximum: DOPPLER_LIMITS.sourcePositionM.max,
                },
                sourceVelocityMps: {
                  type: "number",
                  minimum: DOPPLER_LIMITS.sourceVelocityMps.min,
                  maximum: DOPPLER_LIMITS.sourceVelocityMps.max,
                  description: "Signed velocity; positive moves right and negative moves left.",
                },
                emittedFrequencyHz: {
                  type: "number",
                  minimum: DOPPLER_LIMITS.emittedFrequencyHz.min,
                  maximum: DOPPLER_LIMITS.emittedFrequencyHz.max,
                },
                instrument: {
                  type: "string",
                  enum: DOPPLER_SUPPORTED_INSTRUMENTS,
                  description: "Synthesized tone or real recorded vehicle/siren sound.",
                },
              },
              required: [
                "sourcePositionM",
                "sourceVelocityMps",
                "emittedFrequencyHz",
                "instrument",
              ],
              additionalProperties: false,
            },
          },
        },
        required: ["sources"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("configure_doppler_scene", async (input) =>
        actions.configureScene(input),
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
    {
      name: "create_doppler_video",
      description:
        "Create a 10–60 second 9:16 WebM Doppler video with deterministic motion, recorded sound, wavefronts, captions, and before/after pitch. Use single_pass for one source that crosses the observer halfway through the video; use two_vehicle for the two-source story. Silent files are rejected.",
      inputSchema: {
        type: "object",
        properties: {
          storyMode: {
            type: "string",
            enum: DOPPLER_DIRECTOR_STORY_MODES,
            default: DOPPLER_DIRECTOR_DEFAULTS.storyMode,
            description: "single_pass uses one left-to-right source for the whole video; two_vehicle uses two sequential sources.",
          },
          durationSeconds: {
            type: "number",
            minimum: DOPPLER_DIRECTOR_LIMITS.durationSeconds.min,
            maximum: DOPPLER_DIRECTOR_LIMITS.durationSeconds.max,
            default: DOPPLER_DIRECTOR_DEFAULTS.durationSeconds,
            description: "Total video duration. In single_pass, the observer crossing occurs exactly halfway through.",
          },
          speedMps: {
            type: "number",
            minimum: DOPPLER_DIRECTOR_LIMITS.speedMps.min,
            maximum: DOPPLER_DIRECTOR_LIMITS.speedMps.max,
            default: DOPPLER_DIRECTOR_DEFAULTS.speedMps,
          },
          emittedFrequencyHz: {
            type: "number",
            minimum: DOPPLER_DIRECTOR_LIMITS.emittedFrequencyHz.min,
            maximum: DOPPLER_DIRECTOR_LIMITS.emittedFrequencyHz.max,
            default: DOPPLER_DIRECTOR_DEFAULTS.emittedFrequencyHz,
          },
          firstInstrument: {
            type: "string",
            enum: DOPPLER_DIRECTOR_INSTRUMENTS,
            default: DOPPLER_DIRECTOR_DEFAULTS.firstInstrument,
            description: "Recorded sound for the first source, or the only source in single_pass mode.",
          },
          secondInstrument: {
            type: "string",
            enum: DOPPLER_DIRECTOR_INSTRUMENTS,
            default: DOPPLER_DIRECTOR_DEFAULTS.secondInstrument,
            description: "Recorded sound for the second source in two_vehicle mode.",
          },
        },
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("create_doppler_video", async (input) =>
        actions.startDirector(input),
      ),
    },
    {
      name: "get_doppler_video_status",
      description:
        "Read recording state, elapsed time, story phase, scientific comparison, audio-track presence, verified audio-signal status, and download readiness for the directed Doppler video.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("get_doppler_video_status", async () =>
        actions.getDirectorStatus(),
      ),
    },
    {
      name: "stop_doppler_video",
      description:
        "Stop an active Doppler director recording early and finalize the WebM video so it can be reviewed or downloaded.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("stop_doppler_video", async () =>
        actions.stopDirector(),
      ),
    },
    {
      name: "download_doppler_video",
      description:
        "Download the finalized agent-directed Doppler WebM video. The recording must have status ready before this action is called.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("download_doppler_video", async () =>
        actions.downloadDirector(),
      ),
    },
  ];
}
