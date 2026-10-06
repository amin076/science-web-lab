/* eslint-env node */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  projectRoot,
  "functions",
  "api",
  "data",
  "platformCatalog.generated.json",
);

const agentManifestOutputPath = path.join(
  projectRoot,
  "functions",
  "mcp",
  "data",
  "simulationAgentManifest.generated.json",
);

async function loadPlatformCatalog() {
  const { createServer } = await import("vite");

  const server = await createServer({
    configFile: path.join(projectRoot, "vite.config.js"),
    appType: "custom",
    logLevel: "error",
    server: {
      middlewareMode: true,
    },
    optimizeDeps: {
      noDiscovery: true,
    },
  });

  try {
    const platformCatalogService = await server.ssrLoadModule(
      "/src/platform/services/PlatformCatalogService.js",
    );

    return platformCatalogService.getPlatformCatalog();
  } finally {
    await server.close();
  }
}

async function loadSimulationAgentManifest() {
  const { createServer } = await import("vite");

  const server = await createServer({
    configFile: path.join(projectRoot, "vite.config.js"),
    appType: "custom",
    logLevel: "error",
    server: {
      middlewareMode: true,
    },
    optimizeDeps: {
      noDiscovery: true,
    },
  });

  try {
    const module = await server.ssrLoadModule(
      "/src/platform/agent/simulationAgentManifest.js",
    );

    return module.simulationAgentManifest;
  } finally {
    await server.close();
  }
}

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

function createUnknownCapability(key) {
  return {
    key,
    supported: false,
    verified: false,
    confidence: "unknown",
    source: "safe-default",
    declared: null,
    reason: "No verified capability source is registered for this capability.",
  };
}

function createVerifiedCapability(key, supported, reason, declared = supported) {
  return {
    key,
    supported: supported === true,
    verified: true,
    confidence: "high",
    source: "simulation-agent-manifest",
    declared,
    reason,
  };
}

function buildAgentCapabilityContract(simulation, profile) {
  if (!profile) return simulation.capabilityContract || null;

  const actions = new Set(profile.actions || []);
  const capabilities = CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = createUnknownCapability(key);
    return acc;
  }, {});

  capabilities.interactive = createVerifiedCapability(
    "interactive",
    true,
    "The simulation declares an adapted agent profile and interactive runtime.",
  );

  if (simulation.domain === "physics") {
    capabilities.physics = createVerifiedCapability(
      "physics",
      true,
      "The simulation is registered in the physics domain.",
      simulation.domain,
    );
  }

  capabilities.recording = createVerifiedCapability(
    "recording",
    actions.has("record"),
    actions.has("record")
      ? "The agent manifest declares the standard record action."
      : "The adapted agent manifest does not declare record support.",
    actions.has("record"),
  );

  capabilities.export = createVerifiedCapability(
    "export",
    profile.exportable === true || actions.has("export"),
    profile.exportable === true || actions.has("export")
      ? "The agent manifest declares export support."
      : "The adapted agent manifest does not declare export support.",
    profile.exportable === true || actions.has("export"),
  );

  capabilities.stateRead = createVerifiedCapability(
    "stateRead",
    actions.has("readState"),
    actions.has("readState")
      ? "The agent manifest declares readState."
      : "The adapted agent manifest does not declare readState.",
    actions.has("readState"),
  );

  const commandActions = ["configure", "play", "pause", "reset"];
  const commandExecution = commandActions.some((action) => actions.has(action));
  capabilities.commandExecution = createVerifiedCapability(
    "commandExecution",
    commandExecution,
    commandExecution
      ? "The agent manifest declares one or more executable control actions."
      : "The adapted agent manifest declares no executable control actions.",
    commandActions.filter((action) => actions.has(action)),
  );

  capabilities.agentReady = createVerifiedCapability(
    "agentReady",
    true,
    `Validated adapted profile ${profile.adapterVersion} is present.`,
    profile.adapterVersion,
  );

  const values = Object.values(capabilities);
  return {
    version: "simulation-capabilities.v1",
    status: "verified",
    sourceModel: "simulation-agent-manifest-derived",
    capabilities,
    summary: {
      total: values.length,
      supported: values.filter((capability) => capability.supported).length,
      verified: values.filter((capability) => capability.verified).length,
      unknown: values.filter((capability) => !capability.verified).length,
    },
  };
}

function applyAgentCapabilityContracts(catalog, agentManifest) {
  return catalog.map((simulation) => {
    const profile = agentManifest[simulation.id] || null;
    if (!profile) return simulation;

    return {
      ...simulation,
      capabilityContract: buildAgentCapabilityContract(simulation, profile),
    };
  });
}

function assertJsonSafeCatalog(catalog) {
  if (!Array.isArray(catalog)) {
    throw new Error("Platform catalog generator expected an array.");
  }

  for (const item of catalog) {
    if (!item || typeof item !== "object") {
      throw new Error("Platform catalog contains a non-object item.");
    }

    if (!item.id || !item.name) {
      throw new Error(`Platform catalog item is missing id or name: ${item.id}`);
    }
  }
}

function assertJsonSafeAgentManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Simulation agent manifest generator expected an object.");
  }

  for (const [id, profile] of Object.entries(manifest)) {
    if (!id || !profile || typeof profile !== "object") {
      throw new Error(`Invalid simulation agent manifest entry: ${id}`);
    }

    if (!profile.adapterVersion || !Array.isArray(profile.actions)) {
      throw new Error(`Simulation agent manifest entry is incomplete: ${id}`);
    }

    if (!profile.parameterSchema || !profile.stateSchema) {
      throw new Error(`Simulation agent manifest schemas are missing: ${id}`);
    }
  }
}

async function main() {
  const catalog = await loadPlatformCatalog();
  const agentManifest = await loadSimulationAgentManifest();
  const catalogWithAgentCapabilities = applyAgentCapabilityContracts(
    catalog,
    agentManifest,
  );

  assertJsonSafeCatalog(catalogWithAgentCapabilities);
  assertJsonSafeAgentManifest(agentManifest);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(catalogWithAgentCapabilities, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Generated ${catalogWithAgentCapabilities.length} platform simulations at ${path.relative(
      projectRoot,
      outputPath,
    )}`,
  );

  fs.mkdirSync(path.dirname(agentManifestOutputPath), { recursive: true });
  fs.writeFileSync(
    agentManifestOutputPath,
    `${JSON.stringify(agentManifest, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Generated ${Object.keys(agentManifest).length} simulation agent profiles at ${path.relative(
      projectRoot,
      agentManifestOutputPath,
    )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
