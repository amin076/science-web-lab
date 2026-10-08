import fs from "node:fs";
import assert from "node:assert/strict";
import { simulationAgentManifest } from "../src/platform/agent/simulationAgentManifest.js";
import { WEBMCP_ENABLED_SIMULATIONS } from "../src/webmcp/siteTools.js";

const registryText = fs.readFileSync("src/simulations/registry/index.js", "utf8");
const ids = [...registryText.matchAll(/^\s*"([^"]+)":\s*lazyWithRetry\(/gm)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate simulation IDs in registry.");
assert.equal(ids.length, 32, "Update this audit when the number of registered simulations changes.");

const enabled = new Map(WEBMCP_ENABLED_SIMULATIONS.map((simulation) => [simulation.id, simulation]));
const report = ids.map((id) => {
  const profile = simulationAgentManifest[id];
  const browser = enabled.get(id);
  return {
    simulationId: id,
    hasAgentParameterContract: Boolean(profile?.parameterSchema),
    hasInitialMcpParameterMapping: Boolean(profile?.adapterVersion),
    browserWebMcpDiscovered: Boolean(browser),
    browserCapabilitiesDeclared: browser?.capabilities || [],
    videoCapabilityDeclared: Boolean(profile?.video),
    videoExportDeclared: Boolean(profile?.exportable),
    // A declared capability is never proof of a live working control or a tested recording.
    browserTestsPassed: "NOT_VERIFIED_BY_THIS_AUDIT",
    remoteChatGptControlVerified: "NOT_VERIFIED_BY_THIS_AUDIT",
    deploymentVerified: "NOT_VERIFIED_BY_THIS_AUDIT",
  };
});
assert.equal(report.length, 32);
assert.equal([...enabled.keys()].filter((id) => !ids.includes(id)).length, 0,
  "A WebMCP-enabled simulation is not in the main registry.");
fs.mkdirSync("artifacts/readiness", { recursive: true });
fs.writeFileSync("artifacts/readiness/all-simulations.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  registered: ids.length,
  browserWebMcpDiscovered: report.filter((r) => r.browserWebMcpDiscovered).length,
  missingLiveBrowserTools: report.filter((r) => !r.browserWebMcpDiscovered).map((r) => r.simulationId),
  simulations: report,
}, null, 2) + "\n");
console.log("SIMULATION READINESS INVENTORY", JSON.stringify({
  registered: report.length,
  browserWebMcpDiscovered: report.filter((r) => r.browserWebMcpDiscovered).length,
  missingLiveBrowserTools: report.filter((r) => !r.browserWebMcpDiscovered).length,
}));
