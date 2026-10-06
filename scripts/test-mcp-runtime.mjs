import assert from "node:assert/strict";

import { createServer } from "../functions/mcp/transport.mjs";
import {
  getSimulationProfile,
  validateSimulationParameters,
} from "../functions/mcp/simulationRegistry.mjs";

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

console.log("MCP RUNTIME STARTUP TEST PASSED");
console.log("SIMULATION PARAMETER VALIDATION TEST PASSED");
