import assert from "node:assert/strict";

import { createServer } from "../functions/mcp/transport.mjs";
import {
  getSimulationProfile,
  validateSimulationParameters,
} from "../functions/mcp/simulationRegistry.mjs";
import { readEmbeddedMcpParameters } from "../src/platform/agent/readEmbeddedMcpParameters.js";

const server = createServer();
assert(server, "MCP server factory returned no server");

const springMass = getSimulationProfile("physics.mechanics.spring-mass");
assert.equal(springMass.integrationLevel, "adapted");
assert.equal(springMass.adapterVersion, "spring-mass-adapter.v1");

const validSpringMass = validateSimulationParameters(
  "physics.mechanics.spring-mass",
  {
    k: 30,
    mass: 2,
    displacement: 1.5,
    velocity: 0,
    damping: 0.2,
  },
);
assert.deepEqual(validSpringMass, {
  k: 30,
  mass: 2,
  displacement: 1.5,
  velocity: 0,
  damping: 0.2,
});

assert.throws(
  () =>
    validateSimulationParameters("physics.mechanics.spring-mass", {
      k: 500,
    }),
  /must be <= 100/,
);

assert.throws(
  () =>
    validateSimulationParameters("physics.mechanics.simple-pendulum", {
      unknownParameter: 1,
    }),
  /Unsupported parameter/,
);

const circularEmbedded = readEmbeddedMcpParameters(
  "physics.mechanics.circular-motion",
  { radius: 140, omega0: 1.5, alpha: 0, mass: 1 },
  "?embed=mcp-app&mcp.radius=250&mcp.omega0=-2.5&mcp.mass=3",
);
assert.equal(circularEmbedded.embeddedMcpApp, true);
assert.equal(circularEmbedded.values.radius, 200);
assert.equal(circularEmbedded.values.omega0, -2.5);
assert.equal(circularEmbedded.values.mass, 3);
assert.deepEqual(
  [...circularEmbedded.providedKeys].sort(),
  ["mass", "omega0", "radius"],
);

const projectileEmbedded = readEmbeddedMcpParameters(
  "physics.mechanics.projectile",
  { gravity: 9.8, airResistance: 0, selectedObject: "ball" },
  "?embed=mcp-app&mcp.gravity=3.71&mcp.selectedObject=plane",
);
assert.equal(projectileEmbedded.values.gravity, 3.71);
assert.equal(projectileEmbedded.values.selectedObject, "plane");

console.log("MCP RUNTIME STARTUP TEST PASSED");
console.log("SHARED EMBEDDED MCP PARAMETER READER TEST PASSED");
console.log("SIMULATION PARAMETER VALIDATION TEST PASSED");
