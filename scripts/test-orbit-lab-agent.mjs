import assert from "node:assert/strict";
import { createOrbitLabWebMcpTools } from "../src/simulations/subjects/astronomy/space/earth-orbit-lab/adapter/orbitLabTools.js";
import { WEBMCP_ENABLED_SIMULATIONS } from "../src/webmcp/siteTools.js";

const calls = [];
const actions = Object.fromEntries(
  ["getState", "configure", "setPlayback", "focus", "addPreset", "reset", "startVideo", "getVideoStatus", "stopVideo", "downloadVideo"].map(
    (name) => [name, (input) => {
      calls.push([name, input]);
      return { action: name, input };
    }],
  ),
);
const tools = createOrbitLabWebMcpTools(actions);
const names = tools.map((tool) => tool.name);
assert.equal(names.length, 10);
assert.equal(new Set(names).size, names.length);
assert(names.includes("get_orbit_lab_state"));
assert(names.includes("configure_orbit_lab"));
assert(names.includes("focus_orbit_lab_object"));
assert(names.includes("add_orbit_lab_preset"));
assert(names.includes("create_orbit_lab_video"));
assert(names.includes("get_orbit_lab_video_status"));
assert(names.includes("stop_orbit_lab_video"));
assert(names.includes("download_orbit_lab_video"));
const entries = WEBMCP_ENABLED_SIMULATIONS.filter((entry) => entry.id === "astronomy.space.earth-orbit-lab");
assert.equal(entries.length, 1);
assert(entries[0].capabilities.includes("focus"));
assert(entries[0].capabilities.includes("video-recording"));

async function run(name, input) {
  const result = JSON.parse(await tools.find((tool) => tool.name === name).execute(input));
  assert.equal(result.ok, true, JSON.stringify(result));
}
await run("get_orbit_lab_state", {});
await run("configure_orbit_lab", { timeScale: 320, showOrbits: true });
await run("set_orbit_lab_playback", { action: "pause" });
await run("focus_orbit_lab_object", { bodyId: "moon" });
await run("add_orbit_lab_preset", { preset: "ISS" });
await run("reset_orbit_lab", {});
await run("create_orbit_lab_video", { durationSeconds: 5, storyMode: "focus_target", aspectRatio: "9:16" });
await run("get_orbit_lab_video_status", {});
await run("stop_orbit_lab_video", {});
await run("download_orbit_lab_video", {});
assert.deepEqual(calls.map(([name]) => name), ["getState", "configure", "setPlayback", "focus", "addPreset", "reset", "startVideo", "getVideoStatus", "stopVideo", "downloadVideo"]);
console.log("ORBIT LAB WEBMCP CONTRACT PASS");
