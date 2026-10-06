export const simulationAgentManifest = Object.freeze({
  "physics.acoustics.doppler": Object.freeze({
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
    tools: ["run_doppler_experiment", "open_science_simulation"],
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

  "physics.mechanics.simple-pendulum": Object.freeze({
    adapterVersion: "pendulum-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
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

  "physics.mechanics.spring-mass": Object.freeze({
    adapterVersion: "spring-mass-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        k: { type: "number", minimum: 1, maximum: 100 },
        mass: { type: "number", minimum: 0.1, maximum: 10 },
        displacement: { type: "number", minimum: -5, maximum: 5 },
        velocity: { type: "number", minimum: -10, maximum: 10 },
        damping: { type: "number", minimum: 0, maximum: 2 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "k", "mass", "displacement", "velocity", "damping"],
      properties: {
        running: { type: "boolean" },
        k: { type: "number" },
        mass: { type: "number" },
        displacement: { type: "number" },
        velocity: { type: "number" },
        damping: { type: "number" },
      },
    },
  }),
});

export function getSimulationAgentManifestEntry(id) {
  return simulationAgentManifest[id] || null;
}
