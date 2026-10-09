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
assert.equal(pendulum.video, true);
assert.equal(pendulum.exportable, true);
assert(pendulum.actions.includes("record"));
assert(pendulum.actions.includes("export"));
assert.deepEqual(
  pendulum.actions,
  ["open", "configure", "readState", "play", "pause", "reset", "record", "export"],
);

const springMass = getSimulationAgentProfile("physics.mechanics.spring-mass");
assert.equal(springMass.integrationLevel, "adapted");
assert.equal(springMass.adapterVersion, "spring-mass-adapter.v1");
assert.equal(springMass.video, true);
assert.equal(springMass.exportable, true);
assert(springMass.actions.includes("record"));
assert(springMass.actions.includes("export"));
assert.deepEqual(
  springMass.actions,
  ["open", "configure", "readState", "play", "pause", "reset", "record", "export"],
);

const batchAdaptedIds = [
  "physics.mechanics.projectile",
  "physics.mechanics.circular-motion",
  "physics.mechanics.gravity-comparison",
  "physics.mechanics.seesaw",
  "physics.mechanics.collision",
  "physics.mechanics.pulley-system",
  "physics.mechanics.two-body-gravity",
  "physics.fluid-mechanics.archimedes-principle",
  "physics.acoustics.sound-waves",
  "physics.electricity.coulomb-law-2d",
];

for (const id of batchAdaptedIds) {
  const profile = getSimulationAgentProfile(id);
  assert.equal(profile.integrationLevel, "adapted", `${id} should be adapted`);
  assert(profile.adapterVersion, `${id} should declare an adapterVersion`);
  assert(profile.actions.includes("configure"), `${id} should support configure`);
  assert(profile.parameterSchema, `${id} should declare parameterSchema`);
}

const gyroscope = getSimulationAgentProfile("physics.mechanics.gyroscope");
assert.equal(gyroscope.integrationLevel, "adapted");
assert.equal(gyroscope.adapterVersion, "gyroscope-adapter.v1");
assert.deepEqual(
  gyroscope.actions,
  ["open", "configure", "readState", "play", "pause", "reset"],
);

const solarSystem = getSimulationAgentProfile("astronomy.space.solar-system");
assert.equal(solarSystem.integrationLevel, "adapted");
assert.equal(solarSystem.adapterVersion, "solar-system-adapter.v1");
assert.equal(solarSystem.video, true);
assert.equal(solarSystem.exportable, true);
assert(solarSystem.actions.includes("record"));
assert(solarSystem.actions.includes("export"));

const orbitLab = getSimulationAgentProfile("astronomy.space.earth-orbit-lab");
assert.equal(orbitLab.integrationLevel, "adapted");
assert.equal(orbitLab.adapterVersion, "earth-orbit-lab-adapter.v1");

const microscope = getSimulationAgentProfile("physics.optics.microscope");
assert.equal(microscope.integrationLevel, "adapted");
assert.equal(microscope.adapterVersion, "microscope-adapter.v1");
assert.deepEqual(microscope.actions, ["open", "configure", "readState", "reset"]);
assert.deepEqual(Object.keys(microscope.parameterSchema.properties), ["focus", "zoom", "light"]);
assert.equal(microscope.video, false);

const coulomb3d = getSimulationAgentProfile("physics.electricity.coulomb-law-3d");
assert.equal(coulomb3d.integrationLevel, "adapted");
assert.equal(coulomb3d.adapterVersion, "coulomb-law-3d-adapter.v1");
assert.deepEqual(coulomb3d.actions, ["open", "configure", "readState", "play", "pause", "reset"]);
for (const key of ["q1","q2","x1","y1","z1","x2","y2","z2","showField","showFlux"]) {
  assert(coulomb3d.parameterSchema.properties[key], "Missing Coulomb 3D parameter "+key);
}
assert.equal(coulomb3d.video, false);

const kepler = getSimulationAgentProfile("astronomy.kepler-lab");
assert.equal(kepler.integrationLevel, "adapted");
assert.equal(kepler.adapterVersion, "kepler-lab-adapter.v1");
for (const key of ["launchDistance","launchVelocity","launchAngle","showSweeps"]) {
  assert(kepler.parameterSchema.properties[key], "Kepler setting missing: " + key);
}
assert.deepEqual(kepler.actions, ["open", "configure", "readState", "play", "pause", "reset"]);
assert.equal(kepler.video, false);

const universal = getSimulationAgentProfile("physics.thermodynamics.gas");
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
