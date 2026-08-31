import assert from "node:assert/strict";

import {
  getDopplerStateSnapshot,
  configureDopplerExperiment,
  createResetDopplerState,
} from "../src/simulations/subjects/physics/acoustics/Doppler/adapter/dopplerAdapter.js";
import { createDopplerWebMcpTools } from "../src/simulations/subjects/physics/acoustics/Doppler/adapter/dopplerTools.js";
import { refreshDopplerMeasurements } from "../src/simulations/subjects/physics/acoustics/Doppler/engine/dopplerEngine.js";
import {
  registerWebMcpTools,
  WEBMCP_REGISTRATION_STATUS,
} from "../src/webmcp/registerWebMcpTools.js";
import {
  createEsbikoSiteTools,
  WEBMCP_ENABLED_SIMULATIONS,
} from "../src/webmcp/siteTools.js";
import {
  DOPPLER_WEBMCP_TEST_PROMPT,
  DOPPLER_WEBMCP_TOOL_NAMES,
  formatDopplerResultSummary,
  getWebMcpGuideStatus,
} from "../src/simulations/subjects/physics/acoustics/Doppler/webMcpGuide.js";

const baseState = createResetDopplerState();
const approachingState = configureDopplerExperiment(baseState, {
  motion: "approaching",
  sourceSpeedMps: 20,
  emittedFrequencyHz: 440,
  sourcePositionM: 250,
  observerPositionM: 500,
});
const approachingSnapshot = getDopplerStateSnapshot(approachingState);

assert.equal(approachingSnapshot.sources.length, 1);
assert.equal(approachingSnapshot.sources[0].velocityMps, 20);
assert.ok(
  approachingSnapshot.sources[0].observedFrequencyHz >
    approachingSnapshot.sources[0].emittedFrequencyHz,
  "Approaching source must produce a higher observed frequency.",
);

const recedingState = configureDopplerExperiment(approachingState, {
  motion: "receding",
});
const recedingSnapshot = getDopplerStateSnapshot(recedingState);

assert.equal(recedingSnapshot.sources[0].velocityMps, -20);
assert.ok(
  recedingSnapshot.sources[0].observedFrequencyHz <
    recedingSnapshot.sources[0].emittedFrequencyHz,
  "Receding source must produce a lower observed frequency.",
);

const manuallyAdjustedSources = refreshDopplerMeasurements(
  [
    {
      ...approachingState.sources[0],
      baseFreq: 481,
    },
  ],
  approachingState.observer,
);

assert.equal(manuallyAdjustedSources[0].baseFreq, 481);
assert.ok(
  manuallyAdjustedSources[0].currentFreq > 481,
  "Paused human control changes must refresh the visible Doppler measurement.",
);

assert.throws(
  () =>
    configureDopplerExperiment(baseState, {
      motion: "approaching",
      sourceSpeedMps: 151,
    }),
  (error) => error.code === "PARAMETER_OUT_OF_RANGE",
);

let runtimeState = approachingState;
const dopplerTools = createDopplerWebMcpTools({
  getState: () => getDopplerStateSnapshot(runtimeState),
  configure: (input) => {
    runtimeState = configureDopplerExperiment(runtimeState, input);
    return getDopplerStateSnapshot(runtimeState);
  },
  setPlayback: (action) => {
    runtimeState = { ...runtimeState, isRunning: action === "run" };
    return getDopplerStateSnapshot(runtimeState);
  },
  reset: () => {
    runtimeState = createResetDopplerState();
    return getDopplerStateSnapshot(runtimeState);
  },
});

assert.deepEqual(
  dopplerTools.map((tool) => tool.name),
  [
    "get_doppler_state",
    "configure_doppler",
    "set_doppler_playback",
    "reset_doppler",
  ],
);
assert.equal(dopplerTools[0].annotations.readOnlyHint, true);
assert.equal(dopplerTools[1].annotations.readOnlyHint, false);

const stateResult = JSON.parse(await dopplerTools[0].execute({}));
assert.equal(stateResult.ok, true);
assert.equal(stateResult.data.simulationId, "physics.acoustics.doppler");
assert.ok(JSON.stringify(stateResult).length < 1500);

const invalidResult = JSON.parse(
  await dopplerTools[1].execute({
    motion: "approaching",
    sourceSpeedMps: 999,
  }),
);
assert.equal(invalidResult.ok, false);
assert.equal(invalidResult.error.code, "PARAMETER_OUT_OF_RANGE");

let navigatedTo = null;
const siteTools = createEsbikoSiteTools({
  navigate: (route) => {
    navigatedTo = route;
  },
});
const listResult = JSON.parse(await siteTools[0].execute({}));

assert.equal(listResult.ok, true);
assert.equal(
  listResult.data.simulations.length,
  WEBMCP_ENABLED_SIMULATIONS.length,
);

const openResult = JSON.parse(
  await siteTools[1].execute({
    simulationId: "physics.acoustics.doppler",
  }),
);
assert.equal(openResult.ok, true);
assert.equal(
  navigatedTo,
  "/experiments/physics.acoustics.doppler/run",
);

const registeredTools = [];
const controller = new AbortController();
const registration = await registerWebMcpTools({
  modelContext: {
    registerTool: async (tool, options) => {
      assert.equal(options.signal, controller.signal);
      registeredTools.push(tool.name);
    },
  },
  tools: [...siteTools, ...dopplerTools],
  signal: controller.signal,
});

assert.equal(registration.status, WEBMCP_REGISTRATION_STATUS.READY);
assert.equal(registeredTools.length, 6);
assert.ok(
  [...siteTools, ...dopplerTools].every(
    (tool) => tool.name.length <= 30 && tool.description.length <= 500,
  ),
  "Tool names and descriptions must stay inside recommended WebMCP budgets.",
);

const unsupported = await registerWebMcpTools({
  modelContext: null,
  tools: siteTools,
  signal: controller.signal,
});
assert.equal(unsupported.status, WEBMCP_REGISTRATION_STATUS.UNSUPPORTED);

assert.deepEqual(DOPPLER_WEBMCP_TOOL_NAMES, [
  "list_science_simulations",
  "open_science_simulation",
  "get_doppler_state",
  "configure_doppler",
  "set_doppler_playback",
  "reset_doppler",
]);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /440 Hz/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /20 m\/s/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /site tools/i);
assert.equal(getWebMcpGuideStatus("ready").detail, "6 tools available");
assert.match(getWebMcpGuideStatus("unsupported").help, /ChatGPT desktop app/i);
assert.equal(
  formatDopplerResultSummary(approachingState.sources),
  "440 Hz → 467.24 Hz · +6.19%",
);
assert.equal(formatDopplerResultSummary([]), "No source configured yet");

console.log("ESBIKO_WEBMCP_TEST_PASSED");
