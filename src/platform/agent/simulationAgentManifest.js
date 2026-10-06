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

  "physics.mechanics.circular-motion": Object.freeze({
    adapterVersion: "circular-motion-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        radius: { type: "number", minimum: 10, maximum: 200 },
        omega0: { type: "number", minimum: -5, maximum: 5 },
        alpha: { type: "number", minimum: -2, maximum: 2 },
        mass: { type: "number", minimum: 0.1, maximum: 10 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "radius", "omega0", "alpha", "mass"],
      properties: {
        running: { type: "boolean" },
        radius: { type: "number" },
        omega0: { type: "number" },
        alpha: { type: "number" },
        mass: { type: "number" },
      },
    },
  }),

  "physics.mechanics.projectile": Object.freeze({
    adapterVersion: "projectile-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        gravity: { type: "number", minimum: 0, maximum: 25 },
        airResistance: { type: "number", minimum: 0, maximum: 0.2 },
        selectedObject: {
          type: "string",
          enum: ["ball", "car", "plane", "parcel"],
        },
        x: { type: "number", minimum: -500, maximum: 500 },
        y: { type: "number", minimum: 0, maximum: 200 },
        vx: { type: "number", minimum: -50, maximum: 50 },
        vy: { type: "number", minimum: -50, maximum: 50 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "gravity", "airResistance", "selectedObject"],
      properties: {
        running: { type: "boolean" },
        gravity: { type: "number" },
        airResistance: { type: "number" },
        selectedObject: { type: "string" },
        objects: { type: "array" },
      },
    },
  }),

  "physics.mechanics.gravity-comparison": Object.freeze({
    adapterVersion: "gravity-comparison-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: true,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["freeFall", "projectile"],
        },
        freeFallHeight: { type: "number", minimum: 20, maximum: 150 },
        projectileSpeed: { type: "number", minimum: 5, maximum: 100 },
        projectileAngleDeg: { type: "number", minimum: 5, maximum: 85 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "mode", "freeFallHeight", "projectileSpeed", "projectileAngleDeg"],
      properties: {
        running: { type: "boolean" },
        mode: { type: "string" },
        freeFallHeight: { type: "number" },
        projectileSpeed: { type: "number" },
        projectileAngleDeg: { type: "number" },
      },
    },
  }),

  "physics.mechanics.seesaw": Object.freeze({
    adapterVersion: "seesaw-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        fulcrumHeight: { type: "number", minimum: 0.5, maximum: 4 },
        leftArmLength: { type: "number", minimum: 1, maximum: 5 },
        rightArmLength: { type: "number", minimum: 1, maximum: 5 },
        plankMass: { type: "number", minimum: 5, maximum: 50 },
        damping: { type: "number", minimum: 0, maximum: 1 },
        friction: { type: "number", minimum: 0, maximum: 1 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: [
        "running",
        "fulcrumHeight",
        "leftArmLength",
        "rightArmLength",
        "plankMass",
        "damping",
        "friction",
      ],
      properties: {
        running: { type: "boolean" },
        fulcrumHeight: { type: "number" },
        leftArmLength: { type: "number" },
        rightArmLength: { type: "number" },
        plankMass: { type: "number" },
        damping: { type: "number" },
        friction: { type: "number" },
      },
    },
  }),

  "physics.mechanics.collision": Object.freeze({
    adapterVersion: "collision-adapter.v1",
    actions: ["open", "configure", "readState", "play", "pause", "reset"],
    tools: ["open_science_simulation"],
    video: false,
    exportable: false,
    parameterSchema: {
      type: "object",
      properties: {
        restitution: { type: "number", minimum: 0, maximum: 1 },
        timeScale: { type: "number", minimum: 0, maximum: 5 },
        p1Mass: { type: "number", minimum: 0.1, maximum: 1000 },
        p1Vx: { type: "number", minimum: -100, maximum: 100 },
        p1Vy: { type: "number", minimum: -100, maximum: 100 },
        p2Mass: { type: "number", minimum: 0.1, maximum: 1000 },
        p2Vx: { type: "number", minimum: -100, maximum: 100 },
        p2Vy: { type: "number", minimum: -100, maximum: 100 },
      },
      additionalProperties: false,
    },
    stateSchema: {
      type: "object",
      required: ["running", "restitution", "timeScale", "p1", "p2"],
      properties: {
        running: { type: "boolean" },
        restitution: { type: "number" },
        timeScale: { type: "number" },
        p1: { type: "object" },
        p2: { type: "object" },
      },
    },
  }),
});

export function getSimulationAgentManifestEntry(id) {
  return simulationAgentManifest[id] || null;
}
