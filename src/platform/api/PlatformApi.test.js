import {
  executePlatformApiRequest,
  listSimulations,
  readSimulation,
} from "./PlatformApi.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const all = listSimulations();
assert(Array.isArray(all.simulations), "Catalog response must contain simulations.");
assert(all.count === all.simulations.length, "Catalog count is incorrect.");

const limited = listSimulations({ limit: 2 });
assert(limited.simulations.length <= 2, "Limit filter failed.");

const missing = readSimulation("__missing_simulation__");
assert(missing.ok === false, "Missing simulation must return an error.");
assert(missing.error?.code === "SIMULATION_NOT_FOUND", "Missing simulation error code is incorrect.");

const unknown = executePlatformApiRequest({ action: "unknown" });
assert(unknown.ok === false, "Unknown action must fail safely.");
assert(unknown.error?.code === "UNKNOWN_ACTION", "Unknown action error code is incorrect.");

console.log("ESBIKO_PLATFORM_API_TEST_PASSED");
