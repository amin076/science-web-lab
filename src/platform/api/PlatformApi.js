import {
  getPlatformCatalog,
  getSimulationById,
} from "@/platform/services/PlatformCatalogService";

export const ESBIKO_PLATFORM_API_VERSION = "esbiko-platform-api.v1";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function hasSupportedCapability(simulation, capability) {
  if (!capability) return true;
  return simulation?.capabilities?.[capability] === true;
}

export function getPlatformHealth() {
  const catalog = getPlatformCatalog();

  return {
    ok: true,
    service: "esbiko-platform-api",
    version: ESBIKO_PLATFORM_API_VERSION,
    simulationCount: catalog.length,
    timestamp: new Date().toISOString(),
  };
}

export function listSimulations(options = {}) {
  const {
    domain,
    topic,
    engine,
    capability,
    demo,
    status,
    search,
    limit,
  } = options;

  const searchValue = normalizeText(search);

  let simulations = getPlatformCatalog().filter((simulation) => {
    if (domain && simulation.domain !== domain) return false;
    if (topic && simulation.topic !== topic) return false;
    if (engine && simulation.engine !== engine) return false;
    if (status && simulation.status !== status) return false;
    if (typeof demo === "boolean" && simulation.demo !== demo) return false;
    if (!hasSupportedCapability(simulation, capability)) return false;

    if (searchValue) {
      const searchable = [
        simulation.id,
        simulation.name,
        simulation.description,
        simulation.domain,
        simulation.topic,
        ...(simulation.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(searchValue)) return false;
    }

    return true;
  });

  if (Number.isInteger(limit) && limit >= 0) {
    simulations = simulations.slice(0, limit);
  }

  return {
    version: ESBIKO_PLATFORM_API_VERSION,
    count: simulations.length,
    filters: {
      domain: domain || null,
      topic: topic || null,
      engine: engine || null,
      capability: capability || null,
      demo: typeof demo === "boolean" ? demo : null,
      status: status || null,
      search: search || null,
      limit: Number.isInteger(limit) ? limit : null,
    },
    simulations,
  };
}

export function readSimulation(id) {
  const simulation = getSimulationById(id);

  if (!simulation) {
    return {
      ok: false,
      version: ESBIKO_PLATFORM_API_VERSION,
      error: {
        code: "SIMULATION_NOT_FOUND",
        message: `Simulation not found: ${id}`,
      },
    };
  }

  return {
    ok: true,
    version: ESBIKO_PLATFORM_API_VERSION,
    simulation,
  };
}

export function executePlatformApiRequest(request = {}) {
  const action = request.action;

  switch (action) {
    case "health":
      return getPlatformHealth();
    case "simulations.list":
      return listSimulations(request.params || {});
    case "simulations.get":
      return readSimulation(request.params?.id);
    default:
      return {
        ok: false,
        version: ESBIKO_PLATFORM_API_VERSION,
        error: {
          code: "UNKNOWN_ACTION",
          message: `Unknown platform API action: ${action || "undefined"}`,
        },
      };
  }
}
