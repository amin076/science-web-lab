/* scripts/verify-simulations.cjs */
/* eslint-env node */
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

async function loadRuntimeSources() {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.join(projectRoot, "vite.config.js"),
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
  });

  try {
    const [{ experimentsData }, { simulationRegistry }] = await Promise.all([
      server.ssrLoadModule("/src/data/experiments/index.js"),
      server.ssrLoadModule("/src/simulations/registry/index.js"),
    ]);
    return { experimentsData, simulationRegistry };
  } finally {
    await server.close();
  }
}

function duplicateIds(experimentsData) {
  const seen = new Set();
  const duplicates = new Set();
  for (const experiment of experimentsData) {
    if (!experiment?.id) continue;
    if (seen.has(experiment.id)) duplicates.add(experiment.id);
    seen.add(experiment.id);
  }
  return [...duplicates].sort();
}

async function main() {
  const { experimentsData, simulationRegistry } = await loadRuntimeSources();

  if (!Array.isArray(experimentsData)) {
    throw new Error("experimentsData must be an array.");
  }
  if (!simulationRegistry || typeof simulationRegistry !== "object") {
    throw new Error("simulationRegistry must be an object.");
  }

  const missingIds = experimentsData
    .filter((experiment) => !experiment?.id)
    .map((experiment) => experiment?.name || "<unnamed>");
  const duplicates = duplicateIds(experimentsData);
  const experimentIds = new Set(experimentsData.filter(Boolean).map((item) => item.id).filter(Boolean));
  const registryIds = new Set(Object.keys(simulationRegistry));

  const missingInRegistry = [...experimentIds].filter((id) => !registryIds.has(id)).sort();
  const missingInExperiments = [...registryIds].filter((id) => !experimentIds.has(id)).sort();

  if (missingIds.length || duplicates.length || missingInRegistry.length || missingInExperiments.length) {
    if (missingIds.length) console.error("❌ Experiment metadata missing ids:", missingIds);
    if (duplicates.length) console.error("❌ Duplicate experiment ids:", duplicates);
    if (missingInRegistry.length) console.error("❌ Experiments missing runtime registry bindings:", missingInRegistry);
    if (missingInExperiments.length) console.error("❌ Runtime registry bindings missing experiment metadata:", missingInExperiments);
    process.exitCode = 1;
    return;
  }

  console.log(
    `✅ experimentsData and simulationRegistry are consistent (${experimentIds.size} simulations).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
