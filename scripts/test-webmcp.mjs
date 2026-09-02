import assert from "node:assert/strict";

import {
  getDopplerStateSnapshot,
  configureDopplerExperiment,
  configureDopplerScene,
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
import {
  createDopplerDirectorFrameSource,
  createDopplerDirectorPlan,
  getDopplerDirectorPhase,
} from "../src/simulations/subjects/physics/acoustics/Doppler/director/dopplerDirector.js";

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

const twoCarScene = configureDopplerScene(baseState, {
  observerPositionM: 500,
  observerVelocityMps: 0,
  sources: [
    {
      id: "left-car",
      label: "Real car",
      sourcePositionM: 200,
      sourceVelocityMps: 30,
      emittedFrequencyHz: 440,
      instrument: "car_engine",
    },
    {
      id: "right-car",
      label: "Diesel",
      sourcePositionM: 800,
      sourceVelocityMps: -30,
      emittedFrequencyHz: 440,
      instrument: "diesel_engine",
    },
  ],
});
const twoCarSnapshot = getDopplerStateSnapshot(twoCarScene);

assert.equal(twoCarSnapshot.sources.length, 2);
assert.deepEqual(
  twoCarSnapshot.sources.map((source) => source.instrument),
  ["car_engine", "diesel_engine"],
);
assert.ok(
  twoCarSnapshot.sources.every(
    (source) => source.observedFrequencyHz > source.emittedFrequencyHz,
  ),
  "Both cars must approach the stationary observer from opposite directions.",
);

const directorPlan = createDopplerDirectorPlan({ durationSeconds: 10 });

assert.equal(directorPlan.durationSeconds, 10);
assert.equal(directorPlan.version, "doppler-director.v5");
assert.equal(directorPlan.storyMode, "two_vehicle");
assert.equal(directorPlan.phaseDurationSeconds, 2.5);
assert.equal(directorPlan.cars[0].startPositionM, 350);
assert.equal(directorPlan.cars[0].velocityMps, 60);
assert.equal(directorPlan.cars[1].startPositionM, 650);
assert.equal(directorPlan.cars[1].velocityMps, -60);
assert.equal(directorPlan.cars[1].instrument, "ambulance_siren");
assert.equal(getDopplerDirectorPhase(directorPlan, 3).id, "car-one-receding");
assert.equal(getDopplerDirectorPhase(directorPlan, 8).id, "car-two-receding");
assert.equal(createDopplerDirectorFrameSource(directorPlan, 0).x, 350);
assert.equal(createDopplerDirectorFrameSource(directorPlan, 2.5).x, 500);
assert.equal(createDopplerDirectorFrameSource(directorPlan, 5).x, 650);
assert.equal(createDopplerDirectorFrameSource(directorPlan, 7.5).x, 500);
assert.equal(createDopplerDirectorFrameSource(directorPlan, 9.9).instrument, "ambulance_siren");

const twentySecondPlan = createDopplerDirectorPlan({
  durationSeconds: 20,
  speedMps: 60,
  emittedFrequencyHz: 440,
  firstInstrument: "esbiko_voice",
  secondInstrument: "ambulance_siren",
});

assert.equal(twentySecondPlan.phaseDurationSeconds, 5);
assert.deepEqual(twentySecondPlan.timeline, {
  legDistanceM: 300,
  firstStartM: 200,
  firstPassM: 500,
  firstEndM: 800,
  secondStartM: 800,
  secondPassM: 500,
  secondEndM: 200,
});
assert.equal(twentySecondPlan.cars[0].instrument, "esbiko_voice");
assert.equal(createDopplerDirectorFrameSource(twentySecondPlan, 0).x, 200);
assert.equal(createDopplerDirectorFrameSource(twentySecondPlan, 5).x, 500);
assert.ok(Math.abs(createDopplerDirectorFrameSource(twentySecondPlan, 9.999).x - 799.94) < 0.01);
assert.equal(createDopplerDirectorFrameSource(twentySecondPlan, 10).x, 800);
assert.equal(createDopplerDirectorFrameSource(twentySecondPlan, 15).x, 500);
assert.ok(Math.abs(createDopplerDirectorFrameSource(twentySecondPlan, 19.999).x - 200.06) < 0.01);
assert.equal(getDopplerDirectorPhase(twentySecondPlan, 4.999).id, "car-one-approaching");
assert.equal(getDopplerDirectorPhase(twentySecondPlan, 5).id, "car-one-receding");
assert.equal(getDopplerDirectorPhase(twentySecondPlan, 14.999).id, "car-two-approaching");
assert.equal(getDopplerDirectorPhase(twentySecondPlan, 15).id, "car-two-receding");

const singlePassPlan = createDopplerDirectorPlan({
  storyMode: "single_pass",
  durationSeconds: 10,
  speedMps: 60,
  emittedFrequencyHz: 440,
  firstInstrument: "ambulance_siren",
});

assert.equal(singlePassPlan.storyMode, "single_pass");
assert.equal(singlePassPlan.phaseDurationSeconds, 5);
assert.equal(singlePassPlan.cars.length, 1);
assert.equal(singlePassPlan.cars[0].instrument, "ambulance_siren");
assert.deepEqual(singlePassPlan.timeline, {
  legDistanceM: 300,
  firstStartM: 200,
  firstPassM: 500,
  firstEndM: 800,
});
assert.equal(createDopplerDirectorFrameSource(singlePassPlan, 0).x, 200);
assert.equal(createDopplerDirectorFrameSource(singlePassPlan, 5).x, 500);
assert.ok(Math.abs(createDopplerDirectorFrameSource(singlePassPlan, 9.999).x - 799.94) < 0.01);
assert.equal(createDopplerDirectorFrameSource(singlePassPlan, 4.999).instrument, "ambulance_siren");
assert.equal(createDopplerDirectorFrameSource(singlePassPlan, 5.001).instrument, "ambulance_siren");
assert.equal(getDopplerDirectorPhase(singlePassPlan, 4.999).id, "single-approaching");
assert.equal(getDopplerDirectorPhase(singlePassPlan, 5).id, "single-receding");
assert.ok(
  createDopplerDirectorFrameSource(singlePassPlan, 4.999).currentFreq > 440 &&
    createDopplerDirectorFrameSource(singlePassPlan, 5.001).currentFreq < 440,
  "Single-pass mode must use the same sample across an audible higher-to-lower pitch transition at 5 seconds.",
);

assert.throws(
  () => createDopplerDirectorPlan({ durationSeconds: 60, speedMps: 60 }),
  (error) => error.code === "DIRECTOR_TIMING_OUT_OF_RANGE",
);
assert.throws(
  () =>
    createDopplerDirectorPlan({
      storyMode: "single_pass",
      durationSeconds: 20,
      speedMps: 60,
    }),
  (error) => error.code === "DIRECTOR_TIMING_OUT_OF_RANGE",
);

const carAfterPassFrame = createDopplerDirectorFrameSource(directorPlan, 3);
const ambulanceAfterPassFrame = createDopplerDirectorFrameSource(directorPlan, 8);
assert.ok(
  carAfterPassFrame.waves.length > 0 && ambulanceAfterPassFrame.waves.length > 0,
  "Recorded director frames must preserve visible wavefronts before and after each observer pass.",
);
assert.ok(
  carAfterPassFrame.waves.every((wave) => Number.isFinite(wave.x) && wave.r >= 0),
  "Recorded wavefronts must keep deterministic emission positions and radii.",
);
assert.ok(
  directorPlan.results.approaching.observedFrequencyHz > 440 &&
    directorPlan.results.receding.observedFrequencyHz < 440,
  "The director plan must preserve the before/after Doppler comparison.",
);

let runtimeState = approachingState;
const dopplerTools = createDopplerWebMcpTools({
  getState: () => getDopplerStateSnapshot(runtimeState),
  configure: (input) => {
    runtimeState = configureDopplerExperiment(runtimeState, input);
    return getDopplerStateSnapshot(runtimeState);
  },
  configureScene: (input) => {
    runtimeState = configureDopplerScene(runtimeState, input);
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
  startDirector: (input) => ({
    state: "recording",
    durationSeconds: input.durationSeconds || 10,
    storyMode: input.storyMode || "two_vehicle",
    audioIncluded: true,
    audioSignalDetected: true,
  }),
  getDirectorStatus: () => ({
    state: "ready",
    downloadReady: true,
    audioIncluded: true,
    audioSignalDetected: true,
  }),
  stopDirector: () => ({ state: "finalizing" }),
  downloadDirector: () => ({ state: "ready", downloaded: true }),
});

assert.deepEqual(
  dopplerTools.map((tool) => tool.name),
  [
    "get_doppler_state",
    "configure_doppler",
    "configure_doppler_scene",
    "set_doppler_playback",
    "reset_doppler",
    "create_doppler_video",
    "get_doppler_video_status",
    "stop_doppler_video",
    "download_doppler_video",
  ],
);
assert.equal(dopplerTools[0].annotations.readOnlyHint, true);
assert.equal(dopplerTools[1].annotations.readOnlyHint, false);
assert.equal(dopplerTools[6].annotations.readOnlyHint, true);
assert.deepEqual(
  dopplerTools[5].inputSchema.properties.storyMode.enum,
  ["two_vehicle", "single_pass"],
);

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

const sceneResult = JSON.parse(
  await dopplerTools[2].execute({
    observerPositionM: 500,
    sources: [
      {
        sourcePositionM: 200,
        sourceVelocityMps: 30,
        emittedFrequencyHz: 440,
        instrument: "car_engine",
      },
      {
        sourcePositionM: 800,
        sourceVelocityMps: -30,
        emittedFrequencyHz: 440,
        instrument: "diesel_engine",
      },
    ],
  }),
);
assert.equal(sceneResult.ok, true);
assert.equal(sceneResult.data.sources.length, 2);

const videoStartResult = JSON.parse(
  await dopplerTools[5].execute({
    storyMode: "single_pass",
    durationSeconds: 10,
    firstInstrument: "ambulance_siren",
  }),
);
assert.equal(videoStartResult.ok, true);
assert.equal(videoStartResult.data.state, "recording");
assert.equal(videoStartResult.data.storyMode, "single_pass");
assert.equal(videoStartResult.data.audioSignalDetected, true);

const videoStatusResult = JSON.parse(await dopplerTools[6].execute({}));
assert.equal(videoStatusResult.ok, true);
assert.equal(videoStatusResult.data.audioIncluded, true);
assert.equal(videoStatusResult.data.audioSignalDetected, true);

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
assert.equal(registeredTools.length, 11);
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
  "configure_doppler_scene",
  "set_doppler_playback",
  "reset_doppler",
  "create_doppler_video",
  "get_doppler_video_status",
  "stop_doppler_video",
  "download_doppler_video",
]);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /440 Hz/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /60 m\/s/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /10-second/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /Ambulance Siren/);
assert.match(DOPPLER_WEBMCP_TEST_PROMPT, /site tools/i);
assert.equal(getWebMcpGuideStatus("ready").detail, "11 tools available");
assert.match(getWebMcpGuideStatus("unsupported").help, /ChatGPT desktop app/i);
assert.equal(
  formatDopplerResultSummary(approachingState.sources),
  "440 Hz → 467.24 Hz · +6.19%",
);
assert.equal(formatDopplerResultSummary([]), "No source configured yet");

console.log("ESBIKO_WEBMCP_TEST_PASSED");
