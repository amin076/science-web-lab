import { createSimulationAgentProfile } from "./simulationAgentContract";

export const simulationAgentProfiles = Object.freeze({
  "physics.acoustics.doppler": createSimulationAgentProfile({
    id: "physics.acoustics.doppler",
    adapterVersion: "doppler-adapter.v1",
    actions: [
      "open",
      "configure",
      "readState",
      "play",
      "pause",
      "reset",
      "record",
      "export",
    ],
    video: true,
    exportable: true,
    parameterSchema: {
      type: "object",
      properties: {
        motion: {
          type: "string",
          enum: ["approaching", "receding", "stationary"],
        },
        emittedFrequencyHz: { type: "number", minimum: 100, maximum: 1000 },
        sourceSpeedMps: { type: "number", minimum: 0, maximum: 150 },
        sourcePositionM: { type: "number", minimum: 0, maximum: 1000 },
        observerPositionM: { type: "number", minimum: 0, maximum: 1000 },
        observerVelocityMps: { type: "number", minimum: -100, maximum: 100 },
      },
      required: ["motion"],
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["simulationId", "status", "observer", "sources"],
      properties: {
        simulationId: { const: "physics.acoustics.doppler" },
        status: { type: "string", enum: ["running", "paused"] },
        observer: { type: "object" },
        sources: { type: "array" },
      },
    },
  }),
});

export function getSimulationAgentProfile(id) {
  return simulationAgentProfiles[id] || createSimulationAgentProfile({ id });
}
