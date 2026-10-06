/* eslint-env node */
const assert = require("node:assert/strict");
const {runDopplerExperiment} = require("../functions/mcp/dopplerService");
const {executeTool} = require("../functions/mcp/server");

async function main() {
  const approaching = runDopplerExperiment({
    motion: "approaching",
    emittedFrequencyHz: 440,
    sourceSpeedMps: 60,
    sourcePositionM: 250,
    observerPositionM: 500,
    observerVelocityMps: 0,
  });

  assert.equal(approaching.simulationId, "physics.acoustics.doppler");
  assert.equal(approaching.result.observedFrequencyHz, 533.29);
  assert.equal(approaching.result.shiftPercent, 21.2);
  assert.match(approaching.result.motionStatus, /Higher pitch/);

  const receding = runDopplerExperiment({
    motion: "receding",
    emittedFrequencyHz: 440,
    sourceSpeedMps: 60,
    sourcePositionM: 250,
    observerPositionM: 500,
    observerVelocityMps: 0,
  });

  assert.equal(receding.result.observedFrequencyHz, 374.49);
  assert.equal(receding.result.shiftPercent, -14.89);
  assert.match(receding.result.motionStatus, /Lower pitch/);

  const stationary = runDopplerExperiment({
    motion: "stationary",
    emittedFrequencyHz: 440,
    sourceSpeedMps: 60,
    sourcePositionM: 250,
    observerPositionM: 500,
    observerVelocityMps: 0,
  });

  assert.equal(stationary.result.observedFrequencyHz, 440);
  assert.equal(stationary.result.shiftPercent, 0);

  const toolResult = await executeTool("run_doppler_experiment", {
    motion: "approaching",
    emittedFrequencyHz: 440,
    sourceSpeedMps: 60,
    sourcePositionM: 250,
    observerPositionM: 500,
    observerVelocityMps: 0,
  });

  assert.equal(toolResult.structuredContent.result.observedFrequencyHz, 533.29);
  assert.match(toolResult.content[0].text, /533\.29 Hz observed/);

  console.log("Esbiko MCP Doppler tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
