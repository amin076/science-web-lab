/* eslint-env node */

const platformCatalog = require("../data/platformCatalog.generated.json");

const CAPABILITY_KEYS = [
  "interactive",
  "physics",
  "audio",
  "camera",
  "recording",
  "export",
  "timeline",
  "presets",
  "stateRead",
  "commandExecution",
  "agentReady",
];

function toTitleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toApiSimulationResource(simulation) {
  const route = simulation.route || `/experiments/${simulation.id}/run`;
  const domain = simulation.domain || "unknown";
  const topic = simulation.topic || "general";
  const capabilityContract = normalizeCapabilityContract(simulation);

  return {
    id: simulation.id,
    name: simulation.name,
    description: simulation.description || "",
    domain,
    topic,
    status: simulation.status || "active",
    engine: simulation.engine || "unknown",
    demo: simulation.demo === true,
    tags: Array.isArray(simulation.tags) ? simulation.tags : [],
    difficulty: simulation.difficulty || "unspecified",
    estimatedDurationMinutes: simulation.estimatedDurationMinutes ?? null,
    route,
    capabilities: createLegacyCapabilityFlags(capabilityContract),
    capabilityContract,

    // Backward-compatible aliases from the first public Platform API phase.
    subject: toTitleCase(domain),
    category: toTitleCase(topic),
    runPath: route,
  };
}

function createSafeCapability(key) {
  return {
    key,
    supported: false,
    verified: false,
    confidence: "unknown",
    source: "safe-default",
    declared: null,
    reason: "No verified capability source is registered for this simulation.",
  };
}

function createSafeCapabilityContract() {
  const capabilities = CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = createSafeCapability(key);
    return acc;
  }, {});

  return {
    version: "simulation-capabilities.v1",
    status: "unverified",
    sourceModel: "verified-metadata-or-safe-default",
    capabilities,
    summary: {
      total: CAPABILITY_KEYS.length,
      supported: 0,
      verified: 0,
      unknown: CAPABILITY_KEYS.length,
    },
  };
}

function normalizeCapabilityContract(simulation) {
  const contract = simulation.capabilityContract;

  if (
    contract &&
    contract.version === "simulation-capabilities.v1" &&
    contract.capabilities &&
    typeof contract.capabilities === "object"
  ) {
    return contract;
  }

  return createSafeCapabilityContract();
}

function createLegacyCapabilityFlags(capabilityContract) {
  const contractCapabilities = capabilityContract.capabilities || {};

  return CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = contractCapabilities[key]?.supported === true;
    return acc;
  }, {});
}

function listSimulations() {
  return platformCatalog.map(toApiSimulationResource);
}

function getSimulationById(id) {
  const simulation = platformCatalog.find((item) => item.id === id);

  return simulation ? toApiSimulationResource(simulation) : null;
}

function getSimulationCapabilities(id) {
  const simulation = getSimulationById(id);

  if (!simulation) return null;

  return {
    id: simulation.id,
    contractVersion: simulation.capabilityContract.version,
    status: simulation.capabilityContract.status,
    sourceModel: simulation.capabilityContract.sourceModel,
    capabilities: simulation.capabilityContract.capabilities,
    legacyCapabilities: simulation.capabilities,
    summary: simulation.capabilityContract.summary,
  };
}

module.exports = {
  listSimulations,
  getSimulationById,
  getSimulationCapabilities,
};
