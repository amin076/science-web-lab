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

  assertJsonSafeCatalog(catalog);
  assertJsonSafeAgentManifest(agentManifest);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Generated ${catalog.length} platform simulations at ${path.relative(
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
