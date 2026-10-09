import fs from "node:fs";
import assert from "node:assert/strict";
import { simulationAgentManifest } from "../src/platform/agent/simulationAgentManifest.js";
import { WEBMCP_ENABLED_SIMULATIONS } from "../src/webmcp/siteTools.js";

const registryText = fs.readFileSync("src/simulations/registry/index.js", "utf8");
const ids = [...registryText.matchAll(/^\s*"([^"]+)":\s*lazyWithRetry\(/gm)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate simulation IDs in registry.");
assert.equal(ids.length, 32, "Update this audit when the number of registered simulations changes.");

const enabled = new Map(WEBMCP_ENABLED_SIMULATIONS.map((simulation) => [simulation.id, simulation]));
const unexpectedManifests = Object.keys(simulationAgentManifest).filter((id) => !ids.includes(id));
assert.deepEqual(unexpectedManifests, [], "Adapter manifest has IDs absent from the simulation registry.");
const report = ids.map((id) => {
  const profile = simulationAgentManifest[id];
  const browser = enabled.get(id);
  const hasParameterSchema = Boolean(profile?.parameterSchema?.properties && Object.keys(profile.parameterSchema.properties).length);
  const hasStateSchema = Boolean(profile?.stateSchema?.properties && Object.keys(profile.stateSchema.properties).length);
  const actions = profile?.actions ?? ["open"];
  const declaredAdapted = Boolean(profile?.adapterVersion && hasParameterSchema && hasStateSchema && actions.includes("configure") && actions.includes("readState"));
  return {
    simulationId: id,
    integrationLevel: declaredAdapted ? "adapted-contract-declared" : "universal",
    adapterVersion: profile?.adapterVersion ?? null,
    hasAgentParameterContract: hasParameterSchema,
    hasAgentStateContract: hasStateSchema,
    actionsDeclared: actions,
    hasInitialMcpParameterMapping: declaredAdapted,
    browserWebMcpDiscovered: Boolean(browser),
    browserCapabilitiesDeclared: browser?.capabilities || [],
    videoCapabilityDeclared: Boolean(profile?.video),
    videoExportDeclared: Boolean(profile?.exportable),
    browserTestsPassed: "NOT_VERIFIED_BY_THIS_AUDIT",
    remoteChatGptControlVerified: "NOT_VERIFIED_BY_THIS_AUDIT",
    deploymentVerified: "NOT_VERIFIED_BY_THIS_AUDIT",
  };
});
assert.equal([...enabled.keys()].filter((id) => !ids.includes(id)).length, 0,
  "A WebMCP-enabled simulation is not in the main registry.");
const adapted = report.filter((r) => r.integrationLevel === "adapted-contract-declared");
const missingAdapterIds = report.filter((r) => r.integrationLevel === "universal").map((r) => r.simulationId);
fs.mkdirSync("artifacts/readiness", { recursive: true });
fs.writeFileSync("artifacts/readiness/all-simulations.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  registered: ids.length,
  adaptedContractsDeclared: adapted.length,
  missingAdapterIds,
  browserWebMcpDiscovered: report.filter((r) => r.browserWebMcpDiscovered).length,
  missingLiveBrowserTools: report.filter((r) => !r.browserWebMcpDiscovered).map((r) => r.simulationId),
  simulations: report,
}, null, 2) + "\n");
console.log("SIMULATION READINESS INVENTORY", JSON.stringify({
  registered: report.length,
  adaptedContractsDeclared: adapted.length,
  missingAdvancedAdapters: missingAdapterIds.length,
  missingAdapterIds,
  browserWebMcpDiscovered: report.filter((r) => r.browserWebMcpDiscovered).length,
}));
if (process.argv.includes("--require-all-adapted")) {
  assert.deepEqual(missingAdapterIds, [], "Not all registered simulations declare a meaningful advanced MCP adapter.");
}
