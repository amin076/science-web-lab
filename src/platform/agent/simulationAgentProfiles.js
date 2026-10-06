import { createSimulationAgentProfile } from "./simulationAgentContract";

export const simulationAgentProfiles = Object.freeze({
  "physics.mechanics.simple-pendulum": createSimulationAgentProfile({
    id: "physics.mechanics.simple-pendulum",
    adapterVersion: "pendulum-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        lengthM: { type: "number", minimum: 0.5, maximum: 3.0 },
        massKg: { type: "number", minimum: 0.1, maximum: 10.0 },
        entryAngle: { type: "number", minimum: -170, maximum: 170 },
        elasticity: { type: "number", minimum: 0.98, maximum: 1.0 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "lengthM", "massKg", "entryAngle", "elasticity"],
      properties: {
        running: { type: "boolean" },
        lengthM: { type: "number" },
        massKg: { type: "number" },
        entryAngle: { type: "number" },
        elasticity: { type: "number" },
      },
    },
  }),
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
