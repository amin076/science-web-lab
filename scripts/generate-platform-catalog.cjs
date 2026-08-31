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

async function main() {
  const catalog = await loadPlatformCatalog();
  assertJsonSafeCatalog(catalog);

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
