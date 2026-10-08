import assert from "node:assert/strict";
import { createMultiWaveWebMcpTools, validateWavePatch } from "../src/simulations/subjects/physics/waves/multi-source-interference/multiWaveWebMcpTools.js";
import { WEBMCP_ENABLED_SIMULATIONS } from "../src/webmcp/siteTools.js";
import { simulationAgentManifest } from "../src/platform/agent/simulationAgentManifest.js";

const calls = [];
const handlers = {};
for (const name of ["getState", "configure", "playback", "addSource", "updateSource",
  "removeSource", "configureVideo", "startVideo", "getVideoStatus", "stopVideo", "downloadVideo"]) {
  handlers[name] = (...args) => { calls.push({ name, args }); return { name, args }; };
}
const tools = createMultiWaveWebMcpTools(handlers);
assert.equal(tools.length, 11);
assert.equal(new Set(tools.map(t => t.name)).size, 11);
const discover = WEBMCP_ENABLED_SIMULATIONS.find(e => e.id === "physics.waves.multi-source-interference");
assert(discover);
assert(discover.capabilities.includes("video-recording"));
const manifest = simulationAgentManifest[discover.id];
assert.equal(manifest.video, true);
assert.equal(manifest.exportable, true);
assert(manifest.parameterSchema.properties.waveSpeed);

async function invoke(name, input = {}) {
  const tool = tools.find(t => t.name === name);
  assert(tool, "Unknown test tool " + name);
  return JSON.parse(await tool.execute(input));
}
const happy = [
  ["get_multi_source_state", {}],
  ["configure_multi_source", { renderMode: "water", waveSpeed: 17, damping: 0.02, preset: "aurora", causticStyle: "silk" }],
  ["set_multi_source_playback", { action: "pause" }],
  ["set_multi_source_playback", { action: "run" }],
  ["set_multi_source_playback", { action: "reset" }],
  ["add_multi_source_source", { x: 0.25, y: 0.55, frequency: 2.3, amplitude: 1.8, motion: "figure-eight", pulseEnabled: true }],
  ["update_multi_source_source", { sourceId: 3, motion: "circle", motionRadius: 0.18, pulseOnTime: 0.15 }],
  ["remove_multi_source_source", { sourceId: 3 }],
  ["configure_multi_source_video", { durationSeconds: 5, fps: 30, aspectRatio: "9:16" }],
  ["start_multi_source_video", { durationSeconds: 5, fps: 30, aspectRatio: "16:9" }],
  ["get_multi_source_video_status", {}],
  ["stop_multi_source_video", {}],
  ["download_multi_source_video", {}],
];
for (const [name, input] of happy) {
  const result = await invoke(name, input);
  assert.equal(result.ok, true, JSON.stringify(result));
}
assert.equal(calls.length, happy.length);
for (const [name, input, code] of [
  ["configure_multi_source", { waveSpeed: 999 }, "PARAMETER_OUT_OF_RANGE"],
  ["configure_multi_source", { renderMode: "laser" }, "INVALID_PARAMETER"],
  ["update_multi_source_source", { sourceId: 2, x: Number.NaN }, "PARAMETER_OUT_OF_RANGE"],
  ["add_multi_source_source", { frequency: -1 }, "PARAMETER_OUT_OF_RANGE"],
  ["add_multi_source_source", { fakeSetting: 1 }, "UNKNOWN_PARAMETER"],
  ["start_multi_source_video", { fps: 48 }, "INVALID_PARAMETER"],
  ["start_multi_source_video", { durationSeconds: 700 }, "PARAMETER_OUT_OF_RANGE"],
  ["remove_multi_source_source", {}, "MISSING_PARAMETER"],
]) {
  const result = await invoke(name, input);
  assert.equal(result.ok, false, name);
  assert.equal(result.error.code, code, name);
}
assert.throws(() => validateWavePatch([], { test: { type: "boolean" } }));
console.log("MULTI SOURCE WEBMCP CONTRACT PASS (11 tools, validations, discovery)");
