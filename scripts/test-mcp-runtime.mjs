import assert from "node:assert/strict";

import { createServer } from "../functions/mcp/transport.mjs";
import {
  getSimulationProfile,
  listSimulationProfiles,
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

const archimedesEmbedded = readEmbeddedMcpParameters(
  "physics.fluid-mechanics.archimedes-principle",
  { objDensity: 600, fluidDensity: 1000, shape: "box", showForces: true },
  "?embed=mcp-app&mcp.objDensity=25000&mcp.fluidDensity=1025&mcp.shape=sphere&mcp.showForces=false",
);
assert.equal(archimedesEmbedded.values.objDensity, 20000);
assert.equal(archimedesEmbedded.values.fluidDensity, 1025);
assert.equal(archimedesEmbedded.values.shape, "sphere");
assert.equal(archimedesEmbedded.values.showForces, false);

const soundWavesEmbedded = readEmbeddedMcpParameters(
  "physics.acoustics.sound-waves",
  { mode: "generator", freq1: 440, freq2: 444, volume: 0.5, waveType: "sine" },
  "?embed=mcp-app&mcp.mode=beats&mcp.freq1=440&mcp.freq2=446&mcp.volume=0.7&mcp.waveType=triangle",
);
assert.equal(soundWavesEmbedded.values.mode, "beats");
assert.equal(soundWavesEmbedded.values.freq2, 446);
assert.equal(soundWavesEmbedded.values.volume, 0.7);
assert.equal(soundWavesEmbedded.values.waveType, "triangle");

const gyroscopeProfile = getSimulationProfile("physics.mechanics.gyroscope");
assert.equal(
  gyroscopeProfile.capabilityContract?.status,
  "verified",
  "Gyroscope capability contract should be verified from the agent manifest",
);
assert.equal(
  gyroscopeProfile.capabilityContract?.capabilities?.agentReady?.supported,
  true,
  "Gyroscope agentReady capability should be supported",
);
assert.equal(
  gyroscopeProfile.capabilityContract?.capabilities?.agentReady?.verified,
  true,
  "Gyroscope agentReady capability should be verified",
);
assert.equal(
  gyroscopeProfile.capabilityContract?.capabilities?.stateRead?.supported,
  true,
  "Gyroscope stateRead capability should be supported",
);
assert.equal(
  gyroscopeProfile.capabilityContract?.capabilities?.commandExecution?.supported,
  true,
  "Gyroscope commandExecution capability should be supported",
);


const allProfiles = listSimulationProfiles();
const adaptedIds = new Set(allProfiles
  .filter((profile) => profile.integrationLevel === "adapted")
  .map((profile) => profile.id));
assert(allProfiles.length >= 20, "MCP discovery should expose the full simulation catalog");
assert(adaptedIds.size >= 5, "Generated agent manifest is stale: fewer than five adapted labs");
for (const id of [
  "physics.acoustics.doppler",
  "physics.mechanics.simple-pendulum",
  "physics.mechanics.spring-mass",
  "physics.mechanics.circular-motion",
  "astronomy.space.solar-system",
  "astronomy.space.earth-orbit-lab",
]) {
  assert(adaptedIds.has(id), `Missing MCP agent-ready simulation: ${id}`);
}
console.log("MCP CATALOG DISCOVERY PASSED:", allProfiles.length, "total;", adaptedIds.size, "adapted");

console.log("MCP RUNTIME STARTUP TEST PASSED");
console.log("SHARED EMBEDDED MCP PARAMETER READER TEST PASSED");
console.log("SIMULATION PARAMETER VALIDATION TEST PASSED");
