import assert from "node:assert/strict";

import {
  createSimulationAgentProfile,
  getSimulationAgentProfile,
  SIMULATION_AGENT_CONTRACT_VERSION,
} from "../src/platform/agent/index.js";

assert.equal(SIMULATION_AGENT_CONTRACT_VERSION, "simulation-agent.v1");

const doppler = getSimulationAgentProfile("physics.acoustics.doppler");
assert.equal(doppler.integrationLevel, "adapted");
assert.equal(doppler.adapterVersion, "doppler-adapter.v1");
assert.equal(doppler.video, true);
assert.equal(doppler.exportable, true);
assert(doppler.actions.includes("record"));
assert(doppler.actions.includes("export"));

const pendulum = getSimulationAgentProfile("physics.mechanics.simple-pendulum");
assert.equal(pendulum.integrationLevel, "adapted");
assert.equal(pendulum.adapterVersion, "pendulum-adapter.v1");
assert.equal(pendulum.video, false);
assert.equal(pendulum.exportable, false);
assert.deepEqual(
  pendulum.actions,
  ["open", "configure", "readState", "play", "pause", "reset"],
);

const springMass = getSimulationAgentProfile("physics.mechanics.spring-mass");
assert.equal(springMass.integrationLevel, "adapted");
assert.equal(springMass.adapterVersion, "spring-mass-adapter.v1");
assert.equal(springMass.video, false);
assert.equal(springMass.exportable, false);
assert.deepEqual(
  springMass.actions,
  ["open", "configure", "readState", "play", "pause", "reset"],
);

const universal = getSimulationAgentProfile("physics.mechanics.projectile");
assert.equal(universal.integrationLevel, "universal");
assert.equal(universal.adapterVersion, null);
assert.deepEqual(universal.actions, ["open"]);

assert.throws(
  () =>
    createSimulationAgentProfile({
      id: "invalid.adapted",
      actions: ["open", "configure"],
    }),
  /requires adapterVersion, parameterSchema, and stateSchema/,
);

console.log("SIMULATION AGENT CONTRACT TEST PASSED");
