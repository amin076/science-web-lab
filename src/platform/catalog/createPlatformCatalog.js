import {
  createLegacyCapabilityFlags,
  createSimulationCapabilityContract,
} from "@/platform/capabilities";

function normalizeEngine(engine) {
  if (!engine) return "unknown";
  if (engine === "3d") return "three";
  if (engine === "2d") return "canvas2d";
  return String(engine);
}

export function createPlatformSimulationMetadata(experiment) {
  const capabilityContract = createSimulationCapabilityContract(experiment);

  return {
    id: experiment.id,
    domain: experiment.domain || "unknown",
    topic: experiment.topic || "general",
    name: experiment.name,
    description: experiment.desc || experiment.description || "",
    status: experiment.status || "active",
    engine: normalizeEngine(experiment.engine),
    demo: experiment.demo === true,
    tags: Array.isArray(experiment.tags) ? experiment.tags : [],
    difficulty: experiment.difficulty || "unspecified",
    estimatedDurationMinutes: experiment.estimatedDurationMinutes || null,
    route: `/experiments/${experiment.id}/run`,
    capabilities: createLegacyCapabilityFlags(capabilityContract),
    capabilityContract,
  };
}

export function createPlatformCatalog(experimentsData = []) {
  return experimentsData
    .filter((experiment) => experiment && experiment.id)
    .map(createPlatformSimulationMetadata)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findPlatformSimulationById(id, experimentsData = []) {
  return createPlatformCatalog(experimentsData).find((item) => item.id === id);
}
