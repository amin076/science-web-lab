/* eslint-env node */

const platformCatalog = require("../data/platformCatalog.generated.json");

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
    capabilities: simulation.capabilities || {},

    // Backward-compatible aliases from the first public Platform API phase.
    subject: toTitleCase(domain),
    category: toTitleCase(topic),
    runPath: route,
  };
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
    capabilities: simulation.capabilities || {},
  };
}

module.exports = {
  listSimulations,
  getSimulationById,
  getSimulationCapabilities,
};
